# API Contracts

This directory is **joint ownership**. Both developers must review changes here before implementing them in the extension or backend.

## Contents

| File | Purpose |
|------|---------|
| `openapi.yaml` | Source-of-truth REST API contract |
| `fixtures/` | Sample request/response payloads for mocks and tests |

## Workflow

1. Propose a contract change in a PR that updates `openapi.yaml` and fixtures.
2. Both developers review and approve.
3. Backend implements the endpoint; extension updates its API client/types.
4. Regenerate TypeScript types (from repo root):

```bash
cd extension && npm run generate:types
```

## Phase mapping

| Phase | Endpoints |
|-------|-----------|
| 0 (this repo) | `/health`, stubs for auth/threads/replies |
| 1 | Project setup complete on both sides |
| 2 | `/auth/*` — real OAuth |
| 3 | `/threads/{threadId}` — Gmail API + context cleaning |
| 4 | `/replies/generate`, `/replies/rewrite` — AI integration |
| 5 | `/drafts`, `/preferences/style` |
| 6 | Safety validation, rate limits, telemetry |

## Error codes

Use consistent `error` values in responses:

- `unauthorized` — missing/invalid session
- `not_found` — thread or draft not found
- `validation_error` — bad request body
- `rate_limited` — too many generation requests
- `gmail_error` — Gmail API failure
- `ai_error` — model provider failure
