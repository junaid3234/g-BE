"""
GingiAI Random Forest training pipeline.
Generates synthetic dataset when no CSV provided, trains model, evaluates, saves joblib artifact.
"""

from __future__ import annotations

import json
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from feature_config import CATEGORICAL_FEATURES, FEATURE_COLUMNS, NUMERIC_FEATURES

RANDOM_STATE = 42
MODEL_DIR = Path(__file__).parent / "models"
DATA_DIR = Path(__file__).parent / "data"


def generate_synthetic_data(n_samples: int = 2000) -> pd.DataFrame:
    """Generate realistic synthetic screening data for demo/training."""
    rng = np.random.default_rng(RANDOM_STATE)

    genders = ["Male", "Female", "Other", "Prefer not to say"]
    residence = ["Urban", "Suburban", "Rural"]
    tobacco = ["Never", "Former", "Occasional", "Daily"]
    systemic = ["None", "Diabetes", "Hypertension", "Other"]
    freq = ["Never", "Once daily", "Twice daily", "Three or more times"]
    duration = ["Less than 1 min", "1-2 min", "2-3 min", "More than 3 min"]
    brush_type = ["Manual", "Electric", "Both"]
    replacement = ["Every 1-2 months", "Every 3 months", "Every 6 months", "Rarely"]
    paste = ["Fluoride", "Herbal", "Whitening", "Sensitive", "Other"]
    interdental = ["Never", "Rarely", "Sometimes", "Often", "Always"]
    mouthwash = ["Never", "Sometimes", "Daily"]
    dental_visit = ["Never", "Less than yearly", "Yearly", "Every 6 months"]
    hygiene_rating = ["Poor", "Fair", "Good", "Excellent"]
    symptom = ["Never", "Rarely", "Sometimes", "Often", "Always"]
    gi = ["Normal", "Mild", "Moderate", "Severe"]
    ohi = ["Good", "Fair", "Poor"]
    prev_gum = ["Yes", "No"]

    data = {
        "age": rng.integers(18, 65, n_samples),
        "gender": rng.choice(genders, n_samples),
        "year_of_study": rng.choice(["1", "2", "3", "4", "5+", "N/A"], n_samples),
        "place_of_residence": rng.choice(residence, n_samples),
        "tobacco_use": rng.choice(tobacco, n_samples),
        "systemic_conditions": rng.choice(systemic, n_samples),
        "brushing_frequency": rng.choice(freq, n_samples),
        "brushing_duration": rng.choice(duration, n_samples),
        "toothbrush_type": rng.choice(brush_type, n_samples),
        "toothbrush_replacement": rng.choice(replacement, n_samples),
        "toothpaste_type": rng.choice(paste, n_samples),
        "interdental_cleaning": rng.choice(interdental, n_samples),
        "mouthwash_usage": rng.choice(mouthwash, n_samples),
        "dental_visit_frequency": rng.choice(dental_visit, n_samples),
        "self_rated_hygiene": rng.choice(hygiene_rating, n_samples),
        "bleeding_brushing": rng.choice(symptom, n_samples, p=[0.2, 0.2, 0.25, 0.2, 0.15]),
        "bleeding_eating": rng.choice(symptom, n_samples, p=[0.25, 0.25, 0.2, 0.15, 0.15]),
        "spontaneous_bleeding": rng.choice(symptom, n_samples, p=[0.4, 0.25, 0.2, 0.1, 0.05]),
        "swollen_gums": rng.choice(symptom, n_samples, p=[0.3, 0.25, 0.2, 0.15, 0.1]),
        "red_gums": rng.choice(symptom, n_samples, p=[0.3, 0.25, 0.2, 0.15, 0.1]),
        "tender_gums": rng.choice(symptom, n_samples, p=[0.35, 0.25, 0.2, 0.12, 0.08]),
        "bad_breath": rng.choice(symptom, n_samples, p=[0.25, 0.25, 0.25, 0.15, 0.1]),
        "others_bad_breath": rng.choice(symptom, n_samples, p=[0.4, 0.25, 0.2, 0.1, 0.05]),
        "food_stuck": rng.choice(symptom, n_samples, p=[0.3, 0.3, 0.2, 0.12, 0.08]),
        "previous_gum_disease": rng.choice(prev_gum, n_samples, p=[0.3, 0.7]),
        "gingival_index": rng.choice(gi, n_samples, p=[0.3, 0.35, 0.25, 0.1]),
        "ohi_s": rng.choice(ohi, n_samples, p=[0.35, 0.4, 0.25]),
    }

    df = pd.DataFrame(data)

    # Rule-based labels for gingivitis presence and severity
    symptom_map = {"Never": 0, "Rarely": 1, "Sometimes": 2, "Often": 3, "Always": 4}
    symptom_cols = [
        "bleeding_brushing", "bleeding_eating", "spontaneous_bleeding",
        "swollen_gums", "red_gums", "tender_gums",
    ]
    symptom_score = sum(df[c].map(symptom_map) for c in symptom_cols) / len(symptom_cols)
    gi_map = {"Normal": 0, "Mild": 1, "Moderate": 2, "Severe": 3}
    ohi_map = {"Good": 0, "Fair": 1, "Poor": 2}

    risk = (
        symptom_score * 0.4
        + df["gingival_index"].map(gi_map) * 0.35
        + df["ohi_s"].map(ohi_map) * 0.15
        + (df["tobacco_use"] != "Never").astype(int) * 0.5
        + (df["previous_gum_disease"] == "Yes").astype(int) * 0.5
        + rng.normal(0, 0.3, n_samples)
    )

    df["has_gingivitis"] = (risk > 1.8).astype(int)
    severity = np.where(risk <= 1.0, 0, np.where(risk <= 2.0, 1, np.where(risk <= 3.0, 2, 3)))
    df["severity"] = ["none", "mild", "moderate", "severe"][0]  # placeholder
    df["severity"] = pd.Categorical(
        [["none", "mild", "moderate", "severe"][s] for s in severity],
        categories=["none", "mild", "moderate", "severe"],
    )

    return df


def build_pipeline() -> Pipeline:
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
        ],
        remainder="drop",
    )
    clf = RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=5,
        class_weight="balanced",
        random_state=RANDOM_STATE,
        n_jobs=-1,
    )
    return Pipeline([("preprocessor", preprocessor), ("classifier", clf)])


def train(data_path: str | None = None) -> dict:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    default_dataset = DATA_DIR / "gingivitis_training.csv"
    if data_path and Path(data_path).exists():
        df = pd.read_csv(data_path)
        print(f"Training on dataset: {data_path} ({len(df)} rows)")
    elif default_dataset.exists():
        df = pd.read_csv(default_dataset)
        print(f"Training on Google Form dataset: {default_dataset} ({len(df)} rows)")
    else:
        print("No real dataset found — generating synthetic data. Run: python download_dataset.py")
        df = generate_synthetic_data(2500)
        df.to_csv(DATA_DIR / "synthetic_gingivitis.csv", index=False)

    X = df[FEATURE_COLUMNS]
    y = df["has_gingivitis"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]

    metrics = {
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "f1": float(f1_score(y_test, y_pred)),
        "classification_report": classification_report(y_test, y_pred, output_dict=True),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist(),
        "n_train": len(X_train),
        "n_test": len(X_test),
    }

    # Severity model (multi-class on subset with gingivitis features)
    severity_pipeline = build_pipeline()
    y_sev = df["severity"].astype(str)
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_sev, test_size=0.2, random_state=RANDOM_STATE)
    severity_clf = RandomForestClassifier(
        n_estimators=150, max_depth=10, random_state=RANDOM_STATE, n_jobs=-1
    )
    sev_preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
        ]
    )
    severity_pipeline = Pipeline([
        ("preprocessor", sev_preprocessor),
        ("classifier", severity_clf),
    ])
    severity_pipeline.fit(X_tr, y_tr)
    sev_pred = severity_pipeline.predict(X_te)
    metrics["severity_accuracy"] = float(accuracy_score(y_te, sev_pred))

    artifact = {
        "gingivitis_pipeline": pipeline,
        "severity_pipeline": severity_pipeline,
        "feature_columns": FEATURE_COLUMNS,
        "metrics": metrics,
        "version": "rf_google_form_v1",
        "data_source": str(data_path or default_dataset),
        "n_samples": len(df),
    }

    model_path = MODEL_DIR / "gingivitis_rf_model.joblib"
    joblib.dump(artifact, model_path)
    print(f"Model saved to {model_path}")
    print(json.dumps(metrics, indent=2))

    # Optional SHAP (skip if not installed)
    try:
        import shap

        sample = X_test.iloc[:100]
        transformed = pipeline.named_steps["preprocessor"].transform(sample)
        explainer = shap.TreeExplainer(pipeline.named_steps["classifier"])
        shap_values = explainer.shap_values(transformed)
        shap_path = MODEL_DIR / "shap_sample.npy"
        np.save(shap_path, shap_values if isinstance(shap_values, np.ndarray) else shap_values[1])
        print(f"SHAP sample saved to {shap_path}")
    except ImportError:
        print("SHAP not installed — skipping explainability export")

    return metrics


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Train GingiAI gingivitis model")
    parser.add_argument("--data", type=str, default=None, help="Path to CSV dataset")
    args = parser.parse_args()
    train(args.data)
