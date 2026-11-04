import fetchData from './utils/fetchData.js';
import { v4 as uuidv4 } from 'uuid';
import uploadFile from '../firebase/uploadFile';
import { API_URL } from '../config';

const url = `${API_URL}/user`;

const alert = (dispatch, message, severity = 'success') =>
    dispatch({ type: 'UPDATE_ALERT', payload: { open: true, message, severity } });

/** Returns true on success so the caller can reset its form. */
export const register = async (user, dispatch) => {
    const result = await fetchData({ url: `${url}/register`, body: user }, dispatch);
    if (!result) return false;
    dispatch({ type: 'UPDATE_USER', payload: result });
    dispatch({ type: 'CLOSE_LOGIN' });
    alert(dispatch, `Welcome, ${result.name}! Your account has been created.`);
    return true;
};

/** Returns true on success so the caller can reset its form. */
export const login = async (user, dispatch) => {
    const result = await fetchData({ url: `${url}/login`, body: user }, dispatch);
    if (!result) return false;
    dispatch({ type: 'UPDATE_USER', payload: result });
    dispatch({ type: 'CLOSE_LOGIN' });
    alert(dispatch, `Welcome back, ${result.name}!`);
    return true;
};

export const logout = (dispatch, message = 'You have been logged out') => {
    dispatch({ type: 'LOGOUT' });
    if (message) alert(dispatch, message);
};

const storedToken = () => {
    try {
        return JSON.parse(localStorage.getItem('currentUser'))?.token ?? null;
    } catch {
        return null;
    }
};

/**
 * Validate a session restored from localStorage against GET /user/me.
 * - 401 → fetchData logs the user out and shows "Session expired".
 * - network error → keep the stored session (no alert).
 */
export const loadCurrentUser = async (currentUser, dispatch) => {
    if (!currentUser?.token) return;
    const result = await fetchData(
        { url: `${url}/me`, method: 'GET', token: currentUser.token, silentNetworkError: true },
        dispatch
    );
    if (result && storedToken() === currentUser.token) {
        // Only apply if the user didn't log out / switch accounts meanwhile.
        // /me does not return a token; keep the existing one.
        dispatch({ type: 'UPDATE_USER', payload: { ...currentUser, ...result, token: currentUser.token } });
    }
};

/**
 * updatedFields: { name?, file? } — works for name-only, photo-only, or both.
 */
export const updateProfile = async (currentUser, updatedFields, dispatch) => {
    dispatch({ type: 'START_LOADING' });
    const { name, file } = updatedFields;
    try {
        const body = {};
        if (name !== undefined) body.name = name;
        if (file) {
            const ext = file.name?.split('.').pop();
            const imageName = ext ? `${uuidv4()}.${ext}` : uuidv4();
            const photoURL = await uploadFile(file, `profile/${currentUser.id}/${imageName}`);
            if (photoURL) body.photoURL = photoURL;
        }
        const result = await fetchData(
            { url: `${url}/updateProfile`, method: 'PATCH', body, token: currentUser.token },
            dispatch
        );
        if (result) {
            dispatch({ type: 'UPDATE_USER', payload: { ...currentUser, ...result } });
            alert(dispatch, 'Your profile has been updated successfully');
            dispatch({ type: 'UPDATE_PROFILE', payload: { open: false, file: null, photoURL: result.photoURL || '' } });
        }
    } catch (error) {
        alert(dispatch, error.message || 'Could not update your profile', 'error');
        console.error(error);
    }
    dispatch({ type: 'END_LOADING' });
};
