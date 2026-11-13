# RAVENDORA APK Delivery — Blockers (2026-11-12)

## Genuine technical blockers requiring intervention

### 1) Android build toolchain missing (required to produce a real installable APK)
**Current host:** CachyOS Linux, no Java/JDK, no Android SDK, no Gradle, no adb. No sudo password available (`sudo -n` fails). Expo/EAS CLI not installed; no EAS credentials.

**Action needed (choose one path):**

**Path A — Local build on this/another Linux machine (recommended for local control):**
1. Install JDK 17:
   - Arch/CachyOS (requires sudo): `sudo pacman -S --needed jdk17-openjdk unzip zip`
   - or userspace: download Temurin JDK 17 x64 Linux tar.gz, extract, `export JAVA_HOME=<extract>/jdk-17*; export PATH=$JAVA_HOME/bin:$PATH`
2. Install Android SDK command-line tools and packages:
   ```bash
   mkdir -p "$HOME/Android/Sdk/cmdline-tools"
   # download commandlinetools-linux ZIP from https://developer.android.com/studio#command-line-tools-only
   unzip commandlinetools-linux-*.zip -d "$HOME/Android/Sdk/cmdline-tools"
   mv "$HOME/Android/Sdk/cmdline-tools/cmdline-tools" "$HOME/Android/Sdk/cmdline-tools/latest"
   export ANDROID_HOME="$HOME/Android/Sdk"; export ANDROID_SDK_ROOT="$ANDROID_HOME"
   export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
   yes | sdkmanager --licenses
   sdkmanager "platform-tools" "platforms;android-35" "build-tools;35.0.0"
   ```
3. Build APK (from repo root):
   ```bash
   cd mobile && npm install
   npx expo prebuild -p android --non-interactive
   cd android && ./gradlew assembleDebug   # debug/installable APK
   # or configure signing + ./gradlew assembleRelease for release APK
   ```
4. Copy artifact: `cp mobile/android/app/build/outputs/apk/debug/app-debug.apk release/ravendora-debug.apk && (cd release && sha256sum ravendora-debug.apk > ravendora-debug.apk.sha256)`

**Path B — Expo EAS cloud build:**
1. Install/login: `npm i -g eas-cli && eas login` (requires Expo account)
2. `cd mobile && eas build:configure && eas build -p android --profile preview` (produces installable APK/AAB in cloud)
3. Download APK into `release/`.

> I cannot produce a signed production-release APK without keystore credentials; a debug/locally-signed APK is deliverable once toolchain is available.

### 2) Backend dependencies install stalled in this environment
- Repeated `npm install` attempts in `backend/` hung without producing `node_modules` (Node v26.13.0, npm 12.2.2). This blocks `prisma:generate`, `prisma validate`, `typecheck`, `test`, and `build` execution.
**Action needed:** run `cd backend && rm -rf node_modules package-lock.json && npm install` in a healthy network environment (or try Node 20/22 LTS), then run: `npm run prisma:generate && npx prisma validate && npm run typecheck && npm test && npm run build`.

### 3) PostgreSQL unavailable
- No `psql`/server, no :5432 listener, no Docker. DB migrations and live DB-backed verification blocked.
**Action needed:** install/start PostgreSQL, create DB/user per `backend/.env.example`, run `npm run prisma:migrate` (or deploy) and `npm run seed` with secure `ADMIN_INITIAL_PASSWORD`.

### 4) External credentials (optional integrations)
- AI provider keys and payment/store credentials not provided. Live AI and verified production payments cannot be completed/claimed; integration must be configured with real credentials/sandboxes.

## Status
- **APK produced:** NO (blocked by toolchain; not fabricated)
- **Source/config/docs progressed:** YES (see DEVELOPMENT_STATUS.md, ENGINEERING_REPORT.md, release/)
