import BLEAdvertiser from 'react-native-ble-advertiser';
import { Platform, PermissionsAndroid, NativeEventEmitter, NativeModules } from 'react-native';

// We need a listener for events
const eventEmitter = new NativeEventEmitter(NativeModules.BLEAdvertiser);

class OrbitBLE {
    constructor() {
        this.isScanning = false;
        this.isBroadcasting = false;
        this.myBeaconId = null;
        this.onDeviceFound = null;
    }

    async requestPermissions() {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                ]);

                return (
                    granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.BLUETOOTH_ADVERTISE'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
                );
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true; // iOS permissions handled via Info.plist
    }

    start(myBeaconId, onDeviceFound) {
        this.myBeaconId = myBeaconId;
        this.onDeviceFound = onDeviceFound;

        // Setup Listeners
        // On Device Found
        eventEmitter.addListener('onDeviceFound', (event) => {
            // event.serviceUuids is an array of UUIDs
            if (event.serviceUuids && event.serviceUuids.length > 0) {
                event.serviceUuids.forEach(uuid => {
                    // Check if it's a valid Orbit UUID (we can add a specific prefix check if we want, but for now any UUID found is a candidate)
                    // In a real app, we'd filter by a specific Service UUID, but here we are broadcasting the User's ID as the Service UUID
                    // to allow unique identification.
                    // Wait, broadcasting unique Service UUIDs per user is one strategy, but scanning for ALL UUIDs is expensive/noisy.
                    // Better strategy: Broadcast a COMMON Service UUID (Orbit Service) + User UUID in Manufacturer Data.
                    // However, `react-native-ble-advertiser` supports broadcasting a specific UUID.

                    // Let's stick to the plan: Broadcast the User's UUID as a Service UUID.
                    // Scan for ALL devices? No, we need to scan for... wait.
                    // If everyone has a different UUID, we can't scan for a specific Service UUID unless we know it.
                    // We need a COMMON Service UUID for "Orbit App" and then put the User ID in the payload.

                    // REVISION:
                    // Service UUID: Fixed ORBIT_UUID
                    // Payload: User UUID

                    // BUT `react-native-ble-advertiser` `broadcast` takes a UUID.
                    // If we use a common UUID, everyone looks the same unless we read the payload.
                    // `onDeviceFound` returns `serviceUuids`.

                    // Let's try this:
                    // Everyone broadcasts the SAME Service UUID: '0000180D-0000-1000-8000-00805F9B34FB' (Orbit Service)
                    // And we put the User's UUID in the `manufacturerData` or `localName`.
                    // `react-native-ble-advertiser` allows setting `manufData`.

                    // However, reading manufData on scan can be tricky across platforms.
                    // Alternative: Broadcast the User's UUID as a Service UUID.
                    // Scanner scans for... everything? No, that's battery intensive.

                    // Actually, `scan(UUID, options)` filters by UUID.
                    // If we want to find *anyone*, we must scan for a *common* UUID.
                    // So:
                    // 1. Common UUID = '00000000-0000-0000-0000-000000000000' (Example) -> No, use a real one.
                    // 2. Broadcast(CommonUUID, { manufacturerData: UserUUID }).

                    // Let's use the User UUID as the Service UUID?
                    // No, then A needs to know B's UUID to scan for it.

                    // CORRECT APPROACH:
                    // Common Service UUID: 'A0000000-0000-0000-0000-000000000000' (Orbit)
                    // Broadcast: ServiceUUID = Orbit, DeviceName = UserUUID (or part of it).
                    // Scan: Filter by Orbit ServiceUUID.
                    // OnFound: Read DeviceName.

                    if (event.serviceUuids.includes('A0000000-0000-0000-0000-000000000000')) {
                        // It's an Orbit User!
                        // Prefer manufacturerData for beacon id; fallback to deviceName
                        let detectedId = null;
                        try {
                            if (event.manufacturerData && Array.isArray(event.manufacturerData)) {
                                // Convert byte array to ASCII string (trim nulls)
                                const bytes = event.manufacturerData;
                                detectedId = String.fromCharCode(...bytes).replace(/\u0000/g, '').trim();
                            }
                        } catch (e) {
                            // ignore decode errors
                        }
                        if (!detectedId && event.deviceName) {
                            detectedId = event.deviceName;
                        }
                        if (detectedId && detectedId !== this.myBeaconId) { // Don't detect self
                            this.onDeviceFound(detectedId);
                        }
                    }
                });
            }
        });

        // Start Advertising
        // Common Orbit Service UUID
        const ORBIT_SERVICE_UUID = 'A0000000-0000-0000-0000-000000000000';

        BLEAdvertiser.setCompanyId(0x0059); // Example company ID (Nordic). Any non-zero works for advertising.

        // Broadcast
        // We use the User's Beacon ID in manufacturer data (ASCII bytes)
        const trimmedId = String(myBeaconId || '').slice(0, 16); // keep it short for payload
        const manufBytes = Array.from(trimmedId).map(ch => ch.charCodeAt(0));
        BLEAdvertiser.broadcast(ORBIT_SERVICE_UUID, manufBytes, {
            includeDeviceName: true, // Important!
            includeTxPowerLevel: false,
            connectable: false // We don't need to connect, just advertise
        })
            .then(() => console.log('Broadcasting Started', myBeaconId))
            .catch(error => console.log('Broadcast Error', error));

        // Start Scanning
        BLEAdvertiser.scan([ORBIT_SERVICE_UUID], {
            scanMode: 2, // Low Latency (Fast)
        })
            .then(() => console.log('Scanning Started'))
            .catch(error => console.log('Scan Error', error));

        this.isScanning = true;
        this.isBroadcasting = true;
    }

    stop() {
        if (this.isScanning) {
            BLEAdvertiser.stopScan()
                .then(() => console.log('Scan Stopped'))
                .catch(err => console.log('Stop Scan Error', err));
            this.isScanning = false;
        }
        if (this.isBroadcasting) {
            BLEAdvertiser.stopBroadcast()
                .then(() => console.log('Broadcast Stopped'))
                .catch(err => console.log('Stop Broadcast Error', err));
            this.isBroadcasting = false;
        }
        // Remove listeners? 
        // eventEmitter.removeAllListeners('onDeviceFound'); // Careful not to remove global listeners if shared
    }
}

export const orbitBLE = new OrbitBLE();
