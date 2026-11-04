import { describe, expect, it } from 'vitest';
import { validateAuthForm, validateEmail, validateName, validatePassword } from './validation';

describe('validateName', () => {
  it('requires a name', () => {
    expect(validateName('')).toBe('Name is required');
    expect(validateName('   ')).toBe('Name is required');
  });
  it('enforces length limits on the trimmed value', () => {
    expect(validateName(' a ')).toMatch(/at least 2/);
    expect(validateName('x'.repeat(51))).toMatch(/at most 50/);
    expect(validateName('  Ram  ')).toBe('');
  });
});

describe('validateEmail', () => {
  it('requires a valid email', () => {
    expect(validateEmail('')).toBe('Email is required');
    expect(validateEmail('not-an-email')).toBe('Enter a valid email address');
    expect(validateEmail('a@b')).toBe('Enter a valid email address');
    expect(validateEmail(' user@example.com ')).toBe('');
  });
});

describe('validatePassword', () => {
  it('only requires presence when not strict (login)', () => {
    expect(validatePassword('', { strict: false })).toBe('Password is required');
    expect(validatePassword('x', { strict: false })).toBe('');
  });
  it('enforces strength when strict (register)', () => {
    expect(validatePassword('abc12', { strict: true })).toMatch(/at least 8/);
    expect(validatePassword('abcdefgh', { strict: true })).toMatch(/letter and one number/);
    expect(validatePassword('12345678', { strict: true })).toMatch(/letter and one number/);
    expect(validatePassword('abcd1234', { strict: true })).toBe('');
  });
});

describe('validateAuthForm', () => {
  const empty = { name: '', email: '', password: '', confirmPassword: '' };

  it('returns only email/password errors for login', () => {
    expect(validateAuthForm(empty, false)).toEqual({
      email: 'Email is required',
      password: 'Password is required',
    });
  });

  it('validates name and password confirmation for register', () => {
    const errors = validateAuthForm({ ...empty, email: 'a@b.co', password: 'abcd1234' }, true);
    expect(errors).toEqual({ name: 'Name is required', confirmPassword: 'Please confirm your password' });
    expect(
      validateAuthForm({ name: 'Sita', email: 'a@b.co', password: 'abcd1234', confirmPassword: 'abcd12345' }, true),
    ).toEqual({ confirmPassword: 'Passwords do not match' });
  });

  it('returns no errors for a valid form', () => {
    expect(
      validateAuthForm({ name: 'Sita', email: 'a@b.co', password: 'abcd1234', confirmPassword: 'abcd1234' }, true),
    ).toEqual({});
  });
});
