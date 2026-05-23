"""Generate personalized oral health recommendations."""

from typing import Any


def build_report_summary(prediction: dict[str, Any], features: dict[str, Any]) -> str:
    status = "positive" if prediction.get("has_gingivitis") else "negative"
    severity = prediction.get("severity", "unknown")
    return (
        f"GingiAI screening completed. Gingivitis screening: {status}. "
        f"Severity classification: {severity}. Risk level: {prediction.get('risk_level', 'moderate')}."
    )
