'use client';

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
  type RefObject,
} from 'react';
import type { MapRef } from 'react-map-gl';
import reducer from './reducer';
import { readStoredUser } from './session';
import { initialState, type Dispatch, type State } from './state';

export interface ContextValue {
  state: State;
  dispatch: Dispatch;
  /** The main cluster map (set by ClusterMap). */
  mapRef: RefObject<MapRef | null>;
  /** Sidebar slot where the map geocoder input is mounted. */
  containerRef: RefObject<HTMLDivElement | null>;
}

const Context = createContext<ContextValue | null>(null);

export const useValue = (): ContextValue => {
  const value = useContext(Context);
  if (!value) throw new Error('useValue must be used inside <ContextProvider>');
  return value;
};

interface Props {
  children: ReactNode;
  /** Override parts of the initial state (tests). */
  initial?: Partial<State>;
}

const ContextProvider = ({ children, initial }: Props) => {
  const [state, dispatch] = useReducer(reducer, initial ? { ...initialState, ...initial } : initialState);
  const mapRef = useRef<MapRef | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // localStorage is only available in the browser: restore the session right after
  // hydration (the server render always starts logged-out with authReady=false, so
  // protected pages show a spinner instead of flashing the "please log in" message).
  useEffect(() => {
    if (initial?.authReady) return;
    dispatch({ type: 'RESTORE_SESSION', payload: readStoredUser() });
  }, [initial?.authReady]);

  return (
    <Context.Provider value={{ state, dispatch, mapRef, containerRef }}>{children}</Context.Provider>
  );
};

export default ContextProvider;
