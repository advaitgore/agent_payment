import base64
import hashlib
import hmac
import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import Cookie, Depends, Header, HTTPException, Response
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from apps.api.config import get_settings
from apps.api.db.session import get_db
from apps.api.db.models import Agent, User


def get_agent_from_api_key(x_api_key: str = Header(..., alias="x-api-key"), db: Session = Depends(get_db)) -> Agent:
    """Dependency that returns an Agent for a valid API key or raises 401."""
    agent = db.query(Agent).filter(Agent.api_key == x_api_key).first()
    if not agent:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return agent


settings = get_settings()
AUTH_COOKIE_NAME = "agentpay_session"
AUTH_COOKIE_SAMESITE = "none"


def _b64_encode(raw_bytes: bytes) -> str:
    return base64.b64encode(raw_bytes).decode("utf-8")


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    hashed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return f"{_b64_encode(salt)}:{_b64_encode(hashed)}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt_b64, hash_b64 = stored_hash.split(":", maxsplit=1)
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(hash_b64)
    except (ValueError, TypeError):
        return False

    current = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 100_000)
    return hmac.compare_digest(current, expected)


def create_access_token(user: User) -> str:
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=settings.auth_token_expire_minutes)
    payload = {
        "sub": str(user.id),
        "email": user.email,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    return jwt.encode(payload, settings.auth_secret_key, algorithm="HS256")


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite=AUTH_COOKIE_SAMESITE,
        max_age=settings.auth_token_expire_minutes * 60,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=AUTH_COOKIE_NAME,
        path="/",
        samesite=AUTH_COOKIE_SAMESITE,
        httponly=True,
        secure=True,
    )


def get_current_user(
    authorization: str | None = Header(default=None, alias="Authorization"),
    session_token: str | None = Cookie(default=None, alias=AUTH_COOKIE_NAME),
    db: Session = Depends(get_db),
) -> User:
    # Prefer Bearer token from Authorization header, fall back to cookie
    token: str | None = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
    elif session_token:
        token = session_token

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        payload = jwt.decode(token, settings.auth_secret_key, algorithms=["HS256"])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid session token")
        parsed_user_id = uuid.UUID(str(user_id))
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid session token") from None

    user = db.query(User).filter(User.id == parsed_user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")
    return user
