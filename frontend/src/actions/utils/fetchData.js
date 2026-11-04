const NETWORK_ERROR_MESSAGE = "Can't reach the server. Please check your connection and try again.";
const SESSION_EXPIRED_MESSAGE = 'Session expired, please log in again';

// Endpoints where a 401 means "bad credentials", not "expired session".
const AUTH_ENDPOINT_RE = /\/user\/(login|register)\/?$/;

/**
 * Small fetch wrapper used by all actions.
 *
 * Returns `data.result` on success, or `null` on any failure (after showing an alert).
 * Options:
 *  - method: defaults to POST (GET/HEAD never send a body)
 *  - token: adds `Authorization: Bearer <token>`
 *  - body: JSON-serialisable payload
 *  - silentNetworkError: don't show an alert when the server can't be reached
 */
const fetchData = async (
    { url, method = 'POST', token = '', body = null, silentNetworkError = false },
    dispatch
) => {
    const upperMethod = method.toUpperCase();
    const canHaveBody = body !== null && body !== undefined && !['GET', 'HEAD'].includes(upperMethod);

    const headers = {
        // Harmless outside ngrok; lets ngrok-tunnelled backends skip their HTML interstitial.
        'ngrok-skip-browser-warning': 'true',
        ...(canHaveBody ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const showError = (message) =>
        dispatch({ type: 'UPDATE_ALERT', payload: { open: true, message, severity: 'error' } });

    let response;
    try {
        response = await fetch(url, {
            method: upperMethod,
            headers,
            ...(canHaveBody ? { body: JSON.stringify(body) } : {}),
        });
    } catch (error) {
        console.error(error);
        if (!silentNetworkError) showError(NETWORK_ERROR_MESSAGE);
        return null;
    }

    let data = null;
    try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
    } catch {
        data = null; // non-JSON response (HTML error page, ngrok interstitial, proxy error...)
    }

    const isAuthEndpoint = AUTH_ENDPOINT_RE.test(new URL(url, window.location.origin).pathname);

    if (response.status === 401 && token && !isAuthEndpoint) {
        dispatch({ type: 'LOGOUT' });
        dispatch({
            type: 'UPDATE_ALERT',
            payload: { open: true, message: SESSION_EXPIRED_MESSAGE, severity: 'warning' },
        });
        return null;
    }

    if (!response.ok || !data || data.success === false) {
        let message = data?.message;
        if (!message) {
            if (response.status >= 500 || response.status === 0) {
                message = 'The server ran into a problem. Please try again later.';
            } else if (!data) {
                message = response.ok
                    ? 'Unexpected response from the server.'
                    : `Request failed (${response.status}).`;
            } else {
                message = `Request failed (${response.status}).`;
            }
        }
        showError(message);
        return null;
    }

    return data.result ?? null;
};

export default fetchData;
