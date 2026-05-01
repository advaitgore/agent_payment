# MVP product spec

## Product
Autonomous agent purchasing infrastructure.

## Core flow
1. Create organization
2. Create agent
3. Create mandate
4. Submit purchase request
5. Evaluate request
6. Return decision
7. Store audit event

## Core entities
- Organization
- Agent
- Mandate
- PurchaseRequest
- Decision
- AuditEvent

## MVP rules
- deny if merchant is not in allowlist
- deny if amount exceeds max_per_transaction
- return needs_review if amount exceeds approval_threshold
- approve otherwise

## Non-goals
- real payments
- wallets
- credits as currency
- cross-company FX
- full auth system