import type { LngLat, Trail } from '@/types';
import { persistUser } from './session';
import {
  EMPTY_DETAILS,
  EMPTY_PROFILE,
  type Action,
  type State,
} from './state';

export const applyFilter = (trails: Trail[], address: LngLat | null, price: number | null): Trail[] => {
  let filtered = trails;
  if (address) {
    const { lng, lat } = address;
    filtered = filtered.filter(
      (trail) => Math.abs(lng - trail.sloc[0]) <= 1 && Math.abs(lat - trail.sloc[1]) <= 1,
    );
  }
  if (price !== null) {
    filtered = filtered.filter((trail) => (trail.price ?? 0) <= price);
  }
  return filtered;
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'OPEN_LOGIN':
      return { ...state, openLogin: true };
    case 'CLOSE_LOGIN':
      return { ...state, openLogin: false };
    case 'START_LOADING':
      return { ...state, loading: true };
    case 'END_LOADING':
      return { ...state, loading: false };
    case 'RESTORE_SESSION':
      return { ...state, currentUser: action.payload, authReady: true };
    case 'UPDATE_USER':
      persistUser(action.payload);
      return { ...state, currentUser: action.payload ?? null, authReady: true };
    case 'LOGOUT':
      persistUser(null);
      return { ...state, currentUser: null, profile: EMPTY_PROFILE };
    case 'UPDATE_ALERT':
      return { ...state, alert: action.payload };
    case 'UPDATE_PROFILE':
      return { ...state, profile: action.payload };
    case 'UPDATE_IMAGES':
      return { ...state, images: [...state.images, action.payload] };
    case 'DELETE_IMAGE':
      return { ...state, images: state.images.filter((url) => url !== action.payload) };
    case 'UPDATE_DETAILS':
      return { ...state, details: { ...state.details, ...action.payload } };
    case 'UPDATE_SLOCATION':
      return { ...state, slocation: action.payload };
    case 'UPDATE_FLOCATION':
      return { ...state, flocation: action.payload };
    case 'ADD_CHECKPOINT':
      return { ...state, checkpoints: [...state.checkpoints, action.payload] };
    case 'DELETE_CHECKPOINT':
      return { ...state, checkpoints: state.checkpoints.filter((_, i) => i !== action.payload) };
    case 'UPDATE_CHECKPOINT': {
      const { index, description } = action.payload;
      return {
        ...state,
        checkpoints: state.checkpoints.map((cp, i) => (i === index ? { ...cp, description } : cp)),
      };
    }
    case 'RESET_TRAIL':
      return {
        ...state,
        images: [],
        details: EMPTY_DETAILS,
        slocation: { lng: 0, lat: 0 },
        flocation: { lng: 0, lat: 0 },
        checkpoints: [],
      };
    case 'UPDATE_TRAILS':
      return {
        ...state,
        trails: action.payload,
        addressFilter: null,
        priceFilter: null,
        filteredTrails: action.payload,
      };
    case 'UPDATE_TRAIL':
      return { ...state, trail: action.payload };
    case 'FILTER_PRICE':
      return {
        ...state,
        priceFilter: action.payload,
        filteredTrails: applyFilter(state.trails, state.addressFilter, action.payload),
      };
    case 'RESET_FILTERS':
      return { ...state, priceFilter: null, addressFilter: null, filteredTrails: state.trails };
    case 'FILTER_ADDRESS':
      return {
        ...state,
        addressFilter: action.payload,
        filteredTrails: applyFilter(state.trails, action.payload, state.priceFilter),
      };
    case 'CLEAR_ADDRESS':
      return {
        ...state,
        addressFilter: null,
        filteredTrails: applyFilter(state.trails, null, state.priceFilter),
      };
    default: {
      const unknown: never = action;
      throw new Error(`No matched action: ${(unknown as { type: string }).type}`);
    }
  }
};

export default reducer;
