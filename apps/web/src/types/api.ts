export type RequestStatus = 'pending' | 'approved' | 'denied' | 'needs_review';

export type DecisionStatus = 'approved' | 'denied' | 'needs_review';

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
}

export interface AgentRead {
  id: string;
  org_id: string;
  name: string;
  api_key?: string | null;
  created_at: string;
}

export interface MandateCreate {
  agent_id: string;
  max_per_transaction: number;
  approval_threshold: number;
  allowed_merchants: string[];
}
