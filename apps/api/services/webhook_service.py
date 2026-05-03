import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)


async def fire_webhook(url: str, payload: dict[str, Any]) -> None:
    """Fire a webhook without raising exceptions back to the caller."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
        logger.info("Webhook delivered to %s", url)
    except Exception as exc:
        logger.warning("Webhook delivery failed for %s: %s", url, exc)
