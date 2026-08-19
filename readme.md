# AI Tutor (Nuro)

AI-powered study app with interactive tutoring, adaptive quizzes, and a vintage notebook aesthetic.

## Quick Start

**Backend** (PostgreSQL + FastAPI):

```bash
cd backend
cp .env.example .env    # edit as needed
docker compose up --build
```

- API: http://localhost:8000
- Postgres: localhost:5432

**Frontend** (React + Vite):

```bash
cd FEv2
cp .env.example .env
npm install
npm run dev
```

- App: http://localhost:5173

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Backend | Python 3.13, FastAPI, SQLAlchemy 2.x (async), Alembic |
| Database | PostgreSQL 17 |
| AI | LangChain, Ollama (llama3.2), Google Gemini |
| Frontend | React 19, Vite 8, Tailwind CSS 4, Framer Motion |
| Auth | JWT (PyJWT + bcrypt) |
| Infra | Docker Compose |

## Features

- AI topic generation with structured outlines
- Interactive streaming chat tutor (learn mode)
- Adaptive quizzes with increasing difficulty
- Markdown-based notes with PDF export
- Margin notes (annotations) per topic
- Review page with flashcards
- Public notebook feed (explore)
- Multi-provider AI (Ollama local or Gemini cloud)
- Light, dark, and nord themes
- Graceful fallback to mock data when backend is unavailable

## Project Structure

```
AI_tutor/
├── backend/          # FastAPI app, migrations, services
│   ├── app/          # Routes, models, schemas, services
│   ├── alembic/      # Database migrations
│   └── docker-compose.yml
└── FEv2/             # React frontend
    └── src/
        ├── components/   # UI primitives, layout, marginalia
        ├── features/     # Page-level components
        ├── design/       # Tokens, motion, textures
        └── lib/          # API client, auth, utils
```

## License

MIT
