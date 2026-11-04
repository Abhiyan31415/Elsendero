import { z } from 'zod';
import { nameSchema } from '../users/users.validators.js';

export const emailSchema = z
  .string({ error: 'Email is required' })
  .trim()
  .toLowerCase()
  .min(1, 'Email is required')
  .max(254, 'Please enter a valid email address')
  .pipe(z.email('Please enter a valid email address'));

export const passwordSchema = z
  .string({ error: 'Password is required' })
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must be at most 128 characters long')
  .refine((p) => /[A-Za-z]/.test(p) && /\d/.test(p), 'Password must contain at least one letter and one number');

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string({ error: 'Email and password are required' }).trim().toLowerCase().min(1, 'Email and password are required'),
  password: z.string({ error: 'Email and password are required' }).min(1, 'Email and password are required').max(128, 'Invalid email or password'),
});
