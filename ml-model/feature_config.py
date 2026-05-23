"""Feature definitions aligned with screening questionnaire."""

FEATURE_COLUMNS = [
    "age",
    "gender",
    "year_of_study",
    "place_of_residence",
    "tobacco_use",
    "systemic_conditions",
    "brushing_frequency",
    "brushing_duration",
    "toothbrush_type",
    "toothbrush_replacement",
    "toothpaste_type",
    "interdental_cleaning",
    "mouthwash_usage",
    "dental_visit_frequency",
    "self_rated_hygiene",
    "bleeding_brushing",
    "bleeding_eating",
    "spontaneous_bleeding",
    "swollen_gums",
    "red_gums",
    "tender_gums",
    "bad_breath",
    "others_bad_breath",
    "food_stuck",
    "previous_gum_disease",
    "gingival_index",
    "ohi_s",
]

CATEGORICAL_FEATURES = [
    "gender",
    "year_of_study",
    "place_of_residence",
    "tobacco_use",
    "systemic_conditions",
    "brushing_frequency",
    "brushing_duration",
    "toothbrush_type",
    "toothbrush_replacement",
    "toothpaste_type",
    "interdental_cleaning",
    "mouthwash_usage",
    "dental_visit_frequency",
    "self_rated_hygiene",
    "bleeding_brushing",
    "bleeding_eating",
    "spontaneous_bleeding",
    "swollen_gums",
    "red_gums",
    "tender_gums",
    "bad_breath",
    "others_bad_breath",
    "food_stuck",
    "previous_gum_disease",
    "gingival_index",
    "ohi_s",
]

NUMERIC_FEATURES = ["age"]

SYMPTOM_SCALE = ["Never", "Rarely", "Sometimes", "Often", "Always"]

SEVERITY_LABELS = ["none", "mild", "moderate", "severe"]
