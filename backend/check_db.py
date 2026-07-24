import asyncio

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine


async def run():
    engine = create_async_engine(
        "postgresql+asyncpg://gmail_assistant:gmail_assistant_dev@localhost:5432/gmail_assistant"
    )
    async with engine.begin() as conn:
        res = await conn.execute(
            text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
        )
        print(res.fetchall())


asyncio.run(run())
