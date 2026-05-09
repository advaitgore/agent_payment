# AGENTS.md

This file helps AI coding agents understand the AgentPay codebase quickly.

## What this repo does

AgentPay is a spending authorization layer for AI agents. Before an agent
spends money, it checks against a pre-configured mandate and returns an
`approved` or `denied` decision with an audit trail.

## Repo structure

```
apps/
  api/          FastAPI backend — routes, models, DB, MCP server
  web/          React/Vite frontend dashboard
sdk/
  agent_payment/  Python SDK (AgentPayClient)
examples/
  quickstart.py   End-to-end walkthrough
docs/
  product-spec.md
```

## How to run the API

```bash
cp .env.example .env   # fill in DATABASE_URL
pip install -r apps/api/requirements.txt
alembic upgrade head
uvicorn apps.api.main:app --reload
```

## How to run the MCP server

```bash
python -m apps.api.mcp_server
```

Set `AGENTPAY_BASE_URL` to point at your API (default: `http://localhost:8000`).

## MCP tools available

- `authorize_purchase(agent_id, merchant, amount, category, description)` — core authorization
- `get_mandate(agent_id)` — fetch active mandate
- `get_spending_summary(agent_id)` — totals and counts

## Core authorization flow

1. `POST /orgs` → create org
2. `POST /agents` → create agent, get `api_key`
3. `POST /mandates` → set spend limits
4. `POST /requests` + `POST /requests/{id}/evaluate` → authorize a spend

Or use the single-call shortcut: `POST /authorize-x402`

## Key files

- `apps/api/main.py` — FastAPI app entry point
- `apps/api/routers/` — all route handlers
- `apps/api/models.py` — SQLAlchemy models
- `apps/api/mcp_server.py` — MCP server
- `sdk/agent_payment/client.py` — Python SDK client