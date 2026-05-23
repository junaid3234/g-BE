"""ML prediction service with joblib model loading."""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from app.config import settings

logger = logging.getLogger(__name__)

_artifact: dict | None = None

RECOMMENDATIONS = {
    "low": [
        "Maintain twice-daily brushing for at least 2 minutes.",
        "Continue regular dental check-ups every 6 months.",
        "Use fluoride toothpaste and consider daily flossing.",
    ],
    "moderate": [
        "Increase brushing duration and use interdental cleaners daily.",
        "Schedule a dental hygiene appointment within 4 weeks.",
        "Consider an antimicrobial mouthwash as advised by your dentist.",
        "Monitor for bleeding and report changes promptly.",
    ],
    "high": [
        "Seek professional dental evaluation within 2 weeks.",
        "Improve oral hygiene with supervised brushing technique.",
        "Reduce tobacco use if applicable — a major risk factor.",
        "Use warm salt water rinses only if recommended by a clinician.",
    ],
    "critical": [
        "Urgent dental consultation recommended within 1 week.",
        "Do not delay treatment — signs suggest significant gingival inflammation.",
        "Document symptoms and bring this screening report to your appointment.",
        "Avoid self-medication; follow clinician guidance only.",
    ],
}


def load_model() -> dict:
    global _artifact
    if _artifact is not None:
        return _artifact

    path = Path(settings.model_path)
    if not path.is_absolute():
        repo_model = Path(__file__).resolve().parents[3] / "ml-model" / "models" / "gingivitis_rf_model.joblib"
        path = repo_model if repo_model.exists() else Path(settings.model_path)

    if not path.exists():
        logger.warning("Model not found at %s — using rule-based fallback", path)
        _artifact = {"fallback": True}
        return _artifact

    _artifact = joblib.load(path)
    _artifact["fallback"] = False
    logger.info("Loaded ML model from %s", path)
    return _artifact


def _rule_based_predict(features: dict[str, Any]) -> dict[str, Any]:
    symptom_map = {"Never": 0, "Rarely": 1, "Sometimes": 2, "Often": 3, "Always": 4}
    symptom_cols = [
        "bleeding_brushing", "bleeding_eating", "spontaneous_bleeding",
        "swollen_gums", "red_gums", "tender_gums",
    ]
    score = sum(symptom_map.get(features.get(c, "Never"), 0) for c in symptom_cols) / max(len(symptom_cols), 1)
    gi_map = {"Normal": 0, "Mild": 1, "Moderate": 2, "Severe": 3}
    score += gi_map.get(features.get("gingival_index", "Normal"), 0) * 0.5

    has_gingivitis = score >= 1.5
    if score < 1.0:
        severity = "none"
    elif score < 2.0:
        severity = "mild"
    elif score < 3.0:
        severity = "moderate"
    else:
        severity = "severe"

    risk_map = {"none": "low", "mild": "moderate", "moderate": "high", "severe": "critical"}
    return {
        "has_gingivitis": has_gingivitis,
        "confidence": min(0.95, 0.6 + score * 0.1),
        "severity": severity,
        "severity_score": float(score),
        "risk_level": risk_map[severity],
        "feature_importance": [
            {"feature": "symptom_score", "importance": float(score)},
            {"feature": "gingival_index", "importance": 0.3},
        ],
        "model_version": "fallback_v1",
    }


def predict(features: dict[str, Any]) -> dict[str, Any]:
    artifact = load_model()

    if artifact.get("fallback"):
        result = _rule_based_predict(features)
    else:
        pipeline = artifact["gingivitis_pipeline"]
        severity_pipeline = artifact["severity_pipeline"]
        cols = artifact["feature_columns"]

        row = pd.DataFrame([{k: str(features.get(k, "")) for k in cols}])
        if "age" in cols:
            try:
                row["age"] = int(float(features.get("age", 25)))
            except (TypeError, ValueError):
                row["age"] = 25

        proba = pipeline.predict_proba(row)[0]
        has_gingivitis = bool(pipeline.predict(row)[0])
        confidence = float(max(proba))
        severity = str(severity_pipeline.predict(row)[0])
        sev_proba = severity_pipeline.predict_proba(row)[0]
        classes = list(severity_pipeline.named_steps["classifier"].classes_)
        severity_scores = {c: float(p) for c, p in zip(classes, sev_proba)}

        clf = pipeline.named_steps["classifier"]
        pre = pipeline.named_steps["preprocessor"]
        importances = clf.feature_importances_
        try:
            names = pre.get_feature_names_out()
        except Exception:
            names = [f"f{i}" for i in range(len(importances))]
        top_idx = importances.argsort()[-8:][::-1]
        top_factors = [
            {"feature": str(names[i]), "importance": float(importances[i])}
            for i in top_idx
        ]

        risk_map = {"none": "low", "mild": "moderate", "moderate": "high", "severe": "critical"}
        result = {
            "has_gingivitis": has_gingivitis,
            "confidence": confidence,
            "severity": severity,
            "severity_score": severity_scores.get(severity, confidence),
            "risk_level": risk_map.get(severity, "moderate"),
            "feature_importance": top_factors,
            "model_version": artifact.get("version", "rf_v1"),
        }

    risk = result["risk_level"]
    recs = RECOMMENDATIONS.get(risk, RECOMMENDATIONS["moderate"])
    if result["has_gingivitis"]:
        explanation = (
            f"Our AI model indicates a likelihood of gingivitis with {result['severity']} severity "
            f"(confidence: {result['confidence']:.0%}). This is a screening tool — please consult a dental professional."
        )
    else:
        explanation = (
            f"Screening suggests low gingivitis risk (confidence: {result['confidence']:.0%}). "
            "Continue preventive care and regular dental visits."
        )

    result["recommendations"] = recs
    result["explanation"] = explanation
    return result
