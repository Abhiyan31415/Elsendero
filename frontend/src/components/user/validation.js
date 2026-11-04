// Client-side validation mirroring the backend rules.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateName = (name) => {
    const n = name.trim();
    if (!n) return 'Name is required';
    if (n.length < 2) return 'Name must be at least 2 characters';
    if (n.length > 50) return 'Name must be at most 50 characters';
    return '';
};

export const validateEmail = (email) => {
    const e = email.trim();
    if (!e) return 'Email is required';
    if (!EMAIL_RE.test(e)) return 'Enter a valid email address';
    return '';
};

export const validatePassword = (password, { strict }) => {
    if (!password) return 'Password is required';
    if (!strict) return ''; // login: let the server decide
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return 'Password must contain at least one letter and one number';
    }
    return '';
};

export const validateAuthForm = (values, isRegister) => {
    const errors = {
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
    return Object.fromEntries(Object.entries(errors).filter(([, v]) => v));
};
