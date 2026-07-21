# AI-Powered Gmail Reply Assistant

A Chrome extension and FastAPI backend that helps users compose contextual Gmail replies. **Phase 0** (this repo) provides the project scaffold, API contract, mock endpoints, and a working side-panel UI so two interns can develop in parallel from Phase 1 onward.

> **Core safety rule:** The system creates or inserts drafts only — it never sends messages automatically.

## Repository layout

```
├── extension/          # Developer 1 — Chrome extension (WXT + React + TypeScript)
├── backend/            # Developer 2 — FastAPI, Gmail API, AI services
├── contracts/          # Joint — OpenAPI schema, fixtures, error codes
├── tests/e2e/          # Joint — end-to-end tests (Phase 6+)
├── docs/               # Setup guides and work plan
└── docker-compose.yml  # Local Postgres, Redis, backend
```

## Quick start

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker (optional, for Postgres/Redis)

### Backend

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Extension

```bash
cd extension
npm install
cp .env.example .env.local
npm run dev
```

Load the unpacked extension from `extension/.output/chrome-mv3` in `chrome://extensions`, then open Gmail.

### Docker (full stack)

```bash
cp backend/.env.example backend/.env
docker compose up --build
```

## Phase 0 deliverables (done)

- [x] Monorepo structure with clear ownership boundaries
- [x] OpenAPI contract with stub endpoints and fixtures
- [x] FastAPI app with health, auth, thread, reply, draft, and preference routes (mock data)
- [x] WXT Chrome extension with side panel, Gmail content script, and mock API client
- [x] CI workflow (backend tests, extension typecheck/tests, OpenAPI lint)
- [x] Docker Compose for local services

## What interns build next

| Phase | Developer 1 (Extension) | Developer 2 (Backend) |
|-------|-------------------------|------------------------|
| 1 | Manifest polish, settings page | DB connection, migrations |
| 2 | Connect Gmail UI flow | Real Google OAuth + token storage |
| 3 | Thread detection + context preview | Gmail API + context cleaning |
| 4 | Tone/length controls, suggestions UI | AI orchestration (3 replies) |
| 5 | Insert into compose / save draft | Gmail drafts + style profiles |
| 6 | Safety warnings, extension tests | Rate limits, safety engine, tests |
| 7 | Demo + extension docs | Deployment + metrics dashboard |

See [docs/WORK_PLAN.md](docs/WORK_PLAN.md) and [docs/SETUP.md](docs/SETUP.md) for details.

## Git workflow

- Protected `main` branch
- Feature branches: `ext/feature-name`, `api/feature-name`, `integration/feature-name`
- Contract changes in `/contracts` require review from **both** developers
- Never commit `.env`, tokens, credentials, or email bodies

## API contract

The source of truth is [`contracts/openapi.yaml`](contracts/openapi.yaml). Regenerate extension types after contract changes:

```bash
cd extension && npm run generate:types
```

## Testing

```bash
# Backend
cd backend && pytest

# Extension
cd extension && npm test -- --run
```

## License

Internal internship project — adjust as needed.
