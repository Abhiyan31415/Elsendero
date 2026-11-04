// Client-side validation mirroring the backend rules.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface AuthFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type AuthFormErrors = Partial<Record<keyof AuthFormValues, string>>;

export const validateName = (name: string): string => {
  const n = name.trim();
  if (!n) return 'Name is required';
  if (n.length < 2) return 'Name must be at least 2 characters';
  if (n.length > 50) return 'Name must be at most 50 characters';
  return '';
};

export const validateEmail = (email: string): string => {
  const e = email.trim();
  if (!e) return 'Email is required';
  if (!EMAIL_RE.test(e)) return 'Enter a valid email address';
  return '';
};

export const validatePassword = (password: string, { strict }: { strict: boolean }): string => {
  if (!password) return 'Password is required';
  if (!strict) return ''; // login: let the server decide
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  return '';
};

export const validateAuthForm = (values: AuthFormValues, isRegister: boolean): AuthFormErrors => {
  const errors: AuthFormErrors = {
    email: validateEmail(values.email),
    password: validatePassword(values.password, { strict: isRegister }),
  };
  if (isRegister) {
    errors.name = validateName(values.name);
    errors.confirmPassword = !values.confirmPassword
      ? 'Please confirm your password'
      : values.confirmPassword !== values.password
        ? 'Passwords do not match'
        : '';
  }
  return Object.fromEntries(Object.entries(errors).filter(([, v]) => v)) as AuthFormErrors;
};
