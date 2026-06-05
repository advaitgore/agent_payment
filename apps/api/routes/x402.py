import uuid
from decimal import Decimal

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from apps.api.auth import get_agent_from_api_key
from apps.api.db.models import Agent, AuditEvent, Decision, DecisionStatus, PurchaseRequest, RequestStatus
from apps.api.db.session import get_db
from apps.api.services.policy_service import evaluate_request
from apps.api.services.webhook_service import fire_webhook

router = APIRouter(prefix="/authorize-x402", tags=["x402"])


class X402AuthRequest(BaseModel):
    merchant_address: str
    merchant_name: str
    amount_usd: Decimal
    token: str
    chain: str
    category: str
    reason: str


class X402AuthResponse(BaseModel):
    authorized: bool
    decision: str
    reason: str
    request_id: uuid.UUID


@router.post(
    "",
    response_model=X402AuthResponse,
    summary="Authorize x402 payment",
    description="Evaluate a merchant authorization request using the agent mandate and store the decision.",
)
def authorize_x402(
    payload: X402AuthRequest,
    background_tasks: BackgroundTasks,
    agent: Agent = Depends(get_agent_from_api_key),
    db: Session = Depends(get_db),
) -> X402AuthResponse:
    mandate = agent.mandate
    if not mandate:
        raise HTTPException(status_code=404, detail="Mandate not found for agent")

    temp_request = PurchaseRequest(
        agent_id=agent.id,
        merchant=payload.merchant_name,
        amount=payload.amount_usd,
        category=payload.category,
        reason=payload.reason,
        status=RequestStatus.pending,
    )

    decision_status, reason_code = evaluate_request(temp_request, mandate)

    request_status_map = {
        DecisionStatus.approved: RequestStatus.approved,
        DecisionStatus.denied: RequestStatus.denied,
        DecisionStatus.needs_review: RequestStatus.needs_review,
    }
    request_status = request_status_map[decision_status]

    purchase_request = PurchaseRequest(
        agent_id=agent.id,
        merchant=payload.merchant_name,
        amount=payload.amount_usd,
        category=payload.category,
        reason=payload.reason,
        status=request_status,
    )
    db.add(purchase_request)
    db.flush()

    decision = Decision(
        request_id=purchase_request.id,
        status=decision_status,
        reason=reason_code,
    )
    db.add(decision)

    audit_event = AuditEvent(
        request_id=purchase_request.id,
        action="x402_authorization",
        details={
            "merchant_address": payload.merchant_address,
            "token": payload.token,
            "chain": payload.chain,
        },
    )
    db.add(audit_event)

    db.commit()
    db.refresh(purchase_request)
    db.refresh(decision)

    if decision_status == DecisionStatus.needs_review:
        webhook_url = agent.webhook_url or mandate.callback_url
        if webhook_url:
            webhook_payload = {
                "event": "needs_review",
                "request_id": str(purchase_request.id),
                "merchant": purchase_request.merchant,
                "amount": str(purchase_request.amount),
                "reason": reason_code,
                "agent_id": str(agent.id),
            }
            background_tasks.add_task(fire_webhook, webhook_url, webhook_payload)

    return X402AuthResponse(
        authorized=decision_status == DecisionStatus.approved,
        decision=decision_status.value,
        reason=reason_code,
        request_id=purchase_request.id,
    )
