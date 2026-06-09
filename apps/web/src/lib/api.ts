import type {
  PurchaseEvaluationResponse,
  PurchaseRequestCreate,
  PurchaseRequestRead,
  OrganizationCreate,
  OrganizationRead,
  AgentCreate,
  AgentRead,
  MandateCreate,
  MandateRead,
  MandateUpdate,
  SpendingSummary,
  AuditEventListResponse,
  DecisionStatus,
  UserLogin,
  UserRead,
  UserSignup,
  AuthSessionResponse,
} from '../types/api';
import { getStoredApiBaseUrl } from './storage';

const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

function getBaseUrl(): string {
  return getStoredApiBaseUrl()?.trim() || DEFAULT_BASE_URL;
}

async function apiCall<T>(endpoint: string, method: string = 'GET', body?: unknown, token?: string): Promise<T> {
  const url = `${getBaseUrl()}${endpoint}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };
  if (body) opts.body = JSON.stringify(body);
  const resp = await fetch(url, opts);
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(err.detail || `HTTP ${resp.status}`);
  }
  return resp.json() as Promise<T>;
}

export interface ProvisionResponse {
  api_key: string;
  agent_id: string;
  org_id: string;
}

export async function signupAndProvision(payload: UserSignup): Promise<ProvisionResponse> {
  return apiCall<ProvisionResponse>('/auth/signup-and-provision', 'POST', payload);
}

export async function createOrg(payload: OrganizationCreate): Promise<OrganizationRead> {
  return apiCall<OrganizationRead>('/orgs', 'POST', payload);
}

export async function getOrganization(orgId: string): Promise<OrganizationRead> {
  return apiCall<OrganizationRead>(`/orgs/${orgId}`);
}

export async function createAgent(payload: AgentCreate): Promise<AgentRead> {
  return apiCall<AgentRead>('/agents', 'POST', payload);
}

export async function getAgent(agentId: string): Promise<AgentRead> {
  return apiCall<AgentRead>(`/agents/${agentId}`);
}

export async function rotateAgentKey(agentId: string): Promise<AgentRead> {
  return apiCall<AgentRead>(`/agents/${agentId}/rotate-key`, 'POST');
}

export async function listAgents(orgId?: string, token?: string): Promise<AgentRead[]> {
  const suffix = orgId ? `?org_id=${orgId}` : '';
  return apiCall<AgentRead[]>(`/agents${suffix}`, 'GET', undefined, token);
}

export async function createMandate(payload: MandateCreate): Promise<MandateRead> {
  return apiCall<MandateRead>('/mandates', 'POST', payload);
}

export async function listMandates(agentId: string): Promise<MandateRead[]> {
  return apiCall<MandateRead[]>(`/mandates?agent_id=${agentId}`);
}

export async function getMandate(mandateId: string): Promise<MandateRead> {
  return apiCall<MandateRead>(`/mandates/${mandateId}`);
}

export async function updateMandate(mandateId: string, payload: MandateUpdate): Promise<MandateRead> {
  return apiCall<MandateRead>(`/mandates/${mandateId}`, 'PATCH', payload);
}

export async function getSpendingSummary(agentId: string): Promise<SpendingSummary> {
  return apiCall<SpendingSummary>(`/agents/${agentId}/spending`);
}

export async function createPurchaseRequest(payload: PurchaseRequestCreate): Promise<PurchaseRequestRead> {
  return apiCall<PurchaseRequestRead>('/requests', 'POST', payload);
}

export async function evaluatePurchaseRequest(requestId: string): Promise<PurchaseEvaluationResponse> {
  return apiCall<PurchaseEvaluationResponse>(`/requests/${requestId}/evaluate`, 'POST');
}

export async function listRequests(agentId: string): Promise<PurchaseRequestRead[]> {
  return apiCall<PurchaseRequestRead[]>(`/requests?agent_id=${agentId}`);
}

export async function listAuditEvents(params: {
  agent_id?: string;
  action?: string;
  status?: DecisionStatus;
  start?: string;
  end?: string;
  limit?: number;
  offset?: number;
}): Promise<AuditEventListResponse> {
  const search = new URLSearchParams();
  if (params.agent_id) search.set('agent_id', params.agent_id);
  if (params.action) search.set('action', params.action);
  if (params.status) search.set('status', params.status);
  if (params.start) search.set('start', params.start);
  if (params.end) search.set('end', params.end);
  if (params.limit !== undefined) search.set('limit', String(params.limit));
  if (params.offset !== undefined) search.set('offset', String(params.offset));
  const query = search.toString();
  const suffix = query ? `?${query}` : '';
  return apiCall<AuditEventListResponse>(`/audit-events${suffix}`);
}

export async function signup(payload: UserSignup): Promise<AuthSessionResponse> {
  return apiCall<AuthSessionResponse>('/auth/signup', 'POST', payload);
}

export async function login(payload: UserLogin): Promise<AuthSessionResponse> {
  return apiCall<AuthSessionResponse>('/auth/login', 'POST', payload);
}

export async function getMe(): Promise<UserRead> {
  return apiCall<UserRead>('/auth/me');
}

export async function logout(): Promise<{ ok: boolean }> {
  return apiCall<{ ok: boolean }>('/auth/logout', 'POST');
}
