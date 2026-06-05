import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict

from apps.api.db.models import DecisionStatus, RequestStatus


class OrganizationCreate(BaseModel):
    name: str


class UserSignup(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    created_at: datetime


class AuthSessionResponse(BaseModel):
    user: UserRead


class OrganizationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    created_at: datetime


class AgentCreate(BaseModel):
    org_id: uuid.UUID
    name: str
    wallet_address: str | None = None
    webhook_url: str | None = None


class AgentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    org_id: uuid.UUID
    name: str
    api_key: str | None
    wallet_address: str | None
    webhook_url: str | None
    created_at: datetime


class MandateCreate(BaseModel):
    agent_id: uuid.UUID
    max_per_transaction: Decimal
    approval_threshold: Decimal
    allowed_merchants: list[str]
    callback_url: str | None = None


class MandateUpdate(BaseModel):
    max_per_transaction: Decimal | None = None
    approval_threshold: Decimal | None = None
    allowed_merchants: list[str] | None = None
    callback_url: str | None = None


class MandateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)



class MandateCreateSelf(BaseModel):
    max_per_transaction: Decimal
    approval_threshold: Decimal
    allowed_merchants: list[str]
    callback_url: str | None = None

    id: uuid.UUID
    agent_id: uuid.UUID
    max_per_transaction: Decimal
    approval_threshold: Decimal
    allowed_merchants: list[str]
    callback_url: str | None
    created_at: datetime
    updated_at: datetime | None = None


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


class AuditEventListItem(BaseModel):
    id: uuid.UUID
    request_id: uuid.UUID | None
    action: str
    details: dict[str, Any]
    created_at: datetime
    merchant: str | None
    amount: Decimal | None
    decision_status: DecisionStatus | None
    trace_id: str


class AuditEventListResponse(BaseModel):
    items: list[AuditEventListItem]
    total: int
    limit: int
    offset: int


class PurchaseEvaluationResponse(BaseModel):
    request_id: uuid.UUID
    decision_status: DecisionStatus
    reason: str
