import { z } from 'zod';

const coord = z.coerce.number({ error: 'Coordinates must be numbers' }).refine(Number.isFinite, 'Coordinates must be numbers');
const lngLat = z.tuple([coord, coord], { error: 'Location must be [longitude, latitude]' });

const imageUrl = z.string().trim().min(1).max(2048, 'Image URL is too long');

export const createTrailSchema = z.object({
  title: z.string({ error: 'Title is required' }).trim().min(1, 'Title is required').max(120, 'Title must be at most 120 characters'),
  description: z
    .string({ error: 'Description is required' })
    .trim()
    .min(1, 'Description is required')
    .max(5000, 'Description must be at most 5000 characters'),
  sloc: lngLat,
  floc: lngLat,
  checkp: z
    .array(z.array(z.union([z.string().max(500), z.number()])).max(10), { error: 'Invalid checkpoints' })
    .max(100, 'Too many checkpoints')
    .default([]),
  price: z.coerce.number({ error: 'Price must be a number' }).min(0, 'Price cannot be negative').max(1e9).default(0),
  // Stored as string[][] (legacy shape); a flat string[] is accepted and wrapped.
  images: z
    .array(z.union([imageUrl, z.array(imageUrl).max(20)]), { error: 'Invalid images' })
    .max(20, 'Too many images')
    .default([])
    .transform((list) => list.map((i) => (Array.isArray(i) ? i : [i]))),
  difficulty: z.coerce.number().min(0).max(10).nullish(),
});

export type CreateTrailInput = z.infer<typeof createTrailSchema>;

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(500),
  offset: z.coerce.number().int().min(0).default(0),
});
