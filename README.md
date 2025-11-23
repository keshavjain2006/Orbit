# Orbit

Stop missing the people you keep missing

This app uses Bluetooth Low Energy (BLE) beacons to discover other Orbit users nearby. When two users encounter each other three times, both receive a notification. Each user must explicitly accept (wave) for a mutual match; once matched, they become friends and can chat in realtime. Each encounter may store GPS coordinates (when permission is granted) so you can see where you met.

## What’s implemented

- Auth: simple email-as-phone login/signup using Supabase Auth
- Profiles: create a profile with name, bio, avatar (emoji), interests
- Automatic beacon ID: generated on profile creation and stored to your profile
- BLE broadcasting and scanning:
  - Broadcasts a common Orbit Service UUID and encodes your beacon_id in the BLE manufacturer data (with fallback to device name)
  - Scans for that service and ignores self
  - Discovery toggle in the UI to start/stop BLE; auto‑stops on logout
- Encounter tracking:
  - On each detection, records/updates an encounter in Supabase via the RPC scan_beacon
  - Debounced per detected beacon (2 minutes) to limit spam
  - GPS point {lat, long, timestamp} is appended to encounters.locations for every encounter (on create and on each increment) via scan_beacon; find_nearby_users also appends when used
  - Meet count and last_met_at maintained
- Mutual acceptance (waves):
  - Both users must wave to become friends
  - Matching is enforced in the database function wave_at_person
- Notifications (local via Expo):
  - On the 3rd encounter (2 → 3 transition)
  - When a match is made (mutual wave)
- Feed:
  - Potential Waves (not matched yet) and Friends (matched) from a Supabase view
  - Wave detail screen to accept/wave
- Realtime chat:
  - Live insert subscription per encounter; messages stream in without refresh
- Platform configuration:
  - iOS InfoPlist strings for Bluetooth and Location
  - Android permissions for Bluetooth and Location

## Project layout

- orbit-new/App.js — app UI and main logic (auth, profile, BLE lifecycle, feed, chat)
- orbit-new/lib/ble.js — BLE broadcast/scan abstraction
- orbit-new/schema.sql — Supabase schema, policies, view, and RPC functions
- orbit-new/app.json — Expo/Native configuration (permissions, plugins)

## Prerequisites

- Node.js 18+
- Expo CLI (npx is fine)
- Two physical devices for end‑to‑end BLE testing (Android 8+/iOS 15+ recommended)
  - BLE advertising is not supported on iOS simulators; use real devices
- A Supabase project with anon and URL credentials

## Configure Supabase

1. Create a new Supabase project and copy your Project URL and anon/public key.
2. In the app code, set up the Supabase client (orbit-new/lib/supabase.js). If this file doesn’t exist yet in your environment, create it like below using your credentials:

   ```js
   // orbit-new/lib/supabase.js
   import 'react-native-url-polyfill/auto';
   import { createClient } from '@supabase/supabase-js';

   const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
   const SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY';

   export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
     auth: {
       persistSession: true,
       autoRefreshToken: true,
       detectSessionInUrl: false,
     },
   });
   ```

3. Apply the database schema from orbit-new/schema.sql to your Supabase project (SQL editor → run the whole file). This creates:
   - profiles, encounters, messages tables
   - RLS policies (open for hackathon/testing)
   - my_orbit_feed view
   - scan_beacon(lat/long) and wave_at_person RPCs

Note: For production you should harden RLS policies.

## Install and run

1. Install dependencies:

   ```bash
   cd orbit-new
   npm install
   ```

2. Choose how you want to run it

   Option A — Development build (recommended for real Bluetooth):

   - Why: BLE advertising and native modules like react-native-ble-advertiser do not work in Expo Go. You need a dev build or a full build.
   - Android (fastest):
     - Plug in an Android device with USB debugging enabled
     - Run: `npm run dev:android`
   - iOS (Mac required):
     - Connect an iPhone with a cable and trust the computer
     - Run: `npm run dev:ios`
   - Alternative (EAS dev build, can be shared as an installable dev client):
     - Android: `npm run dev:build:android`
     - iOS: `npm run dev:build:ios`

   Option B — Expo Go (for UI only; BLE won’t function):

   - Android: `npm run android`
   - iOS: `npm run ios`
   - Web: `npm run web`

3. On first launch on device:
   - Accept Bluetooth permissions
   - Accept Location permission (optional, recommended for encounter GPS)
   - Accept Notifications permission

## Using the app

1. Sign up
   - Use your phone number as the “mobile number” (it constructs an email internally like 5550123@orbit.local)
   - Choose a password
2. Create Profile
   - Pick a name, optional pronouns/interests/bio, tap avatar to randomize an emoji
   - Submitting generates a beacon_id automatically
3. Discovery
  - The Bluetooth button on Home toggles discovery on/off
  - When on, your device advertises and scans while the app is active
  - Note: iOS restricts BLE advertising in the background to some modes; keep the app in the foreground during testing
4. Encounters
   - With two devices running Orbit (and discovery on), move them within range; each detection updates “meet_count” and logs GPS if available
   - On the 3rd encounter, both devices get a local notification
5. Wave and match
   - Open Potential Waves → select a person → tap “Accept / Wave”
   - When both have waved, you both receive “It’s a Match!” and the friend moves to the Friends section
6. Chat
   - Open a friend and send messages; messages are delivered realtime via Supabase Realtime

## Testing checklist

- [ ] Two devices can create profiles; beacon_id is set in profiles
- [ ] Discovery toggle starts/stops BLE (status card updates)
- [ ] Encounters appear in feed with increasing meet_count
- [ ] On 3rd encounter, both devices receive notification
- [ ] Wave from both devices → both get match notification → friend appears under Friends
- [ ] Chat delivers messages in realtime between devices
- [ ] Locations array in encounters accumulates GPS points (when permission granted)

## Troubleshooting

- iOS Simulator does not support BLE advertising; use real iPhones
- Expo Go does not support react-native-ble-advertiser; build a development client as shown above
- Android requires Location permission for BLE scans on many OS versions
- Some Android OEMs throttle background work; keep the app in the foreground during testing
- Manufacturer data parsing differs by device; we also fall back to the device name for beacon_id
- If notifications don’t show, ensure Expo notifications permission is granted in system settings

## FAQ

Q: Why are latitude, longitude, and last_seen_at stored on profiles?

- These are optional presence/proximity fields used by the helper SQL function find_nearby_users for coarse discovery (box search) and for a simple "last online" marker.
- The actual encounter history (where you met) is tracked per encounter in encounters.locations as an array of objects like {lat, long, timestamp}. That array is the source of truth for locations when you and someone else meet via BLE.
- If you don’t plan to use geolocation discovery, you can drop these columns from profiles and the BLE encounter flow will still work:
  - ALTER TABLE public.profiles DROP COLUMN latitude;
  - ALTER TABLE public.profiles DROP COLUMN longitude;
  - Optionally keep last_seen_at if you still want a basic presence indicator.

## Scripts

- `npm start` — start Expo Dev Server
- `npm run android` — build/launch on Android device/emulator
- `npm run ios` — build/launch on iOS simulator/device (device via Expo Go)
- `npm run web` — web preview (limited; no BLE)

## Privacy & Safety

This prototype broadcasts a short beacon identifier intended only for app discovery. For production, consider rotating ephemeral IDs, stronger RLS, and server‑side push notifications.
