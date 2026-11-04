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
});
