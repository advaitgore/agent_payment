from contextlib import asynccontextmanager
from typing import Callable

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
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

# Call streamable_http_app() at module level so the session manager is
# initialized before the lifespan tries to access it.
_mcp_asgi = mcp.streamable_http_app()


def _host_spoof(inner: Callable) -> Callable:
    """ASGI middleware that rewrites the Host header to 'localhost' before
    passing the request to FastMCP, bypassing its TrustedHostMiddleware."""
    async def wrapper(scope, receive, send):
        if scope.get("type") == "http":
            headers = [
                (b"host", b"localhost") if k.lower() == b"host" else (k, v)
                for k, v in scope.get("headers", [])
            ]
            scope = {**scope, "headers": headers, "server": ("localhost", 80)}
        await inner(scope, receive, send)
    return wrapper


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    # session_manager is now available because _mcp_asgi was called above
    async with mcp.session_manager.run():
        yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    redirect_slashes=False,
    lifespan=lifespan,
)

app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
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

# Mount FastMCP wrapped in the host-spoof middleware.
# FastMCP mounts its handler at /mcp internally, so full path = /mcp/mcp
app.mount("/mcp", _host_spoof(_mcp_asgi))


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/.well-known/mcp/server-card.json", include_in_schema=False)
def server_card() -> JSONResponse:
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
