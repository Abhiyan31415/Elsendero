import { beforeEach, describe, expect, it, vi } from 'vitest';
import fetchData, { NETWORK_ERROR_MESSAGE, SESSION_EXPIRED_MESSAGE } from './fetchData';

const API = 'http://localhost:5000/api/v1';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

describe('fetchData', () => {
  const dispatch = vi.fn();
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    dispatch.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  it('returns result on success and sends JSON + bearer token', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, result: { id: '1' } }));
    const result = await fetchData<{ id: string }>(
      { url: `${API}/trails`, body: { title: 'x' }, token: 'tok' },
      dispatch,
    );
    expect(result).toEqual({ id: '1' });
    expect(dispatch).not.toHaveBeenCalled();
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe(JSON.stringify({ title: 'x' }));
    expect(init?.headers).toMatchObject({ Authorization: 'Bearer tok', 'Content-Type': 'application/json' });
    expect(init?.headers).not.toHaveProperty('ngrok-skip-browser-warning');
  });

  it('never sends a body with GET', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { success: true, result: [] }));
    await fetchData({ url: `${API}/trails`, method: 'GET', body: { a: 1 } }, dispatch);
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.body).toBeUndefined();
    expect(init?.headers).not.toHaveProperty('Content-Type');
  });

  it('logs out on 401 for authenticated requests', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { success: false, message: 'jwt expired' }));
    const result = await fetchData({ url: `${API}/auth/me`, method: 'GET', token: 'old' }, dispatch);
    expect(result).toBeNull();
    expect(dispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_ALERT',
      payload: { open: true, message: SESSION_EXPIRED_MESSAGE, severity: 'warning' },
    });
  });

  it('does not log out on 401 from /auth/login (bad credentials)', async () => {
    fetchMock.mockResolvedValue(jsonResponse(401, { success: false, message: 'Invalid email or password' }));
    const result = await fetchData(
      { url: `${API}/auth/login`, body: { email: 'a@b.co', password: 'x' }, token: 'stale' },
      dispatch,
    );
    expect(result).toBeNull();
    expect(dispatch).not.toHaveBeenCalledWith({ type: 'LOGOUT' });
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_ALERT',
      payload: { open: true, message: 'Invalid email or password', severity: 'error' },
    });
  });

  it('shows a friendly message on network errors', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await fetchData({ url: `${API}/trails`, method: 'GET' }, dispatch);
    expect(result).toBeNull();
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_ALERT',
      payload: { open: true, message: NETWORK_ERROR_MESSAGE, severity: 'error' },
    });
  });

  it('stays silent on network errors when asked', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await fetchData({ url: `${API}/auth/me`, method: 'GET', token: 't', silentNetworkError: true }, dispatch);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('handles non-JSON responses', async () => {
    fetchMock.mockResolvedValue(new Response('<html>Bad gateway</html>', { status: 502 }));
    const result = await fetchData({ url: `${API}/trails`, method: 'GET' }, dispatch);
    expect(result).toBeNull();
    expect(dispatch).toHaveBeenCalledWith({
      type: 'UPDATE_ALERT',
      payload: { open: true, message: 'The server ran into a problem. Please try again later.', severity: 'error' },
    });
  });

  it('sends FormData without a JSON content type', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { success: true, result: { key: 'k', url: 'https://x.r2.dev/k' } }));
    const form = new FormData();
    form.append('image', new Blob(['x'], { type: 'image/png' }), 'a.png');
    await fetchData({ url: `${API}/uploads`, body: form, token: 't' }, dispatch);
    const [, init] = fetchMock.mock.calls[0];
    expect(init?.body).toBe(form);
    expect(init?.headers).not.toHaveProperty('Content-Type');
  });
});
