import { API_BASE } from '@/config';
import { storedToken } from '@/context/session';
import type { AlertSeverity, AuthResult, CurrentUser, PublicUser, RegisterResult, User } from '@/types';
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

const signIn = (dispatch: Dispatch, result: AuthResult, message: string) => {
  dispatch({ type: 'UPDATE_USER', payload: toSession(result) });
  dispatch({ type: 'CLOSE_LOGIN' });
  alert(dispatch, message);
};

/** Creates the account. Returns true when the verification email is on its way. */
export const register = async (input: RegisterInput, dispatch: Dispatch): Promise<boolean> => {
  const result = await fetchData<RegisterResult>({ url: `${API_BASE}/auth/register`, body: input }, dispatch);
  return Boolean(result?.user);
};

export type LoginOutcome = 'ok' | 'unverified' | 'failed';

export const login = async (input: LoginInput, dispatch: Dispatch): Promise<LoginOutcome> => {
  let unverified = false;
  const result = await fetchData<AuthResult>(
    {
      url: `${API_BASE}/auth/login`,
      body: input,
      onErrorCode: (code) => (unverified = code === 'EMAIL_NOT_VERIFIED'),
    },
    dispatch,
  );
  if (unverified) return 'unverified';
  if (!result?.token || !result.user) return 'failed';
  signIn(dispatch, result, `Welcome back, ${result.user.name}!`);
  return 'ok';
};

/** Asks for a new verification email. The server replies the same way whether or not the account exists. */
export const resendVerification = async (email: string, dispatch: Dispatch): Promise<boolean> => {
  const result = await fetchData<{ message: string }>(
    { url: `${API_BASE}/auth/resend-verification`, body: { email } },
    dispatch,
  );
  if (result) alert(dispatch, 'If your account still needs verifying, a new link is on its way.', 'info');
  return Boolean(result);
};

/** Sends a password reset link. Returns true when the request was accepted. */
export const forgotPassword = async (email: string, dispatch: Dispatch): Promise<boolean> => {
  const result = await fetchData<{ message: string }>(
    { url: `${API_BASE}/auth/forgot-password`, body: { email } },
    dispatch,
  );
  return Boolean(result);
};

/** Confirms the email from the link and signs the user in. */
export const verifyEmail = async (token: string, dispatch: Dispatch): Promise<boolean> => {
  const result = await fetchData<AuthResult>({ url: `${API_BASE}/auth/verify-email`, body: { token } }, dispatch);
  if (!result?.token || !result.user) return false;
  signIn(dispatch, result, `Email verified. Welcome, ${result.user.name}!`);
  return true;
};

/** Sets a new password from the emailed link and signs the user in. */
export const resetPassword = async (token: string, password: string, dispatch: Dispatch): Promise<boolean> => {
  const result = await fetchData<AuthResult>(
    { url: `${API_BASE}/auth/reset-password`, body: { token, password } },
    dispatch,
  );
  if (!result?.token || !result.user) return false;
  signIn(dispatch, result, 'Your password has been changed and you are now logged in.');
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
