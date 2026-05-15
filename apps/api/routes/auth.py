from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from apps.api.auth import clear_auth_cookie, create_access_token, get_current_user, hash_password, set_auth_cookie, verify_password
from apps.api.db.models import User
from apps.api.db.session import get_db
from apps.api.models.schemas import AuthSessionResponse, UserLogin, UserRead, UserSignup

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
    return AuthSessionResponse(user=UserRead.model_validate(user))


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
    return AuthSessionResponse(user=UserRead.model_validate(user))


@router.get(
    "/me",
    response_model=UserRead,
    summary="Current user",
    description="Return the authenticated user from the current session cookie.",
)
def me(user: User = Depends(get_current_user)) -> UserRead:
    return UserRead.model_validate(user)


@router.post(
    "/logout",
    summary="Logout",
    description="Clear the current session cookie.",
)
def logout(response: Response) -> dict[str, bool]:
    clear_auth_cookie(response)
    return {"ok": True}
