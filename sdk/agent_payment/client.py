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

    def authorize(
        self,
        merchant: str,
        amount: float,
        category: str,
        reason: str,
        merchant_address: str = "unknown",
        token: str = "unknown",
        chain: str = "unknown",
    ) -> AuthorizationResult:
        payload = {
            "merchant_address": merchant_address,
            "merchant_name": merchant,
            "amount_usd": amount,
            "token": token,
            "chain": chain,
            "category": category,
            "reason": reason,
        }
        evaluation = self._request("post", "/authorize-x402", json=payload)

        return AuthorizationResult(
            approved=evaluation["decision"] == "approved",
            decision=evaluation["decision"],
            reason=evaluation["reason"],
            request_id=str(evaluation["request_id"]),
        )

    def get_mandate(self) -> dict:
        return self._request("get", "/agents/me/mandate")

    def get_spending(self) -> dict:
        return self._request("get", "/agents/me/spending")
