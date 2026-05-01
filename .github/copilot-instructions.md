# Copilot instructions

## Product
This repository is an MVP for autonomous agent purchasing infrastructure.

The product allows:
- organizations to create agents,
- operators to define spending mandates for agents,
- agents to submit purchase requests,
- the system to evaluate requests against policy,
- the app to log decisions and audit events.

This is not a full bank, exchange, or wallet product.
Do not introduce credits, FX, real payment rails, or compliance-heavy features unless explicitly requested.

## Tech stack
- Backend: FastAPI, Pydantic, PostgreSQL
- Frontend: React, TypeScript, Vite, Tailwind, shadcn/ui
- Keep dependencies minimal.

## MVP priorities
Prioritize:
1. simple end-to-end flows,
2. clarity,
3. maintainability,
4. explicit validation,
5. clean data models,
6. fast iteration.

Prefer boring and explicit code over clever abstractions.

## Core domain entities
- Organization
- User
- Agent
- Mandate
- PurchaseRequest
- Decision
- AuditEvent

## Architecture rules
- Keep one responsibility per file.
- Reuse existing patterns before creating new ones.
- Do not invent new abstractions unless repetition clearly justifies them.
- Keep functions short and easy to read.
- Prefer service-layer logic over fat route handlers.
- Prefer explicit schemas and typed interfaces before implementation.
- Do not modify unrelated files.
- If a task is ambiguous, propose a short plan before coding.

## Backend rules
- Use Pydantic models for request/response validation.
- Keep route handlers thin.
- Put business logic in services.
- Validate all external input.
- Return consistent JSON responses.
- Write simple, explicit error handling.

## Frontend rules
- Use TypeScript strictly.
- Build small reusable components.
- Prefer simple local state for MVP.
- Do not add global state libraries unless explicitly necessary.
- Prioritize clarity and professional polish.
- Avoid flashy UI and generic AI-dashboard design.

## Code quality
- Avoid duplicate helpers and duplicate business logic.
- Preserve existing behavior during refactors.
- Add tests for important logic when relevant.
- Keep comments minimal and useful.
- Use clear names over short names.
- Do not leave dead code, commented-out code, or placeholder TODO logic.

## Non-goals
Do not build:
- credits as currency,
- cross-company exchange,
- real money movement,
- full merchant integrations,
- consumer shopping flows,
unless explicitly requested.