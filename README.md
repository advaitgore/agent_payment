# AgentPay

Authorization layer for AI agent spending — set a mandate, get a decision in <100ms

![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Quickstart

```python
from agent_payment import AgentPayClient
client = AgentPayClient("YOUR_API_KEY")
result = client.authorize("Acme", 49.0, "software", "monthly seat")
print(result.decision, result.reason)
client.close()
```

## How it works

```
[1] Agent request  --->  [2] Mandate evaluation  --->  [3] Decision + audit
```

## API Reference

| Method | Path | Description |
| --- | --- | --- |
| GET | /health | Liveness check for the API service. |
| POST | /orgs | Create a new organization. |
| GET | /orgs/{org_id} | Fetch a single organization by ID. |
| POST | /agents | Create a new agent with an API key. |
| GET | /agents | List agents for an organization (org_id query). |
| GET | /agents/me | Resolve the agent for the provided x-api-key. |
| GET | /agents/{agent_id}/spending | Return spending totals and counts for an agent. |
| POST | /mandates | Create a mandate for an agent. |
| GET | /mandates | List mandates for an agent (agent_id query). |
| GET | /mandates/{mandate_id} | Fetch a mandate by ID. |
| POST | /requests | Create a new purchase request. |
| GET | /requests | List recent purchase requests (agent_id query). |
| POST | /requests/{request_id}/evaluate | Evaluate a request against the mandate. |
| POST | /authorize-x402 | Authorize a payment intent via x402 flow. |

## x402 Integration

Use POST /authorize-x402 to evaluate a merchant authorization request without a prior stored request. The endpoint evaluates the mandate, stores the request and decision, logs an audit event, and returns an authorization result.

## MCP Server

Run the MCP server as a standalone process:

```bash
python -m apps.api.mcp_server
```

Set AGENTPAY_BASE_URL to point the tools at your API (default http://localhost:8000). Use the three tools: authorize_purchase, get_mandate, and get_spending_summary.

## Self-hosting

Docker (build + run):

```bash
docker build -t agentpay .
docker run -p 8000:8000 --env-file .env agentpay
```

Railway deploy button placeholder:

```
[ Deploy on Railway ]
```

## Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| DATABASE_URL | postgresql+psycopg2://postgres:postgres@localhost:5432/agent_payment | PostgreSQL connection string. |
| ENVIRONMENT | development | Runtime environment name. |
| DEBUG | false | Enable debug mode for FastAPI. |
| AGENTPAY_BASE_URL | http://localhost:8000 | Base URL used by the MCP server tools. |
