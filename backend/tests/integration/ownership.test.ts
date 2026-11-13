import { describe, it, expect } from 'vitest';

/**
 * Ownership/authorization gap analysis (static, no DB).
 * Documents missing server-side ownership enforcement in current foundation.
 * Phase 1.1 requires identification; full implementation is a later phase.
 */
describe('ownership and authorization review', () => {
  it('documents current endpoint surface and gaps', () => {
    const implementedEndpoints = [
      'GET /api/v1/health',
      'GET /api/v1/ready',
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/login',
      'POST /api/v1/auth/refresh',
      'POST /api/v1/auth/logout (auth)',
      'GET /api/v1/me/subscription (auth, self)',
      'POST /api/v1/me/subscription/activate-trial (auth, self)',
    ];
    const gaps = [
      'No resource CRUD endpoints yet (tasks/projects/goals/etc.) so per-resource ownership checks are not implemented/testable; must be added when resources are introduced (always scope by authenticated userId; admins only via explicit admin routes with RBAC).',
      'No admin management endpoints yet; requireAdmin decorator exists but no admin routes/audit enforcement beyond seed.',
      'Subscription routes correctly scope to request.user.sub (self-only) — no cross-user access path observed.',
      'Refresh token payload.sid must match a session belonging to payload.sub; current code checks session by sid but does not assert session.userId === payload.sub (potential gap if sid guessed/mismatched).',
      'Login does not revoke prior sessions or enforce device/session limits; rate limiting is global only (no per-account login attempt protection).',
      'Account recovery, email verification, 2FA not implemented.',
    ];
    expect(implementedEndpoints.length).toBeGreaterThan(0);
    expect(gaps.length).toBeGreaterThan(0);
  });
});
