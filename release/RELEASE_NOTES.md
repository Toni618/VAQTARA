# RAVENDORA 1.0.0 — Release Notes (Delivery Attempt 2026-11-12)

## Status: APK NOT DELIVERED (genuine build blockers)

No installable Android APK was produced in this session because required Android build toolchain (JDK 17+, Android SDK/Gradle/Build-Tools, platform) is not installed on the host and cannot be installed without privileged access/credentials, and backend dependencies could not be installed successfully (npm install stalled). **No APK has been fabricated.**

## What is included in repository
- Existing foundation preserved (backend/admin-dashboard/mobile scaffolds, docs, original backups).
- Phase 1.1 stabilization work: app factory, auth/subscription/premium/trial/admin-seed fixes, added tests (not executed), env/docs updates. See `DEVELOPMENT_STATUS.md`, `docs/ENGINEERING_REPORT.md`.
- Mobile scaffold: Expo/React Native config (`com.ravendora.app`), i18n (fa/en) with RTL toggle hook, language selection screen, basic API client (`mobile/src/services/api.ts`) with offline-safe responses (no fake server data).
- Release helpers: `scripts/build-android.sh` (template), this `release/` directory with blockers, build/install instructions, and test notes.

## Known limitations / not implemented
- Full product scope (complete Persian-first galaxy UI, full onboarding, all core features and 20 exclusive features as fully functional modules, complete admin dashboard, verified payment/store billing, live AI, notifications/jobs/sync/offline, comprehensive QA) is **not complete**.
- Backend verification blocked: dependencies not installed → `prisma generate/validate`, `typecheck`, `test`, `build` not executed.
- PostgreSQL unavailable locally; migrations/seed/live DB verification not run.
- No release-signed APK/AAB; iOS requires macOS/Xcode.

## Required to complete APK delivery
See `release/BLOCKERS.md` for exact commands/actions (install JDK+Android SDK, complete `npm install`, configure PostgreSQL, then build via Expo prebuild + Gradle or EAS).
