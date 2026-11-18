import { describe, it, expect } from 'vitest';
import { ClassificationService } from '../src/services/classification.service';
import { DatasetService } from '../src/services/dataset.service';
import { QueryRegistryService } from '../src/services/queryRegistry.service';
import { SupportedIntent } from '../src/types';

describe('AI Intent Classification & Query Registry Unit Tests', () => {
  const classificationService = new ClassificationService();
  const datasetService = new DatasetService();
  const queryRegistryService = new QueryRegistryService();

  describe('Supported Intents Classification Variations', () => {
    const variations: Array<{ question: string; expected: SupportedIntent }> = [
      // 1. customer_count
      { question: 'How many customers do we have?', expected: 'customer_count' },
      { question: 'What is our total number of customers?', expected: 'customer_count' },
      { question: 'count of customers', expected: 'customer_count' },
      { question: 'customer count', expected: 'customer_count' },

      // 2. pending_applications
      { question: 'show pending onboarding applications', expected: 'pending_applications' },
      { question: 'List all pending onboarding applications', expected: 'pending_applications' },
      { question: 'Which applications are pending?', expected: 'pending_applications' },
      { question: 'pending applications', expected: 'pending_applications' },

      // 3. application_status
      { question: 'show applications by status', expected: 'application_status' },
      { question: 'Get application status breakdown', expected: 'application_status' },
      { question: 'Status of onboarding applications', expected: 'application_status' },
      { question: 'how many applications are approved pending rejected', expected: 'application_status' },

      // 4. branch_customers
      { question: 'which branches have the most customers?', expected: 'branch_customers' },
      { question: 'customers per branch', expected: 'branch_customers' },
      { question: 'customers by branch', expected: 'branch_customers' },
      { question: 'top branches by customers', expected: 'branch_customers' },

      // 5. total_transactions
      { question: 'what is the total transaction amount?', expected: 'total_transactions' },
      { question: 'Total transaction volume across the bank', expected: 'total_transactions' },
      { question: 'sum of all transactions', expected: 'total_transactions' },
      { question: 'what is the total transaction value?', expected: 'total_transactions' },

      // 6. monthly_transactions
      { question: 'show monthly transaction trends', expected: 'monthly_transactions' },
      { question: 'Monthly transaction volume history', expected: 'monthly_transactions' },
      { question: 'transactions across multiple months', expected: 'monthly_transactions' },
      { question: 'transactions by month', expected: 'monthly_transactions' },
    ];

    for (const testCase of variations) {
      it(`classifies "${testCase.question}" => ${testCase.expected}`, () => {
        const result = classificationService.classifyQuestion(testCase.question);
        expect(result).not.toBeNull();
        expect(result?.intent).toBe(testCase.expected);
        expect(result?.confidence).toBeGreaterThanOrEqual(0.6);
      });
    }
  });

  describe('Unsupported Questions & Injection Detection', () => {
    const unsupportedList = [
      'What is the weather in New York today?',
      'Tell me a funny joke about banks',
      'How do I bake a cake?',
      'Who won the world cup?',
      'SELECT * FROM users;',
      'DROP TABLE customers; --',
      'What is the stock price of Apple?',
      'Can you write a poem?',
    ];

    for (const q of unsupportedList) {
      it(`rejects unsupported query: "${q}"`, () => {
        const result = classificationService.classifyQuestion(q);
        expect(result).toBeNull();
      });
    }
  });

  describe('Dataset Identification Service', () => {
    it('maps all supported intents to correct tables without crashing', () => {
      expect(datasetService.getDatasetForIntent('customer_count')).toBe('customers');
      expect(datasetService.getDatasetForIntent('pending_applications')).toBe('onboarding_applications');
      expect(datasetService.getDatasetForIntent('application_status')).toBe('onboarding_applications');
      expect(datasetService.getDatasetForIntent('branch_customers')).toBe('branches, customers');
      expect(datasetService.getDatasetForIntent('total_transactions')).toBe('transactions');
      expect(datasetService.getDatasetForIntent('monthly_transactions')).toBe('transactions');
    });
  });

  describe('Query Registry Service & Safe SQL Design', () => {
    const intents: SupportedIntent[] = [
      'customer_count',
      'pending_applications',
      'application_status',
      'branch_customers',
      'total_transactions',
      'monthly_transactions',
    ];

    for (const intent of intents) {
      it(`provides safe, parameterized query for intent "${intent}"`, () => {
        const queryDef = queryRegistryService.getApprovedQuery(intent);

        expect(queryDef).toBeDefined();
        expect(queryDef.intent).toBe(intent);
        expect(queryDef.sql.trim().length).toBeGreaterThan(10);
        expect(queryDef.maxLimit).toBeGreaterThan(0);
        expect(['kpi', 'table', 'bar', 'pie', 'line']).toContain(queryDef.visualization);

        // Security check: No dynamic string concatenation or dangerous SQL commands
        expect(queryDef.sql).not.toMatch(/DROP\s+TABLE/i);
        expect(queryDef.sql).not.toMatch(/DELETE\s+FROM/i);
        expect(queryDef.sql).not.toMatch(/UPDATE\s+/i);
        expect(queryDef.sql).not.toMatch(/INSERT\s+INTO/i);
      });
    }
  });
});
