export type RequestStatus = 'pending' | 'approved' | 'denied' | 'needs_review';

export type DecisionStatus = 'approved' | 'denied' | 'needs_review';

export interface UserRead {
  id: string;
  email: string;
  created_at: string;
}

export interface UserSignup {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  user: UserRead;
}

export interface PurchaseRequestCreate {
  agent_id: string;
  merchant: string;
  amount: number;
  category: string;
  reason: string;
}

export interface PurchaseRequestRead {
  id: string;
  agent_id: string;
  merchant: string;
  amount: number;
  category: string;
  reason: string;
  status: RequestStatus;
  created_at: string;
}

export interface PurchaseEvaluationResponse {
  request_id: string;
  decision_status: DecisionStatus;
  reason: string;
}

export interface OrganizationCreate {
  name: string;
}

export interface OrganizationRead {
  id: string;
  name: string;
  created_at: string;
}

export interface AgentCreate {
  org_id: string;
  name: string;
  wallet_address?: string | null;
  webhook_url?: string | null;
}

export interface AgentRead {
  id: string;
  org_id: string;
  name: string;
  api_key?: string | null;
  wallet_address?: string | null;
  webhook_url?: string | null;
  created_at: string;
}

export interface MandateCreate {
  agent_id: string;
  max_per_transaction: number;
  approval_threshold: number;
  allowed_merchants: string[];
  callback_url?: string | null;
}

export interface MandateUpdate {
  max_per_transaction?: number;
  approval_threshold?: number;
  allowed_merchants?: string[];
  callback_url?: string | null;
}

export interface MandateRead {
  id: string;
  agent_id: string;
  max_per_transaction: number;
  approval_threshold: number;
  allowed_merchants: string[];
  callback_url?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface SpendingSummary {
  agent_id: string;
  total_spent: number;
  total_requests: number;
  approved: number;
  denied: number;
  needs_review: number;
}

export interface AuditEventListItem {
  id: string;
  request_id?: string | null;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
  merchant?: string | null;
  amount?: number | null;
  decision_status?: DecisionStatus | null;
  trace_id: string;
}

export interface AuditEventListResponse {
  items: AuditEventListItem[];
  total: number;
  limit: number;
  offset: number;
}
