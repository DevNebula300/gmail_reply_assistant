# End-to-end tests

Phase 6: add Playwright tests here for the full extension workflow on Gmail.

Suggested first test:

1. Load extension
2. Open Gmail thread fixture
3. Open side panel
4. Generate replies (mock or staging API)
5. Select suggestion and verify compose insertion

```bash
# Future
cd tests/e2e && npm test
```
