"""Standalone prediction helper for testing."""

import json
import sys
from pathlib import Path

import joblib

MODEL_PATH = Path(__file__).parent / "models" / "gingivitis_rf_model.joblib"


def predict(features: dict) -> dict:
    artifact = joblib.load(MODEL_PATH)
    pipeline = artifact["gingivitis_pipeline"]
    severity_pipeline = artifact["severity_pipeline"]
    cols = artifact["feature_columns"]

    import pandas as pd

    row = pd.DataFrame([{k: features.get(k, "") for k in cols}])
    proba = pipeline.predict_proba(row)[0]
    has_gingivitis = bool(pipeline.predict(row)[0])
    confidence = float(max(proba))

    severity = severity_pipeline.predict(row)[0]
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
    return {
        "has_gingivitis": has_gingivitis,
        "confidence": confidence,
        "severity": severity,
        "severity_score": severity_scores.get(severity, confidence),
        "severity_distribution": severity_scores,
        "risk_level": risk_map.get(severity, "moderate"),
        "feature_importance": top_factors,
        "model_version": artifact.get("version", "rf_v1"),
    }


if __name__ == "__main__":
    sample = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    print(json.dumps(predict(sample), indent=2))
