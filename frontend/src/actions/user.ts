import { API_BASE } from '@/config';
import { storedToken } from '@/context/session';
import type { AlertSeverity, AuthResult, CurrentUser, PublicUser, User } from '@/types';
import type { Dispatch } from '@/context/state';
import { uploadImage } from './upload';
import fetchData from './utils/fetchData';
import { unwrapOne } from './utils/unwrap';

const alert = (dispatch: Dispatch, message: string, severity: AlertSeverity = 'success') =>
  dispatch({ type: 'UPDATE_ALERT', payload: { open: true, message, severity } });

const toSession = ({ user, token }: AuthResult): CurrentUser => ({ ...user, token });

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}
export interface LoginInput {
  email: string;
  password: string;
}

/** Returns true on success so the caller can reset its form. */
export const register = async (input: RegisterInput, dispatch: Dispatch): Promise<boolean> => {
  const result = await fetchData<AuthResult>({ url: `${API_BASE}/auth/register`, body: input }, dispatch);
  if (!result?.token || !result.user) return false;
  dispatch({ type: 'UPDATE_USER', payload: toSession(result) });
  dispatch({ type: 'CLOSE_LOGIN' });
  alert(dispatch, `Welcome, ${result.user.name}! Your account has been created.`);
  return true;
};

/** Returns true on success so the caller can reset its form. */
export const login = async (input: LoginInput, dispatch: Dispatch): Promise<boolean> => {
  const result = await fetchData<AuthResult>({ url: `${API_BASE}/auth/login`, body: input }, dispatch);
  if (!result?.token || !result.user) return false;
  dispatch({ type: 'UPDATE_USER', payload: toSession(result) });
  dispatch({ type: 'CLOSE_LOGIN' });
  alert(dispatch, `Welcome back, ${result.user.name}!`);
  return true;
};

export const logout = (dispatch: Dispatch, message = 'You have been logged out') => {
  dispatch({ type: 'LOGOUT' });
  if (message) alert(dispatch, message);
};

/**
 * Validate a session restored from localStorage against GET /auth/me.
 * - 401 → fetchData logs the user out and shows "Session expired".
 * - network error → keep the stored session (no alert).
 */
export const loadCurrentUser = async (currentUser: CurrentUser, dispatch: Dispatch): Promise<void> => {
  if (!currentUser?.token) return;
  const result = await fetchData<{ user: User }>(
    { url: `${API_BASE}/auth/me`, method: 'GET', token: currentUser.token, silentNetworkError: true },
    dispatch,
  );
  const user = unwrapOne<User>(result, 'user');
  // Only apply if the user didn't log out / switch accounts meanwhile. /me has no token; keep ours.
  if (user && storedToken() === currentUser.token) {
    dispatch({ type: 'UPDATE_USER', payload: { ...currentUser, ...user, token: currentUser.token } });
  }
};

/** GET /users/:id — public profile. */
export const getUser = async (id: string, dispatch: Dispatch): Promise<PublicUser | null> => {
  const result = await fetchData<{ user: PublicUser } | PublicUser>(
    { url: `${API_BASE}/users/${encodeURIComponent(id)}`, method: 'GET' },
    dispatch,
  );
  return unwrapOne<PublicUser>(result, 'user');
};

/** updatedFields: { name?, file? } — works for name-only, photo-only, or both. */
export const updateProfile = async (
  currentUser: CurrentUser,
  updatedFields: { name?: string; file?: File | null },
  dispatch: Dispatch,
): Promise<void> => {
  dispatch({ type: 'START_LOADING' });
  try {
    const { name, file } = updatedFields;
    const body: { name?: string; photoURL?: string } = {};
    if (name !== undefined) body.name = name;
    if (file) {
      const photoURL = await uploadImage(file, currentUser.token, dispatch);
      if (!photoURL) return; // fetchData already showed the error
      body.photoURL = photoURL;
    }
    const result = await fetchData<AuthResult>(
      { url: `${API_BASE}/users/me`, method: 'PATCH', body, token: currentUser.token },
      dispatch,
    );
    if (result?.user) {
      // The server issues a fresh token carrying the new name/photo.
      dispatch({
        type: 'UPDATE_USER',
        payload: { ...currentUser, ...result.user, token: result.token || currentUser.token },
      });
      alert(dispatch, 'Your profile has been updated successfully');
      dispatch({ type: 'UPDATE_PROFILE', payload: { open: false, file: null, photoURL: result.user.photoURL || '' } });
    }
  } catch (error) {
    alert(dispatch, error instanceof Error ? error.message : 'Could not update your profile', 'error');
    console.error(error);
  } finally {
    dispatch({ type: 'END_LOADING' });
  }
};
