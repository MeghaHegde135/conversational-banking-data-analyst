import { getDatabase } from '../database/db';
import {
  Branch,
  CustomerWithBranch,
  ApplicationWithCustomer,
  TransactionWithCustomer,
  BankingAnalyticsSummary,
  MonthlyTransactionVolume,
  ApplicationStatusBreakdown,
  ApplicationStatus,
} from '../types';

export class BankingService {
  /**
   * Fetch all branches with customer counts
   */
  public getBranches(): Branch[] {
    const db = getDatabase();
    return db.prepare('SELECT id, branch_name, city FROM branches ORDER BY id ASC').all() as unknown as Branch[];
  }

  /**
   * Fetch customers with branch details and optional search filter
   */
  public getCustomers(search?: string): CustomerWithBranch[] {
    const db = getDatabase();
    if (search && search.trim().length > 0) {
      const term = `%${search.trim()}%`;
      return db.prepare(`
        SELECT c.id, c.customer_name, c.branch_id, c.registration_date, b.branch_name, b.city
        FROM customers c
        JOIN branches b ON c.branch_id = b.id
        WHERE c.customer_name LIKE ? OR b.branch_name LIKE ? OR b.city LIKE ?
        ORDER BY c.registration_date DESC
      `).all(term, term, term) as unknown as CustomerWithBranch[];
    }

    return db.prepare(`
      SELECT c.id, c.customer_name, c.branch_id, c.registration_date, b.branch_name, b.city
      FROM customers c
      JOIN branches b ON c.branch_id = b.id
      ORDER BY c.registration_date DESC
    `).all() as unknown as CustomerWithBranch[];
  }

  /**
   * Fetch onboarding applications with customer and branch details
   */
  public getApplications(statusFilter?: ApplicationStatus): ApplicationWithCustomer[] {
    const db = getDatabase();
    if (statusFilter) {
      return db.prepare(`
        SELECT a.id, a.customer_id, a.status, a.application_date, c.customer_name, b.branch_name
        FROM onboarding_applications a
        JOIN customers c ON a.customer_id = c.id
        JOIN branches b ON c.branch_id = b.id
        WHERE a.status = ?
        ORDER BY a.application_date DESC
      `).all(statusFilter) as unknown as ApplicationWithCustomer[];
    }

    return db.prepare(`
      SELECT a.id, a.customer_id, a.status, a.application_date, c.customer_name, b.branch_name
      FROM onboarding_applications a
      JOIN customers c ON a.customer_id = c.id
      JOIN branches b ON c.branch_id = b.id
      ORDER BY a.application_date DESC
    `).all() as unknown as ApplicationWithCustomer[];
  }

  /**
   * Fetch transactions with customer name and branch
   */
  public getTransactions(limit = 50): TransactionWithCustomer[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT t.id, t.customer_id, t.amount, t.transaction_date, c.customer_name, b.branch_name
      FROM transactions t
      JOIN customers c ON t.customer_id = c.id
      JOIN branches b ON c.branch_id = b.id
      ORDER BY t.transaction_date DESC
      LIMIT ?
    `).all(limit) as unknown as TransactionWithCustomer[];
  }

  /**
   * Aggregate monthly transaction volume and counts for Recharts charts
   */
  public getMonthlyVolumes(): MonthlyTransactionVolume[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT substr(transaction_date, 1, 7) as month,
             ROUND(SUM(amount), 2) as total_amount,
             COUNT(*) as transaction_count
      FROM transactions
      GROUP BY substr(transaction_date, 1, 7)
      ORDER BY month ASC
    `).all() as unknown as MonthlyTransactionVolume[];
  }

  /**
   * Aggregate application status breakdown (APPROVED, PENDING, REJECTED)
   */
  public getApplicationStatusBreakdown(): ApplicationStatusBreakdown[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT status, COUNT(*) as count
      FROM onboarding_applications
      GROUP BY status
      ORDER BY count DESC
    `).all() as unknown as ApplicationStatusBreakdown[];
  }

  /**
   * Comprehensive banking analytics summary
   */
  public getAnalyticsSummary(): BankingAnalyticsSummary {
    const db = getDatabase();

    const customerCount = (db.prepare('SELECT COUNT(*) as c FROM customers').get() as { c: number }).c;
    const branchCount = (db.prepare('SELECT COUNT(*) as c FROM branches').get() as { c: number }).c;
    const txSummary = db.prepare(`
      SELECT COUNT(*) as tx_count, COALESCE(SUM(amount), 0) as total_amount FROM transactions
    `).get() as { tx_count: number; total_amount: number };

    return {
      totalCustomers: customerCount,
      totalBranches: branchCount,
      totalTransactionsAmount: Math.round(txSummary.total_amount * 100) / 100,
      totalTransactionsCount: txSummary.tx_count,
      applicationBreakdown: this.getApplicationStatusBreakdown(),
      monthlyVolumes: this.getMonthlyVolumes(),
    };
  }
}
