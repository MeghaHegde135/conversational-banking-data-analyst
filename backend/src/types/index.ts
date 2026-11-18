export type ApplicationStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface Branch {
  id: number;
  branch_name: string;
  city: string;
}

export type NewBranch = Omit<Branch, 'id'>;

export interface Customer {
  id: number;
  customer_name: string;
  branch_id: number;
  registration_date: string;
}

export type NewCustomer = Omit<Customer, 'id'>;

export interface CustomerWithBranch extends Customer {
  branch_name: string;
  city: string;
}

export interface OnboardingApplication {
  id: number;
  customer_id: number;
  status: ApplicationStatus;
  application_date: string;
}

export type NewOnboardingApplication = Omit<OnboardingApplication, 'id'>;

export interface ApplicationWithCustomer extends OnboardingApplication {
  customer_name: string;
  branch_name: string;
}

export interface Transaction {
  id: number;
  customer_id: number;
  amount: number;
  transaction_date: string;
}

export type NewTransaction = Omit<Transaction, 'id'>;

export interface TransactionWithCustomer extends Transaction {
  customer_name: string;
  branch_name: string;
}

export interface MonthlyTransactionVolume {
  month: string;
  total_amount: number;
  transaction_count: number;
}

export interface ApplicationStatusBreakdown {
  status: ApplicationStatus;
  count: number;
}

export interface BankingAnalyticsSummary {
  totalCustomers: number;
  totalBranches: number;
  totalTransactionsAmount: number;
  totalTransactionsCount: number;
  applicationBreakdown: ApplicationStatusBreakdown[];
  monthlyVolumes: MonthlyTransactionVolume[];
}

// ====================================================================
// Conversational Analytics Types
// ====================================================================

export type SupportedIntent =
  | 'customer_count'
  | 'pending_applications'
  | 'application_status'
  | 'branch_customers'
  | 'total_transactions'
  | 'monthly_transactions';

export type VisualizationType = 'kpi' | 'bar' | 'pie' | 'table';

export interface ClassificationResult {
  intent: SupportedIntent;
  confidence: number;
  extractedEntities?: Record<string, string | number>;
}

export interface ApprovedQuery {
  intent: SupportedIntent;
  dataset: string;
  sql: string;
  defaultParams: (string | number)[];
  visualization: VisualizationType;
  maxLimit: number;
}

export interface AnalyticsAskResponse {
  success: boolean;
  question: string;
  intent: SupportedIntent;
  dataset: string;
  answer: string;
  visualization: VisualizationType;
  data: Record<string, unknown>[];
}
