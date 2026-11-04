import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ContextProvider from '@/context/ContextProvider';
import Login from './Login';

const renderLogin = () =>
  render(
    <ContextProvider initial={{ openLogin: true, authReady: true }}>
      <Login />
    </ContextProvider>,
  );

describe('<Login />', () => {
  it('shows inline errors and does not call the API on empty submit', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('validates register fields after switching mode', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Register' }));
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
  });

  it('clears an error live once the field is fixed', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    await user.type(screen.getByLabelText(/email/i), 'sita@example.com');
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });

  const jsonResponse = (status: number, body: unknown) =>
    Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));

  it('shows the check-your-email screen when logging in to an unverified account', async () => {
    const fetchMock = vi.fn(() =>
      jsonResponse(403, { success: false, message: 'Please verify your email first.', code: 'EMAIL_NOT_VERIFIED' }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderLogin();

    await user.type(screen.getByLabelText(/email/i), 'sita@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Check your email')).toBeInTheDocument();
    expect(screen.getByText('sita@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resend verification email' })).toBeInTheDocument();
  });

  it('shows the check-your-email screen after registering', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        jsonResponse(201, {
          success: true,
          result: { user: { id: '1', name: 'Sita', email: 'sita@example.com', photoURL: '' }, verificationRequired: true },
        }),
      ),
    );
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Register' }));
    await user.type(screen.getByLabelText(/name/i), 'Sita');
    await user.type(screen.getByLabelText(/email/i), 'sita@example.com');
    await user.type(screen.getByLabelText(/^password/i), 'secret123');
    await user.type(screen.getByLabelText(/confirm password/i), 'secret123');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Check your email')).toBeInTheDocument();
    expect(screen.getByText(/We sent a verification link to/)).toBeInTheDocument();
  });

  it('sends a password reset link from the forgot password view', async () => {
    const fetchMock = vi.fn((_url: string, _init?: RequestInit) =>
      jsonResponse(200, { success: true, result: { message: 'ok' } }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: 'Forgot password?' }));
    await user.type(screen.getByLabelText(/email/i), 'sita@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByText(/we sent it a link to reset your password/)).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toMatch(/\/auth\/forgot-password$/);
    expect(JSON.parse(String(init?.body))).toEqual({ email: 'sita@example.com' });
  });
});
