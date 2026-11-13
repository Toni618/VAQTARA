/**
 * API client with graceful fallback when backend is unavailable.
 * No fake data is presented as verified server state.
 */
import Constants from 'expo-constants';

// Set EXPO_PUBLIC_API_BASE_URL (https://...) at build time. Empty => app runs in offline/local mode.
export const BASE_URL: string = process.env.EXPO_PUBLIC_API_BASE_URL || (Constants.expoConfig?.extra as any)?.apiBaseUrl || '';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string; status?: number; offline?: boolean };

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string | null, refresh?: string | null) {
  accessToken = access;
  if (refresh !== undefined) refreshToken = refresh;
}
export function getTokens() { return { accessToken, refreshToken }; }

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as any) };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (!BASE_URL) return { ok: false, error: 'API not configured', offline: true };
  try {
    const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
    let body: any = null;
    try { body = await res.json(); } catch { body = null; }
    if (res.status === 401 && retry && refreshToken) {
      const rr = await fetch(`${BASE_URL}/auth/refresh`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken }) });
      if (rr.ok) {
        const rb = await rr.json();
        accessToken = rb.accessToken; refreshToken = rb.refreshToken;
        return request<T>(path, init, false);
      }
    }
    if (!res.ok) return { ok: false, error: body?.message || body?.error || `HTTP ${res.status}`, status: res.status };
    return { ok: true, data: body as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Network error', offline: true };
  }
}

export const api = {
  register: (p: any) => request('/auth/register', { method: 'POST', body: JSON.stringify(p) }),
  login: (p: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(p) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  meSubscription: () => request('/me/subscription'),
  activateTrial: () => request('/me/subscription/activate-trial', { method: 'POST' }),
  health: () => request('/health'),
};
