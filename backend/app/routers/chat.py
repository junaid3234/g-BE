from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.database import get_db
from app.models import Response as ResponseModel
from app.models import Session
from app.schemas import ChatAnswerRequest, ChatAnswerResponse, ChatMessage, ChatStartResponse
from app.services.questions import (
    QUESTION_BY_KEY,
    TOTAL_QUESTIONS,
    get_question,
    intro_for_section,
    progress_for_index,
)

router = APIRouter(prefix="/chat", tags=["chat"])


def _bot_message(content: str) -> ChatMessage:
    return ChatMessage(role="assistant", content=content, timestamp=datetime.now(timezone.utc))


@router.post("/start", response_model=ChatStartResponse)
async def start_chat(
    db: AsyncSession = Depends(get_db),
    user_id: str | None = Depends(get_current_user_id),
):
    session = Session(
        status="in_progress",
        current_section="A",
        current_question_index=0,
        conversation_json=[],
    )
    db.add(session)
    await db.flush()

    q = get_question(0)
    intro = intro_for_section("A") or ""
    content = f"Hello! I'm Gingi, your AI dental screening assistant. {intro}\n\n{q.text}"
    session.conversation_json = [
        {"role": "assistant", "content": content, "question_key": q.key}
    ]

    return ChatStartResponse(
        session_id=session.id,
        message=_bot_message(content),
        question_key=q.key,
        options=q.options,
        input_type=q.input_type,
        progress=progress_for_index(0),
        section=q.section,
    )


@router.post("/answer", response_model=ChatAnswerResponse)
async def answer_question(
    body: ChatAnswerRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str | None = Depends(get_current_user_id),
):
    result = await db.execute(select(Session).where(Session.id == body.session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != "in_progress":
        raise HTTPException(status_code=400, detail="Session already completed")

    q = QUESTION_BY_KEY.get(body.question_key)
    if not q:
        raise HTTPException(status_code=400, detail="Unknown question")

    if q.input_type == "choice" and q.options and body.answer not in q.options:
        raise HTTPException(status_code=422, detail="Invalid option selected")
    if q.input_type == "number":
        try:
            age = int(body.answer)
            if age < 1 or age > 120:
                raise ValueError()
        except ValueError:
            raise HTTPException(status_code=422, detail="Age must be between 1 and 120")

    resp = ResponseModel(
        session_id=session.id,
        section=q.section,
        question_key=q.key,
        question_text=q.text,
        answer_value=body.answer,
        answer_type=q.input_type,
    )
    db.add(resp)

    conv = list(session.conversation_json or [])
    conv.append({"role": "user", "content": body.answer, "question_key": q.key})
    session.conversation_json = conv

    next_index = session.current_question_index + 1
    session.current_question_index = next_index

    if next_index >= TOTAL_QUESTIONS:
        session.status = "completed"
        session.completed_at = datetime.now(timezone.utc)
        done_msg = (
            "Thank you for completing the screening! I'm analyzing your responses now. "
            "Please proceed to view your personalized risk assessment and recommendations."
        )
        conv.append({"role": "assistant", "content": done_msg})
        session.conversation_json = conv
        await db.flush()
        return ChatAnswerResponse(
            session_id=session.id,
            message=_bot_message(done_msg),
            progress=100.0,
            completed=True,
        )

    next_q = get_question(next_index)
    prev_section = q.section
    transition = ""
    if next_q.section != prev_section:
        intro = intro_for_section(next_q.section)
        if intro:
            transition = f"{intro}\n\n"

    content = f"{transition}{next_q.text}"
    conv.append({"role": "assistant", "content": content, "question_key": next_q.key})
    session.conversation_json = conv
    session.current_section = next_q.section

    await db.flush()
    return ChatAnswerResponse(
        session_id=session.id,
        message=_bot_message(content),
        question_key=next_q.key,
        options=next_q.options,
        input_type=next_q.input_type,
        progress=progress_for_index(next_index),
        section=next_q.section,
        completed=False,
    )


@router.get("/session/{session_id}")
async def get_session_conversation(session_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return {
        "session_id": str(session.id),
        "status": session.status,
        "conversation": session.conversation_json,
        "progress": progress_for_index(session.current_question_index),
    }
