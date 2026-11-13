# Test & Verification Results (2026-11-12)

## Backend
- **Dependency install:** NOT COMPLETED. Multiple attempts (`npm install`, with timeouts, `--ignore-scripts`, cache clean/retry) stalled/hung on this host (Node v26.13.0, npm 12.2.2) without producing `node_modules`.
- **`npm run prisma:generate`:** NOT RUN (blocked by missing deps).
- **Prisma schema validation:** NOT RUN (blocked).
- **`npm run typecheck` (tsc):** NOT RUN (blocked).
- **`npm test` (vitest):** NOT RUN (blocked).
- **`npm run build`:** NOT RUN (blocked).

## Tests added but not executed
- `backend/tests/unit/auth.test.ts` — password hash/verify (Argon2), token hashing (SHA-256).
- `backend/tests/integration/trial-premium.test.ts` — 24h trial activation (idempotent, server-timed) and server-side premium enforcement (402/200 cases) using mocked Prisma/env. No fake payment verification.
- `backend/tests/integration/ownership.test.ts` — static authorization/ownership gap documentation.

## Mobile
- Typecheck/tests: NOT RUN (dependencies not installed in `mobile/`).

## Android build / APK
- **APK produced:** NO.
- **APK path:** N/A (`release/` contains no `.apk`).
- **SHA-256:** N/A.
- **Package metadata (aapt):** NOT VERIFIED (no APK, no build-tools).
- **Install/launch on emulator/device:** NOT VERIFIED (no APK, no adb/emulator configured).

## Main user flows
- NOT TESTED end-to-end (no running backend DB, no built APK). Core flows (onboarding, auth, tasks/calendar/habits/goals, trial/premium, notifications, AI, payments) remain unverified/incomplete.

## Notes
No tests or builds are reported as passed/fabricated. All unrun items are blocked by missing dependencies/toolchains/services as documented in `release/BLOCKERS.md`.
