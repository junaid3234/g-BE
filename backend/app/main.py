import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine
from app.routers import analytics, auth_router, chat, predict, reports, users
from app.services.ml_service import load_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address, default_limits=[f"{settings.rate_limit_per_minute}/minute"])


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables ensured")
    except Exception as e:
        logger.warning("Database init skipped: %s", e)
    load_model()
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    description="AI-Assisted Gingivitis Screening & Severity Prediction API",
    version="1.0.0",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

origins = [o.strip() for o in settings.cors_origins.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(chat.router)
app.include_router(predict.router)
app.include_router(users.router)
app.include_router(reports.router)
app.include_router(analytics.router)


@app.get("/health")
@limiter.limit("30/minute")
async def health(request: Request):
    db_ok = False
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            db_ok = True
    except Exception:
        pass
    return {
        "status": "healthy",
        "service": "GingiAI API",
        "database": "connected" if db_ok else "unavailable",
    }
