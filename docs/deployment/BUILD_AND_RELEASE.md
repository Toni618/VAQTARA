# Build & Release Guide (RAVENDORA 1.0.0)

## Environment constraints (scaffolding host)
- Linux without Java/JDK, Android SDK, Flutter, Docker, Xcode.
- **Cannot produce signed APK/AAB or iOS binaries on this host.** iOS builds require macOS with Xcode. Android release builds require JDK + Android SDK/Gradle toolchain (typically via Expo EAS or local Android Studio environment).

## Android (Expo/React Native project in `mobile/`)
Prereqs: Node.js, npm/yarn, Expo CLI/EAS CLI, JDK 17+, Android SDK, configured keystore.
1. `cd mobile && npm install`
2. Configure `app.json` (package, versionCode) and EAS: create `eas.json` with development/preview/production profiles.
3. Keystore: generate and store securely (never commit). Configure credentials via EAS secrets or local `credentials.json` excluded from git.
4. Build AAB (Play Store): `npx eas build -p android --profile production`
5. Build APK (distribution/testing): use preview profile or `buildType: "apk"` in EAS profile.
6. Outputs downloaded from EAS or produced locally with `expo run:android`/Gradle when SDK is installed.

## iOS (source project only; build on macOS)
Prereqs: macOS, Xcode, CocoaPods, Apple Developer account.
1. `cd mobile && npm install`
2. `npx expo prebuild -p ios` (if using managed workflow) then open `ios/*.xcworkspace` in Xcode.
3. Configure bundle identifier, signing team, capabilities (notifications, StoreKit), and `app.json` iOS settings.
4. Archive via Xcode (Product > Archive) for App Store/TestFlight. IPA export requires valid signing.
5. StoreKit-compatible purchase architecture must be implemented and tested in sandbox/TestFlight (not completed in scaffold).

## Backend
Prereqs: Node.js >= 20, PostgreSQL.
1. `cd backend && cp .env.example .env` and set strong secrets, `DATABASE_URL`, CORS, and admin provisioning vars.
2. `npm install && npm run prisma:generate && npm run prisma:deploy`
3. Provision admin securely: `ADMIN_INITIAL_PASSWORD='...' npm run seed` (username `toni618` by default). Never hardcode.
4. `npm run build && npm start` (or run via process manager). Place behind TLS reverse proxy; configure rate limits, backups, monitoring.

## Admin dashboard
`cd admin-dashboard && npm install && npm run build` then serve `dist/` behind HTTPS; point API base URL to backend.

## CI recommendation
- Use CI runners with Android SDK for APK/AAB and macOS runners for iOS archives; inject secrets via CI secret store.
- Run lint/typecheck/tests and migration checks before release builds.
