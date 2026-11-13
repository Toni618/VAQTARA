# RAVENDORA 1.0.0 — Technical Architecture (Draft)

## 1. Goals & Constraints
- Premium cross-platform productivity platform (Android, iOS, backend, admin).
- Persian-first (RTL) + English; onboarding language selection on first launch.
- Server-authoritative auth, trial (24h from first server-verified activation), subscriptions, admin.
- Environment: Linux dev host without Android SDK/Java/Flutter/Docker/Xcode; deliver source, configs, and reproducible build/deploy instructions. APK/AAB/iOS binaries require platform toolchains/CI or macOS (iOS) — do not fake artifacts.

## 2. High-level Components
- **Mobile app (`mobile/`)**: React Native (Expo) + TypeScript for shared Android/iOS codebase, Expo Router, i18n (fa/en, RTL), secure storage, notifications, offline-capable local cache with server sync. UI: custom galaxy theme, animations (respect reduced motion).
- **Backend API (`backend/`)**: Node.js + TypeScript, Fastify/Nest-style modular monolith (pragmatic), PostgreSQL, Prisma migrations, REST API versioned `/api/v1`, JWT access + refresh rotation, RBAC (user/admin).
- **Admin dashboard (`admin-dashboard/`)**: Web SPA (React/Vite) consuming admin APIs; served separately or behind backend.
- **Database**: PostgreSQL (production-grade). Local dev via Docker Compose when available; also support direct connection config.
- **Background jobs**: worker process/queue abstraction (e.g. BullMQ/Redis when available, or DB-backed scheduler fallback) for reminders, reports, subscription checks.
- **AI integration**: provider-agnostic adapter with explicit configuration; graceful degradation and clear "not configured/unavailable" states (never fake).

## 3. Security Principles
- Passwords hashed with Argon2/bcrypt; no plaintext.
- Server-side trial/subscription/premium enforcement on every protected endpoint.
- Rate limiting, input validation, audit logs, session/device management, token rotation/revocation.
- Admin `toni618` seeded only via secure installer/env (`ADMIN_INITIAL_PASSWORD`), never committed.
- Secrets via env vars; `.env.example` only.

## 4. Data Model (core entities)
Users, Profiles, Preferences, Tasks, Projects, Goals, Habits, CalendarEvents, Notifications, StudySchedules, WorkSchedules, FocusSessions, Achievements, Subscriptions, Payments, DevicesSessions, AuditLogs (+ supporting tables for tags, dependencies, milestones, etc.).

## 5. Subscription & Trial
- Trial starts at first server-verified activation (timestamp recorded server-side, single 24h window per account).
- Subscription state machine: none/trialing/active/past_due/canceled/expired; provider-verified receipts/webhooks; idempotent payment processing.
- Anti-abuse: server timestamps, account uniqueness, rate limits, receipt verification, integrity signals where available; layered defense with honest limitations documented.

## 6. Delivery Phasing
1. Foundation: repo structure, docs, backend skeleton, DB schema/migrations, auth.
2. Core domain APIs + mobile shell/onboarding/i18n.
3. Feature modules (tasks/calendar/habits/goals/focus/study/work/notes/analytics).
4. AI adapters, admin, subscription/payment integration scaffolding.
5. Tests, hardening, release configs, docs, packaging instructions.

## 7. Known Environment Limitations
- Cannot produce signed APK/AAB or iOS binaries on this host without Android/iOS toolchains; will provide complete projects, configs, and CI/build scripts/instructions.
- Payment store verification requires provider credentials/sandboxes; implement configurable verification with clear test/stub boundaries (no simulated success in production paths).
