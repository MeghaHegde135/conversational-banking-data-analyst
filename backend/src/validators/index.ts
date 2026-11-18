import { z } from 'zod';

export const ApplicationStatusEnum = z.enum(['APPROVED', 'PENDING', 'REJECTED']);

export const BranchSchema = z.object({
  branch_name: z.string().min(2, 'Branch name must be at least 2 characters').max(100),
  city: z.string().min(2, 'City must be at least 2 characters').max(50),
});

export const CustomerSchema = z.object({
  customer_name: z.string().min(2, 'Customer name must be at least 2 characters').max(150),
  branch_id: z.number().int().positive('Branch ID must be a positive integer'),
  registration_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const OnboardingApplicationSchema = z.object({
  customer_id: z.number().int().positive('Customer ID must be a positive integer'),
  status: ApplicationStatusEnum,
  application_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const TransactionSchema = z.object({
  customer_id: z.number().int().positive('Customer ID must be a positive integer'),
  amount: z.number().positive('Transaction amount must be greater than zero'),
  transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});

export const EnvSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DB_FILE: z.string().default('./src/database/banking.db'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters'),
  DB_ENCRYPTION_KEY: z.string().min(8, 'DB_ENCRYPTION_KEY must be at least 8 characters'),
  API_PREFIX: z.string().default('/api'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

// Validator for POST /api/analytics/ask
export const AskQuestionSchema = z.object({
  question: z
    .string({
      required_error: 'Question is required in request body',
      invalid_type_error: 'Question must be a string',
    })
    .trim()
    .min(1, 'Question cannot be empty')
    .max(500, 'Question cannot exceed 500 characters'),
});

export type AskQuestionInput = z.infer<typeof AskQuestionSchema>;
