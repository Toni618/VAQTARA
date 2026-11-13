# Build Instructions — RAVENDORA Android APK

## Prerequisites
- Linux/macOS/Windows with Node.js (LTS recommended: 20 or 22), npm.
- JDK 17 (e.g. Temurin/OpenJDK 17). Verify: `java -version` shows 17.x.
- Android SDK: cmdline-tools, platform-tools, `platforms;android-35` (or version matching project), `build-tools;35.0.0`. Accept licenses: `yes | sdkmanager --licenses`.
- Environment:
  ```bash
  export JAVA_HOME=/path/to/jdk-17
  export ANDROID_HOME=$HOME/Android/Sdk
  export ANDROID_SDK_ROOT=$ANDROID_HOME
  export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"
  ```

## Backend (configure & verify)
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
cp .env.example .env   # set strong JWT secrets, DATABASE_URL, CORS_ORIGIN
npm run prisma:generate
npx prisma validate
npm run typecheck
npm test               # do not claim pass unless actually passes
npm run build
# With PostgreSQL running:
npm run prisma:migrate  # or prisma:deploy
ADMIN_INITIAL_PASSWORD='StrongPasswordMin12Chars!' npm run seed
npm start
```

## Mobile dependencies
```bash
cd mobile
npm install
```

## Build debug APK (installable, locally signed debug key)
```bash
cd mobile
npx expo prebuild -p android --non-interactive
cd android
./gradlew assembleDebug
# Output: android/app/build/outputs/apk/debug/app-debug.apk
```
Copy to release: `cp app/build/outputs/apk/debug/app-debug.apk ../../release/ravendora-debug.apk && sha256sum ../../release/ravendora-debug.apk > ../../release/ravendora-debug.apk.sha256`

## Build release APK (requires signing)
- Create keystore (keep private, never commit): `keytool -genkeypair -v -storetype PKCS12 -keystore ravendora-release.keystore -alias ravendora -keyalg RSA -keysize 2048 -validity 10000`
- Configure `android/gradle.properties` and `android/app/build.gradle` signingConfigs per React Native/Gradle docs (use env vars for passwords).
- Run: `cd mobile/android && ./gradlew assembleRelease` → `app/build/outputs/apk/release/`.
- **Do not label as production-signed unless signed with production credentials.**

## Alternative: EAS Build
```bash
npm i -g eas-cli && eas login
cd mobile
eas build:configure
eas build -p android --profile preview   # APK for internal/testing
# download artifact to release/
```

## Verification
- `ls -lh release/*.apk` (nonzero size) and `sha256sum -c release/*.apk.sha256`
- Inspect metadata: `aapt dump badging release/ravendora-debug.apk | head -20` (requires build-tools)
- Install/launch: `adb install -r release/ravendora-debug.apk` on emulator/device with USB debugging.
