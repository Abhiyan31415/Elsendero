// Shared types matching the backend /api/v1 contract.

/** [lng, lat] */
export type LngLatTuple = [number, number];
/** [lng, lat, description] */
export type CheckpointTuple = [number, number, string];

export interface LngLat {
  lng: number;
  lat: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string;
}

/** Public profile returned by GET /users/:id (email may be omitted). */
export type PublicUser = Pick<User, 'id' | 'name' | 'photoURL'> & Partial<Pick<User, 'email'>>;

/** The session kept in context/localStorage: the user plus their JWT. */
export interface CurrentUser extends User {
  token: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export interface Trail {
  id: string;
  /** Legacy Mongo-style id, still sent by some backends. */
  _id?: string;
  sloc: LngLatTuple;
  floc: LngLatTuple;
  checkp: CheckpointTuple[];
  price: number;
  title: string;
  description: string;
  /** Absolute URLs, or legacy relative `/uploads/...` paths (possibly nested arrays). */
  images: string[];
  difficulty?: number | null;
  rating?: number;
  uid: string;
  uName: string;
  uPhoto: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Body of POST /trails. */
export interface NewTrail {
  sloc: LngLatTuple;
  floc: LngLatTuple;
  checkp: CheckpointTuple[];
  price: number;
  title: string;
  description: string;
  images: string[];
}

export interface Event {
  id: string;
  _id?: string;
  title: string;
  description: string;
  from: string;
  to: string;
  location: string;
  participants: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type NewEvent = Pick<Event, 'title' | 'description' | 'from' | 'to' | 'location' | 'participants'>;

export interface Message {
  id: string;
  _id?: string;
  eventId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
}

export interface UploadResult {
  key: string;
  url: string;
}

export type ApiSuccess<T> = { success: true; result: T };
export type ApiError = { success: false; message: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type AlertSeverity = 'success' | 'info' | 'warning' | 'error';

export interface AlertState {
  open: boolean;
  severity: AlertSeverity;
  message: string;
}

export interface ProfileState {
  open: boolean;
  file: File | null;
  photoURL: string;
}

export interface TrailDetails {
  title: string;
  description: string;
  price: number;
}

export interface Checkpoint extends LngLat {
  description: string;
}

/** Stable id for records that may come with `id` and/or legacy `_id`. */
export const recordId = (r: { id?: string | number; _id?: string | number }): string =>
  String(r.id ?? r._id ?? '');
