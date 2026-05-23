import os
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


def _connect_args(url: str) -> dict:
    if "sqlite" in url:
        return {"check_same_thread": False}
    return {"ssl": True}


engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    connect_args=_connect_args(settings.database_url),
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


def to_db_id(value) -> str:
    """Normalise a UUID/str id to a plain string for SQLite compatibility."""
    return str(value)
