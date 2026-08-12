const fetchData = async ({ url, method = 'POST', token = '', body = null }, dispatch) => {
    const headers = {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    const config = {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {})
    };

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!data.success) {
            if (response.status === 401) {
                dispatch({ type: 'UPDATE_USER', payload: null });
            }
            throw new Error(data.message);
        }
        return data.result;
    } catch (error) {
        dispatch({
            type: 'UPDATE_ALERT',
            payload: { open: true, message: error.message, severity: 'error' }
        });
        console.log(error);
        return null;
    }
};

export default fetchData;