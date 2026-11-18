import { z } from 'zod';

export const ApplicationStatusSchema = z.enum(['APPROVED', 'PENDING', 'REJECTED']);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;

export const BranchSchema = z.object({
  id: z.number(),
  branch_name: z.string(),
  city: z.string(),
});
export type Branch = z.infer<typeof BranchSchema>;

export const CustomerSchema = z.object({
  id: z.number(),
  customer_name: z.string(),
  branch_id: z.number(),
  registration_date: z.string(),
  branch_name: z.string().optional(),
  city: z.string().optional(),
});
export type Customer = z.infer<typeof CustomerSchema>;

export const OnboardingApplicationSchema = z.object({
  id: z.number(),
  customer_id: z.number(),
  status: ApplicationStatusSchema,
  application_date: z.string(),
  customer_name: z.string().optional(),
  branch_name: z.string().optional(),
});
export type OnboardingApplication = z.infer<typeof OnboardingApplicationSchema>;

export const TransactionSchema = z.object({
  id: z.number(),
  customer_id: z.number(),
  amount: z.number(),
  transaction_date: z.string(),
  customer_name: z.string().optional(),
  branch_name: z.string().optional(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const MonthlyVolumeSchema = z.object({
  month: z.string(),
  total_amount: z.number(),
  transaction_count: z.number(),
});
export type MonthlyVolume = z.infer<typeof MonthlyVolumeSchema>;

export const StatusBreakdownSchema = z.object({
  status: ApplicationStatusSchema,
  count: z.number(),
});
export type StatusBreakdown = z.infer<typeof StatusBreakdownSchema>;

export const AnalyticsSummarySchema = z.object({
  totalCustomers: z.number(),
  totalBranches: z.number(),
  totalTransactionsAmount: z.number(),
  totalTransactionsCount: z.number(),
  applicationBreakdown: z.array(StatusBreakdownSchema),
  monthlyVolumes: z.array(MonthlyVolumeSchema),
});
export type AnalyticsSummary = z.infer<typeof AnalyticsSummarySchema>;

// ====================================================================
// Conversational Banking Analytics API Types
// ====================================================================

export type VisualizationType = 'kpi' | 'table' | 'bar' | 'line' | 'pie';

export interface SupportedIntentGuide {
  intent: string;
  example: string;
}

export interface AnalyticsAskResponse {
  success: boolean;
  question: string;
  intent: string;
  dataset: string;
  answer: string;
  visualization: VisualizationType;
  data: Record<string, unknown>[];
  error?: string;
  supported_intents?: SupportedIntentGuide[];
}

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  response?: AnalyticsAskResponse;
  error?: string;
  supportedIntents?: SupportedIntentGuide[];
}
