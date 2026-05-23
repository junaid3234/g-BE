import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config import settings
from app.database import Base

_is_postgres = "postgresql" in settings.database_url or "asyncpg" in settings.database_url

if _is_postgres:
    from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
    _UUID = PG_UUID(as_uuid=True)
    _JSONB = JSONB
    def _uuid_default():
        return uuid.uuid4()
else:
    _UUID = String(36)
    _JSONB = JSON
    def _uuid_default():
        return str(uuid.uuid4())


def _now() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(_UUID, primary_key=True, default=_uuid_default)
    clerk_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50), default="patient")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now)

    sessions: Mapped[list["Session"]] = relationship(back_populates="user")


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(_UUID, primary_key=True, default=_uuid_default)
    user_id: Mapped[str | None] = mapped_column(_UUID, ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="in_progress")
    current_section: Mapped[str | None] = mapped_column(String(10))
    current_question_index: Mapped[int] = mapped_column(Integer, default=0)
    conversation_json: Mapped[list] = mapped_column(_JSONB, default=list)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User | None"] = relationship(back_populates="sessions")
    responses: Mapped[list["Response"]] = relationship(back_populates="session", cascade="all, delete-orphan")
    predictions: Mapped[list["Prediction"]] = relationship(back_populates="session", cascade="all, delete-orphan")


class Response(Base):
    __tablename__ = "responses"

    id: Mapped[str] = mapped_column(_UUID, primary_key=True, default=_uuid_default)
    session_id: Mapped[str] = mapped_column(_UUID, ForeignKey("sessions.id"), nullable=False)
    user_id: Mapped[str | None] = mapped_column(_UUID, ForeignKey("users.id"), nullable=True)
    section: Mapped[str] = mapped_column(String(10), nullable=False)
    question_key: Mapped[str] = mapped_column(String(100), nullable=False)
    question_text: Mapped[str | None] = mapped_column(Text)
    answer_value: Mapped[str] = mapped_column(Text, nullable=False)
    answer_type: Mapped[str] = mapped_column(String(50), default="choice")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    session: Mapped["Session"] = relationship(back_populates="responses")


class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[str] = mapped_column(_UUID, primary_key=True, default=_uuid_default)
    session_id: Mapped[str] = mapped_column(_UUID, ForeignKey("sessions.id"), nullable=False)
    user_id: Mapped[str | None] = mapped_column(_UUID, ForeignKey("users.id"), nullable=True)
    has_gingivitis: Mapped[bool] = mapped_column(Boolean, nullable=False)
    severity: Mapped[str] = mapped_column(String(50), nullable=False)
    severity_score: Mapped[float | None] = mapped_column(Numeric(5, 2))
    confidence: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    risk_level: Mapped[str | None] = mapped_column(String(50))
    feature_importance: Mapped[list | None] = mapped_column(_JSONB)
    model_version: Mapped[str] = mapped_column(String(50), default="rf_v1")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    session: Mapped["Session"] = relationship(back_populates="predictions")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(_UUID, primary_key=True, default=_uuid_default)
    session_id: Mapped[str] = mapped_column(_UUID, ForeignKey("sessions.id"), nullable=False)
    prediction_id: Mapped[str | None] = mapped_column(_UUID, ForeignKey("predictions.id"), nullable=True)
    user_id: Mapped[str | None] = mapped_column(_UUID, ForeignKey("users.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255), default="Gingivitis Screening Report")
    summary: Mapped[str | None] = mapped_column(Text)
    recommendations: Mapped[dict | None] = mapped_column(_JSONB)
    pdf_path: Mapped[str | None] = mapped_column(String(500))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)
