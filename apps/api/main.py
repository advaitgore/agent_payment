from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from apps.api.config import get_settings
from apps.api.db.init_db import init_db
from apps.api.routes.auth import router as auth_router
from apps.api.routes.agents import router as agents_router
from apps.api.routes.audit_events import router as audit_events_router
from apps.api.routes.mandates import router as mandates_router
from apps.api.routes.orgs import router as orgs_router
from apps.api.routes.requests import router as requests_router
from apps.api.routes.x402 import router as x402_router
from apps.api.mcp_server import mcp


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    async with mcp.session_manager:
        yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    redirect_slashes=False,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(orgs_router)
app.include_router(auth_router)
app.include_router(agents_router)
app.include_router(audit_events_router)
app.include_router(mandates_router)
app.include_router(requests_router)
app.include_router(x402_router)

# Mount MCP ASGI app at root so FastMCP's internal /mcp route is exposed correctly
app.mount("", mcp.streamable_http_app())


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/.well-known/mcp/server-card.json", include_in_schema=False)
def server_card() -> JSONResponse:
    """Static server card for Smithery discovery."""
    return JSONResponse({
        "schemaVersion": "1.0",
        "serverInfo": {
            "name": "AgentPay",
            "version": "1.0.0",
            "description": "Payment mandate infrastructure for AI agents.",
        },
        "tools": [
            {"name": "authorize_purchase", "description": "Authorize a purchase using the agent's mandate."},
            {"name": "get_mandate", "description": "Return the current mandate for the agent."},
            {"name": "update_mandate", "description": "Update the agent's mandate."},
            {"name": "get_spending_summary", "description": "Return a spending summary for the agent."},
            {"name": "get_audit_log", "description": "Return audit events for the current agent."},
            {"name": "rotate_agent_key", "description": "Rotate the current agent's API key."},
            {"name": "create_account", "description": "Create a new user account and organization."},
            {"name": "create_agent", "description": "Create an agent under an organization."},
            {"name": "create_mandate", "description": "Create a mandate for an agent."},
        ],
    })
