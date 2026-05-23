"""
Download Google Form responses CSV and preprocess for training.

Sheet: https://docs.google.com/spreadsheets/d/1NlQj8yzGeEKORUcGSv0IsVvgquKZxW5nrAVy3q23D6Q/
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

import pandas as pd
import requests

SHEET_ID = "1NlQj8yzGeEKORUcGSv0IsVvgquKZxW5nrAVy3q23D6Q"
EXPORT_URL = f"https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv"
DATA_DIR = Path(__file__).parent / "data"
RAW_PATH = DATA_DIR / "google_form_raw.csv"
PROCESSED_PATH = DATA_DIR / "gingivitis_training.csv"
UPLOAD_MD = Path(__file__).resolve().parents[2] / ".cursor" / "projects" / "c-Users-asus-Desktop-GingiAI" / "uploads" / "edit-0.md"
# Also check workspace-relative upload path
UPLOAD_MD_ALT = Path(__file__).resolve().parents[1].parent / ".cursor" / "projects" / "c-Users-asus-Desktop-GingiAI" / "uploads" / "edit-0.md"


def download_raw() -> Path | None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    try:
        r = requests.get(EXPORT_URL, timeout=60)
        r.raise_for_status()
        text = r.text
        if text.strip().startswith("<!") or "html" in text[:200].lower():
            return None
        RAW_PATH.write_text(text, encoding="utf-8")
        print(f"Downloaded {len(text)} bytes -> {RAW_PATH}")
        return RAW_PATH
    except Exception as e:
        print(f"Download failed: {e}")
        return None


def parse_markdown_table(md_path: Path) -> pd.DataFrame:
    """Parse markdown table rows from uploaded sheet export."""
    if not md_path.exists():
        raise FileNotFoundError(f"Markdown export not found: {md_path}")

    lines = md_path.read_text(encoding="utf-8", errors="ignore").splitlines()
    rows: list[list[str]] = []
    for line in lines:
        if not re.match(r"^\|\s*\d+\s*\|", line):
            continue
        parts = [p.strip() for p in line.split("|")]
        if len(parts) < 30:
            continue
        # parts[0]='', parts[1]=row_num, parts[2:]=timestamp, email, name, age, ...
        cells = parts[2:]
        if cells and cells[0].isdigit():
            cells = cells[1:]  # drop row number column
        rows.append(cells)

    if not rows:
        raise ValueError("No data rows found in markdown")

    # Column order from Google Form (28 features + metadata at start)
    columns = [
        "timestamp", "email", "name",
        "age", "gender", "year_of_study", "place_of_residence",
        "tobacco_use", "systemic_conditions",
        "brushing_frequency", "brushing_duration", "toothbrush_type",
        "toothbrush_replacement", "toothpaste_type", "interdental_cleaning",
        "mouthwash_usage", "dental_visit_frequency", "self_rated_hygiene",
        "bleeding_brushing", "bleeding_eating", "spontaneous_bleeding",
        "swollen_gums", "red_gums", "tender_gums", "bad_breath",
        "others_bad_breath", "food_stuck", "previous_gum_disease",
        "gingival_index", "ohi_s",
    ]

    # Align width — some rows may have extra/ fewer cells
    max_cols = max(len(r) for r in rows)
    if max_cols >= len(columns) + 3:
        # trim metadata columns if present (timestamp, email, name)
        trimmed = [r[3 : 3 + len(columns)] if len(r) >= 3 + len(columns) else r for r in rows]
        rows = trimmed
    elif max_cols == len(columns):
        pass
    else:
        # pad rows
        rows = [r + [""] * (len(columns) - len(r)) for r in rows]

    df = pd.DataFrame(rows[: len(columns)] if len(rows[0]) != len(columns) else rows, columns=columns)
    if len(df.columns) != len(columns):
        df = pd.DataFrame([r[: len(columns)] for r in rows], columns=columns)

    print(f"Parsed {len(df)} rows from markdown")
    return df


def load_raw_csv(path: Path) -> pd.DataFrame:
    df = pd.read_csv(path, encoding="utf-8")
    # Drop metadata columns by position if wide form export
    if df.shape[1] >= 30:
        # Typical form: first 3 cols metadata, then features
        feature_start = 3
        names = [
            "age", "gender", "year_of_study", "place_of_residence",
            "tobacco_use", "systemic_conditions",
            "brushing_frequency", "brushing_duration", "toothbrush_type",
            "toothbrush_replacement", "toothpaste_type", "interdental_cleaning",
            "mouthwash_usage", "dental_visit_frequency", "self_rated_hygiene",
            "bleeding_brushing", "bleeding_eating", "spontaneous_bleeding",
            "swollen_gums", "red_gums", "tender_gums", "bad_breath",
            "others_bad_breath", "food_stuck", "previous_gum_disease",
            "gingival_index", "ohi_s",
        ]
        if df.shape[1] >= feature_start + len(names):
            out = df.iloc[:, feature_start : feature_start + len(names)].copy()
            out.columns = names
            return out
    return df


def _extract_age(val: str) -> int:
    if pd.isna(val):
        return 25
    m = re.search(r"\d+", str(val))
    return int(m.group()) if m else 25


def _norm_symptom(val: str) -> str:
    v = str(val).strip().upper()
    mapping = {
        "NEVER": "Never",
        "RARELY": "Rarely",
        "SOMETIMES": "Sometimes",
        "OFTEN": "Often",
        "ALWAYS": "Always",
    }
    return mapping.get(v, val.strip().title() if val else "Never")


def _norm_gi(val: str) -> str:
    v = str(val).upper()
    if "NORMAL" in v or v.strip() == "0":
        return "Normal"
    if "SEVERE" in v or "2.0" in v:
        return "Severe"
    if "MODERATE" in v or "1 -" in v:
        return "Moderate"
    if "MILD" in v:
        return "Mild"
    return "Normal"


def _norm_ohi(val: str) -> str:
    v = str(val).upper()
    if "POOR" in v or "3.1" in v:
        return "Poor"
    if "FAIR" in v:
        return "Fair"
    if "GOOD" in v:
        return "Good"
    return "Fair"


def _norm_gender(val: str) -> str:
    v = str(val).strip().upper()
    if v in ("MALE", "M"):
        return "Male"
    if v in ("FEMALE", "F"):
        return "Female"
    return "Other"


def _norm_tobacco(val: str) -> str:
    v = str(val).strip().upper()
    if v in ("NO", "NEVER"):
        return "Never"
    if "FORMER" in v:
        return "Former"
    if "OCCASIONAL" in v:
        return "Occasional"
    return "Daily" if v in ("YES", "DAILY") else "Never"


def _norm_residence(val: str) -> str:
    v = str(val).strip().upper()
    if "HOSTEL" in v:
        return "Hostel"
    if "HOME" in v:
        return "Home"
    if "URBAN" in v:
        return "Urban"
    if "RURAL" in v:
        return "Rural"
    return val.strip().title() or "Home"


def _norm_year(val: str) -> str:
    v = str(val).strip().upper()
    mapping = {
        "I BDS": "I BDS",
        "II BDS": "II BDS",
        "III BDS": "III BDS",
        "IV BDS": "IV BDS",
        "INTERN": "Intern",
        "INTERNSHIP": "Intern",
    }
    for token, out in mapping.items():
        if token in v:
            return out
    return v.title() if v else "N/A"


def _norm_brushing_freq(val: str) -> str:
    v = str(val).upper()
    if "TWICE" in v:
        return "Twice daily"
    if "THREE" in v or "MORE" in v and "BRUSH" in v:
        return "Three or more times daily"
    if "ONCE" in v:
        return "Once daily"
    return "Never"


def _norm_duration(val: str) -> str:
    v = str(val).upper()
    if "LESS THAN 1" in v:
        return "Less than 1 min"
    if "1-2" in v:
        return "1-2 min"
    if "2-3" in v:
        return "2-3 min"
    if "MORE THAN 2" in v or "MORE THAN 3" in v:
        return "More than 3 min"
    return "1-2 min"


def _norm_brush_type(val: str) -> str:
    v = str(val).upper()
    if "POWERED" in v or "ELECTRIC" in v:
        return "Electric"
    if "BOTH" in v:
        return "Both"
    return "Manual"


def _norm_replacement(val: str) -> str:
    v = str(val).upper()
    if "LESS THAN 3" in v or "1-2 MONTH" in v:
        return "Every 1-2 months"
    if "3-6" in v:
        return "Every 3 months"
    if "MORE THAN 6" in v:
        return "Every 6 months"
    return "Every 3 months"


def _norm_toothpaste(val: str) -> str:
    v = str(val).upper()
    if "SENSITIVE" in v:
        return "Sensitive"
    if "HERBAL" in v:
        return "Herbal"
    if "WHITEN" in v:
        return "Whitening"
    if "FLUORIDE" in v:
        return "Fluoride"
    return "Fluoride"


def _norm_interdental(val: str) -> str:
    v = str(val).upper()
    if "NEVER" in v:
        return "Never"
    if "EVERYDAY" in v or "ALMOST EVERYDAY" in v:
        return "Always"
    if "3-5" in v:
        return "Often"
    if "1-2 DAYS" in v:
        return "Sometimes"
    if "OCCASIONAL" in v:
        return "Rarely"
    return "Never"


def _norm_mouthwash(val: str) -> str:
    v = str(val).upper()
    if "NEVER" in v:
        return "Never"
    if "DAILY" in v:
        return "Daily"
    return "Sometimes"


def _norm_dental_visit(val: str) -> str:
    v = str(val).upper()
    if "NEVER" in v or "EMERGENC" in v:
        return "Never"
    if "LESS THAN ONCE IN 2" in v or "LESS THAN YEARLY" in v:
        return "Less than yearly"
    if "TWO OR MORE" in v or "6 MONTH" in v:
        return "Every 6 months"
    if "ONCE A YEAR" in v or "ABOUT ONCE" in v:
        return "Yearly"
    return "Less than yearly"


def _norm_hygiene(val: str) -> str:
    v = str(val).upper()
    if "POOR" in v:
        return "Poor"
    if "GOOD" in v or "EXCELLENT" in v:
        return "Good"
    if "FAIR" in v or "AVERAGE" in v:
        return "Fair"
    return "Fair"


def _norm_prev_gum(val: str) -> str:
    v = str(val).upper()
    if v.startswith("NO") or v == "NO":
        return "No"
    return "Yes"


def _norm_systemic(val: str) -> str:
    v = str(val).strip().upper()
    if not v or v == "NONE":
        return "None"
    if "DIABET" in v:
        return "Diabetes"
    if "HYPERTEN" in v:
        return "Hypertension"
    if "HEART" in v:
        return "Heart Disease"
    if "ARTHRIT" in v:
        return "Other"
    return "Other"


def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize form values to training schema."""
    out = pd.DataFrame()
    out["age"] = df["age"].map(_extract_age)
    out["gender"] = df["gender"].map(_norm_gender)
    out["year_of_study"] = df["year_of_study"].map(_norm_year)
    out["place_of_residence"] = df["place_of_residence"].map(_norm_residence)
    out["tobacco_use"] = df["tobacco_use"].map(_norm_tobacco)
    out["systemic_conditions"] = df["systemic_conditions"].map(_norm_systemic)

    out["brushing_frequency"] = df["brushing_frequency"].map(_norm_brushing_freq)
    out["brushing_duration"] = df["brushing_duration"].map(_norm_duration)
    out["toothbrush_type"] = df["toothbrush_type"].map(_norm_brush_type)
    out["toothbrush_replacement"] = df["toothbrush_replacement"].map(_norm_replacement)
    out["toothpaste_type"] = df["toothpaste_type"].map(_norm_toothpaste)
    out["interdental_cleaning"] = df["interdental_cleaning"].map(_norm_interdental)
    out["mouthwash_usage"] = df["mouthwash_usage"].map(_norm_mouthwash)
    out["dental_visit_frequency"] = df["dental_visit_frequency"].map(_norm_dental_visit)
    out["self_rated_hygiene"] = df["self_rated_hygiene"].map(_norm_hygiene)

    for col in [
        "bleeding_brushing", "bleeding_eating", "spontaneous_bleeding",
        "swollen_gums", "red_gums", "tender_gums", "bad_breath",
        "others_bad_breath", "food_stuck",
    ]:
        out[col] = df[col].map(_norm_symptom)

    out["previous_gum_disease"] = df["previous_gum_disease"].map(_norm_prev_gum)
    out["gingival_index"] = df["gingival_index"].map(_norm_gi)
    out["ohi_s"] = df["ohi_s"].map(_norm_ohi)

    # Labels from clinical gingival index (gold standard in form)
    gi = out["gingival_index"]
    out["has_gingivitis"] = (gi != "Normal").astype(int)
    severity_map = {"Normal": "none", "Mild": "mild", "Moderate": "moderate", "Severe": "severe"}
    out["severity"] = gi.map(severity_map)

    return out


def main() -> Path:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    raw_df = None

    path = download_raw()
    if path:
        try:
            raw_df = load_raw_csv(path)
            print(f"Loaded CSV: {len(raw_df)} rows")
        except Exception as e:
            print(f"CSV parse error: {e}")

    if raw_df is None or len(raw_df) < 10:
        for md in [UPLOAD_MD, UPLOAD_MD_ALT, Path(__file__).parent / "data" / "form_export.md"]:
            if md.exists():
                print(f"Using markdown fallback: {md}")
                raw_df = parse_markdown_table(md)
                break

    if raw_df is None or len(raw_df) < 5:
        raise SystemExit("Could not load dataset. Share sheet publicly or place form_export.md in ml-model/data/")

    # Ensure expected columns exist
    required = [
        "age", "gender", "year_of_study", "place_of_residence", "tobacco_use",
        "systemic_conditions", "brushing_frequency", "brushing_duration",
        "toothbrush_type", "toothbrush_replacement", "toothpaste_type",
        "interdental_cleaning", "mouthwash_usage", "dental_visit_frequency",
        "self_rated_hygiene", "bleeding_brushing", "bleeding_eating",
        "spontaneous_bleeding", "swollen_gums", "red_gums", "tender_gums",
        "bad_breath", "others_bad_breath", "food_stuck", "previous_gum_disease",
        "gingival_index", "ohi_s",
    ]
    if not all(c in raw_df.columns for c in required):
        print("Columns:", list(raw_df.columns))
        raise SystemExit(f"Missing columns in raw data. Found {raw_df.shape[1]} cols.")

    processed = preprocess(raw_df)
    processed.to_csv(PROCESSED_PATH, index=False)
    raw_df.to_csv(DATA_DIR / "google_form_raw_parsed.csv", index=False)
    print(f"Saved {len(processed)} rows -> {PROCESSED_PATH}")
    print(f"Gingivitis positive rate: {processed['has_gingivitis'].mean():.1%}")
    print(processed["severity"].value_counts().to_string())
    return PROCESSED_PATH


if __name__ == "__main__":
    main()
