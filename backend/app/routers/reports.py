import io

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, to_db_id
from app.models import Prediction, Report, Response, Session

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/session/{session_id}")
async def get_report(session_id: str, db: AsyncSession = Depends(get_db)):
    sid = to_db_id(session_id)
    result = await db.execute(
        select(Report).where(Report.session_id == sid).order_by(Report.created_at.desc())
    )
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    pred_result = await db.execute(
        select(Prediction).where(Prediction.session_id == sid).order_by(Prediction.created_at.desc())
    )
    prediction = pred_result.scalars().first()
    return {
        "report": {
            "id": str(report.id),
            "title": report.title,
            "summary": report.summary,
            "recommendations": report.recommendations,
            "created_at": report.created_at.isoformat(),
        },
        "prediction": {
            "has_gingivitis": prediction.has_gingivitis if prediction else None,
            "severity": prediction.severity if prediction else None,
            "confidence": float(prediction.confidence) if prediction else None,
            "risk_level": prediction.risk_level if prediction else None,
            "feature_importance": prediction.feature_importance if prediction else None,
        } if prediction else None,
    }


@router.get("/session/{session_id}/pdf")
async def download_pdf(session_id: str, db: AsyncSession = Depends(get_db)):
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas

    sid = to_db_id(session_id)
    result = await db.execute(select(Report).where(Report.session_id == sid))
    report = result.scalars().first()
    pred_result = await db.execute(
        select(Prediction).where(Prediction.session_id == sid).order_by(Prediction.created_at.desc())
    )
    prediction = pred_result.scalars().first()
    resp_result = await db.execute(select(Response).where(Response.session_id == sid))
    responses = resp_result.scalars().all()

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 50

    c.setFont("Helvetica-Bold", 18)
    c.drawString(50, y, "GingiAI - Gingivitis Screening Report")
    y -= 30
    c.setFont("Helvetica", 10)
    c.drawString(50, y, f"Session ID: {session_id}")
    y -= 20

    if report and report.summary:
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "Summary")
        y -= 18
        c.setFont("Helvetica", 10)
        for line in _wrap_text(report.summary, 90):
            c.drawString(50, y, line)
            y -= 14
            if y < 80:
                c.showPage()
                y = height - 50

    if prediction:
        y -= 10
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "Prediction Results")
        y -= 18
        c.setFont("Helvetica", 10)
        lines = [
            f"Gingivitis Detected: {'Yes' if prediction.has_gingivitis else 'No'}",
            f"Severity: {prediction.severity}",
            f"Confidence: {float(prediction.confidence):.1%}",
            f"Risk Level: {prediction.risk_level}",
        ]
        for line in lines:
            c.drawString(50, y, line)
            y -= 14

    if report and report.recommendations:
        y -= 10
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, y, "Recommendations")
        y -= 18
        c.setFont("Helvetica", 10)
        items = report.recommendations.get("items", []) if isinstance(report.recommendations, dict) else []
        for item in items:
            for line in _wrap_text(f"- {item}", 85):
                c.drawString(50, y, line)
                y -= 14

    c.setFont("Helvetica-Oblique", 8)
    c.drawString(50, 40, "Disclaimer: This is an AI screening tool, not a medical diagnosis.")
    c.save()
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=gingiai-report-{session_id}.pdf"},
    )


def _wrap_text(text: str, max_len: int) -> list[str]:
    words = text.split()
    lines, current = [], ""
    for w in words:
        if len(current) + len(w) + 1 <= max_len:
            current = f"{current} {w}".strip()
        else:
            if current:
                lines.append(current)
            current = w
    if current:
        lines.append(current)
    return lines or [text[:max_len]]
