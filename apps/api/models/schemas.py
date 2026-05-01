import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict

from apps.api.db.models import DecisionStatus, RequestStatus


class OrganizationCreate(BaseModel):
    name: str


class OrganizationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    created_at: datetime


class AgentCreate(BaseModel):
    org_id: uuid.UUID
    name: str


class AgentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    org_id: uuid.UUID
    name: str
    created_at: datetime


class MandateCreate(BaseModel):
    agent_id: uuid.UUID
    max_per_transaction: Decimal
    approval_threshold: Decimal
    allowed_merchants: list[str]


class MandateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    agent_id: uuid.UUID
    max_per_transaction: Decimal
    approval_threshold: Decimal
    allowed_merchants: list[str]
    created_at: datetime


class PurchaseRequestCreate(BaseModel):
    agent_id: uuid.UUID
    merchant: str
    amount: Decimal
    category: str
    reason: str


class PurchaseRequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    agent_id: uuid.UUID
    merchant: str
    amount: Decimal
    category: str
    reason: str
    status: RequestStatus
    created_at: datetime


class DecisionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    request_id: uuid.UUID
    status: DecisionStatus
    reason: str
    created_at: datetime


class AuditEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    request_id: uuid.UUID | None
    action: str
    details: dict[str, Any]
    created_at: datetime


class PurchaseEvaluationResponse(BaseModel):
    request_id: uuid.UUID
    decision_status: DecisionStatus
    reason: str
