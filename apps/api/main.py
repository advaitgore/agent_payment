from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, Response
from starlette.routing import Route
from starlette.applications import Starlette

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
    async with mcp.session_manager.run():
        yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    redirect_slashes=False,
    lifespan=lifespan,
)

# Allow all hosts
app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])

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


# Directly expose the MCP streamable-HTTP handler without going through
# FastMCP's Starlette app (which wraps TrustedHostMiddleware around it).
# We grab the underlying ASGI handler from the session manager directly.
@app.api_route("/mcp/mcp", methods=["GET", "POST", "DELETE"])
async def mcp_handler(request: Request):
    """Proxy all MCP traffic to the session manager's handle_request."""
    handler = mcp.session_manager.handle_request
    # Build a minimal scope that looks like the request came from localhost
    scope = dict(request.scope)
    headers = [
        (b"host", b"localhost") if k.lower() == b"host" else (k, v)
        for k, v in scope.get("headers", [])
    ]
    scope["headers"] = headers
    scope["server"] = ("localhost", 80)

    body_chunks = []
    async def receive():
        body = await request.body()
        return {"type": "http.request", "body": body, "more_body": False}

    response_started = {}
    response_body = []

    async def send(message):
        if message["type"] == "http.response.start":
            response_started["status"] = message["status"]
            response_started["headers"] = message.get("headers", [])
        elif message["type"] == "http.response.body":
            response_body.append(message.get("body", b""))

    await handler(scope, receive, send)

    status = response_started.get("status", 200)
    raw_headers = response_started.get("headers", [])
    headers_dict = {k.decode(): v.decode() for k, v in raw_headers}
    body = b"".join(response_body)
    return Response(
        content=body,
        status_code=status,
        headers=headers_dict,
    )


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
