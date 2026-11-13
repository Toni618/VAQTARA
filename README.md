# RAVENDORA 1.0.0

RAVENDORA is an in-progress intelligent personal productivity, daily planning, schedule engineering and life management platform (Persian-first, English supported).

## Repository status (2026-11-12)
This repository contains an initial architecture, backend foundation, and project scaffolding. It is **not** a complete, production-ready commercial release yet.

### Implemented (initial foundation)
- Monorepo structure (`backend/`, `admin-dashboard/`, `mobile/`, `docs/`, `packages/`)
- Architecture draft and implementation plan: `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_PLAN.md`
- Backend (Node.js/TypeScript/Fastify) skeleton with:
  - Environment validation (`backend/.env.example`)
  - Prisma/PostgreSQL schema covering core entities (users, tasks, projects, goals, habits, calendar, notes, schedules, focus, subscriptions, payments, audit logs, etc.)
  - Health endpoint, auth (register/login/refresh/logout), JWT + refresh session records, Argon2 password hashing
  - Server-verified 24h trial activation endpoint and server-authoritative premium gate middleware (foundation)
  - Secure admin provisioning seed script (requires `ADMIN_INITIAL_PASSWORD` env; never hardcoded)

### Not yet implemented / incomplete
- Full mobile apps (Android/iOS), onboarding flow, galaxy UI, all 20+ core/exclusive features
- Complete admin dashboard, payments/billing provider integrations and verified purchase flows
- Background jobs, notifications delivery, AI provider integration, sync/offline behavior
- Comprehensive automated tests, security hardening audit, release builds (APK/AAB/IPA)

## Environment notes
- Dev host used for scaffolding: Linux (CachyOS), Node v26.13.0, Python 3.14.9.
- **Not available on this host:** Java/JDK, Android SDK, Flutter, Docker, Xcode. Signed APK/AAB and iOS binaries cannot be produced here; iOS builds require macOS/Xcode. This repo will provide source, configs, and build/deploy instructions/CI guidance rather than fabricated artifacts.

## Backend (foundation) quick start
Requirements: Node.js >= 20, PostgreSQL.

```bash
cd backend
cp .env.example .env   # set DATABASE_URL and strong JWT secrets
npm install
npm run prisma:generate
# npm run prisma:migrate  # requires PostgreSQL
# ADMIN_INITIAL_PASSWORD='StrongPasswordHere123!' npm run seed  # provisions admin toni618 securely
npm run dev
```
API base: `http://localhost:4000/api/v1` (health: `/health`).

## Security
- Never commit secrets, signing keys, or production passwords.
- Administrator `toni618` must be provisioned via secure install/env (`ADMIN_INITIAL_PASSWORD`), never hardcoded.
- Trial/subscription/premium status must be enforced server-side (client state is untrusted). No absolute anti-bypass guarantee is claimed.

## Documentation
See `docs/` for architecture, plan, and forthcoming API/security/deployment/user/release docs.
