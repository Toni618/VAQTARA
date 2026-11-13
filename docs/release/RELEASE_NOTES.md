# Release Notes — RAVENDORA 1.0.0 (Foundation Draft)

Date: 2026-11-12

## Summary
Initial engineering foundation scaffold created in repository. Not a production-ready commercial release.

## Included
- Monorepo structure and documentation (architecture, plan, engineering report, build/security docs).
- Backend skeleton: Fastify/TypeScript, Prisma schema, auth endpoints, server-verified trial activation, premium gate middleware, admin seed (env-provisioned).
- Admin dashboard scaffold (React/Vite) with navigation placeholders.
- Mobile scaffold (Expo/React Native) with i18n (fa/en) and language selection entry screen.

## Not included / pending
- Complete feature implementation (core + 20 exclusives), full UI/UX, onboarding, admin functionality, payments verification, AI integration, notifications/jobs, sync/offline, comprehensive tests, and production hardening.
- Release binaries: APK/AAB/IPA not built (toolchains unavailable on scaffolding host).

## Known limitations
- Requires PostgreSQL and dependency installation to run backend; no builds/tests executed in this pass.
- iOS builds require macOS/Xcode. Android release builds require JDK/Android SDK.
- Subscription/payment/AI features require external provider configuration and verification; no simulated success.
