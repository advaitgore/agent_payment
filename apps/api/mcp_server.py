import os
from typing import Any

import httpx
from mcp.server.fastmcp import FastMCP

BASE_URL = os.getenv("AGENTPAY_BASE_URL", "http://localhost:8000").rstrip("/")

mcp = FastMCP("AgentPay")


async def _get_agent(client: httpx.AsyncClient, api_key: str) -> dict[str, Any]:
    response = await client.get(
        f"{BASE_URL}/agents/me",
        headers={"x-api-key": api_key},
    )
    response.raise_for_status()
    return response.json()


async def _get(client: httpx.AsyncClient, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    response = await client.get(f"{BASE_URL}{path}", params=params)
    response.raise_for_status()
    return response.json()


async def _post(client: httpx.AsyncClient, path: str, payload: dict[str, Any]) -> dict[str, Any]:
    response = await client.post(f"{BASE_URL}{path}", json=payload)
    response.raise_for_status()
    return response.json()


@mcp.tool()
async def authorize_purchase(api_key: str, merchant: str, amount: float, category: str, reason: str) -> str:
    """Authorize a purchase using the agent's mandate."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        agent = await _get_agent(client, api_key)
        agent_id = agent["id"]

        request_payload = {
            "agent_id": agent_id,
            "merchant": merchant,
            "amount": amount,
            "category": category,
            "reason": reason,
        }
        request_response = await _post(client, "/requests", request_payload)

        evaluation = await _post(client, f"/requests/{request_response['id']}/evaluate", {})

    return (
        f"decision={evaluation['decision_status']} "
        f"reason={evaluation['reason']} "
        f"request_id={evaluation['request_id']}"
    )


@mcp.tool()
async def get_mandate(api_key: str) -> str:
    """Return a formatted mandate summary for the agent."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        agent = await _get_agent(client, api_key)
        agent_id = agent["id"]
        mandates = await _get(client, "/mandates", params={"agent_id": agent_id})

    if not mandates:
        return f"No mandate found for agent_id={agent_id}"

    mandate = mandates[0]
    allowed_merchants = ", ".join(mandate.get("allowed_merchants", []))
    return (
        f"mandate_id={mandate['id']} "
        f"max_per_transaction={mandate['max_per_transaction']} "
        f"approval_threshold={mandate['approval_threshold']} "
        f"allowed_merchants=[{allowed_merchants}]"
    )


@mcp.tool()
async def get_spending_summary(api_key: str) -> str:
    """Return a formatted spending summary for the agent."""
    async with httpx.AsyncClient(timeout=10.0) as client:
        agent = await _get_agent(client, api_key)
        agent_id = agent["id"]
        spending = await _get(client, f"/agents/{agent_id}/spending")

    return (
        f"total_spent={spending['total_spent']} "
        f"total_requests={spending['total_requests']} "
        f"approved={spending['approved']} "
        f"denied={spending['denied']} "
        f"needs_review={spending['needs_review']}"
    )


if __name__ == "__main__":
    mcp.run()
