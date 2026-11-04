import { z } from 'zod';

export const nameSchema = z
  .string({ error: 'Name is required' })
  .trim()
  .min(2, 'Name must be between 2 and 50 characters')
  .max(50, 'Name must be between 2 and 50 characters');

const photoUrlSchema = z
  .string({ error: 'Invalid photo URL' })
  .trim()
  .max(2048, 'Invalid photo URL')
  .refine((v) => v === '' || /^https?:\/\//i.test(v), 'Photo URL must start with http:// or https://');

export const updateMeSchema = z
  .object({ name: nameSchema.optional(), photoURL: photoUrlSchema.optional() })
  .refine((v) => v.name !== undefined || v.photoURL !== undefined, 'Nothing to update');
