Add `api_key` column to existing `agents` table (manual step)

For existing databases you must add the column and backfill API keys for existing agents.

1) Run this SQL against your Postgres database:

```sql
ALTER TABLE agents ADD COLUMN api_key TEXT UNIQUE;
```

2) Backfill API keys for existing agents with this small Python snippet (run from repo root with the virtualenv active):

```py
from sqlalchemy.orm import Session
from apps.api.db.session import SessionLocal
from apps.api.db.models import Agent
import secrets

db: Session = SessionLocal()
agents = db.query(Agent).filter(Agent.api_key == None).all()
for a in agents:
    a.api_key = secrets.token_hex(32)
db.commit()
print('Backfilled', len(agents))
```

Recommended: create an Alembic migration for production environments.
