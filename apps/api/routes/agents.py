import secrets
import uuid

from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from apps.api.db.models import Agent, AuditEvent, Organization, PurchaseRequest, RequestStatus
from apps.api.db.session import get_db
from apps.api.models.schemas import AgentCreate, AgentRead
from apps.api.auth import get_agent_from_api_key

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


@router.post(
    "",
    response_model=AgentRead,
    summary="Create agent",
    description="Create a new agent under an organization and return its api_key.",
)
def create_agent(
    agent: AgentCreate,
    db: Session = Depends(get_db),
) -> AgentRead:
    """Create a new agent."""
    # Verify organization exists
    org = db.query(Organization).filter(Organization.id == agent.org_id).first()
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
    db: Session = Depends(get_db),
) -> list[AgentRead]:
    """List all agents for an organization."""
    agents = db.query(Agent).filter(Agent.org_id == org_id).all()
    return [AgentRead.model_validate(agent) for agent in agents]


@router.get(
    "/{agent_id}",
    response_model=AgentRead,
    summary="Get agent",
    description="Fetch a single agent by ID.",
)
def get_agent(
    agent_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> AgentRead:
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
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
    db: Session = Depends(get_db),
) -> AgentRead:
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
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
    db: Session = Depends(get_db),
) -> dict:
    """Return spending ledger summary for an agent."""
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
