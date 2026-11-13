# API Overview (RAVENDORA v1, Foundation)

Base URL: `/api/v1`
Auth: Bearer JWT access token (where required). Refresh via `/auth/refresh`.

## Implemented (scaffold)
- `GET /health` — service health
- `GET /ready` — readiness
- `POST /auth/register` — create user (username/password, optional email/displayName/preferredLanguage)
- `POST /auth/login` — returns access/refresh tokens + user
- `POST /auth/refresh` — rotate refresh token, returns new tokens
- `POST /auth/logout` — revoke current session (auth required)
- `GET /me/subscription` — server-side trial/subscription status (auth required)
- `POST /me/subscription/activate-trial` — first server-verified 24h activation, idempotent (auth required)

## Planned (not yet implemented)
- Profile/preferences/onboarding, tasks/projects/goals/habits/calendar/notes/schedules/focus/analytics/achievements endpoints
- Admin APIs (users, subscriptions, payments, plans, analytics, audit logs, announcements, feature flags, support) with RBAC and audit logging
- Payment provider webhooks/verification, notifications, AI assistant endpoints (graceful unavailable state), data export/deletion, account recovery
- All premium endpoints must enforce server-authoritative premium access.
