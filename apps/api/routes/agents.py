import secrets
import uuid

from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from apps.api.auth import get_agent_from_api_key, get_current_user
from apps.api.db.models import Agent, AuditEvent, DecisionStatus, Mandate, Organization, PurchaseRequest, RequestStatus, User, UserOrganization
from apps.api.db.session import get_db
from apps.api.models.schemas import AgentCreate, AgentRead, AuditEventListItem, AuditEventListResponse, MandateRead, MandateUpdate
from apps.api.services.audit_service import list_audit_events

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get(
    "/me",
    response_model=AgentRead,
    summary="Get current agent",
    description="Resolve the agent associated with the provided x-api-key header.",
)
def get_current_agent(agent: Agent = Depends(get_agent_from_api_key)) -> AgentRead:
    """Return the agent associated with the provided x-api-key header."""
    return AgentRead.model_validate(agent)


@router.get(
    "/me/mandate",
    response_model=MandateRead,
    summary="Get current mandate",
    description="Fetch the current mandate for the agent identified by x-api-key.",
)
def get_current_agent_mandate(
    agent: Agent = Depends(get_agent_from_api_key),
    db: Session = Depends(get_db),
) -> MandateRead:
    mandate = db.query(Mandate).filter(Mandate.agent_id == agent.id).first()
    if not mandate:
        raise HTTPException(status_code=404, detail="Mandate not found for agent")
    return MandateRead.model_validate(mandate)


@router.patch(
    "/me/mandate",
    response_model=MandateRead,
    summary="Update current mandate",
    description="Update the current mandate for the agent identified by x-api-key.",
)
def update_current_agent_mandate(
    payload: MandateUpdate,
    agent: Agent = Depends(get_agent_from_api_key),
    db: Session = Depends(get_db),
) -> MandateRead:
    mandate = db.query(Mandate).filter(Mandate.agent_id == agent.id).first()
    if not mandate:
        raise HTTPException(status_code=404, detail="Mandate not found for agent")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No mandate fields provided")

    for field, value in update_data.items():
        setattr(mandate, field, value)

    audit_event = AuditEvent(
        request_id=None,
        action="mandate_updated",
        details={
            "agent_id": str(agent.id),
            "mandate_id": str(mandate.id),
        },
    )
    db.add(audit_event)
    db.commit()
    db.refresh(mandate)

    return MandateRead.model_validate(mandate)


@router.get(
    "/me/audit-events",
    response_model=AuditEventListResponse,
    summary="List audit events for current agent",
    description="Return audit events for the agent identified by x-api-key.",
)
def get_current_agent_audit_events(
    agent: Agent = Depends(get_agent_from_api_key),
    action: str | None = None,
    status: DecisionStatus | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
) -> AuditEventListResponse:
    items_raw, total = list_audit_events(
        db,
        accessible_agent_ids=[agent.id],
        agent_id=agent.id,
        action=action,
        status=status,
        start=start,
        end=end,
        limit=limit,
        offset=offset,
    )
    items = [AuditEventListItem.model_validate(item) for item in items_raw]
    return AuditEventListResponse(items=items, total=total, limit=limit, offset=offset)


@router.get(
    "/me/spending",
    summary="Get spending summary for current agent",
    description="Return spending totals and counts for the agent identified by x-api-key.",
)
def current_agent_spending(
    agent: Agent = Depends(get_agent_from_api_key),
    db: Session = Depends(get_db),
) -> dict:
    total_requests = db.query(func.count(PurchaseRequest.id)).filter(PurchaseRequest.agent_id == agent.id).scalar() or 0

    approved = db.query(func.count(PurchaseRequest.id)).filter(
        PurchaseRequest.agent_id == agent.id, PurchaseRequest.status == RequestStatus.approved
    ).scalar() or 0
    denied = db.query(func.count(PurchaseRequest.id)).filter(
        PurchaseRequest.agent_id == agent.id, PurchaseRequest.status == RequestStatus.denied
    ).scalar() or 0
    needs_review = db.query(func.count(PurchaseRequest.id)).filter(
        PurchaseRequest.agent_id == agent.id, PurchaseRequest.status == RequestStatus.needs_review
    ).scalar() or 0

    total_spent = db.query(func.coalesce(func.sum(PurchaseRequest.amount), 0)).filter(
        PurchaseRequest.agent_id == agent.id, PurchaseRequest.status == RequestStatus.approved
    ).scalar() or Decimal("0.00")

    return {
        "agent_id": agent.id,
        "total_spent": total_spent,
        "total_requests": int(total_requests),
        "approved": int(approved),
        "denied": int(denied),
        "needs_review": int(needs_review),
    }


@router.post(
    "/me/rotate-key",
    response_model=AgentRead,
    summary="Rotate current agent API key",
    description="Generate a new API key for the agent identified by x-api-key.",
)
def rotate_current_agent_key(
    agent: Agent = Depends(get_agent_from_api_key),
    db: Session = Depends(get_db),
) -> AgentRead:
    agent.api_key = secrets.token_hex(32)
    audit_event = AuditEvent(
        request_id=None,
        action="api_key_rotated",
        details={"agent_id": str(agent.id)},
    )
    db.add(audit_event)
    db.commit()
    db.refresh(agent)

    return AgentRead.model_validate(agent)


@router.post(
    "",
    response_model=AgentRead,
    summary="Create agent",
    description="Create a new agent under an organization and return its api_key.",
)
def create_agent(
    agent: AgentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AgentRead:
    """Create a new agent."""
    # Verify organization exists
    org = (
        db.query(Organization)
        .join(UserOrganization, UserOrganization.org_id == Organization.id)
        .filter(
            Organization.id == agent.org_id,
            UserOrganization.user_id == current_user.id,
        )
        .first()
    )
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    new_agent = Agent(
        org_id=agent.org_id,
        name=agent.name,
        wallet_address=agent.wallet_address,
        webhook_url=agent.webhook_url,
    )
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    return AgentRead.model_validate(new_agent)


@router.get(
    "",
    response_model=list[AgentRead],
    summary="List agents",
    description="List all agents for a given organization.",
)
def list_agents(
    org_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AgentRead]:
    """List all agents for an organization."""
    agents = (
        db.query(Agent)
        .join(Organization, Organization.id == Agent.org_id)
        .join(UserOrganization, UserOrganization.org_id == Organization.id)
        .filter(
            Agent.org_id == org_id,
            UserOrganization.user_id == current_user.id,
        )
        .all()
    )
    return [AgentRead.model_validate(agent) for agent in agents]


@router.get(
    "/{agent_id}",
    response_model=AgentRead,
    summary="Get agent",
    description="Fetch a single agent by ID.",
)
def get_agent(
    agent_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AgentRead:
    agent = (
        db.query(Agent)
        .join(Organization, Organization.id == Agent.org_id)
        .join(UserOrganization, UserOrganization.org_id == Organization.id)
        .filter(
            Agent.id == agent_id,
            UserOrganization.user_id == current_user.id,
        )
        .first()
    )
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentRead.model_validate(agent)


@router.post(
    "/{agent_id}/rotate-key",
    response_model=AgentRead,
    summary="Rotate agent API key",
    description="Generate a new API key for the agent and record an audit event.",
)
def rotate_agent_key(
    agent_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AgentRead:
    agent = (
        db.query(Agent)
        .join(Organization, Organization.id == Agent.org_id)
        .join(UserOrganization, UserOrganization.org_id == Organization.id)
        .filter(
            Agent.id == agent_id,
            UserOrganization.user_id == current_user.id,
        )
        .first()
    )
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent.api_key = secrets.token_hex(32)
    audit_event = AuditEvent(
        request_id=None,
        action="api_key_rotated",
        details={"agent_id": str(agent.id)},
    )
    db.add(audit_event)
    db.commit()
    db.refresh(agent)

    return AgentRead.model_validate(agent)


@router.get(
    "/{agent_id}/spending",
    summary="Get spending summary",
    description="Return request counts and total approved spend for the agent.",
)
def agent_spending(
    agent_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    """Return spending ledger summary for an agent."""
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

    # total requests
    total_requests = db.query(func.count(PurchaseRequest.id)).filter(PurchaseRequest.agent_id == agent_id).scalar() or 0

    # counts by status
    approved = db.query(func.count(PurchaseRequest.id)).filter(
        PurchaseRequest.agent_id == agent_id, PurchaseRequest.status == RequestStatus.approved
    ).scalar() or 0
    denied = db.query(func.count(PurchaseRequest.id)).filter(
        PurchaseRequest.agent_id == agent_id, PurchaseRequest.status == RequestStatus.denied
    ).scalar() or 0
    needs_review = db.query(func.count(PurchaseRequest.id)).filter(
        PurchaseRequest.agent_id == agent_id, PurchaseRequest.status == RequestStatus.needs_review
    ).scalar() or 0

    # total spent (sum of approved amounts)
    total_spent = db.query(func.coalesce(func.sum(PurchaseRequest.amount), 0)).filter(
        PurchaseRequest.agent_id == agent_id, PurchaseRequest.status == RequestStatus.approved
    ).scalar() or Decimal("0.00")

    return {
        "agent_id": agent_id,
        "total_spent": total_spent,
        "total_requests": int(total_requests),
        "approved": int(approved),
        "denied": int(denied),
        "needs_review": int(needs_review),
    }
