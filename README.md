# AgentPay

[![smithery badge](https://smithery.ai/badge/advaitgore/payguard)](https://smithery.ai/servers/advaitgore/payguard)

> **Give your AI agent a wallet with rules it can't break.**

AgentPay is the authorization layer between an AI agent and real spending. Install it into any MCP-compatible agent, define your rules once — spending caps, approved merchants, time windows — and every purchase the agent attempts is checked against them in real time. Approved transactions go through. Anything outside the mandate is blocked, logged, and surfaced to you.

Your agent runs autonomously. You stay in control.

---

## How It Works

```
You install AgentPay into your agent
            ↓
   You set a spending mandate once
            ↓
     Agent runs autonomously
            ↓
   Before every purchase attempt:
   agent calls authorize_purchase
          ↓               ↓
   ✅ Approved      ❌ Denied
   Agent proceeds   Agent stops,
                    reports to you
```

AgentPay sits between your agent's intent and the actual transaction — it doesn't move money itself, it decides whether the agent is *allowed* to.

---

## Install Into Your Agent

First, grab your API key from [agent-payment-eight.vercel.app](https://agent-payment-eight.vercel.app).

Then pick your agent:

### Hermes or OpenClaw (natural language)

Just paste this into your agent's chat — no CLI needed:

```
Install the AgentPay MCP server. My API key is <your-api-key>.
The server URL is https://agentpayment-production.up.railway.app/mcp.
```

Your agent will handle the rest automatically.

### Claude / Cursor / Windsurf (Smithery)

```bash
npx @smithery/cli install advaitgore/payguard --client claude
```

When prompted, paste your API key.

### Any MCP-compatible agent (manual config)

```json
{
  "mcpServers": {
    "agentpay": {
      "url": "https://agentpayment-production.up.railway.app/mcp",
      "headers": {
        "Authorization": "Bearer <your-api-key>"
      }
    }
  }
}
```

---

Once installed, tell your agent to set up a mandate:

```
"Set my spending limit to $50 per transaction. Approved merchants: Amazon, Vercel, GitHub."
```

That's it. Your agent now has spending rules it evaluates autonomously before every purchase.

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

## How the Agent Uses It

Once installed, your agent calls `authorize_purchase` before any spend:

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

> **What the agent should do:** `approved` → proceed. `denied` → stop and surface the `reason` to the user. Never retry without updated mandate permissions.

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
