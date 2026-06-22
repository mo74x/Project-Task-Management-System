import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const createProjectSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    status: z.enum(['Active', 'Archived', 'Completed']).optional(),
});

export const updateProjectSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').optional(),
    description: z.string().optional(),
    status: z.enum(['Active', 'Archived', 'Completed']).optional(),
});