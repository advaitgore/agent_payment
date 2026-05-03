from __future__ import annotations

import httpx

from agent_payment.models import AuthorizationResult


class AgentPayClient:
    def __init__(self, api_key: str, base_url: str = "http://localhost:8000") -> None:
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._client = httpx.Client(
            base_url=self._base_url,
            timeout=10.0,
            headers={"x-api-key": api_key},
        )

    def close(self) -> None:
        self._client.close()

    def __enter__(self) -> "AgentPayClient":
        return self

    def __exit__(self, exc_type, exc, tb) -> None:
        self.close()

    def _request(self, method: str, path: str, **kwargs) -> dict:
        try:
            response = self._client.request(method, path, **kwargs)
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            body = exc.response.text
            raise RuntimeError(f"API error {status} for {method.upper()} {path}: {body}") from exc
        except httpx.RequestError as exc:
            raise RuntimeError(f"Request failed for {method.upper()} {path}: {exc}") from exc

        return response.json()

    def _get_agent(self) -> dict:
        return self._request("get", "/agents/me")

    def authorize(self, merchant: str, amount: float, category: str, reason: str) -> AuthorizationResult:
        agent = self._get_agent()
        request_payload = {
            "agent_id": agent["id"],
            "merchant": merchant,
            "amount": amount,
            "category": category,
            "reason": reason,
        }
        created = self._request("post", "/requests", json=request_payload)
        evaluation = self._request("post", f"/requests/{created['id']}/evaluate", json={})

        return AuthorizationResult(
            approved=evaluation["decision_status"] == "approved",
            decision=evaluation["decision_status"],
            reason=evaluation["reason"],
            request_id=str(evaluation["request_id"]),
        )

    def get_mandate(self) -> dict:
        agent = self._get_agent()
        mandates = self._request("get", "/mandates", params={"agent_id": agent["id"]})
        if not mandates:
            raise RuntimeError(f"No mandate found for agent_id={agent['id']}")
        return mandates[0]

    def get_spending(self) -> dict:
        agent = self._get_agent()
        return self._request("get", f"/agents/{agent['id']}/spending")
