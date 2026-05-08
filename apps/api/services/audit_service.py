import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from apps.api.db.models import AuditEvent, Decision, DecisionStatus, PurchaseRequest


def list_audit_events(
    db: Session,
    *,
    agent_id: uuid.UUID | None,
    action: str | None,
    status: DecisionStatus | None,
    start: datetime | None,
    end: datetime | None,
    limit: int,
    offset: int,
) -> tuple[list[dict[str, Any]], int]:
    query = (
        db.query(AuditEvent, PurchaseRequest, Decision)
        .outerjoin(PurchaseRequest, AuditEvent.request_id == PurchaseRequest.id)
        .outerjoin(Decision, Decision.request_id == PurchaseRequest.id)
    )

    if agent_id:
        query = query.filter(
            or_(
                PurchaseRequest.agent_id == agent_id,
                AuditEvent.details["agent_id"].astext == str(agent_id),
            )
        )

    if action:
        query = query.filter(AuditEvent.action == action)

    if status:
        query = query.filter(Decision.status == status)

    if start:
        query = query.filter(AuditEvent.created_at >= start)

    if end:
        query = query.filter(AuditEvent.created_at <= end)

    total = query.with_entities(func.count(AuditEvent.id)).scalar() or 0

    rows = (
        query.order_by(AuditEvent.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    items: list[dict[str, Any]] = []
    for audit_event, purchase_request, decision in rows:
        items.append(
            {
                "id": audit_event.id,
                "request_id": audit_event.request_id,
                "action": audit_event.action,
                "details": audit_event.details,
                "created_at": audit_event.created_at,
                "merchant": purchase_request.merchant if purchase_request else None,
                "amount": purchase_request.amount if purchase_request else None,
                "decision_status": decision.status if decision else None,
                "trace_id": str(audit_event.id),
            }
        )

    return items, int(total)
