import { API_BASE } from '@/config';
import type { Dispatch } from '@/context/state';
import type { CurrentUser, NewTrail, Trail } from '@/types';
import fetchData from './utils/fetchData';
import { unwrapList, unwrapOne } from './utils/unwrap';

const url = `${API_BASE}/trails`;

/** Returns the created trail, or null on failure. */
export const createTrail = async (
  trail: NewTrail,
  currentUser: CurrentUser,
  dispatch: Dispatch,
): Promise<Trail | null> => {
  dispatch({ type: 'START_LOADING' });
  try {
    const result = await fetchData<Trail | { trail: Trail }>({ url, body: trail, token: currentUser.token }, dispatch);
    if (!result) return null;
    dispatch({
      type: 'UPDATE_ALERT',
      payload: { open: true, message: 'Trail has been created successfully', severity: 'success' },
    });
    dispatch({ type: 'RESET_TRAIL' });
    return unwrapOne<Trail>(result, 'trail');
  } finally {
    dispatch({ type: 'END_LOADING' });
  }
};

export const getTrails = async (dispatch: Dispatch): Promise<void> => {
  const result = await fetchData<unknown>({ url, method: 'GET' }, dispatch);
  if (result) dispatch({ type: 'UPDATE_TRAILS', payload: unwrapList<Trail>(result, 'trails') });
};
