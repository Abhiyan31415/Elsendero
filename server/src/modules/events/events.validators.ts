import { z } from 'zod';

const date = (label: string) =>
  z.coerce.date({ error: `${label} must be a valid date` }).refine((d) => !Number.isNaN(d.getTime()), `${label} must be a valid date`);

export const createEventSchema = z
  .object({
    title: z.string({ error: 'Title is required' }).trim().min(1, 'Title is required').max(120, 'Title must be at most 120 characters'),
    description: z
      .string({ error: 'Description is required' })
      .trim()
      .min(1, 'Description is required')
      .max(5000, 'Description must be at most 5000 characters'),
    from: date('Start date'),
    to: date('End date'),
    location: z.string({ error: 'Location is required' }).trim().min(1, 'Location is required').max(200, 'Location is too long'),
    participants: z
      .array(z.string().trim().max(100))
      .max(200, 'Too many participants')
      .default([])
      .transform((list) => list.filter(Boolean)),
  })
  .refine((e) => e.to.getTime() >= e.from.getTime(), { message: 'End date must be after start date', path: ['to'] });

export type CreateEventInput = z.infer<typeof createEventSchema>;
