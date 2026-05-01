import logging

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from apps.api.db.models import Base
from apps.api.db.session import engine


logger = logging.getLogger(__name__)

def init_db() -> None:
    try:
        Base.metadata.create_all(bind=engine)
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        logger.warning("Skipping database startup check: %s", exc)