import os
from typing import Any

import httpx
from mcp.server.fastmcp import FastMCP

BASE_URL = os.getenv("AGENTPAY_BASE_URL", "http://localhost:8000").rstrip("/")
API_KEY = os.getenv("AGENTPAY_API_KEY")

mcp = FastMCP("AgentPay")


def _auth_headers() -> dict[str, str]:
    if not API_KEY:
        raise RuntimeError("AGENTPAY_API_KEY is not set")
    return {"x-api-key": API_KEY}


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


if __name__ == "__main__":
    mcp.run()
