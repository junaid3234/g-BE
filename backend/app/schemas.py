from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserCreate(BaseModel):
    clerk_id: str
    email: EmailStr
    full_name: str | None = None
    role: str = "patient"


class UserResponse(BaseModel):
    id: UUID
    clerk_id: str
    email: str
    full_name: str | None
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: datetime | None = None


class ChatStartResponse(BaseModel):
    session_id: UUID
    message: ChatMessage
    question_key: str
    options: list[str] | None = None
    input_type: str = "choice"
    progress: float
    section: str


class ChatAnswerRequest(BaseModel):
    session_id: UUID
    question_key: str
    answer: str


class ChatAnswerResponse(BaseModel):
    session_id: UUID
    message: ChatMessage | None = None
    question_key: str | None = None
    options: list[str] | None = None
    input_type: str = "choice"
    progress: float
    section: str | None = None
    completed: bool = False


class PredictRequest(BaseModel):
    session_id: UUID | None = None
    features: dict[str, Any] = Field(default_factory=dict)


class PredictResponse(BaseModel):
    session_id: UUID | None
    prediction_id: UUID | None
    has_gingivitis: bool
    severity: str
    severity_score: float
    confidence: float
    risk_level: str
    feature_importance: list[dict[str, Any]]
    recommendations: list[str]
    explanation: str
    model_version: str


class ReportResponse(BaseModel):
    id: UUID
    session_id: UUID
    title: str
    summary: str | None
    recommendations: list[str] | None
    created_at: datetime

    model_config = {"from_attributes": True}


class AnalyticsOverview(BaseModel):
    total_users: int
    total_screenings: int
    completed_screenings: int
    gingivitis_positive_rate: float
    severity_distribution: dict[str, int]
    recent_submissions: list[dict[str, Any]]


class SessionSummary(BaseModel):
    id: UUID
    status: str
    started_at: datetime
    completed_at: datetime | None
    has_prediction: bool

    model_config = {"from_attributes": True}
