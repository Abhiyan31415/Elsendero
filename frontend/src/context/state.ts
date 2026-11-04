import type {
  AlertState,
  Checkpoint,
  CurrentUser,
  LngLat,
  ProfileState,
  Trail,
  TrailDetails,
} from '@/types';

export const MAX_PRICE_FILTER = 150;

export interface State {
  currentUser: CurrentUser | null;
  /** False until the stored session has been read from localStorage on the client. */
  authReady: boolean;
  openLogin: boolean;
  loading: boolean;
  alert: AlertState;
  profile: ProfileState;
  // Add-trail wizard
  images: string[];
  details: TrailDetails;
  slocation: LngLat;
  flocation: LngLat;
  checkpoints: Checkpoint[];
  // Trails + filters
  trails: Trail[];
  priceFilter: number;
  addressFilter: LngLat | null;
  filteredTrails: Trail[];
  /** Trail shown in the quick-view dialog. */
  trail: Trail | null;
}

export const EMPTY_DETAILS: TrailDetails = { title: '', description: '', price: 0 };
export const EMPTY_PROFILE: ProfileState = { open: false, file: null, photoURL: '' };

export const initialState: State = {
  currentUser: null,
  authReady: false,
  openLogin: false,
  loading: false,
  alert: { open: false, severity: 'info', message: '' },
  profile: EMPTY_PROFILE,
  images: [],
  details: EMPTY_DETAILS,
  slocation: { lng: 0, lat: 0 },
  flocation: { lng: 0, lat: 0 },
  checkpoints: [],
  trails: [],
  priceFilter: MAX_PRICE_FILTER,
  addressFilter: null,
  filteredTrails: [],
  trail: null,
};

export type Action =
  | { type: 'OPEN_LOGIN' }
  | { type: 'CLOSE_LOGIN' }
  | { type: 'START_LOADING' }
  | { type: 'END_LOADING' }
  /** Hydrate the session read from storage (does not write storage). */
  | { type: 'RESTORE_SESSION'; payload: CurrentUser | null }
  | { type: 'UPDATE_USER'; payload: CurrentUser | null }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_ALERT'; payload: AlertState }
  | { type: 'UPDATE_PROFILE'; payload: ProfileState }
  | { type: 'UPDATE_IMAGES'; payload: string }
  | { type: 'DELETE_IMAGE'; payload: string }
  | { type: 'UPDATE_DETAILS'; payload: Partial<TrailDetails> }
  | { type: 'UPDATE_SLOCATION'; payload: LngLat }
  | { type: 'UPDATE_FLOCATION'; payload: LngLat }
  | { type: 'ADD_CHECKPOINT'; payload: Checkpoint }
  | { type: 'DELETE_CHECKPOINT'; payload: number }
  | { type: 'UPDATE_CHECKPOINT'; payload: { index: number; description: string } }
  | { type: 'RESET_TRAIL' }
  | { type: 'UPDATE_TRAILS'; payload: Trail[] }
  | { type: 'UPDATE_TRAIL'; payload: Trail | null }
  | { type: 'FILTER_PRICE'; payload: number }
  | { type: 'FILTER_ADDRESS'; payload: LngLat }
  | { type: 'CLEAR_ADDRESS' };

export type Dispatch = (action: Action) => void;
