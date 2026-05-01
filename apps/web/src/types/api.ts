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
