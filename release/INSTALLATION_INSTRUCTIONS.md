# Installation Instructions — RAVENDORA Android APK

## Prerequisites
- Android device (Android 8.0+ recommended) or emulator.
- "Install unknown apps" enabled for the installer you use (Files/Browser/ADB) if sideloading.

## Install via ADB (developer)
1. Enable Developer Options and USB debugging on device.
2. Connect device and verify: `adb devices`
3. Install: `adb install -r ravendora-debug.apk`
4. Launch: open **RAVENDORA** from app drawer (package `com.ravendora.app`).

## Install via file transfer
1. Copy `ravendora-debug.apk` to device storage.
2. Open it with a file manager and confirm install.
3. If Play Protect warns about unknown developer/debug build, review and proceed only if you trust this build.

## Backend connectivity
- The app expects API base URL configured in `mobile/app.json` (`expo.extra.apiBaseUrl`). For Android emulator use `http://10.0.2.2:4000/api/v1`; for a physical device use your machine's LAN IP and ensure backend is reachable.
- Start backend (`backend/.env` configured, PostgreSQL if required by features in use): `cd backend && npm start` (or `npm run dev`).
- If backend is unavailable, the app must show offline/network errors gracefully (no fake success). Features requiring server (auth, trial activation, premium verification) will not function without a reachable configured backend.

## First run
1. Select language (فارسی / English) — RTL applies for Persian (may require app reload on some builds).
2. Register/login against configured backend.
3. Trial activation and premium status are server-verified (24h from first activation) when backend is available and configured.

## Notes
- Debug APKs are signed with a debug key (not for Play Store production). Release/Play Store distribution requires proper release signing and store-compliant builds.
- iOS build is not included; requires macOS/Xcode.
