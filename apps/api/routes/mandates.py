import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.api.db.models import Agent, Mandate
from apps.api.db.session import get_db
from apps.api.models.schemas import MandateCreate, MandateRead

router = APIRouter(prefix="/mandates", tags=["mandates"])


@router.post("", response_model=MandateRead)
def create_mandate(
    mandate: MandateCreate,
    db: Session = Depends(get_db),
) -> MandateRead:
    """Create a new mandate for an agent."""
    # Verify agent exists
    agent = db.query(Agent).filter(Agent.id == mandate.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Check if mandate already exists for this agent
    existing_mandate = db.query(Mandate).filter(Mandate.agent_id == mandate.agent_id).first()
    if existing_mandate:
        raise HTTPException(status_code=409, detail="Mandate already exists for this agent")

    new_mandate = Mandate(
        agent_id=mandate.agent_id,
        max_per_transaction=mandate.max_per_transaction,
        approval_threshold=mandate.approval_threshold,
        allowed_merchants=mandate.allowed_merchants,
    )
    db.add(new_mandate)
    db.commit()
    db.refresh(new_mandate)
    return MandateRead.model_validate(new_mandate)


@router.get("/{mandate_id}", response_model=MandateRead)
def get_mandate(
    mandate_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> MandateRead:
    """Get a mandate by ID."""
    mandate = db.query(Mandate).filter(Mandate.id == mandate_id).first()
    if not mandate:
        raise HTTPException(status_code=404, detail="Mandate not found")
    return MandateRead.model_validate(mandate)
