import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal

from apps.api.db.models import Agent, Organization, PurchaseRequest, RequestStatus
from apps.api.db.session import get_db
from apps.api.models.schemas import AgentCreate, AgentRead
from apps.api.auth import get_agent_from_api_key

router = APIRouter(prefix="/agents", tags=["agents"])


@router.get("/me", response_model=AgentRead)
def get_current_agent(agent: Agent = Depends(get_agent_from_api_key)) -> AgentRead:
    """Return the agent associated with the provided x-api-key header."""
    return AgentRead.model_validate(agent)


@router.post("", response_model=AgentRead)
def create_agent(
    agent: AgentCreate,
    db: Session = Depends(get_db),
) -> AgentRead:
    """Create a new agent."""
    # Verify organization exists
    org = db.query(Organization).filter(Organization.id == agent.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    new_agent = Agent(org_id=agent.org_id, name=agent.name)
    db.add(new_agent)
    db.commit()
    db.refresh(new_agent)
    return AgentRead.model_validate(new_agent)


@router.get("", response_model=list[AgentRead])
def list_agents(
    org_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> list[AgentRead]:
    """List all agents for an organization."""
    agents = db.query(Agent).filter(Agent.org_id == org_id).all()
    return [AgentRead.model_validate(agent) for agent in agents]


@router.get("/{agent_id}/spending")
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
