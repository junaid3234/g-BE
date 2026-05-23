import csv
import io
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import require_auth
from app.database import get_db
from app.models import Prediction, Session, User
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
            select(Prediction).where(Prediction.session_id == s.id).order_by(Prediction.created_at.desc())
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
    _user: str = Depends(require_auth),
    search: str | None = Query(None),
):
    preds = (await db.execute(select(Prediction).order_by(Prediction.created_at.desc()))).scalars().all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["session_id", "has_gingivitis", "severity", "confidence", "risk_level", "created_at"])
    for p in preds:
        writer.writerow([
            str(p.session_id), p.has_gingivitis, p.severity,
            float(p.confidence), p.risk_level, p.created_at.isoformat(),
        ])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=gingiai-export.csv"},
    )
