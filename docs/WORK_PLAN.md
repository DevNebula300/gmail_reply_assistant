# Two-Person Work Plan

This document maps the project proposal phases to concrete tasks in this repository.

## Ownership

| Area | Owner | Directories |
|------|-------|-------------|
| Extension & UX | Developer 1 | `extension/` |
| Backend, Gmail, AI | Developer 2 | `backend/` |
| API contract | Both | `contracts/` |
| E2E & release | Both | `tests/e2e/`, CI, Docker |

## Phase checklist

### Phase 0 — Base repo (complete)

- [x] Repository structure
- [x] OpenAPI contract + fixtures
- [x] Backend stubs returning mock data
- [x] Extension side panel + Gmail content script
- [x] CI skeleton

### Phase 1 — Project setup

**Developer 1**

- [ ] Extension settings/options page
- [ ] Error and loading state components
- [ ] Vitest component tests for side panel

**Developer 2**

- [ ] SQLAlchemy async engine in `app/db/`
- [ ] Initial Alembic migration
- [ ] Health check includes DB connectivity

### Phase 2 — Gmail connection

**Developer 1**

- [ ] Connect / connected / disconnect screens
- [ ] OAuth redirect handling in extension (open auth URL, receive token)

**Developer 2**

- [ ] `app/services/oauth.py` — authorization URL, callback, token refresh
- [ ] Encrypted refresh token storage
- [ ] `/auth/me` and `/auth/logout` with real sessions

### Phase 3 — Email context

**Developer 1**

- [ ] Reliable active thread ID detection from Gmail URL/DOM
- [ ] Context preview wired to live `/threads/{id}`

**Developer 2**

- [ ] `app/services/gmail.py` — fetch thread via Gmail API
- [ ] `app/services/context.py` — strip quotes, signatures, HTML noise
- [ ] Return `fingerprint` for wrong-thread protection

### Phase 4 — AI replies

**Developer 1**

- [ ] Full generate UI (tone, length, instruction)
- [ ] Display three suggestions with regenerate

**Developer 2**

- [ ] `app/services/ai.py` — prompt templates, structured output
- [ ] `/replies/generate` and `/replies/rewrite` with real model calls
- [ ] Timeouts, retries, usage logging (no email body in logs)

### Phase 5 — Draft handling

**Developer 1**

- [ ] Insert selected text into Gmail compose editor
- [ ] Rewrite actions on selected draft text

**Developer 2**

- [ ] `/drafts` — create/update Gmail drafts
- [ ] `/preferences/style` — persist style profiles

### Phase 6 — Safety and testing

**Developer 1**

- [ ] Render safety warnings prominently
- [ ] Playwright extension E2E tests

**Developer 2**

- [ ] `app/services/safety.py` — commitment detection
- [ ] Rate limiting on generate endpoint
- [ ] Backend integration tests with fixtures

### Phase 7 — Final delivery

**Developer 1**

- [ ] Extension install/demo guide
- [ ] UI polish

**Developer 2**

- [ ] Deploy backend (Render/Railway/Fly.io)
- [ ] Metrics dashboard for evaluation

## Definition of done (per phase)

A phase is complete when:

1. Both developers finish assigned tasks
2. Related tests pass in CI
3. Extension and backend work together via the agreed contract
4. Unfinished items move to the stretch backlog

## Stretch backlog (post-core)

- Language auto-detection
- Reply templates
- Intent classification
- Thread summarization
- Multiple AI provider adapters
