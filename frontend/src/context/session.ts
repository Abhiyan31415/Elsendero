import type { CurrentUser } from '@/types';

export const SESSION_KEY = 'currentUser';

const isCurrentUser = (value: unknown): value is CurrentUser =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as CurrentUser).token === 'string' &&
  (value as CurrentUser).token.length > 0;

/** Read the stored session; clears corrupted values. Safe to call on the server (returns null). */
export const readStoredUser = (): CurrentUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user: unknown = JSON.parse(raw);
    if (isCurrentUser(user)) return user;
  } catch {
    // corrupted value — fall through and clear it
  }
  try {
    window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // storage unavailable
  }
  return null;
};

export const persistUser = (user: CurrentUser | null): void => {
  if (typeof window === 'undefined') return;
  try {
    if (user) window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Could not persist currentUser', error);
  }
};

/** Token currently in storage (used to detect a logout/account switch during a request). */
export const storedToken = (): string | null => readStoredUser()?.token ?? null;
