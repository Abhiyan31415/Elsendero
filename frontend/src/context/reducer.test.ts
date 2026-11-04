import { describe, expect, it } from 'vitest';
import reducer from './reducer';
import { SESSION_KEY } from './session';
import { initialState, type State } from './state';
import type { CurrentUser, Trail } from '@/types';

const user: CurrentUser = { id: '1', name: 'Sita', email: 'sita@example.com', photoURL: '', token: 'jwt' };

const trail = (id: string, lng: number, lat: number, price: number): Trail => ({
  id,
  sloc: [lng, lat],
  floc: [lng + 0.1, lat + 0.1],
  checkp: [],
  price,
  title: `Trail ${id}`,
  description: 'desc',
  images: [],
  uid: '1',
  uName: 'Sita',
  uPhoto: '',
});

describe('reducer', () => {
  it('UPDATE_USER stores the session in state and localStorage', () => {
    const next = reducer(initialState, { type: 'UPDATE_USER', payload: user });
    expect(next.currentUser).toEqual(user);
    expect(next.authReady).toBe(true);
    expect(JSON.parse(window.localStorage.getItem(SESSION_KEY) ?? 'null')).toEqual(user);
  });

  it('UPDATE_USER with null clears storage', () => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    const next = reducer({ ...initialState, currentUser: user }, { type: 'UPDATE_USER', payload: null });
    expect(next.currentUser).toBeNull();
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('LOGOUT clears the user, profile dialog and storage', () => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    const state: State = {
      ...initialState,
      currentUser: user,
      profile: { open: true, file: null, photoURL: 'blob:x' },
    };
    const next = reducer(state, { type: 'LOGOUT' });
    expect(next.currentUser).toBeNull();
    expect(next.profile).toEqual({ open: false, file: null, photoURL: '' });
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('RESTORE_SESSION marks auth as ready without touching storage', () => {
    const next = reducer(initialState, { type: 'RESTORE_SESSION', payload: user });
    expect(next).toMatchObject({ currentUser: user, authReady: true });
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it('UPDATE_TRAILS resets filters and shows all trails; filters combine', () => {
    const trails = [trail('a', 85, 27, 0), trail('b', 85.5, 27.5, 120), trail('c', 10, 10, 20)];
    let s = reducer(initialState, { type: 'UPDATE_TRAILS', payload: trails });
    expect(s.filteredTrails).toHaveLength(3);
    s = reducer(s, { type: 'FILTER_PRICE', payload: 50 });
    expect(s.filteredTrails.map((t) => t.id)).toEqual(['a', 'c']);
    s = reducer(s, { type: 'FILTER_ADDRESS', payload: { lng: 85.2, lat: 27.2 } });
    expect(s.filteredTrails.map((t) => t.id)).toEqual(['a']);
    s = reducer(s, { type: 'CLEAR_ADDRESS' });
    expect(s.filteredTrails.map((t) => t.id)).toEqual(['a', 'c']);
  });

  it('manages checkpoints and images', () => {
    let s = reducer(initialState, { type: 'ADD_CHECKPOINT', payload: { lng: 1, lat: 2, description: '' } });
    s = reducer(s, { type: 'UPDATE_CHECKPOINT', payload: { index: 0, description: 'Camp' } });
    expect(s.checkpoints[0].description).toBe('Camp');
    s = reducer(s, { type: 'DELETE_CHECKPOINT', payload: 0 });
    expect(s.checkpoints).toEqual([]);
    s = reducer(s, { type: 'UPDATE_IMAGES', payload: 'https://x/1.png' });
    s = reducer(s, { type: 'DELETE_IMAGE', payload: 'https://x/1.png' });
    expect(s.images).toEqual([]);
  });
});
