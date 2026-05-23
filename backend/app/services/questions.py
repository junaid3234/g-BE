"""Conversational screening question flow — aligned with Google Form dataset."""

from dataclasses import dataclass


@dataclass
class Question:
    key: str
    section: str
    text: str
    input_type: str  # choice | number | text
    options: list[str] | None = None
    validation: dict | None = None


# Options match ml-model/data/google_form_responses (BDS screening cohort)
QUESTIONS: list[Question] = [
    # SECTION A – BASIC INFORMATION
    Question("age", "A", "What is your age (in years)?", "number", validation={"min": 1, "max": 120}),
    Question("gender", "A", "What is your gender?", "choice", ["Male", "Female", "Other"]),
    Question("year_of_study", "A", "What is your year of study?", "choice",
             ["I BDS", "II BDS", "III BDS", "IV BDS", "Intern", "N/A"]),
    Question("place_of_residence", "A", "What is your place of residence?", "choice",
             ["Home", "Hostel", "Urban", "Rural"]),
    Question("tobacco_use", "A", "Tobacco use in the last 6 months (any form)?", "choice",
             ["Never", "Former", "Occasional", "Daily"]),
    Question("systemic_conditions", "A", "Known systemic conditions:", "choice",
             ["None", "Diabetes", "Hypertension", "Heart Disease", "Other"]),
    # SECTION B – ORAL HYGIENE PRACTICES
    Question("brushing_frequency", "B", "How often do you brush your teeth?", "choice",
             ["Once daily", "Twice daily", "Three or more times daily", "Never"]),
    Question("brushing_duration", "B", "For how long do you usually brush each time?", "choice",
             ["Less than 1 min", "1-2 min", "2-3 min", "More than 3 min"]),
    Question("toothbrush_type", "B", "What type of toothbrush do you mainly use?", "choice",
             ["Manual", "Electric", "Both"]),
    Question("toothbrush_replacement", "B", "When did you last change your toothbrush?", "choice",
             ["Every 1-2 months", "Every 3 months", "Every 6 months", "Rarely"]),
    Question("toothpaste_type", "B", "What type of toothpaste do you mainly use?", "choice",
             ["Fluoride", "Sensitive", "Herbal", "Whitening", "Other"]),
    Question("interdental_cleaning", "B",
             "Do you clean between your teeth (floss, interdental brush, water flosser, etc.)?",
             "choice", ["Never", "Rarely", "Sometimes", "Often", "Always"]),
    Question("mouthwash_usage", "B", "How often do you use mouthwash?", "choice",
             ["Never", "Sometimes", "Daily"]),
    Question("dental_visit_frequency", "B", "How often do you usually visit a dentist?", "choice",
             ["Never", "Less than yearly", "Yearly", "Every 6 months"]),
    Question("self_rated_hygiene", "B", "How would you rate your overall oral hygiene?", "choice",
             ["Poor", "Fair", "Good", "Excellent"]),
    # SECTION C – GINGIVAL SYMPTOMS
    Question("bleeding_brushing", "C", "My gums bleed when I brush my teeth.", "choice",
             ["Never", "Rarely", "Sometimes", "Often", "Always"]),
    Question("bleeding_eating", "C", "My gums bleed when I eat hard food.", "choice",
             ["Never", "Rarely", "Sometimes", "Often", "Always"]),
    Question("spontaneous_bleeding", "C", "My gums bleed on their own (spontaneously).", "choice",
             ["Never", "Rarely", "Sometimes", "Often", "Always"]),
    Question("swollen_gums", "C", "My gums look swollen or puffy.", "choice",
             ["Never", "Rarely", "Sometimes", "Often", "Always"]),
    Question("red_gums", "C", "My gums look redder than normal.", "choice",
             ["Never", "Rarely", "Sometimes", "Often", "Always"]),
    Question("tender_gums", "C", "My gums feel sore or tender.", "choice",
             ["Never", "Rarely", "Sometimes", "Often", "Always"]),
    Question("bad_breath", "C", "I notice bad breath from my mouth.", "choice",
             ["Never", "Rarely", "Sometimes", "Often", "Always"]),
    Question("others_bad_breath", "C", "Other people have told me that I have bad breath.", "choice",
             ["Never", "Rarely", "Sometimes", "Often", "Always"]),
    Question("food_stuck", "C", "I feel food getting stuck between my teeth or near my gums.", "choice",
             ["Never", "Rarely", "Sometimes", "Often", "Always"]),
    Question("previous_gum_disease", "C", "A dentist has told me that I have gum disease / gingivitis.", "choice",
             ["Yes", "No"]),
    # FINAL CLINICAL INPUTS
    Question("gingival_index", "D", "Gingival Index Interpretation:", "choice",
             ["Normal", "Mild", "Moderate", "Severe"]),
    Question("ohi_s", "D", "OHI-S Interpretation:", "choice",
             ["Good", "Fair", "Poor"]),
]

QUESTION_BY_KEY = {q.key: q for q in QUESTIONS}
TOTAL_QUESTIONS = len(QUESTIONS)


def get_question(index: int) -> Question | None:
    if 0 <= index < TOTAL_QUESTIONS:
        return QUESTIONS[index]
    return None


def progress_for_index(index: int) -> float:
    return round((index / TOTAL_QUESTIONS) * 100, 1)


SECTION_INTROS = {
    "A": "Let's start with some basic information about you.",
    "B": "Great! Now I'll ask about your oral hygiene practices.",
    "C": "Thank you. Next, I'd like to understand any gingival symptoms you've experienced.",
    "D": "Almost done! Please provide these final clinical assessment inputs.",
}


def intro_for_section(section: str) -> str | None:
    return SECTION_INTROS.get(section)
