# AgentPay

[![smithery badge](https://smithery.ai/badge/advaitgore/payguard)](https://smithery.ai/servers/advaitgore/payguard)

> **Set a budget. Let your agent run. Know it can't overspend.**

AgentPay is the authorization layer between an AI agent and real spending. You define the rules — spending caps, allowed merchants, time windows — and every purchase attempt the agent makes is checked against them in real time. Approved transactions go through. Anything outside the mandate is blocked and logged.

No more babysitting every agent action. No more runaway charges.

---

## How It Works

```
Human sets mandate once
        ↓
  Agent runs autonomously
        ↓
  Before every purchase:
  agent calls authorize_purchase
        ↓               ↓
   ✅ Approved      ❌ Denied
   Agent proceeds   Agent stops,
                    reports to user
```

AgentPay sits between your agent's intent and the actual transaction — it doesn't move money itself, it decides whether the agent is *allowed* to.

---

## Real-World Examples

**Personal assistant agent**
> *"You have $50 tonight. Uber and DoorDash only. Go."*

```json
{
  "daily_limit": 50,
  "allowed_merchants": ["uber.com", "doordash.com", "ubereats.com"]
}
```

**Autonomous research agent**
> *"$20 per run. API providers only."*

```json
{
  "max_per_transaction": 20,
  "allowed_merchants": ["openai.com", "serpapi.com", "anthropic.com"]
}
```

**Company expense agent**
> *"$500/week. Approved SaaS vendors only."*

```json
{
  "weekly_limit": 500,
  "allowed_merchants": ["notion.so", "vercel.com", "github.com", "figma.com"]
}
```

---

## Quickstart

Install via Smithery (works with Claude, Cursor, Windsurf, and any MCP-compatible client):

```bash
npx @smithery/cli install advaitgore/payguard --client claude
```

You'll be prompted for your `agentpayApiKey`. Get one in three steps through the MCP server itself:

```
1. create_account   → creates your user + org
2. create_agent     → provisions an agent, returns api_key
3. create_mandate   → sets spending rules for that agent
```

Or use the [REST API](https://agentpayment-production.up.railway.app/docs) directly.

---

## Example: Agent Authorizing a Purchase

**The agent calls `authorize_purchase` before spending:**

```json
{
  "merchant": "openai.com",
  "amount": 10.00,
  "currency": "USD",
  "description": "API credits for task execution"
}
```

**Approved — within mandate:**
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

**Denied — merchant not on allowlist:**
```json
{
  "status": "denied",
  "reason": "merchant_not_allowed",
  "message": "openai.com is not on the approved merchant list for this agent"
}
```

> **What the agent should do:** `approved` → proceed with payment. `denied` → stop and surface the `reason` to the user. Never retry without updated mandate permissions.

---

## Available Tools

| Tool | What it does |
|---|---|
| `authorize_purchase` | Check a purchase against the agent's mandate — the core call |
| `get_mandate` | View current spending rules for this agent |
| `update_mandate` | Change limits or allowed merchants |
| `get_spending_summary` | Total spend by category and merchant |
| `get_audit_log` | Full history of every authorize/deny decision |
| `rotate_agent_key` | Rotate the agent's API key |
| `create_account` | Create a new user account + org |
| `create_agent` | Provision a new agent under an org |
| `create_mandate` | Set spending rules for a newly created agent |

---

## REST API

Interactive docs: [https://agentpayment-production.up.railway.app/docs](https://agentpayment-production.up.railway.app/docs)

---

## Self-Hosting

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
