import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.api.db.models import Organization
from apps.api.db.session import get_db
from apps.api.models.schemas import OrganizationCreate, OrganizationRead

router = APIRouter(prefix="/orgs", tags=["organizations"])


@router.post("", response_model=OrganizationRead)
def create_organization(
    org: OrganizationCreate,
    db: Session = Depends(get_db),
) -> OrganizationRead:
    """Create a new organization."""
    organization = Organization(name=org.name)
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return OrganizationRead.model_validate(organization)


@router.get("/{org_id}", response_model=OrganizationRead)
def get_organization(
    org_id: uuid.UUID,
    db: Session = Depends(get_db),
) -> OrganizationRead:
    """Get an organization by ID."""
    organization = db.query(Organization).filter(Organization.id == org_id).first()
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    return OrganizationRead.model_validate(organization)
