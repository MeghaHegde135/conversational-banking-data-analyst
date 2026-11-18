import {
  AnalyticsAskResponse,
  AnalyticsSummary,
  AnalyticsSummarySchema,
  Branch,
  BranchSchema,
  Customer,
  CustomerSchema,
  OnboardingApplication,
  OnboardingApplicationSchema,
  Transaction,
  TransactionSchema,
} from '../types';
import { z } from 'zod';

const API_BASE = '/api';

export interface HealthCheckResponse {
  status: string;
  service: string;
  timestamp: string;
  database: string;
}

export async function checkBackendHealth(): Promise<HealthCheckResponse> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return (await res.json()) as HealthCheckResponse;
  } catch (err) {
    throw new Error(`Cannot connect to backend server: ${(err as Error).message}`);
  }
}

export async function askAnalyticsQuestion(question: string): Promise<AnalyticsAskResponse> {
  try {
    const res = await fetch(`${API_BASE}/analytics/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ question }),
    });

    const json = (await res.json()) as Record<string, unknown>;

    if (!res.ok) {
      const errorMessage =
        typeof json['error'] === 'string'
          ? (json['error'] as string)
          : `Request failed with status ${res.status}`;

      const supportedIntents = Array.isArray(json['supported_intents'])
        ? (json['supported_intents'] as AnalyticsAskResponse['supported_intents'])
        : undefined;

      const errorPayload: AnalyticsAskResponse = {
        success: false,
        question,
        intent: 'unsupported',
        dataset: 'none',
        answer: errorMessage,
        visualization: 'kpi',
        data: [],
        error: errorMessage,
        supported_intents: supportedIntents,
      };

      return errorPayload;
    }

    return json as unknown as AnalyticsAskResponse;
  } catch (err) {
    throw new Error(`Network failure: Unable to reach banking analytics server. Please ensure the backend is running.`);
  }
}

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const res = await fetch(`${API_BASE}/analytics/summary`);
  if (!res.ok) {
    throw new Error(`Failed to fetch analytics summary: ${res.statusText}`);
  }
  const json = (await res.json()) as { data: unknown };
  return AnalyticsSummarySchema.parse(json.data);
}

export async function fetchBranches(): Promise<Branch[]> {
  const res = await fetch(`${API_BASE}/branches`);
  if (!res.ok) {
    throw new Error(`Failed to fetch branches: ${res.statusText}`);
  }
  const json = (await res.json()) as { data: unknown };
  return z.array(BranchSchema).parse(json.data);
}

export async function fetchCustomers(search?: string): Promise<Customer[]> {
  const url = search ? `${API_BASE}/customers?search=${encodeURIComponent(search)}` : `${API_BASE}/customers`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch customers: ${res.statusText}`);
  }
  const json = (await res.json()) as { data: unknown };
  return z.array(CustomerSchema).parse(json.data);
}

export async function fetchApplications(status?: string): Promise<OnboardingApplication[]> {
  const url = status && status !== 'ALL' ? `${API_BASE}/applications?status=${status}` : `${API_BASE}/applications`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch applications: ${res.statusText}`);
  }
  const json = (await res.json()) as { data: unknown };
  return z.array(OnboardingApplicationSchema).parse(json.data);
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/transactions?limit=50`);
  if (!res.ok) {
    throw new Error(`Failed to fetch transactions: ${res.statusText}`);
  }
  const json = (await res.json()) as { data: unknown };
  return z.array(TransactionSchema).parse(json.data);
}
