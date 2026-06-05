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

app = FastAPI(title=settings.app_name, debug=settings.debug)

# CORS middleware with environment-driven allowed origins
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

# Mount MCP server — accessible at /mcp for Smithery and MCP clients
app.mount("/mcp", mcp.streamable_http_app())


@app.on_event("startup")
def startup() -> None:
    init_db()


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
            "description": "Payment mandate infrastructure for AI agents. Authorize purchases, manage spending limits, and audit transactions — all scoped to agent-level API keys.",
        },
        "tools": [
            {
                "name": "authorize_purchase",
                "description": "Authorize a purchase using the agent's mandate. Checks spend limits, category rules, and allowed merchants before approving.",
            },
            {
                "name": "get_mandate",
                "description": "Return the current mandate for the agent — spending limits, allowed merchants, and approval threshold.",
            },
            {
                "name": "update_mandate",
                "description": "Update the agent's mandate: max per transaction, approval threshold, allowed merchants, or callback URL.",
            },
            {
                "name": "get_spending_summary",
                "description": "Return a spending summary for the agent including total spend and transaction counts.",
            },
            {
                "name": "get_audit_log",
                "description": "Return audit events for the current agent, filterable by action, status, and date range.",
            },
            {
                "name": "rotate_agent_key",
                "description": "Rotate the current agent's API key and return the new key.",
            },
            {
                "name": "create_account",
                "description": "Create a new user account and organization. Returns email, generated password, and org_id.",
            },
            {
                "name": "create_agent",
                "description": "Create an agent under an organization. Returns agent id and api_key.",
            },
            {
                "name": "create_mandate",
                "description": "Create a mandate for an agent using its API key.",
            },
        ],
    })
