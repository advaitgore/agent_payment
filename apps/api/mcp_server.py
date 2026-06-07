import os
from typing import Any
import secrets
from typing import Annotated

import httpx
from mcp.server.fastmcp import FastMCP

BASE_URL = os.getenv("AGENTPAY_BASE_URL", "http://localhost:8000").rstrip("/")
API_KEY = os.getenv("AGENTPAY_API_KEY")

# host="0.0.0.0" prevents FastMCP from auto-enabling TrustedHostMiddleware
# (which it only auto-enables when host is localhost/127.0.0.1/::1)
mcp = FastMCP(
    "AgentPay",
    stateless_http=True,
    host="0.0.0.0",
)


def _auth_headers() -> dict[str, str]:
    if not API_KEY:
        raise RuntimeError(
            "AGENTPAY_API_KEY environment variable is not set. "
            "Provide your agent API key when connecting to this server."
        )
    return {"x-api-key": API_KEY}


def _bearer_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


async def _get(client: httpx.AsyncClient, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    response = await client.get(f"{BASE_URL}{path}", params=params, headers=_auth_headers())
    response.raise_for_status()
    return response.json()


async def _post(client: httpx.AsyncClient, path: str, payload: dict[str, Any]) -> dict[str, Any]:
    response = await client.post(f"{BASE_URL}{path}", json=payload, headers=_auth_headers())
    response.raise_for_status()
    return response.json()


async def _patch(client: httpx.AsyncClient, path: str, payload: dict[str, Any]) -> dict[str, Any]:
    response = await client.patch(f"{BASE_URL}{path}", json=payload, headers=_auth_headers())
    response.raise_for_status()
    return response.json()


async def _post_noauth(client: httpx.AsyncClient, path: str, payload: dict[str, Any]) -> dict[str, Any]:
    response = await client.post(f"{BASE_URL}{path}", json=payload)
    response.raise_for_status()
    return response.json()


async def _post_with_bearer(client: httpx.AsyncClient, path: str, payload: dict[str, Any], token: str) -> dict[str, Any]:
    response = await client.post(f"{BASE_URL}{path}", json=payload, headers=_bearer_headers(token))
    response.raise_for_status()
    return response.json()


async def _post_with_key(client: httpx.AsyncClient, path: str, payload: dict[str, Any], api_key: str) -> dict[str, Any]:
    response = await client.post(f"{BASE_URL}{path}", json=payload, headers={"x-api-key": api_key})
    response.raise_for_status()
    return response.json()


@mcp.tool()
async def authorize_purchase(
    merchant: Annotated[str, "Name of the merchant or service being paid (e.g. 'OpenAI', 'AWS', 'Stripe')"],
    amount: Annotated[float, "Purchase amount in USD (e.g. 9.99)"],
    category: Annotated[str, "Spending category for this purchase (e.g. 'ai-inference', 'cloud-storage', 'data')"],
    reason: Annotated[str, "Brief justification for why the agent is making this purchase"],
    merchant_address: Annotated[str, "On-chain wallet address of the merchant, if applicable. Use 'unknown' if not relevant."] = "unknown",
    token: Annotated[str, "Payment token/currency to use (e.g. 'USDC', 'ETH'). Use 'unknown' for fiat."] = "unknown",
    chain: Annotated[str, "Blockchain network for the payment (e.g. 'base', 'ethereum'). Use 'unknown' for fiat."] = "unknown",
) -> dict[str, Any]:
    """Check whether a purchase is permitted under the agent's mandate and, if so, authorize it.

    Returns an authorization result with status ('approved' or 'denied') and a transaction ID if approved.
    Call this before any payment action — do not pay first and ask permission later.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        payload = {
            "merchant_address": merchant_address,
            "merchant_name": merchant,
            "amount_usd": amount,
            "token": token,
            "chain": chain,
            "category": category,
            "reason": reason,
        }
        return await _post(client, "/authorize-x402", payload)


@mcp.tool()
async def get_mandate() -> dict[str, Any]:
    """Fetch the current spending mandate for this agent.

    Returns limits such as max_per_transaction, approval_threshold, and allowed_merchants.
    Call this first to understand what the agent is permitted to spend before calling authorize_purchase.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        return await _get(client, "/agents/me/mandate")


@mcp.tool()
async def get_spending_summary() -> dict[str, Any]:
    """Fetch a summary of the agent's spending to date.

    Returns totals broken down by period, category, and merchant.
    Useful for checking remaining budget before making a purchase.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        return await _get(client, "/agents/me/spending")


@mcp.tool()
async def get_audit_log(
    action: Annotated[str | None, "Filter by action type (e.g. 'authorize', 'deny', 'mandate_update'). Omit for all actions."] = None,
    status: Annotated[str | None, "Filter by outcome status (e.g. 'approved', 'denied'). Omit for all statuses."] = None,
    start: Annotated[str | None, "Start of date range in ISO 8601 format (e.g. '2025-01-01T00:00:00Z'). Omit for no lower bound."] = None,
    end: Annotated[str | None, "End of date range in ISO 8601 format (e.g. '2025-12-31T23:59:59Z'). Omit for no upper bound."] = None,
    limit: Annotated[int | None, "Maximum number of events to return (default: 50, max: 200)."] = None,
    offset: Annotated[int | None, "Number of events to skip for pagination (default: 0)."] = None,
) -> dict[str, Any]:
    """Fetch the audit log of all authorization events for this agent.

    Returns a paginated list of events showing every authorize or deny decision, with timestamps and amounts.
    Use action, status, start, and end filters to narrow results.
    """
    params = {
        "action": action,
        "status": status,
        "start": start,
        "end": end,
        "limit": limit,
        "offset": offset,
    }
    params = {key: value for key, value in params.items() if value is not None}
    async with httpx.AsyncClient(timeout=10.0) as client:
        return await _get(client, "/agents/me/audit-events", params=params)


@mcp.tool()
async def update_mandate(
    max_per_transaction: Annotated[float | None, "New maximum USD amount allowed per single transaction. Omit to leave unchanged."] = None,
    approval_threshold: Annotated[float | None, "USD amount above which human approval is required before the agent can proceed. Omit to leave unchanged."] = None,
    allowed_merchants: Annotated[list[str] | None, "Allowlist of merchant names the agent may pay. Pass an empty list [] to allow all merchants. Omit to leave unchanged."] = None,
    callback_url: Annotated[str | None, "HTTPS URL to receive webhook notifications for authorization events. Omit to leave unchanged."] = None,
) -> dict[str, Any]:
    """Update one or more fields of the agent's spending mandate.

    Only the fields you provide will be changed — omitted fields are left as-is.
    Changes take effect immediately for all subsequent authorize_purchase calls.
    """
    payload = {
        "max_per_transaction": max_per_transaction,
        "approval_threshold": approval_threshold,
        "allowed_merchants": allowed_merchants,
        "callback_url": callback_url,
    }
    payload = {key: value for key, value in payload.items() if value is not None}
    async with httpx.AsyncClient(timeout=10.0) as client:
        return await _patch(client, "/agents/me/mandate", payload)


@mcp.tool()
async def rotate_agent_key() -> dict[str, Any]:
    """Rotate the API key for the current agent and return the new key.

    The old key is immediately invalidated. Store the new key securely before the response is lost.
    Use this if a key may have been compromised or as part of a regular rotation policy.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        return await _post(client, "/agents/me/rotate-key", {})


@mcp.tool()
async def create_account(
    email: Annotated[str, "Email address for the new user account (e.g. 'user@example.com')"],
    org_name: Annotated[str, "Display name for the organization to create alongside this account (e.g. 'Acme AI')"],
) -> dict[str, Any]:
    """Create a new AgentPay user account and an organization in one step.

    A secure random password is generated automatically.
    Returns the email, generated password, and org_id — save these immediately as the password is not stored.
    After this, call create_agent to provision an agent under the new org.
    """
    password = secrets.token_urlsafe(16)
    async with httpx.AsyncClient(timeout=10.0) as client:
        signup_resp = await _post_noauth(client, "/auth/signup", {"email": email, "password": password})
        token = signup_resp.get("access_token")
        if not token:
            raise RuntimeError("Signup did not return access_token")
        org_resp = await _post_with_bearer(client, "/orgs", {"name": org_name}, token)
    return {"email": email, "password": password, "org_id": org_resp.get("id")}


@mcp.tool()
async def create_agent(
    email: Annotated[str, "Email of the existing AgentPay user account that owns this agent"],
    password: Annotated[str, "Password for the user account (returned by create_account)"],
    org_id: Annotated[str, "UUID of the organization to create the agent under (returned by create_account)"],
    agent_name: Annotated[str, "Human-readable name for this agent (e.g. 'research-bot', 'purchasing-agent')"],
    webhook_url: Annotated[str | None, "Optional HTTPS URL to receive real-time authorization event webhooks"] = None,
) -> dict[str, Any]:
    """Create a new agent under an existing organization.

    Returns an agent_id and api_key — the api_key is the credential used to connect this MCP server.
    Save the api_key immediately; it cannot be retrieved again (only rotated via rotate_agent_key).
    After this, call create_mandate to set spending limits for the agent.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        login_resp = await _post_noauth(client, "/auth/login", {"email": email, "password": password})
        token = login_resp.get("access_token")
        if not token:
            raise RuntimeError("Login did not return access_token")
        payload = {"org_id": org_id, "name": agent_name, "webhook_url": webhook_url}
        agent_resp = await _post_with_bearer(client, "/agents", payload, token)
    return {"agent_id": agent_resp.get("id"), "api_key": agent_resp.get("api_key")}


@mcp.tool()
async def create_mandate(
    agent_api_key: Annotated[str, "API key of the agent to create the mandate for (returned by create_agent)"],
    max_per_transaction: Annotated[float, "Maximum USD amount allowed in a single transaction (e.g. 50.0)"],
    approval_threshold: Annotated[float, "USD amount above which human approval is required before the agent can proceed (e.g. 100.0)"],
    allowed_merchants: Annotated[list[str], "List of merchant names the agent is permitted to pay. Pass an empty list [] to allow all merchants."],
    callback_url: Annotated[str | None, "Optional HTTPS URL to receive webhook notifications for authorization events"] = None,
) -> dict[str, Any]:
    """Create a spending mandate for an agent using its API key.

    A mandate must exist before the agent can call authorize_purchase.
    Sets the rules governing what the agent may spend, on whom, and up to what amount.
    """
    payload = {
        "max_per_transaction": max_per_transaction,
        "approval_threshold": approval_threshold,
        "allowed_merchants": allowed_merchants,
        "callback_url": callback_url,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        return await _post_with_key(client, "/agents/me/mandate", payload, agent_api_key)
