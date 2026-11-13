# RAVENDORA 1.0.0 — Engineering Report

Date: 2026-11-12
Environment: CachyOS Linux (Arch-based), Node v26.13.0, npm 12.2.2, Python 3.14.9. Missing: Java/JDK, Android SDK, Flutter, Docker, Xcode, PostgreSQL client/server runtime (no `psql`, service inactive, no :5432 listener).

## Scope
Phase 1.1 requested: foundation verification and stabilization only (no next major product phase), preserving existing files/functionality and backups.

## Executed commands (this phase)
| # | Command | Result |
|---|---|---|
| 1 | `ls -la /home/danial/Projects/RAVENDORA` | OK — inspected workspace (empty scaffold present) |
| 2 | `find . -maxdepth 3 ...` | OK — listed project files |
| 3 | `cat /etc/os-release ...; node --version; python3 --version; java -version; flutter --version; docker --version` | OK — captured env; java/flutter/docker not installed |
| 4 | `cat backend/package.json` | OK — scripts identified: `dev`, `build`, `start`, `prisma:generate`, `prisma:migrate`, `prisma:deploy`, `seed`, `test` (vitest), `typecheck` |
| 5 | `node -v && npm -v && (command -v psql...) && (pg_isready...) && (systemctl is-active postgresql...) && (ss -ltn ... 5432)` | OK — Node v26.13.0, npm 12.2.2, no psql/pg_isready, postgres inactive, no 5432 listener |
| 6 | `ls -la docs && ls DEVELOPMENT_STATUS.md && find . -name DEVELOPMENT_STATUS.md` | OK — docs present; root `DEVELOPMENT_STATUS.md` missing initially |
| 7 | `cat backend/prisma/seed.ts && cat backend/src/modules/auth/routes.ts` | OK — inspected admin provisioning and auth routes |
| 8 | `cat backend/src/middleware/premium.ts && cat backend/src/modules/subscriptions/routes.ts` | OK — inspected trial/premium logic |
| 9 | `cat backend/src/plugins/auth.ts && cat backend/src/server.ts` | OK — inspected JWT/auth decorators and server wiring |
| 10 | `cat backend/src/config/env.ts && cat backend/src/lib/auth.ts` | OK — inspected env validation and auth helpers |
| 11 | `cd backend && npm install` (timeout 120s) | **Terminated** — exceeded 120s timeout in tool; no `node_modules` created |
| 12 | `ls backend/node_modules ...; ps aux \| grep npm\|node` | OK — confirmed no node_modules / no lingering npm process from attempt 1 |
| 13 | `cat backend/package-lock.json` | Not found |
| 14 | `date -u +"%Y%m%d-%H%M%S" && find . -maxdepth 2 -type f \| sort` | OK — captured timestamp and file inventory |
| 15 | `tar -czf backups/ravendora-pre-phase1.1-20261112-081054.tar.gz --exclude='backups/*.tar.gz' --exclude='node_modules' --exclude='.git' .` | **OK** — backup created (23K); original foundation backup preserved |
| 16 | `ls backups/` | OK — both backups present |
| 17 | Wrote `DEVELOPMENT_STATUS.md` (initial) | OK |
| 18 | `cd backend && npm install` retry (timeout 300s) | **Terminated** — exceeded 120s shell limit reported; no `node_modules` |
| 19 | `grep -n "fastify-plugin" backend/src/plugins/auth.ts; grep -n "jsonwebtoken" backend/src/modules/auth/routes.ts` | OK — found imports for packages missing from manifest |
| 20 | Created `backend/src/app.ts`, updated `backend/src/server.ts` | OK — extracted app factory for testing |
| 21 | Edited `backend/package.json` (added `fastify-plugin`, `jsonwebtoken`, `@types/jsonwebtoken`) | OK — defect fix in manifest |
| 22 | `mkdir -p backend/tests/unit backend/tests/integration` | OK |
| 23 | Created `backend/vitest.config.ts` | OK |
| 24 | `background_process start: cd backend && npm install --no-audit --no-fund --progress=false` (`bgp_1ced32388001h44hpVU6ihtjQD`) | **Started/running** — still running at last checks; no logs/output, no `node_modules` observed |
| 25 | Created `backend/tests/unit/auth.test.ts` | OK |
| 26 | Created `backend/tests/integration/trial-premium.test.ts` | OK (mocked Prisma; no fake payment verification) |
| 27 | `background_process status/logs` for `bgp_1ced32388001h44hpVU6ihtjQD` (multiple checks) | Running, no output |
| 28 | Created `backend/tests/integration/ownership.test.ts` | OK |
| 29 | Edited `backend/src/modules/auth/routes.ts` (refresh: require `session.userId === payload.sub`) | OK — security/ownership fix |
| 30 | Edited `backend/prisma/seed.ts` (upsert updates `passwordHash` when env password provided) | OK — provisioning fix |
| 31 | Created `backend/.env` (safe local placeholders) | OK |
| 32 | `find backend -name "*.ts" \| sort` | OK — inventory confirmed |
| 33 | Updated `DEVELOPMENT_STATUS.md`, `docs/ENGINEERING_REPORT.md` | OK |

## Test results
- **Not executed.** Backend dependencies installation did not complete; `node_modules` absent at time of reporting.
- **Blocked:** `npm run prisma:generate`, `npx prisma validate`, `npm run typecheck`, `npm test` (vitest) could not be run.
- **Tests added (pending execution):**
  - `backend/tests/unit/auth.test.ts` — Argon2 hash/verify and deterministic token hashing (SHA-256 hex)
  - `backend/tests/integration/trial-premium.test.ts` — 24h trial activation (idempotent, 24h window) and server-side premium enforcement (402 when none/expired, 200 when trial active) using **mocked Prisma** (no PostgreSQL, no fake payment verification)
  - `backend/tests/integration/ownership.test.ts` — documents endpoint surface and authorization/ownership gaps (static)

## Discovered defects and fixes applied
| Defect | Location | Fix | Status |
|---|---|---|---|
| Missing runtime deps referenced in source (`fastify-plugin`, `jsonwebtoken`) and missing `@types/jsonwebtoken` | `backend/package.json` | Added dependencies/devDependencies | Fixed in manifest (install pending) |
| Server entrypoint not testable (auto-listen in module) | `backend/src/server.ts` | Extracted `buildApp()` to `backend/src/app.ts`; server now imports and listens | Fixed |
| Refresh token rotation did not assert session ownership (`session.userId === payload.sub`) — potential session/id mismatch risk | `backend/src/modules/auth/routes.ts` | Added ownership check in session validation | Fixed |
| Admin seed upsert updated role/status but not `passwordHash` when `ADMIN_INITIAL_PASSWORD` provided | `backend/prisma/seed.ts` | Upsert now sets `passwordHash` on update (env-provided, >=12 chars; never hardcoded) | Fixed |

## Verification notes (code inspection)
- **Auth routes:** register (unique username/email, Argon2 hash), login (status check, verify password, create session, sign access+refresh, store refresh hash, audit), refresh (JWT verify, session lookup + revocation/expiry/hash match + ownership, rotate refresh, issue access), logout (auth required, revoke session by `sid`).
- **Refresh rotation/session revocation:** refresh hash stored/compared (SHA-256), reuse/mismatch revokes session; logout revokes session; fixed sid-user ownership binding.
- **24h trial:** `POST /me/subscription/activate-trial` is auth-protected, transactional, idempotent if `trialActivatedAt` set, computes `expiresAt = activatedAt + TRIAL_DURATION_HOURS*1h` server-side, persists user trial fields + trialing subscription record + audit log.
- **Premium enforcement:** `requirePremiumAccess` uses server time, DB user trial window, and active (non-expired) subscription; returns 402 `PREMIUM_REQUIRED` when absent/expired; admin bypass present. Must be applied to all premium endpoints as they are added.
- **Admin provisioning (`toni618`):** seed requires `ADMIN_INITIAL_PASSWORD` env (skips if unset), enforces >=12 chars, hashes with Argon2, upserts ADMIN/ACTIVE with password (fixed), creates profile/preferences/audit log; no hardcoded password.

## Missing ownership checks / authorization vulnerabilities (identified)
1. **Resource CRUD not yet implemented:** tasks/projects/goals/habits/calendar/notes/schedules/focus/etc. endpoints absent, so per-resource ownership enforcement is not yet testable; when added, every private resource must be queried/mutated by authenticated `userId` (never trust client IDs) with explicit admin-only exceptions.
2. **Admin surface missing:** `requireAdmin` exists but no admin management routes; future admin endpoints must enforce RBAC server-side and emit audit logs for privileged actions.
3. **Login/session hardening:** no per-account login attempt limiting/lockout, no device/session caps or "revoke other sessions" flow, no account recovery/email verification/2FA (admin 2FA recommended).
4. **Subscription status endpoint:** correctly scoped to `request.user.sub` (self-only) — no cross-user read path observed.
5. **Global rate limit only:** Fastify rate limit registered globally (200/min); sensitive endpoints (login/register/refresh) may need stricter per-route/account/IP policies.
6. **CORS/config:** dev `.env` sets restricted origin; production must enforce strict allowlists and TLS/secret management.

## PostgreSQL availability / local dev DB
- **Unavailable:** no `psql`, no `pg_isready`, `postgresql` service inactive, no port 5432 listener; Docker unavailable. Cannot create/start DB or run migrations/seeds in this environment.
- **Safe local config:** `backend/.env` added with placeholder connection `postgresql://ravendora:ravendora@localhost:5432/ravendora?schema=public` and dev-only JWT secrets (must be rotated/secured outside local dev). No real secrets committed.

## Remaining blockers
- Backend dependency installation incomplete (`bgp_1ced32388001h44hpVU6ihtjQD` running at last check) — blocks prisma generate/validate, typecheck, and tests.
- No PostgreSQL runtime — blocks migrations and live DB/integration verification.
- Full authorization hardening and domain endpoints pending (future phases).
- Missing toolchains/credentials: Java/Android SDK, Flutter, Xcode, AI/payment providers.

## Compliance notes
- Existing files/functionality preserved; original and new backups retained.
- No fake payment verification or simulated production security introduced.
- Tests not claimed as passed (not executed).
- Stopped for approval before continuing to next phase.
