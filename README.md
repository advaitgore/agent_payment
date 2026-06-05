# AgentPay

Authorization layer for AI agent spending — set a mandate, get a decision in <100ms.

![Python](https://img.shields.io/badge/Python-3.11%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100%2B-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## What it does

An AI agent wants to spend money. AgentPay checks that spend against a pre-configured mandate (max per transaction, allowed merchants, approval thresholds) and returns an `approved` or `denied` decision in under 100ms — with a full audit trail.

No dashboard required. Set up entirely through Claude or any MCP-compatible client in under 2 minutes.

---

## Quickstart — MCP (recommended)

No account needed upfront. Add this to your `claude_desktop_config.json` (or equivalent):

```json
{
  "mcpServers": {
    "agentpay": {
      "command": "python",
      "args": ["-m", "apps.api.mcp_server"],
      "env": {
        "AGENTPAY_BASE_URL": "https://agentpayment-production.up.railway.app"
      }
    }
  }
}
```

Restart Claude, then say:

> "Set me up on AgentPay with a $50/transaction limit."

Claude will call `create_account` → `create_agent` → `create_mandate` and hand you back an API key. Add it to your config and restart — you're live.

```json
{
  "mcpServers": {
    "agentpay": {
      "command": "python",
      "args": ["-m", "apps.api.mcp_server"],
      "env": {
        "AGENTPAY_BASE_URL": "https://agentpayment-production.up.railway.app",
        "AGENTPAY_API_KEY": "agp_xxxx_your_key_here"
      }
    }
  }
}
```

---

## MCP Tools

### Setup tools (no API key required)

| Tool | Description |
| --- | --- |
| `create_account(email, org_name)` | Create a user account and organization. Returns `email`, `password`, `org_id`. |
| `create_agent(email, password, org_id, agent_name)` | Create an agent under your org. Returns `agent_id` and `api_key`. |
| `create_mandate(agent_api_key, max_per_transaction, approval_threshold, allowed_merchants)` | Set spending rules for your agent. |

### Runtime tools (requires `AGENTPAY_API_KEY`)

| Tool | Description |
| --- | --- |
| `authorize_purchase` | Evaluate a spend request against the active mandate. Returns `approved` or `denied` with reason. |
| `get_mandate` | Fetch the current mandate. |
| `get_spending_summary` | Return total spend and transaction count. |
| `get_audit_log` | List audit events with optional filters. |
| `update_mandate` | Update limits or merchant allowlist. |
| `rotate_agent_key` | Rotate the agent API key. |

---

## Quickstart (SDK)

```bash
pip install git+https://github.com/advaitgore/agent_payment.git#subdirectory=sdk
```

```python
from agent_payment import AgentPayClient

client = AgentPayClient("YOUR_API_KEY")
result = client.authorize("AWS", 49.0, "infrastructure", "EC2 instance")
print(result.decision, result.reason)
client.close()
```

---

## How it works

```
Agent request  →  Mandate evaluation  →  Decision + audit log
```

1. Your agent calls `authorize_purchase` (MCP) or `POST /authorize-x402` (HTTP)
2. AgentPay evaluates the request against the agent's active mandate
3. Returns `{ "decision": "approved" | "denied", "reason": "..." }` and persists an audit event

---

## API Reference

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | /health | — | Liveness check |
| POST | /auth/signup | — | Create user account |
| POST | /auth/login | — | Log in |
| POST | /orgs | session | Create an organization |
| GET | /orgs/{org_id} | session | Fetch an organization |
| POST | /agents | session | Create an agent (returns api_key) |
| GET | /agents/me | x-api-key | Resolve agent from key |
| GET | /agents/me/mandate | x-api-key | Get active mandate |
| POST | /agents/me/mandate | x-api-key | Create mandate |
| PATCH | /agents/me/mandate | x-api-key | Update mandate |
| GET | /agents/me/spending | x-api-key | Spending summary |
| GET | /agents/me/audit-events | x-api-key | Audit log |
| POST | /agents/me/rotate-key | x-api-key | Rotate API key |
| POST | /authorize-x402 | x-api-key | Single-call authorization |

---

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
# API running at http://localhost:8000

# 5. Start the frontend (optional)
cd apps/web && npm install && npm run dev
# Dashboard at http://localhost:5173
```

---

## Self-hosting

```bash
docker build -t agentpay .
docker run -p 8000:8000 --env-file .env agentpay
```

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

> Set `DATABASE_URL`, `ENVIRONMENT=production`, `DEBUG=false` in Railway environment variables.

---

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `postgresql+psycopg2://postgres:postgres@localhost:5432/agent_payment` | PostgreSQL connection string |
| `ENVIRONMENT` | `development` | Runtime environment |
| `DEBUG` | `false` | FastAPI debug mode |
| `AGENTPAY_API_KEY` | — | Agent API key for MCP runtime tools |
| `AGENTPAY_BASE_URL` | `http://localhost:8000` | API base URL for MCP server |
| `VITE_API_URL` | `http://localhost:8000` | Base URL for the frontend dashboard |
