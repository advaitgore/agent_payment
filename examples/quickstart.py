"""
AgentPay quickstart — runs end-to-end against a local or deployed API.

Usage:
    python examples/quickstart.py

Requires the API to be running at http://localhost:8000 (or set BASE_URL below).
"""

import httpx
import sys

BASE_URL = "http://localhost:8000"


def main():
    client = httpx.Client(base_url=BASE_URL, timeout=10)

    # 1. Create an org
    print("Creating org...")
    org = client.post("/orgs", json={"name": "Demo Org"}).json()
    print(f"  org_id: {org['id']}")

    # 2. Create an agent
    print("Creating agent...")
    agent = client.post("/agents", json={
        "org_id": org["id"],
        "name": "demo-agent"
    }).json()
    api_key = agent["api_key"]
    print(f"  agent_id: {agent['id']}")
    print(f"  api_key:  {api_key}")

    # 3. Create a mandate
    print("Creating mandate...")
    mandate = client.post("/mandates", json={
        "agent_id": agent["id"],
        "max_per_transaction": 100.0,
        "approval_threshold": 50.0,
        "allowed_merchants": ["AWS", "Stripe", "GitHub"]
    }).json()
    print(f"  mandate_id: {mandate['id']}")

    # 4. Submit a purchase request
    print("Submitting purchase request...")
    request = client.post("/requests", json={
        "agent_id": agent["id"],
        "merchant": "AWS",
        "amount": 45.0,
        "category": "infrastructure",
        "description": "EC2 instance"
    }).json()
    print(f"  request_id: {request['id']}")

    # 5. Evaluate the request
    print("Evaluating request...")
    result = client.post(
        f"/requests/{request['id']}/evaluate",
        headers={"x-api-key": api_key}
    ).json()

    print()
    print(f"  Decision : {result['decision'].upper()}")
    print(f"  Reason   : {result['reason']}")
    print()

    # 6. Check spending summary
    spending = client.get(f"/agents/{agent['id']}/spending").json()
    print(f"  Total spent: ${spending['total_amount']:.2f} across {spending['total_count']} transaction(s)")

    client.close()


if __name__ == "__main__":
    main()