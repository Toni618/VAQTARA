# Security Notes (RAVENDORA 1.0.0 — Foundation)

## Implemented (baseline)
- Password hashing with Argon2 (backend).
- JWT access tokens + refresh token rotation with server-side session records and revocation on logout/reuse detection.
- Server-authoritative 24h trial activation endpoint and premium access middleware (must be applied to all premium APIs).
- Admin provisioning via environment/seed script only (`ADMIN_INITIAL_PASSWORD`), not hardcoded. Username default `toni618`.
- Input validation with Zod on auth routes; centralized error handling; Helmet and rate limiting registered.
- `.gitignore` excludes env files, keys, keystores.

## Required for production (not complete)
- Full OWASP API/Mobile hardening review; CSRF considerations for web contexts; strict CORS allowlists.
- Strong, rotated JWT secrets and secret management (vault/CI secrets); TLS everywhere.
- Rate limiting tuning, login attempt protection/lockout, account recovery flows, optional 2FA for admin.
- Server-side authorization on every endpoint (RBAC/ownership checks) and audit logging coverage for all sensitive actions.
- Verified payment receipt/webhook handling with idempotency and provider signature verification.
- Integrity signals (Play Integrity / App Attest) where available; honest limitations documented (no absolute bypass-proof guarantee).
- Dependency scanning, encrypted backups, secure local storage on mobile (Keychain/Keystore), data export/deletion workflows, privacy controls.
- Do not claim features verified until tested in target environments.
