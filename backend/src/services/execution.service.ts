import { getDatabase } from '../database/db';
import { ApprovedQuery } from '../types';

export class AnalyticsExecutionService {
  /**
   * Safely executes an approved, parameterized query with execution metrics and non-sensitive logging.
   */
  public executeQuery(queryDef: ApprovedQuery, customParams?: (string | number)[]): Record<string, unknown>[] {
    const db = getDatabase();
    const params = customParams && customParams.length > 0 ? customParams : queryDef.defaultParams;

    const startTime = Date.now();
    try {
      const stmt = db.prepare(queryDef.sql);
      const rows = (stmt.all(...params) as Record<string, unknown>[]) || [];

      // Sensible record limit safety guardrail
      const boundedRows = rows.slice(0, queryDef.maxLimit);
      const durationMs = Date.now() - startTime;

      // Safe audit logging without exposing sensitive user records
      console.log(
        `[Analytics Execution] Intent="${queryDef.intent}" Dataset="${queryDef.dataset}" Rows=${boundedRows.length} Duration=${durationMs}ms`
      );

      return boundedRows;
    } catch (error) {
      console.error(
        `[Analytics Execution Error] Intent="${queryDef.intent}" Error="${(error as Error).message}"`
      );
      throw error;
    }
  }
}
