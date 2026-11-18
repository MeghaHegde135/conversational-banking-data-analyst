import { describe, it, expect, beforeAll } from 'vitest';
import { createRequire } from 'node:module';
import * as path from 'node:path';
import * as fs from 'node:fs';
import {
  BranchSchema,
  CustomerSchema,
  OnboardingApplicationSchema,
  TransactionSchema,
} from '../src/validators';

const require = createRequire(import.meta.url);
const { DatabaseSync } = require('node:sqlite');

describe('Banking Database & Validation Test Suite', () => {
  let db: any;

  beforeAll(() => {
    // In-memory isolated database for lightning fast tests
    db = new DatabaseSync(':memory:');
    db.exec('PRAGMA foreign_keys = ON;');

    const schemaPath = path.resolve(__dirname, '../src/database/scheme.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schemaSql);
  });

  describe('Foreign Key & SQLite Constraint Enforcement', () => {
    it('should have PRAGMA foreign_keys enabled', () => {
      const res = db.prepare('PRAGMA foreign_keys').get();
      expect(res.foreign_keys).toBe(1);
    });

    it('should reject customer insertion with non-existent branch_id', () => {
      expect(() => {
        db.prepare(`
          INSERT INTO customers (customer_name, branch_id, registration_date)
          VALUES ('Ghost Customer', 99999, '2026-01-01');
        `).run();
      }).toThrow(/FOREIGN KEY/i);
    });

    it('should reject application insertion with invalid status CHECK constraint', () => {
      // First insert valid branch and customer
      db.prepare("INSERT OR IGNORE INTO branches (id, branch_name, city) VALUES (1, 'Test Branch', 'Test City');").run();
      db.prepare("INSERT OR IGNORE INTO customers (id, customer_name, branch_id, registration_date) VALUES (1, 'Test Cust', 1, '2026-01-01');").run();

      expect(() => {
        db.prepare(`
          INSERT INTO onboarding_applications (customer_id, status, application_date)
          VALUES (1, 'SUSPENDED', '2026-01-01');
        `).run();
      }).toThrow(/CHECK constraint/i);
    });
  });

  describe('Zod Schema Validation', () => {
    it('validates branch schema successfully', () => {
      const valid = BranchSchema.safeParse({
        branch_name: 'Metro City Branch',
        city: 'Metropolis',
      });
      expect(valid.success).toBe(true);
    });

    it('rejects invalid branch data', () => {
      const invalid = BranchSchema.safeParse({
        branch_name: '',
        city: 'M',
      });
      expect(invalid.success).toBe(false);
    });

    it('validates customer schema successfully', () => {
      const valid = CustomerSchema.safeParse({
        customer_name: 'Horizon Innovations Ltd',
        branch_id: 1,
        registration_date: '2026-03-15',
      });
      expect(valid.success).toBe(true);
    });

    it('validates onboarding application with valid status', () => {
      const validApproved = OnboardingApplicationSchema.safeParse({
        customer_id: 1,
        status: 'APPROVED',
        application_date: '2026-03-16',
      });
      const validPending = OnboardingApplicationSchema.safeParse({
        customer_id: 1,
        status: 'PENDING',
        application_date: '2026-03-16',
      });
      const validRejected = OnboardingApplicationSchema.safeParse({
        customer_id: 1,
        status: 'REJECTED',
        application_date: '2026-03-16',
      });

      expect(validApproved.success).toBe(true);
      expect(validPending.success).toBe(true);
      expect(validRejected.success).toBe(true);
    });

    it('rejects transaction with negative or zero amount', () => {
      const invalid = TransactionSchema.safeParse({
        customer_id: 1,
        amount: -500,
        transaction_date: '2026-03-16',
      });
      expect(invalid.success).toBe(false);
    });
  });
});
