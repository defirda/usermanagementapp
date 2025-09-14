import { z } from 'zod';

export const getUserListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().optional(),
  role: z.string().optional(),
  createdFrom: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().optional()
  ),
  createdTo: z.preprocess(
    (val) => (val ? new Date(val as string) : undefined),
    z.date().optional()
  ),
  sortBy: z.enum(['username', 'name', 'role', 'createdAt', 'updatedAt']).optional(),
  sortDir: z.enum(['asc', 'desc']).optional(),
});

export const createUserSchema = z
  .object({
    name: z
      .string()
      .min(4, 'Name must be at least 4 characters')
      .max(100, 'Name must be at most 100 characters'),
    username: z
      .string()
      .min(4, 'Username must be at least 4 characters')
      .max(100, 'Username must be at most 100 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be at most 100 characters'),
    confirm_password: z.string(),
    role: z.enum(['admin', 'user']),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ['confirm_password'],
    message: 'Passwords do not match',
  });

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  username: z.string().min(4).optional(),
  role: z.enum(['admin', 'user']).optional(),
});

export const updateUserPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Password confirmation does not match',
    path: ['confirm_password'],
  });

export const deleteUserSchema = z.object({
  confirm_password: z.string().min(8, 'Password confirmation is required'),
});
