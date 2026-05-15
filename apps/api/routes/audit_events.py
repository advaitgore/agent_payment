import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from apps.api.auth import get_current_user
from apps.api.db.models import Agent, DecisionStatus, Organization, User, UserOrganization
from apps.api.db.session import get_db
from apps.api.models.schemas import AuditEventListResponse, AuditEventListItem
from apps.api.services.audit_service import list_audit_events

router = APIRouter(prefix="/audit-events", tags=["audit-events"])


@router.get(
    "",
    response_model=AuditEventListResponse,
    summary="List audit events",
    description="Return audit events with optional filters for agent, action, status, and time range.",
)
def get_audit_events(
    agent_id: uuid.UUID | None = None,
    action: str | None = None,
    status: DecisionStatus | None = None,
    start: datetime | None = None,
    end: datetime | None = None,
    limit: int = Query(20, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AuditEventListResponse:
    accessible_agents = (
        db.query(Agent.id)
        .join(Organization, Organization.id == Agent.org_id)
        .join(UserOrganization, UserOrganization.org_id == Organization.id)
        .filter(UserOrganization.user_id == current_user.id)
        .all()
    )
    accessible_agent_ids = [row[0] for row in accessible_agents]

    items_raw, total = list_audit_events(
        db,
        accessible_agent_ids=accessible_agent_ids,
        agent_id=agent_id,
        action=action,
        status=status,
        start=start,
        end=end,
        limit=limit,
        offset=offset,
    )

    items = [AuditEventListItem.model_validate(item) for item in items_raw]
    return AuditEventListResponse(items=items, total=total, limit=limit, offset=offset)
