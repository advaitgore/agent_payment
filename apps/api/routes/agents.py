import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.api.db.models import Agent, Organization
from apps.api.db.session import get_db
from apps.api.models.schemas import AgentCreate, AgentRead

router = APIRouter(prefix="/agents", tags=["agents"])


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
