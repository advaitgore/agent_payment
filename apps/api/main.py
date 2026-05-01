from fastapi import FastAPI

from apps.api.config import get_settings
from apps.api.db.init_db import init_db
from apps.api.routes.agents import router as agents_router
from apps.api.routes.mandates import router as mandates_router
from apps.api.routes.orgs import router as orgs_router
from apps.api.routes.requests import router as requests_router


settings = get_settings()

app = FastAPI(title=settings.app_name, debug=settings.debug)

app.include_router(orgs_router)
app.include_router(agents_router)
app.include_router(mandates_router)
app.include_router(requests_router)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}