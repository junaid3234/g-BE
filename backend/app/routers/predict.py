from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user_id
from app.database import get_db
from app.models import Prediction, Report, Response, Session
from app.schemas import PredictRequest, PredictResponse
from app.services.ml_service import predict as ml_predict
from app.services.recommendations import build_report_summary

router = APIRouter(prefix="/predict", tags=["predict"])


@router.post("", response_model=PredictResponse)
async def run_prediction(
    body: PredictRequest,
    db: AsyncSession = Depends(get_db),
    user_id: str | None = Depends(get_current_user_id),
):
    features = dict(body.features)

    if body.session_id:
        result = await db.execute(select(Session).where(Session.id == body.session_id))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        resp_result = await db.execute(
            select(Response).where(Response.session_id == body.session_id)
        )
        for r in resp_result.scalars().all():
            features[r.question_key] = r.answer_value
    elif not features:
        raise HTTPException(status_code=400, detail="Provide session_id or features")

    prediction_result = ml_predict(features)

    prediction_id = None
    if body.session_id:
        pred = Prediction(
            session_id=body.session_id,
            has_gingivitis=prediction_result["has_gingivitis"],
            severity=prediction_result["severity"],
            severity_score=float(prediction_result.get("severity_score", 0)),
            confidence=float(prediction_result["confidence"]),
            risk_level=prediction_result["risk_level"],
            feature_importance=prediction_result["feature_importance"],
            model_version=prediction_result["model_version"],
        )
        db.add(pred)
        await db.flush()
        prediction_id = pred.id

        report = Report(
            session_id=body.session_id,
            prediction_id=pred.id,
            summary=build_report_summary(prediction_result, features),
            recommendations={"items": prediction_result["recommendations"]},
        )
        db.add(report)

    return PredictResponse(
        session_id=body.session_id,
        prediction_id=prediction_id,
        has_gingivitis=prediction_result["has_gingivitis"],
        severity=prediction_result["severity"],
        severity_score=float(prediction_result.get("severity_score", 0)),
        confidence=float(prediction_result["confidence"]),
        risk_level=prediction_result["risk_level"],
        feature_importance=prediction_result["feature_importance"],
        recommendations=prediction_result["recommendations"],
        explanation=prediction_result["explanation"],
        model_version=prediction_result["model_version"],
    )
