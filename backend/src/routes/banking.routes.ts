import { Router, Request, Response } from 'express';
import { BankingService } from '../services/banking.service';
import { ApplicationStatusEnum } from '../validators';
import { z } from 'zod';

const router = Router();
const service = new BankingService();

// Health check endpoint
router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'banking-data-analyst-backend',
  });
});

// GET /api/branches
router.get('/branches', (_req: Request, res: Response): void => {
  try {
    const branches = service.getBranches();
    res.json({ success: true, count: branches.length, data: branches });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/customers
router.get('/customers', (req: Request, res: Response): void => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const customers = service.getCustomers(search);
    res.json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/applications
router.get('/applications', (req: Request, res: Response): void => {
  try {
    let statusFilter = undefined;
    if (req.query.status) {
      const parsedStatus = ApplicationStatusEnum.safeParse(req.query.status);
      if (!parsedStatus.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid status filter. Allowed values: APPROVED, PENDING, REJECTED',
        });
        return;
      }
      statusFilter = parsedStatus.data;
    }

    const applications = service.getApplications(statusFilter);
    res.json({ success: true, count: applications.length, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/transactions
router.get('/transactions', (req: Request, res: Response): void => {
  try {
    const limitQuery = req.query.limit ? Number(req.query.limit) : 50;
    const limit = z.number().int().positive().max(500).catch(50).parse(limitQuery);
    const transactions = service.getTransactions(limit);
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/analytics/summary
router.get('/analytics/summary', (_req: Request, res: Response): void => {
  try {
    const summary = service.getAnalyticsSummary();
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

// GET /api/analytics/monthly-volume
router.get('/analytics/monthly-volume', (_req: Request, res: Response): void => {
  try {
    const volumes = service.getMonthlyVolumes();
    res.json({ success: true, data: volumes });
  } catch (error) {
    res.status(500).json({ success: false, error: (error as Error).message });
  }
});

export default router;
