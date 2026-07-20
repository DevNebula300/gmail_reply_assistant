import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["version"] == "0.1.0"


@pytest.mark.asyncio
async def test_generate_replies_returns_three_suggestions(client):
    response = await client.post(
        "/replies/generate",
        json={
            "thread_id": "thread_test",
            "tone": "professional",
            "length": "medium",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["suggestions"]) == 3
    assert "request_id" in data


@pytest.mark.asyncio
async def test_get_thread_context(client):
    response = await client.get("/threads/thread_test_123")
    assert response.status_code == 200
    data = response.json()
    assert data["thread_id"] == "thread_test_123"
    assert "messages" in data
