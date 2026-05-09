# AgentPay

Authorization layer for AI agent spending — set a mandate, get a decision in <100ms.

![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## What it does

An AI agent wants to spend money. AgentPay checks that spend against a pre-configured mandate (max per transaction, allowed merchants, approval thresholds) and returns an `approved` or `denied` decision in under 100ms — with a full audit trail.

## Quickstart (SDK)

```python
pip install git+https://github.com/advaitgore/agent_payment.git#subdirectory=sdk
```

```python
from agent_payment import AgentPayClient
client = AgentPayClient("YOUR_API_KEY")
result = client.authorize("AWS", 49.0, "infrastructure", "EC2 instance")
print(result.decision, result.reason)
client.close()
```

## Local Development

```bash
git clone https://github.com/advaitgore/agent_payment
cd agent_payment

# 1. Set up environment
cp .env.example .env
# Edit .env — set DATABASE_URL to your Postgres connection string

# 2. Install backend dependencies
pip install -r apps/api/requirements.txt

# 3. Run DB migrations
alembic upgrade head

# 4. Start the API
uvicorn apps.api.main:app --reload
# API is now running at http://localhost:8000

# 5. Start the frontend (new terminal)
cd apps/web
cp .env.example .env
# VITE_API_URL is already set to http://localhost:8000
npm install
npm run dev
# Dashboard is now at http://localhost:5173
```

## How it works

```
 Agent request  →   Mandate evaluation  →   Decision + audit log
```

1. Your agent calls `POST /authorize-x402` (or use the SDK)
2. AgentPay evaluates the request against the agent's active mandate
3. Returns `{ "decision": "approved" | "denied", "reason": "..." }` and persists an audit event

## Setup flow

Before authorizing any payments, you need three things:

1. **Create an org** — `POST /orgs`
2. **Create an agent** — `POST /agents` (returns an `api_key`)
3. **Create a mandate** — `POST /mandates` (sets spend limits for that agent)

See `examples/quickstart.py` for a full working walkthrough.

## API Reference

| Method | Path | Description |
| --- | --- | --- |
| GET | /health | Liveness check |
| POST | /orgs | Create a new organization |
| GET | /orgs/{org_id} | Fetch an organization by ID |
| POST | /agents | Create a new agent (returns api_key) |
| GET | /agents | List agents for an org |
| GET | /agents/me | Resolve agent from x-api-key header |
| GET | /agents/{agent_id}/spending | Return spending totals and counts |
| POST | /agents/{agent_id}/rotate-key | Rotate the agent's API key |
| POST | /mandates | Create a mandate for an agent |
| GET | /mandates | List mandates for an agent |
| GET | /mandates/{mandate_id} | Fetch a mandate by ID |
| PATCH | /mandates/{mandate_id} | Update mandate limits |
| POST | /requests | Create a new purchase request |
| GET | /requests | List recent purchase requests |
| POST | /requests/{request_id}/evaluate | Evaluate a request against the mandate |
| POST | /authorize-x402 | Single-call authorization (x402 flow) |

## MCP Server

Run as a standalone MCP server:

```bash
python -m apps.api.mcp_server
```

Set `AGENTPAY_BASE_URL` to point tools at your deployed API (default: `http://localhost:8000`).

**Available tools:**
- `authorize_purchase` — evaluate a spend request against the active mandate
- `get_mandate` — fetch the current mandate for an agent
- `get_spending_summary` — return total spend and transaction count

**Claude / Cursor integration** — add to your `mcp_servers` config:
```json
{
	"agentpay": {
		"command": "python",
		"args": ["-m", "apps.api.mcp_server"],
		"env": { "AGENTPAY_BASE_URL": "https://your-deployed-api-url" }
	}
}
```

## Self-hosting (Docker)

```bash
docker build -t agentpay .
docker run -p 8000:8000 --env-file .env agentpay
```

## Deploy on Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

> Set `DATABASE_URL`, `ENVIRONMENT=production`, `DEBUG=false` in Railway environment variables.

## Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| DATABASE_URL | postgresql+psycopg2://postgres:postgres@localhost:5432/agent_payment | PostgreSQL connection string |
| ENVIRONMENT | development | Runtime environment name |
| DEBUG | false | Enable FastAPI debug mode |
| AGENTPAY_BASE_URL | http://localhost:8000 | Base URL used by the MCP server |
| VITE_API_URL | http://localhost:8000 | Base URL used by the frontend dashboard |
