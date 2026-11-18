import { AnalyticsAskResponse, SupportedIntent, VisualizationType } from '../types';

export class ResponseFormattingService {
  /**
   * Formats execution results into a user-friendly natural language answer and structured response.
   */
  public formatResponse(
    question: string,
    intent: SupportedIntent,
    dataset: string,
    visualization: VisualizationType,
    data: Record<string, unknown>[]
  ): AnalyticsAskResponse {
    const answer = this.generateNaturalLanguageAnswer(intent, data);

    return {
      success: true,
      question,
      intent,
      dataset,
      answer,
      visualization,
      data,
    };
  }

  private generateNaturalLanguageAnswer(intent: SupportedIntent, data: Record<string, unknown>[]): string {
    switch (intent) {
      case 'customer_count': {
        const total = (data[0]?.['total_customers'] as number) ?? 0;
        return `We currently have ${total} registered customers across all active regional branches.`;
      }

      case 'pending_applications': {
        const count = data.length;
        if (count === 0) {
          return 'There are currently no pending onboarding applications awaiting review.';
        }
        return `There are currently ${count} onboarding applications in PENDING status awaiting compliance review.`;
      }

      case 'application_status': {
        if (data.length === 0) {
          return 'No onboarding application status records were found in the database.';
        }
        const summaryParts = data.map((row) => `${row['count']} ${row['status']}`);
        return `Onboarding applications breakdown: ${summaryParts.join(', ')}.`;
      }

      case 'branch_customers': {
        if (data.length === 0) {
          return 'No branch customer data is currently available.';
        }
        const top = data[0];
        const topName = (top?.['branch_name'] as string) || 'Top Branch';
        const topCount = (top?.['customer_count'] as number) || 0;
        const totalBranches = data.length;
        return `Across ${totalBranches} branches, ${topName} has the highest customer volume with ${topCount} registered customers.`;
      }

      case 'total_transactions': {
        const row = data[0] || {};
        const totalAmount = Number(row['total_amount'] || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        const totalCount = Number(row['total_count'] || 0).toLocaleString();
        const avgAmount = Number(row['average_amount'] || 0).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        return `The total recorded transaction volume is $${totalAmount} across ${totalCount} transactions (averaging $${avgAmount} per transaction).`;
      }

      case 'monthly_transactions': {
        if (data.length === 0) {
          return 'No monthly transaction trend data is currently recorded.';
        }
        const monthCount = data.length;
        const firstMonth = (data[0]?.['month'] as string) || '';
        const lastMonth = (data[data.length - 1]?.['month'] as string) || '';
        const totalVol = data
          .reduce((sum, item) => sum + Number(item['total_amount'] || 0), 0)
          .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        return `Monthly transaction trends tracked across ${monthCount} months (${firstMonth} to ${lastMonth}) with a cumulative volume of $${totalVol}.`;
      }

      default:
        return 'Analytics request processed successfully.';
    }
  }
}
