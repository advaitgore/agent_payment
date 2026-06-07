import os
from typing import Any
import secrets

import httpx
from mcp.server.fastmcp import FastMCP

BASE_URL = os.getenv("AGENTPAY_BASE_URL", "http://localhost:8000").rstrip("/")
API_KEY = os.getenv("AGENTPAY_API_KEY")

mcp = FastMCP(
    "AgentPay",
    stateless_http=True,
)


def _auth_headers() -> dict[str, str]:
    if not API_KEY:
        raise RuntimeError("AGENTPAY_API_KEY is not set")
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
    merchant: str,
    amount: float,
    category: str,
    reason: str,
    merchant_address: str = "unknown",
    token: str = "unknown",
    chain: str = "unknown",
) -> dict[str, Any]:
    """Authorize a purchase using the agent's mandate."""
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
    """Return the current mandate for the agent."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        return await _get(client, "/agents/me/mandate")


@mcp.tool()
async def get_spending_summary() -> dict[str, Any]:
    """Return a spending summary for the agent."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        return await _get(client, "/agents/me/spending")


@mcp.tool()
async def get_audit_log(
    action: str | None = None,
    status: str | None = None,
    start: str | None = None,
    end: str | None = None,
    limit: int | None = None,
    offset: int | None = None,
) -> dict[str, Any]:
    """Return audit events for the current agent."""
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
    max_per_transaction: float | None = None,
    approval_threshold: float | None = None,
    allowed_merchants: list[str] | None = None,
    callback_url: str | None = None,
) -> dict[str, Any]:
    """Update the current agent's mandate."""
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
    """Rotate the current agent's API key."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        return await _post(client, "/agents/me/rotate-key", {})


@mcp.tool()
async def create_account(email: str, org_name: str) -> dict[str, Any]:
    """Create a user account and an organization. Returns email, password, and org_id."""
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
    email: str,
    password: str,
    org_id: str,
    agent_name: str,
    webhook_url: str | None = None,
) -> dict[str, Any]:
    """Log in and create an agent under org_id. Returns agent_id and api_key."""
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
    agent_api_key: str,
    max_per_transaction: float,
    approval_threshold: float,
    allowed_merchants: list[str],
    callback_url: str | None = None,
) -> dict[str, Any]:
    """Create a mandate using the provided agent API key."""
    payload = {
        "max_per_transaction": max_per_transaction,
        "approval_threshold": approval_threshold,
        "allowed_merchants": allowed_merchants,
        "callback_url": callback_url,
    }
    async with httpx.AsyncClient(timeout=10.0) as client:
        return await _post_with_key(client, "/agents/me/mandate", payload, agent_api_key)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    mcp.run(transport="streamable-http", host="0.0.0.0", port=port)
