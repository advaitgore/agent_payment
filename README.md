# AgentPay — Payment Mandate Infrastructure for AI Agents

[![smithery badge](https://smithery.ai/badge/advaitgore/payguard)](https://smithery.ai/servers/advaitgore/payguard)

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

## Example: Agent Authorizing a Purchase

An agent calls `authorize_purchase` before spending. Here’s what the exchange looks like:

**Request:**
```json
{
  "merchant": "openai.com",
  "amount": 10.00,
  "currency": "USD",
  "description": "API credits for task execution"
}
```

**Approved response:**
```json
{
  "status": "approved",
  "transaction_id": "txn_01j9k2m...",
  "amount": 10.00,
  "merchant": "openai.com",
  "remaining_budget": 40.00,
  "message": "Purchase approved within mandate limits"
}
```

**Denied response** (e.g. merchant not on allowlist):
```json
{
  "status": "denied",
  "reason": "merchant_not_allowed",
  "message": "openai.com is not on the approved merchant list for this agent"
}
```

> **What the agent should do:** If `status` is `approved`, proceed with the payment. If `denied`, stop and surface the `reason` to the user or orchestrator — never retry without updated mandate permissions.

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
