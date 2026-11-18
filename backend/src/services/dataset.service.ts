import { SupportedIntent } from '../types';

export class DatasetService {
  private static readonly DATASET_MAP: Record<SupportedIntent, string> = {
    customer_count: 'customers',
    pending_applications: 'onboarding_applications',
    application_status: 'onboarding_applications',
    branch_customers: 'branches, customers',
    total_transactions: 'transactions',
    monthly_transactions: 'transactions',
  };

  /**
   * Identifies the primary banking dataset associated with an analytical intent
   */
  public getDatasetForIntent(intent: SupportedIntent): string {
    const dataset = DatasetService.DATASET_MAP[intent];
    if (!dataset) {
      throw new Error(`Unmapped dataset for intent: ${intent}`);
    }
    return dataset;
  }
}
