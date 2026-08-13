# AI Tutor

## Backend (Postgres + FastAPI)

From `backend/`, build and start everything (applies all Alembic migrations on startup):

```bash
docker compose up --build
```

- API: http://localhost:8000
- Postgres: localhost:5432
- To run in the background: `docker compose up -d --build`
- To stop: `docker compose down` (add `-v` to also delete the Postgres volume)

Settings come from `backend/.env`; the compose file overrides `DB_HOST`/`DATABASE_URL`
so the backend reaches the `db` service.
