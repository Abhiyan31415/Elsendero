'use client';

import { useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useValue } from '@/context/ContextProvider';
import type { Dispatch } from '@/context/state';
import { loadCurrentUser } from '@/actions/user';

// setTimeout overflows above ~24.8 days; longer tokens are re-checked on next app load.
const MAX_TIMEOUT = 2 ** 31 - 1;

/** Returns the token expiry in ms, Infinity if it has no exp, or null if the token is malformed. */
export const getExpiry = (token: string): number | null => {
  try {
    const { exp } = jwtDecode(token);
    return typeof exp === 'number' ? exp * 1000 : Infinity;
  } catch {
    return null;
  }
};

const expireSession = (dispatch: Dispatch) => {
  dispatch({ type: 'LOGOUT' });
  dispatch({
    type: 'UPDATE_ALERT',
    payload: { open: true, message: 'Session expired, please log in again', severity: 'warning' },
  });
};

/**
 * Mount once (in the app shell). Logs the user out when the token is malformed/expired,
 * schedules an automatic logout at expiry, and validates the restored session against
 * the server once the stored session has been read.
 */
function useCheckToken(): void {
  const {
    state: { currentUser, authReady },
    dispatch,
  } = useValue();
  const token = currentUser?.token;

  useEffect(() => {
    if (!token) return undefined;
    const expiry = getExpiry(token);
    if (expiry === null || expiry <= Date.now()) {
      expireSession(dispatch);
      return undefined;
    }
    const delay = expiry - Date.now();
    if (delay > MAX_TIMEOUT) return undefined;
    const timer = setTimeout(() => expireSession(dispatch), delay);
    return () => clearTimeout(timer);
  }, [token, dispatch]);

  // Validate the restored session with the server once, right after it was restored.
  const validated = useRef(false);
  useEffect(() => {
    if (!authReady || validated.current) return;
    validated.current = true;
    if (!currentUser?.token) return;
    const expiry = getExpiry(currentUser.token);
    if (expiry === null || expiry <= Date.now()) return; // handled by the effect above
    void loadCurrentUser(currentUser, dispatch);
  }, [authReady, currentUser, dispatch]);
}

export default useCheckToken;
