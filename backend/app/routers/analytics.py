import csv
import io
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, to_db_id
from app.models import Prediction, Response, Session, User
from app.schemas import AnalyticsOverview

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview", response_model=AnalyticsOverview)
async def analytics_overview(
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    total_screenings = (await db.execute(select(func.count(Session.id)))).scalar() or 0
    completed = (
        await db.execute(select(func.count(Session.id)).where(Session.status == "completed"))
    ).scalar() or 0

    preds = (await db.execute(select(Prediction))).scalars().all()
    positive = sum(1 for p in preds if p.has_gingivitis)
    rate = positive / len(preds) if preds else 0.0

    severity_dist: dict[str, int] = {}
    for p in preds:
        severity_dist[p.severity] = severity_dist.get(p.severity, 0) + 1

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent_sessions = (
        await db.execute(
            select(Session).where(Session.started_at >= week_ago).order_by(Session.started_at.desc()).limit(10)
        )
    ).scalars().all()

    recent = []
    for s in recent_sessions:
        pred_r = await db.execute(
            select(Prediction).where(Prediction.session_id == to_db_id(s.id)).order_by(Prediction.created_at.desc())
        )
        pred = pred_r.scalars().first()
        recent.append({
            "session_id": str(s.id),
            "status": s.status,
            "started_at": s.started_at.isoformat(),
            "severity": pred.severity if pred else None,
            "has_gingivitis": pred.has_gingivitis if pred else None,
        })

    return AnalyticsOverview(
        total_users=total_users,
        total_screenings=total_screenings,
        completed_screenings=completed,
        gingivitis_positive_rate=round(rate, 3),
        severity_distribution=severity_dist,
        recent_submissions=recent,
    )


@router.get("/export")
async def export_csv(
    db: AsyncSession = Depends(get_db),
    search: str | None = Query(None, description="Filter by severity (e.g. 'mild', 'moderate')"),
):
    """Export all screening data as CSV — no auth required for admin use."""
    # Fetch all sessions with their predictions and responses
    sessions = (
        await db.execute(select(Session).order_by(Session.started_at.desc()))
    ).scalars().all()

    # Build a lookup: session_id -> list of responses keyed by question_key
    all_responses = (await db.execute(select(Response))).scalars().all()
    resp_map: dict[str, dict[str, str]] = {}
    for r in all_responses:
        sid = str(r.session_id)
        if sid not in resp_map:
            resp_map[sid] = {}
        resp_map[sid][r.question_key] = r.answer_value

    # Build a lookup: session_id -> latest prediction
    all_preds = (
        await db.execute(select(Prediction).order_by(Prediction.created_at.desc()))
    ).scalars().all()
    pred_map: dict[str, Prediction] = {}
    for p in all_preds:
        sid = str(p.session_id)
        if sid not in pred_map:
            pred_map[sid] = p

    # Define CSV columns — prediction fields + all question keys
    question_keys = [
        "age", "gender", "year_of_study", "place_of_residence", "tobacco_use", "systemic_conditions",
        "brushing_frequency", "brushing_duration", "toothbrush_type", "toothbrush_replacement",
        "toothpaste_type", "interdental_cleaning", "mouthwash_usage", "dental_visit_frequency",
        "self_rated_hygiene",
        "bleeding_brushing", "bleeding_eating", "spontaneous_bleeding", "swollen_gums",
        "red_gums", "tender_gums", "bad_breath", "others_bad_breath", "food_stuck",
        "previous_gum_disease",
    ]

    header = [
        "session_id", "status", "started_at", "completed_at",
        "has_gingivitis", "severity", "confidence", "risk_level",
    ] + question_keys

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(header)

    for s in sessions:
        sid = str(s.id)
        pred = pred_map.get(sid)

        # Apply severity filter if provided
        if search and pred and pred.severity.lower() != search.lower():
            continue

        responses = resp_map.get(sid, {})
        row = [
            sid,
            s.status,
            s.started_at.isoformat() if s.started_at else "",
            s.completed_at.isoformat() if s.completed_at else "",
            pred.has_gingivitis if pred else "",
            pred.severity if pred else "",
            float(pred.confidence) if pred else "",
            pred.risk_level if pred else "",
        ] + [responses.get(k, "") for k in question_keys]

        writer.writerow(row)

    output.seek(0)
    filename = f"gingiai-screening-export-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
