import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters'),
    email: z.string().trim().email('Invalid email address').transform(val => val.toLowerCase()),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['attendee', 'organizer']).default('attendee'),
    organization: z.string().trim().optional().nullable(),
    avatar: z.string().url().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    bio: z.string().trim().optional().nullable()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email('Invalid email address').transform(val => val.toLowerCase()),
    password: z.string().min(1, 'Password is required'),
    expectedRole: z.enum(['attendee', 'organizer', 'admin']).optional()
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').optional(),
    organization: z.string().trim().optional().nullable(),
    avatar: z.string().url().optional().nullable(),
    city: z.string().trim().optional().nullable(),
    bio: z.string().trim().optional().nullable()
  })
});
