import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.api.auth import get_current_user
from apps.api.db.models import Agent, AuditEvent, Decision, DecisionStatus, Organization, PurchaseRequest, RequestStatus, User, UserOrganization
from apps.api.db.session import get_db
from apps.api.models.schemas import (
    PurchaseEvaluationResponse,
    PurchaseRequestCreate,
    PurchaseRequestRead,
)
from apps.api.services.policy_service import evaluate_request
from apps.api.services.webhook_service import fire_webhook

router = APIRouter(prefix="/requests", tags=["requests"])


@router.get(
    "",
    response_model=list[PurchaseRequestRead],
    summary="List purchase requests",
    description="Return the most recent purchase requests for an agent, newest first.",
)
def list_requests(
    agent_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[PurchaseRequestRead]:
    """Return the most recent 50 purchase requests for an agent, newest first."""
    authorized_agent = (
        db.query(Agent)
        .join(Organization, Organization.id == Agent.org_id)
        .join(UserOrganization, UserOrganization.org_id == Organization.id)
        .filter(
            Agent.id == agent_id,
            UserOrganization.user_id == current_user.id,
        )
        .first()
    )
    if not authorized_agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    requests = (
        db.query(PurchaseRequest)
        .filter(PurchaseRequest.agent_id == agent_id)
        .order_by(PurchaseRequest.created_at.desc())
        .limit(50)
        .all()
    )
    return [PurchaseRequestRead.model_validate(r) for r in requests]


@router.post(
    "",
    response_model=PurchaseRequestRead,
    summary="Create purchase request",
    description="Create a new purchase request in pending status.",
)
def create_request(
    req: PurchaseRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PurchaseRequestRead:
    """Create a new purchase request."""
    authorized_agent = (
        db.query(Agent)
        .join(Organization, Organization.id == Agent.org_id)
        .join(UserOrganization, UserOrganization.org_id == Organization.id)
        .filter(
            Agent.id == req.agent_id,
            UserOrganization.user_id == current_user.id,
        )
        .first()
    )
    if not authorized_agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    purchase_request = PurchaseRequest(
        agent_id=req.agent_id,
        merchant=req.merchant,
        amount=req.amount,
        category=req.category,
        reason=req.reason,
        status=RequestStatus.pending,
    )
    db.add(purchase_request)
    db.commit()
    db.refresh(purchase_request)
    return PurchaseRequestRead.model_validate(purchase_request)


@router.post(
    "/{request_id}/evaluate",
    response_model=PurchaseEvaluationResponse,
    summary="Evaluate purchase request",
    description="Evaluate a purchase request against the agent mandate and store a decision.",
)
def evaluate_purchase_request(
    request_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> PurchaseEvaluationResponse:
    """Evaluate a purchase request and create a decision."""
    # Load the purchase request
    purchase_request = (
        db.query(PurchaseRequest)
        .join(Agent, Agent.id == PurchaseRequest.agent_id)
        .join(Organization, Organization.id == Agent.org_id)
        .join(UserOrganization, UserOrganization.org_id == Organization.id)
        .filter(
            PurchaseRequest.id == request_id,
            UserOrganization.user_id == current_user.id,
        )
        .first()
    )
    if not purchase_request:
        raise HTTPException(status_code=404, detail="Request not found")

    # Load the agent's mandate
    agent = purchase_request.agent
    if not agent.mandate:
        raise HTTPException(status_code=404, detail="Mandate not found for agent")

    # Check for existing decision
    existing_decision = db.query(Decision).filter(Decision.request_id == request_id).first()
    if existing_decision:
        raise HTTPException(status_code=409, detail="Request already evaluated")

    # Evaluate the request
    decision_status, reason_code = evaluate_request(purchase_request, agent.mandate)

    # Map DecisionStatus to RequestStatus
    request_status_map = {
        DecisionStatus.approved: RequestStatus.approved,
        DecisionStatus.denied: RequestStatus.denied,
        DecisionStatus.needs_review: RequestStatus.needs_review,
    }
    request_status = request_status_map[decision_status]

    # Create the decision
    decision = Decision(
        request_id=purchase_request.id,
        status=decision_status,
        reason=reason_code,
    )
    db.add(decision)

    # Update the request status
    purchase_request.status = request_status

    # Create an audit event
    audit_event = AuditEvent(
        request_id=purchase_request.id,
        action="request_evaluated",
        details={
            "decision_status": decision_status.value,
            "reason": reason_code,
        },
    )
    db.add(audit_event)

    db.commit()
    db.refresh(decision)

    if decision_status == DecisionStatus.needs_review:
        webhook_url = agent.webhook_url or agent.mandate.callback_url
        if webhook_url:
            payload = {
                "event": "needs_review",
                "request_id": str(purchase_request.id),
                "merchant": purchase_request.merchant,
                "amount": str(purchase_request.amount),
                "reason": reason_code,
                "agent_id": str(agent.id),
            }
            background_tasks.add_task(fire_webhook, webhook_url, payload)

    return PurchaseEvaluationResponse(
        request_id=purchase_request.id,
        decision_status=decision_status,
        reason=reason_code,
    )
