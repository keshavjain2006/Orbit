// Cross-platform Bluetooth LE service with safe fallbacks
// Uses react-native-ble-manager for scanning and react-native-ble-advertiser for broadcasting when present.
// All calls are guarded to avoid crashes if native modules are missing during early development.

import { NativeModules, NativeEventEmitter, PermissionsAndroid, Platform, AppState } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { supabase, logEncounterByHash } from './supabase';

// Try to access BleManager if available
let BleManager = null;
let BleManagerModule = null;
let bleManagerEmitter = null;
try {
  BleManager = require('react-native-ble-manager');
  BleManagerModule = NativeModules.BleManager;
  if (BleManagerModule) {
    bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
  }
} catch (e) {
  // Module not installed
}

// Try to access advertiser if available
let BleAdvertiser = null;
try {
  BleAdvertiser = require('react-native-ble-advertiser');
} catch (e) {}

// App service/characteristic UUIDs (custom 128-bit UUIDs)
// Note: If you already have provisioned service/characteristic UUIDs, replace these with yours.
const SERVICE_UUID = '6b0f6f5e-b3c4-4f0f-9a0f-9c3b6b0d9c1a';
const CHARACTERISTIC_UUID = 'a9e5b3d2-1c4e-4a6b-8f2d-3c1b9e7f5a42';

class BluetoothService {
  constructor() {
    this.isScanning = false;
    this.discoveredDevices = new Set();
    this.userBleUUID = null;
    this.currentUserId = null;
    this._desiredScanUserId = null; // when set, we attempt to keep scanning (best-effort on iOS)
    this._appState = 'active';
    this._appStateSub = null;
    // Bind handler once
    this._boundDiscover = this.handleDiscoverPeripheral.bind(this);
    this._boundAppState = this._onAppStateChange.bind(this);
    this._boundStopScan = this._onStopScan.bind(this);

    // Proximity qualification state
    this._sightings = new Map(); // key: deviceId or bleHash; value: { hits, first, last, maxRssi }
    this._cooldown = new Map();  // key: peerKey, value: timestamp when cooldown ends

    // Tunables (can move to env/config)
    this.RSSI_THRESHOLD = -70;         // dBm
    this.REQUIRED_HITS = 3;            // N observations
    this.DWELL_WINDOW_MS = 45 * 1000;  // over 45 seconds
    this.COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
  }

  async init() {
    try {
      if (BleManager?.start) {
        await BleManager.start({ showAlert: false });
        if (bleManagerEmitter) {
          bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', this._boundDiscover);
          bleManagerEmitter.addListener('BleManagerStopScan', this._boundStopScan);
        }
      }
      // Request permissions on Android
      if (Platform.OS === 'android') {
        await this.requestAndroidPermissions();
      }
      // Initialize advertiser on Android if present
      if (BleAdvertiser?.setCompanyId && Platform.OS === 'android') {
        BleAdvertiser.setCompanyId(0x00);
      }
      // Observe app state to best-effort resume scanning on iOS when foregrounded
      if (!this._appStateSub) {
        this._appStateSub = AppState.addEventListener('change', this._boundAppState);
      }
      // eslint-disable-next-line no-console
      console.log('[BLE] Initialized');
      return true;
    } catch (e) {
      console.warn('[BLE] init failed or unavailable:', e?.message || e);
      return false;
    }
  }

  async requestAndroidPermissions() {
    try {
      if (Platform.OS !== 'android') return;
      if (Platform.Version >= 31) {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      } else {
        await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      }
    } catch (e) {
      console.warn('[BLE] permission request error', e);
    }
  }

  async startAdvertising(userOrUuid) {
    // Accept either a full user object (preferred) or a raw UUID string
    const bleUuid = typeof userOrUuid === 'string' ? userOrUuid : (userOrUuid?.ble_uuid || null);
    const bleHash = typeof userOrUuid === 'string' ? null : (userOrUuid?.ble_hash || null);
    this.userBleUUID = bleUuid;
    try {
      if (BleAdvertiser?.broadcast) {
        // Build options. Many devices/libraries accept manufacturer data or service data bytes
        const options = {};
        if (bleHash && this.isLikelyBleHash(bleHash)) {
          // Encode as ASCII bytes; simple and parseable on scan
          options.manufacturerId = 0xFFFF; // test/manufacturer ID for custom data
          options.manufacturerData = this.asciiToBytes(bleHash);
        }
        await BleAdvertiser.broadcast(bleUuid || 'ORBIT', [SERVICE_UUID], options);
        console.log('[BLE] Broadcasting', { bleUuid, withHash: !!bleHash });
      } else {
        console.log('[BLE] Advertiser module not available; skipping advertising');
      }
    } catch (e) {
      console.warn('[BLE] startAdvertising error', e);
    }
  }

  async startScanning(currentUserId) {
    try {
      if (!BleManager?.scan) {
        console.log('[BLE] BleManager not available; skip scanning');
        return;
      }
      if (this.isScanning) return;
      this.isScanning = true;
      this.currentUserId = currentUserId;
      this._desiredScanUserId = currentUserId;
      this.discoveredDevices.clear();
      await BleManager.scan([SERVICE_UUID], 30, false);
      console.log('[BLE] Started scanning');
    } catch (e) {
      console.warn('[BLE] startScanning error', e);
      this.isScanning = false;
    }
  }

  stopScanning() {
    try {
      if (BleManager?.stopScan) BleManager.stopScan();
    } catch {}
    this.isScanning = false;
    this._desiredScanUserId = null;
    console.log('[BLE] Stopped scanning');
  }

  async handleDiscoverPeripheral(peripheral) {
    try {
      if (!peripheral?.id) return;

      // Extract advertisement hash if available
      const adv = peripheral?.advertising || {};
      const parsed = this.parseAdvertisement(adv);
      const rssi = typeof peripheral?.rssi === 'number' ? peripheral.rssi : -1000;

      // Track sightings keyed by best available identifier
      const key = parsed?.bleHash || peripheral.id;
      const now = Date.now();
      const rec = this._sightings.get(key) || { hits: 0, first: now, last: now, maxRssi: -1000 };
      rec.hits += 1;
      rec.last = now;
      rec.maxRssi = Math.max(rec.maxRssi, rssi);
      this._sightings.set(key, rec);

      // Proximity check: RSSI strong enough and dwell within window
      if (rec.maxRssi >= this.RSSI_THRESHOLD && (rec.last - rec.first) <= this.DWELL_WINDOW_MS && rec.hits >= this.REQUIRED_HITS) {
        // Cooldown check to avoid spamming same counterpart
        const cooldownUntil = this._cooldown.get(key) || 0;
        if (now < cooldownUntil) return;
        this._cooldown.set(key, now + this.COOLDOWN_MS);

        const location = await this.getCurrentLocation();

        // Prefer advertisement-based logging (no connection)
        if (parsed?.bleHash) {
          try {
            await logEncounterByHash(this.currentUserId, parsed.bleHash, location.latitude, location.longitude);
            console.log('[BLE] Encounter logged via adv hash');
            return;
          } catch (e) {
            console.warn('[BLE] logEncounterByHash failed', e?.message || e);
          }
        }

        // Fallback: connect + read characteristic to get ble_uuid
        try {
          if (!BleManager?.connect) return;
          await BleManager.connect(peripheral.id);
          await BleManager.retrieveServices(peripheral.id);
          let detectedUserBleUUID = null;
          try {
            if (BleManager?.read) {
              const data = await BleManager.read(peripheral.id, SERVICE_UUID, CHARACTERISTIC_UUID);
              detectedUserBleUUID = this.bytesToString(data);
            }
          } catch (e) {
            console.warn('[BLE] read characteristic failed', e);
          }
          if (detectedUserBleUUID) {
            await this.logEncounter(detectedUserBleUUID, location);
          }
        } finally {
          try { await BleManager.disconnect(peripheral.id); } catch {}
        }
      }
    } catch (e) {
      console.warn('[BLE] handleDiscoverPeripheral error', e);
    }
  }

  getCurrentLocation() {
    return new Promise((resolve) => {
      try {
        Geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos?.coords?.latitude ?? null, longitude: pos?.coords?.longitude ?? null }),
          () => resolve({ latitude: null, longitude: null }),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } catch (e) {
        resolve({ latitude: null, longitude: null });
      }
    });
  }

  async logEncounter(detectedUserBleUUID, location) {
    try {
      if (!supabase) return; // Skip if backend not configured
      const { data: detectedUser, error: e1 } = await supabase
        .from('users')
        .select('id')
        .eq('ble_uuid', detectedUserBleUUID)
        .single();
      if (e1 || !detectedUser) return;

      const { error: e2 } = await supabase
        .from('encounters')
        .insert({
          user_id: this.currentUserId,
          detected_user_id: detectedUser.id,
          latitude: location.latitude,
          longitude: location.longitude,
        });
      if (e2) throw e2;
      console.log('[BLE] Encounter logged');
    } catch (e) {
      console.warn('[BLE] logEncounter failed', e?.message || e);
    }
  }

  bytesToString(bytes) {
    try {
      // Expect Uint8Array/number[]
      return String.fromCharCode.apply(null, bytes);
    } catch (e) {
      return '';
    }
  }

  destroy() {
    try { this.stopScanning(); } catch {}
    try {
      bleManagerEmitter?.removeListener('BleManagerDiscoverPeripheral', this._boundDiscover);
      bleManagerEmitter?.removeListener('BleManagerStopScan', this._boundStopScan);
    } catch {}
    try { this._appStateSub?.remove?.(); this._appStateSub = null; } catch {}
  }

  // Allow runtime tuning of proximity heuristics
  setHeuristicsPreset(preset) {
    // 'safe' (default) vs 'instant'
    switch ((preset || 'safe').toLowerCase()) {
      case 'instant':
        this.RSSI_THRESHOLD = -65;
        this.REQUIRED_HITS = 1;
        this.DWELL_WINDOW_MS = 10 * 1000; // not really used for 1 hit
        this.COOLDOWN_MS = 60 * 1000; // 1 minute debounce
        break;
      case 'safe':
      default:
        this.RSSI_THRESHOLD = -70;
        this.REQUIRED_HITS = 3;
        this.DWELL_WINDOW_MS = 45 * 1000;
        this.COOLDOWN_MS = 10 * 60 * 1000;
        break;
    }
  }

  // Parse advertisement to extract our BLE hash from manufacturer/service data
  parseAdvertisement(adv) {
    if (!adv) return null;
    // Common shapes exposed by react-native-ble-manager:
    // adv.serviceData: { [uuid]: { bytes: number[] } }
    // adv.serviceData (iOS): { [uuid]: { data: base64 } }
    // adv.manufacturerData (Android): { bytes: number[] }
    // adv.manufacturerData (iOS): { data: base64 }
    try {
      // Try serviceData first
      if (adv.serviceData) {
        const services = Object.values(adv.serviceData);
        for (const s of services) {
          let bytes = s?.bytes;
          if ((!bytes || !bytes.length) && typeof s?.data === 'string') {
            bytes = this.base64ToBytes(s.data);
          }
          const hash = this.bytesToAsciiSafe(bytes);
          if (hash && this.isLikelyBleHash(hash)) {
            return { bleHash: hash };
          }
        }
      }
      // Try manufacturer data
      const m = adv.manufacturerData;
      if (m) {
        let bytes = m.bytes;
        if ((!bytes || !bytes.length) && typeof m.data === 'string') {
          bytes = this.base64ToBytes(m.data);
        }
        if (bytes && bytes.length) {
          const hash = this.bytesToAsciiSafe(bytes);
          if (hash && this.isLikelyBleHash(hash)) {
            return { bleHash: hash };
          }
        }
      }
    } catch {}
    return null;
  }

  bytesToAsciiSafe(bytes) {
    try {
      if (!bytes || !bytes.length) return '';
      const str = String.fromCharCode.apply(null, bytes);
      // Keep hex/base64url-ish only to avoid junk
      return str.replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
    } catch { return ''; }
  }

  isLikelyBleHash(str) {
    // Our ble_hash is 24 hex chars in schema
    return typeof str === 'string' && /^[0-9a-f]{24}$/.test(str);
  }

  asciiToBytes(str) {
    try {
      const out = [];
      for (let i = 0; i < str.length; i++) out.push(str.charCodeAt(i) & 0xff);
      return out;
    } catch {
      return [];
    }
  }

  // Best-effort base64 string to byte[] for iOS advertisement fields
  base64ToBytes(b64) {
    try {
      if (!b64 || typeof b64 !== 'string') return [];
      // Prefer global atob if present (React Native often polyfills it)
      if (typeof atob === 'function') {
        const bin = atob(b64);
        const out = new Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) & 0xff;
        return out;
      }
      // Fallback: minimal decoder for standard base64
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let str = b64.replace(/[^A-Za-z0-9+/=]/g, '');
      let output = [];
      let enc1, enc2, enc3, enc4;
      let i = 0;
      while (i < str.length) {
        enc1 = chars.indexOf(str.charAt(i++));
        enc2 = chars.indexOf(str.charAt(i++));
        enc3 = chars.indexOf(str.charAt(i++));
        enc4 = chars.indexOf(str.charAt(i++));
        const chr1 = (enc1 << 2) | (enc2 >> 4);
        const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
        const chr3 = ((enc3 & 3) << 6) | enc4;
        output.push(chr1 & 0xff);
        if (enc3 !== 64) output.push(chr2 & 0xff);
        if (enc4 !== 64) output.push(chr3 & 0xff);
      }
      return output;
    } catch {
      return [];
    }
  }

  _onAppStateChange(nextState) {
    this._appState = nextState;
    // When app comes to foreground on iOS, try to resume scan if desired
    if (Platform.OS === 'ios' && nextState === 'active' && this._desiredScanUserId && !this.isScanning) {
      // Fire and forget
      this.startScanning(this._desiredScanUserId);
    }
  }

  _onStopScan() {
    // iOS typically limits scan duration; if user desires scanning, restart in foreground
    if (Platform.OS === 'ios' && this._desiredScanUserId && this._appState === 'active') {
      this.isScanning = false;
      // Slight delay to yield event loop
      setTimeout(() => {
        if (!this.isScanning && this._desiredScanUserId) {
          this.startScanning(this._desiredScanUserId);
        }
      }, 500);
    } else {
      this.isScanning = false;
    }
  }
}

export default new BluetoothService();
