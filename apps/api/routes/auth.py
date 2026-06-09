from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from apps.api.auth import clear_auth_cookie, create_access_token, get_current_user, hash_password, set_auth_cookie, verify_password
from apps.api.db.models import Agent, Organization, User, UserOrganization
from apps.api.db.session import get_db
from apps.api.models.schemas import AgentRead, AuthSessionResponse, ProvisionResponse, UserLogin, UserRead, UserSignup

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/signup",
    response_model=AuthSessionResponse,
    summary="Sign up",
    description="Create a user account and start a session.",
)
def signup(
    payload: UserSignup,
    response: Response,
    db: Session = Depends(get_db),
) -> AuthSessionResponse:
    email = payload.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already exists")

    user = User(email=email, password_hash=hash_password(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user)
    set_auth_cookie(response, token)
    return AuthSessionResponse(user=UserRead.model_validate(user), access_token=token)


@router.post(
    "/signup-and-provision",
    response_model=ProvisionResponse,
    summary="Signup and provision",
    description="Create user, org, and default agent in one call. Returns the agent API key.",
)
def signup_and_provision(
    payload: UserSignup,
    response: Response,
    db: Session = Depends(get_db),
) -> ProvisionResponse:
    email = payload.email.strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=409, detail="Email already exists")

    user = User(email=email, password_hash=hash_password(payload.password))
    db.add(user)
    db.flush()

    org_name = email.split("@")[0]
    org = Organization(name=org_name)
    db.add(org)
    db.flush()

    db.add(UserOrganization(user_id=user.id, org_id=org.id))

    agent = Agent(org_id=org.id, name="default")
    db.add(agent)
    db.commit()
    db.refresh(agent)

    token = create_access_token(user)
    set_auth_cookie(response, token)

    return ProvisionResponse(api_key=agent.api_key, agent_id=agent.id, org_id=org.id)


@router.post(
    "/login",
    response_model=AuthSessionResponse,
    summary="Login",
    description="Authenticate an existing user and start a session.",
)
def login(
    payload: UserLogin,
    response: Response,
    db: Session = Depends(get_db),
) -> AuthSessionResponse:
    email = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user)
    set_auth_cookie(response, token)
    return AuthSessionResponse(user=UserRead.model_validate(user), access_token=token)


@router.get(
    "/me",
    response_model=UserRead,
    summary="Current user",
    description="Return the authenticated user from the current session cookie.",
)
def me(user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(user)


@router.get(
    "/me/agents",
    response_model=list[AgentRead],
    summary="List agents for current user",
    description="Return all agents belonging to any org the current user is a member of.",
)
def me_agents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[AgentRead]:
    agents = (
        db.query(Agent)
        .join(Organization, Organization.id == Agent.org_id)
        .join(UserOrganization, UserOrganization.org_id == Organization.id)
        .filter(UserOrganization.user_id == current_user.id)
        .all()
    )
    return [AgentRead.model_validate(a) for a in agents]


@router.post(
    "/logout",
    summary="Logout",
    description="Clear the current session cookie.",
)
def logout(response: Response) -> dict[str, bool]:
    clear_auth_cookie(response)
    return {"ok": True}
