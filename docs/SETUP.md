# Setup Guide

## Developer 1 — Extension

### 1. Install and run

```bash
cd extension
npm install
npm run dev
```

### 2. Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select `extension/.output/chrome-mv3`

### 3. Test on Gmail

1. Open https://mail.google.com
2. Open any thread
3. Click the extension icon or the injected **AI Reply** button
4. Use the side panel to preview context and generate mock replies

### 4. Switch to live API

Create `extension/.env.local`:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_API=false
```

Restart `npm run dev` after env changes.

### Owned paths

- `extension/` (all)
- Extension manifest and WXT config
- Do **not** edit `backend/` except in agreed integration PRs

---

## Developer 2 — Backend

### 1. Install and run

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 2. Optional: Postgres + Redis

```bash
docker compose up postgres redis -d
```

Then ensure `DATABASE_URL` and `REDIS_URL` in `.env` match `docker-compose.yml`.

### 3. Google Cloud setup (Phase 2)

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Gmail API**
3. Create OAuth 2.0 credentials (Web application)
4. Add redirect URI: `http://localhost:8000/auth/google/callback`
5. Copy client ID/secret to `backend/.env`

Recommended scopes (least privilege):

- `https://www.googleapis.com/auth/gmail.readonly`
- `https://www.googleapis.com/auth/gmail.compose`

### 4. AI provider (Phase 4)

Add `OPENAI_API_KEY` to `.env` when implementing generation.

### Owned paths

- `backend/` (all)
- Database migrations
- OAuth secrets and deployment config
- Do **not** edit `extension/` except in agreed integration PRs

---

## Shared — Contracts and integration

### Changing the API

1. Edit `contracts/openapi.yaml`
2. Update fixtures in `contracts/fixtures/` if needed
3. Get review from both developers
4. Implement backend route + extension client
5. Run `cd extension && npm run generate:types`

### Integration cadence

- Pull `main` before starting integration branches
- Integrate at least twice per week
- Use `integration/*` branches for cross-module fixes

### Secrets policy

Never commit:

- `.env` files with real values
- Google client secrets
- OAuth refresh/access tokens
- OpenAI or other AI API keys
- Real email bodies or attachments

Use synthetic fixtures only.
