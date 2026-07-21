from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, drafts, health, preferences, replies, threads
from app.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    # TODO(phase-1): Initialize DB pool and Redis when ready
    yield
    # TODO(phase-1): Close connections on shutdown
    _ = settings


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="AI-Powered Gmail Reply Assistant backend API",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(auth.router)
    app.include_router(threads.router)
    app.include_router(replies.router)
    app.include_router(drafts.router)
    app.include_router(preferences.router)

    return app


app = create_app()
