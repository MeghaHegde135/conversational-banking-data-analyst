import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { seedDatabase } from '../src/database/seed.cjs';
import { Application } from 'express';

describe('POST /api/analytics/ask Test Suite', () => {
  let app: Application;

  beforeAll(() => {
    seedDatabase();
    app = createApp();
  });

  describe('Health Endpoint', () => {
    it('GET /api/health returns HTTP 200 with ok status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.database).toBe('connected');
    });
  });

  describe('All 6 Supported Analytics Intents', () => {
    it('1. customer_count: "how many customers do we have?"', async () => {
      const res = await request(app)
        .post('/api/analytics/ask')
        .send({ question: 'How many customers do we have?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('customer_count');
      expect(res.body.dataset).toBe('customers');
      expect(res.body.visualization).toBe('kpi');
      expect(res.body.answer).toMatch(/We currently have \d+ registered customers/i);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].total_customers).toBeGreaterThan(0);
    });

    it('2. pending_applications: "show pending onboarding applications"', async () => {
      const res = await request(app)
        .post('/api/analytics/ask')
        .send({ question: 'show pending onboarding applications' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('pending_applications');
      expect(res.body.dataset).toBe('onboarding_applications');
      expect(res.body.visualization).toBe('table');
      expect(res.body.answer).toMatch(/pending/i);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const row of res.body.data) {
        expect(row.status).toBe('PENDING');
      }
    });

    it('3. application_status: "show applications by status"', async () => {
      const res = await request(app)
        .post('/api/analytics/ask')
        .send({ question: 'show applications by status' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('application_status');
      expect(res.body.dataset).toBe('onboarding_applications');
      expect(res.body.visualization).toBe('pie');
      expect(res.body.answer).toMatch(/breakdown/i);
      expect(Array.isArray(res.body.data)).toBe(true);
      const statuses = res.body.data.map((r: { status: string }) => r.status);
      expect(statuses).toContain('APPROVED');
      expect(statuses).toContain('PENDING');
      expect(statuses).toContain('REJECTED');
    });

    it('4. branch_customers: "which branches have the most customers?"', async () => {
      const res = await request(app)
        .post('/api/analytics/ask')
        .send({ question: 'which branches have the most customers?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('branch_customers');
      expect(res.body.dataset).toBe('branches, customers');
      expect(res.body.visualization).toBe('bar');
      expect(res.body.answer).toMatch(/branch/i);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].customer_count).toBeGreaterThan(0);
    });

    it('5. total_transactions: "what is the total transaction amount?"', async () => {
      const res = await request(app)
        .post('/api/analytics/ask')
        .send({ question: 'what is the total transaction amount?' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('total_transactions');
      expect(res.body.dataset).toBe('transactions');
      expect(res.body.visualization).toBe('kpi');
      expect(res.body.answer).toMatch(/total recorded transaction volume/i);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].total_amount).toBeGreaterThan(0);
      expect(res.body.data[0].total_count).toBeGreaterThan(0);
    });

    it('6. monthly_transactions: "show monthly transaction trends"', async () => {
      const res = await request(app)
        .post('/api/analytics/ask')
        .send({ question: 'show monthly transaction trends' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.intent).toBe('monthly_transactions');
      expect(res.body.dataset).toBe('transactions');
      expect(res.body.visualization).toBe('bar');
      expect(res.body.answer).toMatch(/monthly transaction trends/i);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(1);
      expect(res.body.data[0]).toHaveProperty('month');
      expect(res.body.data[0]).toHaveProperty('total_amount');
    });
  });

  describe('Validation & Error Handling (HTTP 400 & HTTP 422)', () => {
    it('returns HTTP 400 when question is missing from payload', async () => {
      const res = await request(app).post('/api/analytics/ask').send({});
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Question is required/i);
    });

    it('returns HTTP 400 when question exceeds 500 characters', async () => {
      const oversizedQuestion = 'A'.repeat(501);
      const res = await request(app)
        .post('/api/analytics/ask')
        .send({ question: oversizedQuestion });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/cannot exceed 500 characters/i);
    });

    it('returns HTTP 400 when question is empty', async () => {
      const res = await request(app)
        .post('/api/analytics/ask')
        .send({ question: '   ' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('returns HTTP 422 when question cannot be classified into approved intents', async () => {
      const res = await request(app)
        .post('/api/analytics/ask')
        .send({ question: 'What is the recipe for chocolate chip cookies?' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Unsupported question/i);
      expect(Array.isArray(res.body.supported_intents)).toBe(true);
    });

    it('rejects SQL injection attempts with HTTP 422 and never executes raw SQL', async () => {
      const sqlInjection = "'; DROP TABLE customers; --";
      const res = await request(app)
        .post('/api/analytics/ask')
        .send({ question: sqlInjection });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);

      const verifyRes = await request(app)
        .post('/api/analytics/ask')
        .send({ question: 'How many customers do we have?' });
      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data[0].total_customers).toBeGreaterThan(0);
    });
  });
});
