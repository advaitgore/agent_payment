# AgentPay — Payment Mandate Infrastructure for AI Agents

AgentPay gives AI agents a safe, auditable way to make payments. Instead of handing an agent a credit card with no limits, you define a **mandate** — spending caps, allowed merchants, and approval thresholds — and the agent must call `authorize_purchase` before every transaction. Every decision is logged.

## How it works

1. **Create an account + org** → `create_account`
2. **Provision an agent** → `create_agent` (returns an `api_key`)
3. **Set spending rules** → `create_mandate` (max per transaction, allowed merchants)
4. **Agent authorizes purchases** → `authorize_purchase` (approved or denied based on mandate)
5. **Monitor spending** → `get_spending_summary`, `get_audit_log`

## Quickstart via MCP (Smithery)

Add this server to your MCP client via [Smithery](https://smithery.ai/servers/advaitgore/payguard):

```
npx @smithery/cli install advaitgore/payguard --client claude
```

You'll be prompted for your `agentpayApiKey`. Get one by calling `create_account` → `create_agent` through the MCP server itself, or via the [REST API](https://agentpayment-production.up.railway.app/docs).

## Available Tools

| Tool | What it does |
|---|---|
| `authorize_purchase` | Check and authorize a payment against the agent's mandate |
| `get_mandate` | View current spending rules for this agent |
| `update_mandate` | Change spending limits or allowed merchants |
| `get_spending_summary` | View total spend by category and merchant |
| `get_audit_log` | Full history of every authorize/deny decision |
| `rotate_agent_key` | Rotate the agent's API key |
| `create_account` | Create a new user account + organization |
| `create_agent` | Provision a new agent under an org |
| `create_mandate` | Set spending rules for a newly created agent |

## REST API

Interactive docs: [https://agentpayment-production.up.railway.app/docs](https://agentpayment-production.up.railway.app/docs)

## Self-hosting

```bash
git clone https://github.com/advaitgore/agent_payment
cd agent_payment
pip install -r apps/api/requirements.txt
uvicorn apps.api.main:app --host 0.0.0.0 --port 8080
```

Required env vars:
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
```
