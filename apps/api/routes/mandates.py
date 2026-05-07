import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.api.db.models import Agent, AuditEvent, Mandate
from apps.api.db.session import get_db
from apps.api.models.schemas import MandateCreate, MandateRead, MandateUpdate

router = APIRouter(prefix="/mandates", tags=["mandates"])


@router.post(
    "",
    response_model=MandateRead,
    summary="Create mandate",
    description="Create a mandate for an agent with spending rules and optional callback URL.",
)
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
        callback_url=mandate.callback_url,
    )
    db.add(new_mandate)
    db.commit()
    db.refresh(new_mandate)
    return MandateRead.model_validate(new_mandate)


@router.get(
    "",
    response_model=list[MandateRead],
    summary="List mandates",
    description="List mandates filtered by agent_id.",
)
def list_mandates(
    agent_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> list[MandateRead]:
    mandates = db.query(Mandate).filter(Mandate.agent_id == agent_id).all()
    return [MandateRead.model_validate(mandate) for mandate in mandates]


@router.get(
    "/{mandate_id}",
    response_model=MandateRead,
    summary="Get mandate",
    description="Fetch a specific mandate by its ID.",
)
def get_mandate(
    mandate_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> MandateRead:
    """Get a mandate by ID."""
    mandate = db.query(Mandate).filter(Mandate.id == mandate_id).first()
    if not mandate:
        raise HTTPException(status_code=404, detail="Mandate not found")
    return MandateRead.model_validate(mandate)


@router.patch(
    "/{mandate_id}",
    response_model=MandateRead,
    summary="Update mandate",
    description="Update mandate limits, allowed merchants, or callback URL.",
)
def update_mandate(
    mandate_id: uuid.UUID,
    payload: MandateUpdate,
    db: Session = Depends(get_db),
) -> MandateRead:
    mandate = db.query(Mandate).filter(Mandate.id == mandate_id).first()
    if not mandate:
        raise HTTPException(status_code=404, detail="Mandate not found")

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No mandate fields provided")

    for field, value in update_data.items():
        setattr(mandate, field, value)

    audit_event = AuditEvent(
        request_id=None,
        action="mandate_updated",
        details={
            "agent_id": str(mandate.agent_id),
            "mandate_id": str(mandate.id),
        },
    )
    db.add(audit_event)
    db.commit()
    db.refresh(mandate)

    return MandateRead.model_validate(mandate)
