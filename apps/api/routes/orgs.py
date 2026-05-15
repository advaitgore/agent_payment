import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from apps.api.auth import get_current_user
from apps.api.db.models import Organization, User, UserOrganization
from apps.api.db.session import get_db
from apps.api.models.schemas import OrganizationCreate, OrganizationRead

router = APIRouter(prefix="/orgs", tags=["organizations"])


@router.post(
    "",
    response_model=OrganizationRead,
    summary="Create organization",
    description="Create a new organization that can own agents and mandates.",
)
def create_organization(
    org: OrganizationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrganizationRead:
    """Create a new organization."""
    organization = Organization(name=org.name)
    db.add(organization)
    db.flush()
    db.add(UserOrganization(user_id=current_user.id, org_id=organization.id))
    db.commit()
    db.refresh(organization)
    return OrganizationRead.model_validate(organization)


@router.get(
    "",
    response_model=list[OrganizationRead],
    summary="List organizations",
    description="List organizations owned by the authenticated user.",
)
def list_organizations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[OrganizationRead]:
    organizations = (
        db.query(Organization)
        .join(UserOrganization, UserOrganization.org_id == Organization.id)
        .filter(UserOrganization.user_id == current_user.id)
        .order_by(Organization.created_at.desc())
        .all()
    )
    return [OrganizationRead.model_validate(organization) for organization in organizations]


@router.get(
    "/{org_id}",
    response_model=OrganizationRead,
    summary="Get organization",
    description="Fetch a single organization by its ID.",
)
def get_organization(
    org_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> OrganizationRead:
    """Get an organization by ID."""
    organization = (
        db.query(Organization)
        .join(UserOrganization, UserOrganization.org_id == Organization.id)
        .filter(
            Organization.id == org_id,
            UserOrganization.user_id == current_user.id,
        )
        .first()
    )
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")
    return OrganizationRead.model_validate(organization)
