from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apps.api.config import get_settings
from apps.api.db.init_db import init_db
from apps.api.routes.agents import router as agents_router
from apps.api.routes.audit_events import router as audit_events_router
from apps.api.routes.mandates import router as mandates_router
from apps.api.routes.orgs import router as orgs_router
from apps.api.routes.requests import router as requests_router
from apps.api.routes.x402 import router as x402_router


settings = get_settings()

app = FastAPI(title=settings.app_name, debug=settings.debug)

# Allow local frontend dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orgs_router)
app.include_router(agents_router)
app.include_router(audit_events_router)
app.include_router(mandates_router)
app.include_router(requests_router)
app.include_router(x402_router)


@app.on_event("startup")
def startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}