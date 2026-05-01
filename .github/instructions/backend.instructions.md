---
applyTo: "apps/api/**/*.py"
---

## Backend instructions
- Use FastAPI routers for endpoints.
- Use Pydantic schemas for request and response models.
- Put core logic in services, not routes.
- Keep database access organized and explicit.
- Validate all user input.
- Add tests for policy evaluation logic.
- Avoid magic strings; use enums/constants where helpful.
- Prefer simple, explicit code over abstraction-heavy designs.