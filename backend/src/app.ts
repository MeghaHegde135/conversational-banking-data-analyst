import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import bankingRoutes from './routes/banking.routes';
import analyticsRoutes from './routes/analytics.routes';
import { getDatabase, initSchema } from './database/db';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

export function createApp(): Application {
  const app = express();

  // Initialize DB & schema automatically on startup
  const db = getDatabase();
  initSchema(db);

  // Security & CORS: Restrict strictly to the frontend origin
  const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.use(
    cors({
      origin: allowedOrigin,
      credentials: true,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '100kb' }));

  const apiPrefix = process.env.API_PREFIX || '/api';

  // Health Endpoint
  app.get(`${apiPrefix}/health`, (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'conversational-banking-data-analyst',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  });

  // Analytics & Banking Routes
  app.use(`${apiPrefix}/analytics`, analyticsRoutes);
  app.use(apiPrefix, bankingRoutes);

  // Root info endpoint
  app.get('/', (_req: Request, res: Response) => {
    res.json({
      name: 'Conversational Banking Data Analyst API',
      version: '1.0.0',
      health: `${apiPrefix}/health`,
      ask: `${apiPrefix}/analytics/ask`,
    });
  });

  // Global Error Handler (HTTP 500)
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[Unhandled Server Error]', err.message);
    res.status(500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    });
  });

  return app;
}
