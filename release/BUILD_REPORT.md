# VAQTARA — Build Report (2026-11-12)

## Outcome: NOT BUILT — no APK exists. Nothing below claims otherwise.

**Reason:** the sandbox this work was done in can reach npm but not `dl.google.com`
(Android SDK), `services.gradle.org`, Maven Central/Google Maven, or `api.expo.dev`
(EAS). No Android SDK / Gradle can be downloaded, so `assembleRelease` cannot run there.
Build on your machine with `scripts/build-vaqtara-android.fish`.

## Actual project state (inspected)
- Mobile app was a **foundation scaffold**: one language-select screen. None of the
  requested features (auth, planner, calendar, tasks, habits, pomodoro, stats, profile,
  settings, smart scheduling) exist yet. Backend has auth/subscription routes only;
  its tests/typecheck were never run (previous env had no working install).
- No assets (icon/splash), no EAS config, app identity was RAVENDORA / com.ravendora.app.

## Defects found and fixed
| # | Defect | Fix |
|---|---|---|
| 1 | `query-string` missing -> Metro bundle failed (verified by reproducing the error) | added `query-string@^7` |
| 2 | `expo-constants` imported but not declared; expo-router peers `expo-linking`, `expo-status-bar` missing | added, versions match Expo SDK 52 map |
| 3 | `expo-system-ui` missing (prebuild warning, userInterfaceStyle ignored on Android) | added |
| 4 | Old `scripts/build-android.sh` ran `assembleDebug` -> debug APK needs a Metro server and won't run standalone | new script builds `assembleRelease` (JS bundle embedded) |
| 5 | `apiBaseUrl` defaulted to `localhost` / `10.0.2.2` — unusable in an installed APK, and cleartext HTTP is off | now `EXPO_PUBLIC_API_BASE_URL` (https); empty => "API not configured" offline result |
| 6 | Identity | name `وقتارا`, slug `vaqtara`, package `com.vaqtara.app`, scheme `vaqtara`, versionName 1.0.0 / versionCode 1 |
| 7 | No icon/splash | generated icon, adaptive icon, splash (**placeholder artwork**, replace before launch) |
| 8 | RTL | `forceRTL(true)` at startup; Android `supportsRtl=true` |
| 9 | `mobile` inside npm workspaces (hoisting risk for Gradle/Metro) | removed from root `workspaces`; mobile is self-contained |

## Verified (in sandbox, Node 22)
- `npm install` (mobile): OK, 943+ packages
- `expo install --check`: dependencies match SDK 52 map (offline map)
- `tsc --noEmit`: 0 errors
- `expo export --platform android`: **Metro bundled OK (920 modules)**
- `expo prebuild -p android`: OK. Generated project has applicationId `com.vaqtara.app`,
  `app_name` = `وقتارا`, versionName 1.0.0, versionCode 1, `supportsRtl=true`,
  `usesCleartextTraffic=false`, newArch + Hermes on.

## NOT verified
Gradle build, APK validity, install, launch, any screen on a device/emulator,
backend install/tests/typecheck, fish script syntax (fish not available in sandbox).

## Toolchain the build needs (taken from the generated project)
JDK 17 · Gradle 8.10.2 (wrapper) · compileSdk 35 · build-tools 35.0.0 · NDK 26.1.10909125 · Kotlin 1.9.25 · Node 22 LTS

## Known limitations
- Release APK is signed with Expo's **debug keystore**: installable/sideloadable, NOT Play Store ready.
- First launch after install may render LTR once; RTL applies from the next launch (React Native limitation).
- No AI features/credentials; none are faked.
