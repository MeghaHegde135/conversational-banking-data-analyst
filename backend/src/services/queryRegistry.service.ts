import { ApprovedQuery, SupportedIntent } from '../types';

export class QueryRegistryService {
  /**
   * Predefined and human-reviewed SQL queries.
   * All queries use strict parameterization (? placeholders) and sensible limits.
   * Never accepts or runs dynamic or AI-generated raw SQL strings.
   */
  private static readonly REGISTRY: Record<SupportedIntent, ApprovedQuery> = {
    customer_count: {
      intent: 'customer_count',
      dataset: 'customers',
      sql: `
        SELECT COUNT(*) AS total_customers
        FROM customers;
      `,
      defaultParams: [],
      visualization: 'kpi',
      maxLimit: 1,
    },

    pending_applications: {
      intent: 'pending_applications',
      dataset: 'onboarding_applications',
      sql: `
        SELECT a.id,
               c.customer_name,
               b.branch_name,
               b.city,
               a.status,
               a.application_date
        FROM onboarding_applications a
        JOIN customers c ON a.customer_id = c.id
        JOIN branches b ON c.branch_id = b.id
        WHERE a.status = ?
        ORDER BY a.application_date DESC
        LIMIT ?;
      `,
      defaultParams: ['PENDING', 50],
      visualization: 'table',
      maxLimit: 50,
    },

    application_status: {
      intent: 'application_status',
      dataset: 'onboarding_applications',
      sql: `
        SELECT status,
               COUNT(*) AS count
        FROM onboarding_applications
        GROUP BY status
        ORDER BY count DESC;
      `,
      defaultParams: [],
      visualization: 'pie',
      maxLimit: 10,
    },

    branch_customers: {
      intent: 'branch_customers',
      dataset: 'branches, customers',
      sql: `
        SELECT b.id,
               b.branch_name,
               b.city,
               COUNT(c.id) AS customer_count
        FROM branches b
        LEFT JOIN customers c ON b.id = c.branch_id
        GROUP BY b.id
        ORDER BY customer_count DESC, b.branch_name ASC
        LIMIT ?;
      `,
      defaultParams: [15],
      visualization: 'bar',
      maxLimit: 15,
    },

    total_transactions: {
      intent: 'total_transactions',
      dataset: 'transactions',
      sql: `
        SELECT COUNT(*) AS total_count,
               ROUND(COALESCE(SUM(amount), 0), 2) AS total_amount,
               ROUND(COALESCE(AVG(amount), 0), 2) AS average_amount,
               ROUND(COALESCE(MIN(amount), 0), 2) AS min_amount,
               ROUND(COALESCE(MAX(amount), 0), 2) AS max_amount
        FROM transactions;
      `,
      defaultParams: [],
      visualization: 'kpi',
      maxLimit: 1,
    },

    monthly_transactions: {
      intent: 'monthly_transactions',
      dataset: 'transactions',
      sql: `
        SELECT substr(transaction_date, 1, 7) AS month,
               ROUND(SUM(amount), 2) AS total_amount,
               COUNT(*) AS transaction_count
        FROM transactions
        GROUP BY substr(transaction_date, 1, 7)
        ORDER BY month ASC
        LIMIT ?;
      `,
      defaultParams: [36],
      visualization: 'bar',
      maxLimit: 36,
    },
  };

  /**
   * Retrieves the reviewed and approved query descriptor for a given intent.
   */
  public getApprovedQuery(intent: SupportedIntent): ApprovedQuery {
    const entry = QueryRegistryService.REGISTRY[intent];
    if (!entry) {
      throw new Error(`No approved query registered for intent: ${intent}`);
    }
    return entry;
  }
}
