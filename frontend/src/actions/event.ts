import { API_BASE } from '@/config';
import type { Dispatch } from '@/context/state';
import type { Event, Message, NewEvent } from '@/types';
import fetchData from './utils/fetchData';
import { unwrapList, unwrapOne } from './utils/unwrap';

export const getEvents = async (dispatch: Dispatch): Promise<Event[] | null> => {
  const result = await fetchData<unknown>({ url: `${API_BASE}/events`, method: 'GET' }, dispatch);
  return result ? unwrapList<Event>(result, 'events') : null;
};

export const createEvent = async (event: NewEvent, token: string, dispatch: Dispatch): Promise<Event | null> => {
  const result = await fetchData<unknown>({ url: `${API_BASE}/events`, body: event, token }, dispatch);
  return unwrapOne<Event>(result, 'event');
};

export const getMessages = async (
  eventId: string,
  token: string | undefined,
  dispatch: Dispatch,
): Promise<Message[] | null> => {
  const result = await fetchData<unknown>(
    { url: `${API_BASE}/messages?eventId=${encodeURIComponent(eventId)}`, method: 'GET', token },
    dispatch,
  );
  return result ? unwrapList<Message>(result, 'messages') : null;
};
