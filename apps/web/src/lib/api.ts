import type { PurchaseEvaluationResponse, PurchaseRequestCreate, PurchaseRequestRead } from '../types/api';

const API_BASE_URL = 'http://localhost:8001';

async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: unknown,
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function createPurchaseRequest(payload: PurchaseRequestCreate): Promise<PurchaseRequestRead> {
  return apiCall<PurchaseRequestRead>('/requests', 'POST', payload);
}

export async function evaluatePurchaseRequest(requestId: string): Promise<PurchaseEvaluationResponse> {
  return apiCall<PurchaseEvaluationResponse>(`/requests/${requestId}/evaluate`, 'POST');
}
