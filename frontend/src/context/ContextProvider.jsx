/* eslint-disable react/prop-types, react-refresh/only-export-components */
import { createContext, useContext, useReducer, useRef } from 'react';
import reducer from './reducer';

const initialState = {
    currentUser: null,
    openLogin: false,
    loading: false,
    alert: { open: false, severity: 'info', message: '' },
    profile: { open: false, file: null, photoURL: '' },
    images: [],
    details: { title: '', description: '', price: 0 },
    slocation: { lng: 0, lat: 0 },
    flocation: { lng: 0, lat: 0 },
    checkpoints: [],
    trails: [],
    priceFilter: 150,
    addressFilter: null,
    filteredTrails: [],
    trail: null,
};

// Restore the stored session synchronously so the first render already knows
// whether the user is logged in (avoids a flash of the "please login" message).
const readStoredUser = () => {
    try {
        const raw = localStorage.getItem('currentUser');
        if (!raw) return null;
        const user = JSON.parse(raw);
        if (user && typeof user === 'object' && typeof user.token === 'string' && user.token) {
            return user;
        }
    } catch {
        // corrupted value — fall through and clear it
    }
    try {
        localStorage.removeItem('currentUser');
    } catch {
        // storage unavailable
    }
    return null;
};

const init = (state) => ({ ...state, currentUser: readStoredUser() });

const Context = createContext(initialState);
export const useValue = () => useContext(Context);

const ContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState, init);
    const mapRef = useRef();
    const containerRef = useRef();
    return (
        <Context.Provider value={{ state, dispatch, mapRef, containerRef }}>{children}</Context.Provider>
    );
};
export default ContextProvider;
