import type {
  PurchaseEvaluationResponse,
  PurchaseRequestCreate,
  PurchaseRequestRead,
  OrganizationCreate,
  OrganizationRead,
  AgentCreate,
  AgentRead,
  MandateCreate,
} from '../types/api';

const API_BASE_URL = 'http://localhost:8001';

async function apiCall<T>(endpoint: string, method: string = 'GET', body?: unknown): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const opts: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(url, opts);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${resp.status}`);
  }
  return resp.json() as Promise<T>;
}

export async function createOrg(payload: OrganizationCreate): Promise<OrganizationRead> {
  return apiCall<OrganizationRead>('/orgs', 'POST', payload);
}

export async function createAgent(payload: AgentCreate): Promise<AgentRead> {
  return apiCall<AgentRead>('/agents', 'POST', payload);
}

export async function listAgents(orgId?: string): Promise<AgentRead[]> {
  if (orgId) return apiCall<AgentRead[]>(`/agents?org_id=${orgId}`);
  return apiCall<AgentRead[]>('/agents?org_id=');
}

export async function createMandate(payload: MandateCreate) {
  return apiCall('/mandates', 'POST', payload);
}

export async function createPurchaseRequest(payload: PurchaseRequestCreate): Promise<PurchaseRequestRead> {
  return apiCall<PurchaseRequestRead>('/requests', 'POST', payload);
}

export async function evaluatePurchaseRequest(requestId: string): Promise<PurchaseEvaluationResponse> {
  return apiCall<PurchaseEvaluationResponse>(`/requests/${requestId}/evaluate`, 'POST');
}

export async function listRequests(agentId: string) {
  return apiCall<PurchaseRequestRead[]>(`/requests?agent_id=${agentId}`);
}
