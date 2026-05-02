from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from apps.api.db.session import get_db
from apps.api.db.models import Agent


def get_agent_from_api_key(x_api_key: str = Header(..., alias="x-api-key"), db: Session = Depends(get_db)) -> Agent:
    """Dependency that returns an Agent for a valid API key or raises 401."""
    agent = db.query(Agent).filter(Agent.api_key == x_api_key).first()
    if not agent:
        raise HTTPException(status_code=401, detail="Invalid API key")
    return agent
