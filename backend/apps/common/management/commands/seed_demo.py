"""Seed the database with the demo content the Next.js UI was built against.

The payload mirrors `tiryaq/lib/mock/data.ts` and `tiryaq/services/studyService.ts`
so the wired frontend renders exactly what it showed with local mocks.

Usage:
    python manage.py seed_demo            # idempotent upsert
    python manage.py seed_demo --reset    # wipe seeded rows first
"""

from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.constants import ADMIN, INSTRUCTOR, STUDENT
from apps.accounts.models import InstructorApplication, InstructorProfile
from apps.analytics.models import (
    ReviewHistoryEntry,
    StudyActivity,
    StudyProgress,
    SubjectMastery,
)
from apps.billing.models import Transaction
from apps.catalog.models import (
    CartItem,
    Course,
    CourseModule,
    CourseReview,
    Enrollment,
    Lesson,
    LessonResource,
)
from apps.common.utils import deterministic_uuid
from apps.live.models import LiveSession
from apps.study.models import (
    CaseProgress,
    ClinicalCase,
    Deck,
    DifferentialDiagnosis,
    Flashcard,
    LabResult,
    PhysicalExam,
    QuizQuestion,
)

User = get_user_model()

WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

INSTRUCTORS = [
    {
        "key": "inst-1",
        "name": "Dr. Amine Haddad",
        "email": "amine.haddad@tiryaq.com",
        "specialty": "Cardiology",
        "rating": 4.9,
        "student_count": 8240,
        "bio": "Interventional cardiologist with 15 years of clinical and teaching experience. Author of the CardioSprint series.",
    },
    {
        "key": "inst-2",
        "name": "Dr. Leila Mansouri",
        "email": "leila.mansouri@tiryaq.com",
        "specialty": "Neurology",
        "rating": 4.8,
        "student_count": 5110,
        "bio": "Academic neurologist specialising in stroke and epilepsy. Known for making complex neuroanatomy accessible.",
    },
    {
        "key": "inst-3",
        "name": "Dr. Karim Ouali",
        "email": "karim.ouali@tiryaq.com",
        "specialty": "Emergency Medicine",
        "rating": 4.7,
        "student_count": 6380,
        "bio": "Emergency physician and simulation educator. Practical, high-yield teaching for every rotation and shelf exam.",
    },
    {
        "key": "inst-4",
        "name": "Dr. Aya Chikh",
        "email": "aya.chikh@tiryaq.com",
        "specialty": "Nephrology",
        "rating": 4.8,
        "student_count": 3920,
        "bio": "Nephrologist with a focus on acid-base disorders and AKI management. Consultant for two USMLE prep companies.",
    },
]

COURSES = [
    {
        "key": "course-1",
        "instructor": "inst-1",
        "title": "The Cardio Sprint",
        "slug": "cardiology-sprint",
        "specialty": "Cardiology",
        "level": "Intermediate",
        "price": 3000,
        "original_price": 6000,
        "rating": 4.9,
        "review_count": 1284,
        "student_count": 8240,
        "lesson_count": 42,
        "duration": "18h 30m",
        "description": "A focused, high-yield cardiology course covering everything from basic cardiac physiology to advanced ECG interpretation, heart failure, arrhythmias, and ACS management. Built for MS-III/IV students and USMLE Step 2 CK prep.",
        "badges": ["Best Seller", "New"],
        "status": Course.PUBLISHED,
        "enrolled_demo_student": True,
        "progress": 34,
        "modules": [
            {
                "key": "m-1",
                "title": "Cardiac Anatomy & Physiology",
                "lessons": [
                    {"key": "l-1-1", "title": "Cardiac cycle and pressure-volume loops", "duration": "28m", "type": Lesson.VIDEO, "free": True, "completed": True},
                    {"key": "l-1-2", "title": "Coronary anatomy and blood supply", "duration": "22m", "type": Lesson.VIDEO, "free": False, "completed": True},
                    {"key": "l-1-3", "title": "Lecture slides — Anatomy unit", "duration": "", "type": Lesson.RESOURCE, "free": False, "completed": False,
                     "resources": [{"name": "Cardiac Anatomy Slides.pdf", "type": LessonResource.SLIDE, "size": "4.2 MB"}]},
                ],
            },
            {
                "key": "m-2",
                "title": "ECG Interpretation",
                "lessons": [
                    {"key": "l-2-1", "title": "The systematic approach to ECG reading", "duration": "35m", "type": Lesson.VIDEO, "free": True, "completed": True},
                    {"key": "l-2-2", "title": "Arrhythmia recognition", "duration": "40m", "type": Lesson.VIDEO, "free": False, "completed": False},
                    {"key": "l-2-3", "title": "ST-segment changes and ACS", "duration": "32m", "type": Lesson.VIDEO, "free": False, "completed": False},
                    {"key": "l-2-4", "title": "High-yield ECG cheat sheet", "duration": "", "type": Lesson.RESOURCE, "free": False, "completed": False,
                     "resources": [{"name": "ECG Cheat Sheet.pdf", "type": LessonResource.PDF, "size": "1.8 MB"}]},
                ],
            },
            {
                "key": "m-3",
                "title": "Heart Failure",
                "lessons": [
                    {"key": "l-3-1", "title": "HFrEF vs HFpEF — pathophysiology", "duration": "30m", "type": Lesson.VIDEO, "free": False, "completed": False},
                    {"key": "l-3-2", "title": "Management ladder and GDMT", "duration": "25m", "type": Lesson.VIDEO, "free": False, "completed": False},
                    {"key": "l-3-3", "title": "Acute decompensated heart failure", "duration": "28m", "type": Lesson.VIDEO, "free": False, "completed": False},
                ],
            },
        ],
    },
    {
        "key": "course-2",
        "instructor": "inst-2",
        "title": "Neuro Made Simple",
        "slug": "neurology-made-simple",
        "specialty": "Neurology",
        "level": "Beginner",
        "price": 39,
        "rating": 4.8,
        "review_count": 876,
        "student_count": 5110,
        "lesson_count": 35,
        "duration": "14h 15m",
        "description": "Master clinical neurology from lesion localisation to stroke management. Covers the most-tested neurological syndromes with case-based teaching and high-yield mnemonics.",
        "badges": ["Top Rated"],
        "status": Course.PUBLISHED,
        "modules": [
            {
                "key": "m-1",
                "title": "Neuroanatomy for Clinicians",
                "lessons": [
                    {"key": "l-1-1", "title": "The upper vs lower motor neuron", "duration": "26m", "type": Lesson.VIDEO, "free": True, "completed": False},
                    {"key": "l-1-2", "title": "Spinal cord syndromes", "duration": "30m", "type": Lesson.VIDEO, "free": False, "completed": False},
                ],
            }
        ],
    },
    {
        "key": "course-3",
        "instructor": "inst-3",
        "title": "Emergency Medicine Essentials",
        "slug": "emergency-medicine-essentials",
        "specialty": "Emergency Medicine",
        "level": "Intermediate",
        "price": 54,
        "original_price": 69,
        "rating": 4.7,
        "review_count": 1050,
        "student_count": 6380,
        "lesson_count": 56,
        "duration": "22h",
        "description": "Everything you need to survive the ED rotation and nail shelf exams. ABCDE approach, trauma, toxicology, and the top presentations every student gets pimped on.",
        "badges": ["Best Seller"],
        "status": Course.PUBLISHED,
        "modules": [
            {
                "key": "m-1",
                "title": "Critical Care Approach",
                "lessons": [
                    {"key": "l-1-1", "title": "Primary survey and ABCDE", "duration": "20m", "type": Lesson.VIDEO, "free": True, "completed": False},
                    {"key": "l-1-2", "title": "Airway management essentials", "duration": "35m", "type": Lesson.VIDEO, "free": False, "completed": False},
                ],
            }
        ],
    },
    {
        "key": "course-4",
        "instructor": "inst-4",
        "title": "Renal & Acid-Base Mastery",
        "slug": "renal-acid-base",
        "specialty": "Nephrology",
        "level": "Advanced",
        "price": 44,
        "rating": 4.8,
        "review_count": 620,
        "student_count": 3920,
        "lesson_count": 30,
        "duration": "12h",
        "description": "The definitive guide to renal pathophysiology, AKI, CKD, glomerulonephritis, and a step-by-step acid-base interpretation framework that never fails.",
        "badges": ["New"],
        "status": Course.PUBLISHED,
        "modules": [
            {
                "key": "m-1",
                "title": "Glomerular Disorders",
                "lessons": [
                    {"key": "l-1-1", "title": "Nephritic vs nephrotic syndrome", "duration": "32m", "type": Lesson.VIDEO, "free": True, "completed": False},
                    {"key": "l-1-2", "title": "The big six glomerulonephritides", "duration": "40m", "type": Lesson.VIDEO, "free": False, "completed": False},
                ],
            }
        ],
    },
    {
        "key": "course-5",
        "instructor": "inst-3",
        "title": "Internal Medicine Bootcamp",
        "slug": "internal-medicine-bootcamp",
        "specialty": "Internal Medicine",
        "level": "Intermediate",
        "price": 2000,
        "original_price": 6000,
        "rating": 4.7,
        "review_count": 2100,
        "student_count": 11200,
        "lesson_count": 68,
        "duration": "28h",
        "description": "A comprehensive internal medicine course covering all major organ systems. Perfect for clerkship prep, Step 2 CK, and NBME shelf exams.",
        "badges": ["Best Seller", "Top Rated"],
        "status": Course.PUBLISHED,
        "modules": [
            {
                "key": "m-1",
                "title": "Pulmonology",
                "lessons": [
                    {"key": "l-1-1", "title": "Approach to dyspnoea", "duration": "22m", "type": Lesson.VIDEO, "free": True, "completed": False},
                    {"key": "l-1-2", "title": "COPD and asthma management", "duration": "35m", "type": Lesson.VIDEO, "free": False, "completed": False},
                ],
            }
        ],
    },
    {
        "key": "course-6",
        "instructor": "inst-1",
        "title": "ECG Masterclass",
        "slug": "ecg-masterclass",
        "specialty": "Cardiology",
        "level": "Beginner",
        "price": 9000,
        "rating": 4.9,
        "review_count": 3450,
        "student_count": 15600,
        "lesson_count": 24,
        "duration": "8h",
        "description": "From the basics to advanced interpretation. Includes 50+ practice ECGs with detailed walkthroughs.",
        "badges": ["Best Seller", "Top Rated"],
        "status": Course.PUBLISHED,
        "modules": [
            {
                "key": "m-1",
                "title": "ECG Fundamentals",
                "lessons": [
                    {"key": "l-1-1", "title": "Leads, axes, and the basics", "duration": "18m", "type": Lesson.VIDEO, "free": True, "completed": False},
                    {"key": "l-1-2", "title": "Rate and rhythm analysis", "duration": "24m", "type": Lesson.VIDEO, "free": False, "completed": False},
                ],
            }
        ],
    },
    {
        "key": "course-7",
        "instructor": "inst-3",
        "title": "Gastroenterology Essentials",
        "slug": "gastroenterology-essentials",
        "specialty": "Gastroenterology",
        "level": "Intermediate",
        "price": 42,
        "rating": 4.6,
        "review_count": 0,
        "student_count": 0,
        "lesson_count": 18,
        "duration": "9h",
        "description": "Awaiting review in the moderation queue: GI bleeding, liver disease and the acute abdomen.",
        "badges": ["New"],
        "status": Course.DRAFT,
        "modules": [],
    },
]

COURSE_REVIEWS = [
    {"course": "course-1", "author": "Tarek M.", "rating": 5, "body": "Best cardiology resource I've found. Dr. Haddad explains ACS in a way that actually sticks. Passed my shelf after going through this twice."},
    {"course": "course-1", "author": "Fatima A.", "rating": 5, "body": "The ECG section alone is worth the price. I could barely read a tracing before this course."},
    {"course": "course-1", "author": "Omar K.", "rating": 4, "body": "Really solid content. I'd like more practice questions embedded in the videos, but the explanations are excellent."},
]

FLASHCARD_DECKS = [
    {"key": "deck-cardio", "name": "Cardiology Core", "subject": "Cardiology"},
    {"key": "deck-pulm", "name": "Pulmonology Core", "subject": "Pulmonology"},
    {"key": "deck-renal", "name": "Renal Core", "subject": "Renal / Nephrology"},
    {"key": "deck-endo", "name": "Endocrine Core", "subject": "Endocrinology"},
]

FLASHCARDS = [
    {
        "key": "fc-1",
        "deck": "deck-cardio",
        "subject": "Cardiology",
        "vignette": 'A 62-year-old male presents with severe, tearing chest pain radiating to his back. His blood pressure is 185/110 mmHg in the right arm and 145/85 mmHg in the left arm. A chest X-ray shows mediastinal widening.',
        "diagnosis": "Aortic Dissection (Stanford Type A or B)",
        "rationale": 'The sudden onset of severe "tearing" chest pain radiating to the back, coupled with asymmetric blood pressures between arms (>20 mmHg difference) and mediastinal widening on chest X-ray, is highly specific for aortic dissection. Stanford Type A involves the ascending aorta and requires emergency surgical intervention, while Stanford Type B involves the descending aorta and is typically managed medically with beta-blockers (e.g., esmolol) to control shear stress.',
        "interval_days": 3,
        "ease_factor": 2.5,
    },
    {
        "key": "fc-2",
        "deck": "deck-pulm",
        "subject": "Pulmonology",
        "vignette": "A 28-year-old female presents with progressive dyspnea and a non-productive cough. Chest X-ray reveals bilateral hilar adenopathy. High-resolution chest CT shows perilymphatic nodules. Serum calcium and ACE levels are elevated.",
        "diagnosis": "Sarcoidosis",
        "rationale": "Bilateral hilar lymphadenopathy on CXR, elevated serum calcium, and elevated angiotensin-converting enzyme (ACE) levels in a young patient are classic for Sarcoidosis. Histopathology would reveal non-caseating granulomas composed of epithelioid histiocytes and multinucleated giant cells. Initial treatment consists of systemic corticosteroids for symptomatic patients or those with end-organ involvement.",
        "interval_days": 5,
        "ease_factor": 2.6,
    },
    {
        "key": "fc-3",
        "deck": "deck-renal",
        "subject": "Renal / Nephrology",
        "vignette": 'A 9-year-old boy presents with hematuria ("cola-colored urine"), periorbital edema, and hypertension. Two weeks ago, he was treated for a skin infection (impetigo). Urinalysis shows red blood cell casts and mild proteinuria.',
        "diagnosis": "Poststreptococcal Glomerulonephritis (PSGN)",
        "rationale": 'PSGN occurs 1-4 weeks after a streptococcal pharyngeal or skin infection (e.g., Streptococcus pyogenes). It is a Type III hypersensitivity reaction causing immune complex deposition (subepithelial "humps" on electron microscopy). Classic features include hematuria (RBC casts), periorbital edema, hypertension, and low serum C3 complement levels.',
        "interval_days": 1,
        "ease_factor": 2.3,
    },
    {
        "key": "fc-4",
        "deck": "deck-endo",
        "subject": "Endocrinology",
        "vignette": "A 45-year-old female presents with heat intolerance, weight loss despite increased appetite, and palpitations. On exam, she has a diffuse, non-tender goiter, proptosis, and pretibial myxedema.",
        "diagnosis": "Graves' Disease",
        "rationale": "Graves' disease is an autoimmune hyperthyroidism caused by Thyroid Stimulating Immunoglobulins (TSI) that act as agonists on TSH receptors. Pretibial myxedema (localized dermopathy) and ophthalmopathy (proptosis due to retro-orbital glycosaminoglycan accumulation) are highly specific and do not occur in other causes of hyperthyroidism.",
        "interval_days": 7,
        "ease_factor": 2.7,
        "difficulty": "Easy",
    },
]

CLINICAL_CASES = [
    {
        "key": "case-101",
        "title": "Acute Right Lower Quadrant Pain",
        "subject": "General Surgery",
        "difficulty": "Intermediate",
        "tags": ["Appendicitis", "Surgical emergency"],
        "estimated_minutes": 15,
        "presenting_complaint": "Severe lower abdominal pain for 12 hours.",
        "history_of_present_illness": "A 24-year-old female presents with a 12-hour history of abdominal pain. The pain began as a dull, vague ache in the periumbilical region, but has since localized to the right lower quadrant (RLQ). She reports accompanying anorexia, nausea, and two episodes of non-bilious emesis. Her last menstrual period was 3 weeks ago, regular, and she active sexually using oral contraceptives.",
        "past_medical_history": "Appendectomy: No. Prior abdominal surgeries: None. No chronic medical conditions, no known allergies.",
        "final_diagnosis": "Acute Appendicitis",
        "discussion": "Acute appendicitis is one of the most common surgical emergencies. The pathophysiology usually involves obstruction of the appendiceal lumen by a fecalith, lymphoid hyperplasia (often post-viral), or a foreign body. This leads to increased intraluminal pressure, venous congestion, lymphatic obstruction, and bacterial overgrowth, culminating in ischemia and perforation if untreated. Diagnosis is primarily clinical, but can be confirmed with ultrasound (particularly in children/pregnant females) or abdominal CT (revealing an enlarged appendix >6mm with wall thickening and periappendiceal stranding).",
        "physical_exam": {
            "general": "Ill-appearing, lying still on the gurney, favoring the right leg flexed.",
            "vitals": "Temp: 38.2°C (100.8°F), HR: 104 bpm, BP: 118/76 mmHg, RR: 18 bpm, SpO2: 99% on room air.",
            "cardiovascular": "Tachycardic, regular rhythm. No murmurs, rubs, or gallops.",
            "respiratory": "Lungs clear to auscultation bilaterally.",
            "abdomen": "Flat. Hypoactive bowel sounds. Marked tenderness in the RLQ at McBurney's point. Exquisite guarding and rebound tenderness are present. Positive Rovsing's sign (referred RLQ pain with LLQ palpation) and positive Psoas sign.",
            "neurological": "Alert and oriented x3. No focal deficits.",
        },
        "labs": [
            {"name": "White Blood Cell (WBC)", "value": "14.8 x 10^3/µL", "reference_range": "4.5 - 11.0 x 10^3/µL", "status": LabResult.HIGH},
            {"name": "Neutrophils", "value": "82%", "reference_range": "40% - 70%", "status": LabResult.HIGH},
            {"name": "Hemoglobin", "value": "13.5 g/dL", "reference_range": "12.0 - 15.5 g/dL", "status": LabResult.NORMAL},
            {"name": "Platelets", "value": "250 x 10^3/µL", "reference_range": "150 - 450 x 10^3/µL", "status": LabResult.NORMAL},
            {"name": "Urine hCG (Pregnancy)", "value": "Negative", "reference_range": "Negative", "status": LabResult.NORMAL},
            {"name": "Serum Creatinine", "value": "0.8 mg/dL", "reference_range": "0.6 - 1.1 mg/dL", "status": LabResult.NORMAL},
        ],
        "differentials": [
            {"diagnosis": "Acute Appendicitis", "correct": True, "feedback": "Correct! The migratory nature of the pain (periumbilical to RLQ), combined with systemic signs (fever, leukocytosis with neutrophilic shift), nausea/vomiting, McBurney's tenderness, guarding, and rebound, is a classic presentation of acute appendicitis. Operative intervention (laparoscopic appendectomy) is the definitive standard of care."},
            {"diagnosis": "Ruptured Ectopic Pregnancy", "correct": False, "feedback": "Incorrect. While ectopic pregnancy can cause acute RLQ pain and pelvic tenderness, her urine hCG is strictly negative, which rules out active pregnancy."},
            {"diagnosis": "Ovarian Torsion", "correct": False, "feedback": "Incorrect. Ovarian torsion presents with sudden-onset, severe, unilateral pelvic pain, often colicky, and may have a history of ovarian cysts. While possible, the classic migratory pain, fever, high WBC count, and localized peritoneal signs make appendicitis far more probable. However, ultrasound would be used to differentiate if diagnosis were ambiguous."},
            {"diagnosis": "Pelvic Inflammatory Disease (PID)", "correct": False, "feedback": "Incorrect. PID presents with bilateral lower abdominal pain, cervical motion tenderness (Chandelier sign), purulent vaginal discharge, and dyspareunia. This patient lacks these features, and her pain is highly localized to McBurney's point."},
        ],
    },
    {
        "key": "case-102",
        "title": "62-Year-Old with Acute Chest Pain",
        "subject": "Cardiology",
        "difficulty": "Advanced",
        "tags": ["ACS", "STEMI", "ECG"],
        "estimated_minutes": 20,
        "presenting_complaint": "Crushing central chest pain for 40 minutes, radiating to the left arm.",
        "history_of_present_illness": "A 62-year-old male with hypertension and a 30 pack-year smoking history describes sudden retrosternal pressure while walking, associated with diaphoresis and nausea. The pain is not relieved by rest and he feels clammy and short of breath.",
        "past_medical_history": "Hypertension, dyslipidaemia, no prior cardiac events, no drug allergies.",
        "final_diagnosis": "Inferior ST-Elevation Myocardial Infarction (STEMI)",
        "discussion": "Inferior STEMI usually reflects occlusion of the right coronary artery. Obtain right-sided and posterior leads to look for RV involvement; RV infarction is preload dependent, so nitrates can precipitate profound hypotension. Reperfusion (primary PCI within 90 minutes of first medical contact) is the treatment of choice, alongside dual antiplatelet therapy, anticoagulation, and high-intensity statin.",
        "physical_exam": {
            "general": "Diaphoretic, anxious, sitting upright and clutching the chest.",
            "vitals": "Temp 36.8°C, HR 96 bpm (irregular), BP 108/68 mmHg, RR 22 bpm, SpO2 95% on room air.",
            "cardiovascular": "Irregularly irregular rhythm. No murmur. Elevated JVP.",
            "respiratory": "Bibasal inspiratory crackles, no wheeze.",
            "abdomen": "Soft, non-tender, no bruit, no organomegaly.",
            "neurological": "Alert, oriented, no focal deficit.",
        },
        "labs": [
            {"name": "Troponin I (high-sensitivity)", "value": "480 ng/L", "reference_range": "< 14 ng/L", "status": LabResult.HIGH},
            {"name": "Potassium", "value": "3.2 mmol/L", "reference_range": "3.5 - 5.1 mmol/L", "status": LabResult.LOW},
            {"name": "Creatinine", "value": "1.0 mg/dL", "reference_range": "0.6 - 1.1 mg/dL", "status": LabResult.NORMAL},
        ],
        "differentials": [
            {"diagnosis": "Inferior STEMI", "correct": True, "feedback": "Correct. ST elevation in II, III and aVF with reciprocal depression in I and aVL plus a raised troponin is an inferior STEMI. Activate the cath lab immediately."},
            {"diagnosis": "Unstable Angina", "correct": False, "feedback": "Incorrect. Unstable angina produces ischaemic changes (T-wave inversion or ST depression) without persistent ST elevation, and troponin is typically normal."},
            {"diagnosis": "Acute Pericarditis", "correct": False, "feedback": "Incorrect. Pericarditis gives diffuse concave ST elevation with PR depression and positional, pleuritic pain rather than a territorial distribution."},
        ],
    },
    {
        "key": "case-103",
        "title": "Sudden Onset Unilateral Weakness",
        "subject": "Neurology",
        "difficulty": "Advanced",
        "tags": ["Stroke", "tPA decision", "NIHSS"],
        "estimated_minutes": 25,
        "presenting_complaint": "Right-sided weakness and inability to speak, onset 70 minutes ago.",
        "history_of_present_illness": "A 71-year-old woman was found by her daughter unable to move her right arm or leg, with garbled, non-fluent speech. She takes warfarin for atrial fibrillation and last felt well at breakfast about 70 minutes before arrival.",
        "past_medical_history": "Atrial fibrillation on warfarin, hypertension, hyperlipidaemia. No prior stroke or haemorrhage.",
        "final_diagnosis": "Acute Ischaemic Stroke — Left Middle Cerebral Artery Territory",
        "discussion": "Non-contrast CT is the first test to exclude haemorrhage. Within 4.5 hours of a clearly defined onset, IV thrombolysis (alteplase or tenecteplase) is indicated after checking contraindications — including a therapeutic INR. Mechanical thrombectomy is offered for large-vessel occlusion, and the door-to-needle target is under 60 minutes.",
        "physical_exam": {
            "general": "Alert but aphasic, unable to follow two-step commands.",
            "vitals": "Temp 36.9°C, HR 104 bpm (irregularly irregular), BP 176/94 mmHg, RR 18 bpm, SpO2 97%.",
            "cardiovascular": "Irregularly irregular pulse, no murmur, no carotid bruit.",
            "respiratory": "Clear to auscultation, gag reflex intact.",
            "abdomen": "Soft and non-tender.",
            "neurological": "Right-sided hemianopia with dense right hemiparesis and expressive aphasia; no meningism.",
        },
        "labs": [
            {"name": "INR", "value": "2.6", "reference_range": "0.8 - 1.2", "status": LabResult.HIGH},
            {"name": "Glucose", "value": "112 mg/dL", "reference_range": "70 - 140 mg/dL", "status": LabResult.NORMAL},
            {"name": "Platelets", "value": "212 x 10^3/µL", "reference_range": "150 - 450 x 10^3/µL", "status": LabResult.NORMAL},
        ],
        "differentials": [
            {"diagnosis": "Ischaemic Stroke (left MCA)", "correct": True, "feedback": "Correct. Dense right hemiparesis with expressive aphasia localises to the left MCA territory. The therapeutic INR excludes thrombolysis, so proceed to CT angiography and consider thrombectomy if a large vessel is occluded."},
            {"diagnosis": "Intracerebral Haemorrhage", "correct": False, "feedback": "Incorrect. Haemorrhage is excluded by non-contrast CT; it is the key test before any reperfusion decision."},
            {"diagnosis": "Hypoglycaemic Encephalopathy", "correct": False, "feedback": "Incorrect. Glucose is 112 mg/dL, so hypoglycaemia can be ruled out as a stroke mimic."},
        ],
    },
    {
        "key": "case-104",
        "title": "Young Woman with Butterfly Rash",
        "subject": "Rheumatology",
        "difficulty": "Beginner",
        "tags": ["SLE", "Autoimmune", "ANA"],
        "estimated_minutes": 12,
        "presenting_complaint": "Fatigue, joint pains and a facial rash for six weeks.",
        "history_of_present_illness": "A 27-year-old woman reports symmetric hand and wrist arthralgia with morning stiffness, mouth ulcers, hair thinning and a photosensitive rash over both cheeks. She has had two episodes of pleuritic chest pain in the past year.",
        "past_medical_history": "No chronic illness, no regular medication, family history of autoimmune thyroid disease.",
        "final_diagnosis": "Systemic Lupus Erythematosus",
        "discussion": "SLE is a multisystem autoimmune disease with a strong female predominance. The malar (butterfly) rash spares the nasolabial folds, which helps distinguish it from seborrhoeic dermatitis. ANA is highly sensitive but not specific; anti-dsDNA and anti-Smith are more specific and anti-dsDNA titres track activity. Hydroxychloroquine is the backbone of treatment, with immunosuppression for organ-threatening disease.",
        "physical_exam": {
            "general": "Well-looking but tired, no pallor or jaundice.",
            "vitals": "Temp 37.4°C, HR 84 bpm, BP 118/72 mmHg, RR 16 bpm, SpO2 99%.",
            "cardiovascular": "Normal heart sounds, no rub, no murmur.",
            "respiratory": "Reduced bibasal excursion, clear on auscultation.",
            "abdomen": "Soft, non-tender, no hepatosplenomegaly.",
            "neurological": "Normal cranial nerves and power; no focal deficit.",
        },
        "labs": [
            {"name": "ANA", "value": "Positive 1:640 (speckled)", "reference_range": "Negative", "status": LabResult.HIGH},
            {"name": "Anti-dsDNA", "value": "Positive", "reference_range": "Negative", "status": LabResult.HIGH},
            {"name": "C3 complement", "value": "0.62 g/L", "reference_range": "0.9 - 1.8 g/L", "status": LabResult.LOW},
        ],
        "differentials": [
            {"diagnosis": "Systemic Lupus Erythematosus", "correct": True, "feedback": "Correct. Malar rash, photosensitivity, oral ulcers, arthralgia, serositis and a positive ANA with anti-dsDNA and low complement fulfil the classification criteria."},
            {"diagnosis": "Dermatomyositis", "correct": False, "feedback": "Incorrect. Dermatomyositis gives heliotrope eyelids and Gottron papules with proximal muscle weakness and raised CK — not a sparing-nasolabial-fold malar rash."},
            {"diagnosis": "Rheumatoid Arthritis", "correct": False, "feedback": "Incorrect. RA causes erosive symmetric small-joint synovitis with anti-CCP positivity but does not explain the rash, ulcers or serositis."},
        ],
    },
    {
        "key": "case-105",
        "title": "Infant with Fever and Bulging Fontanelle",
        "subject": "Pediatrics",
        "difficulty": "Intermediate",
        "tags": ["Meningitis", "Lumbar puncture", "Pediatric emergency"],
        "estimated_minutes": 15,
        "presenting_complaint": "Eight-month-old with fever, irritability and vomiting for 12 hours.",
        "history_of_present_illness": "The infant has been increasingly inconsolable and has vomited after every feed. He is not fully vaccinated, having missed the 6-month schedule, and has had a mild runny nose for two days.",
        "past_medical_history": "Born at term, uncomplicated delivery, immunisations incomplete.",
        "final_diagnosis": "Bacterial Meningitis (Streptococcus pneumoniae)",
        "discussion": "In infants the meningeal signs are unreliable — a bulging fontanelle, poor feeding, lethargy and irritability are the red flags. Start empiric ceftriaxone plus vancomycin immediately after blood cultures; dexamethasone reduces hearing loss in pneumococcal disease. Lumbar puncture is performed once the infant is stable, deferred only if there are focal deficits or signs of raised intracranial pressure.",
        "physical_exam": {
            "general": "Fretful, consolable only when held, poor eye contact, no rash.",
            "vitals": "Temp 39.1°C, HR 168 bpm, BP 84/52 mmHg, RR 40 bpm, cap refill 3 seconds.",
            "cardiovascular": "Tachycardic, normal heart sounds, warm peripheries.",
            "respiratory": "Clear breath sounds, no recession.",
            "abdomen": "Soft, no guarding, no organomegaly.",
            "neurological": "Bulging anterior fontanelle, neck stiffness, high-pitched cry, no focal deficit.",
        },
        "labs": [
            {"name": "White Blood Cell (WBC)", "value": "21.4 x 10^3/µL", "reference_range": "6.0 - 17.5 x 10^3/µL", "status": LabResult.HIGH},
            {"name": "C-reactive protein", "value": "148 mg/L", "reference_range": "< 5 mg/L", "status": LabResult.HIGH},
            {"name": "CSF glucose", "value": "28 mg/dL", "reference_range": "40 - 70 mg/dL", "status": LabResult.LOW},
        ],
        "differentials": [
            {"diagnosis": "Bacterial Meningitis", "correct": True, "feedback": "Correct. Fever, bulging fontanelle, neck stiffness and neutrophilic pleocytosis with low CSF glucose in an under-vaccinated infant — start empiric antibiotics without delay."},
            {"diagnosis": "Febrile Seizure", "correct": False, "feedback": "Incorrect. A simple febrile seizure occurs in a well-appearing child between 6 months and 5 years and is followed by a normal neurological examination."},
            {"diagnosis": "Viral Meningitis", "correct": False, "feedback": "Incorrect. Viral meningitis typically produces a lymphocytic pleocytosis with normal glucose and only mildly raised protein, and the infant usually appears less toxic."},
        ],
    },
    {
        "key": "case-106",
        "title": "Diabetic with Altered Mental Status",
        "subject": "Endocrinology",
        "difficulty": "Intermediate",
        "tags": ["DKA", "HHS", "Glucose management"],
        "estimated_minutes": 15,
        "presenting_complaint": "Nausea, abdominal pain and drowsiness in a known type 1 diabetic.",
        "history_of_present_illness": "A 22-year-old man with type 1 diabetes has had three days of polyuria, polydipsia and vomiting after an upper respiratory infection. He omitted insulin when he stopped eating. His breath smells of acetone and he is increasingly drowsy.",
        "past_medical_history": "Type 1 diabetes for 9 years on basal-bolus insulin, no other medication.",
        "final_diagnosis": "Diabetic Ketoacidosis",
        "discussion": "DKA is defined by hyperglycaemia, ketonaemia and a metabolic acidosis with an elevated anion gap. Treatment is intravenous 0.9% saline, a fixed-rate insulin infusion, and meticulous potassium replacement — total body potassium is depleted even when the serum value looks normal, and insulin drives it intracellularly. Add dextrose once glucose falls below 200 mg/dL so the insulin infusion can continue until ketones clear.",
        "physical_exam": {
            "general": "Drowsy but rousable, deep sighing respiration, dry mucous membranes, acetone breath.",
            "vitals": "Temp 37.8°C, HR 118 bpm, BP 102/64 mmHg, RR 28 bpm (Kussmaul), SpO2 98%.",
            "cardiovascular": "Tachycardic, volume depleted, no murmur.",
            "respiratory": "Deep Kussmaul breathing, clear chest.",
            "abdomen": "Diffuse tenderness without guarding or rebound.",
            "neurological": "GCS 14, oriented to person only, no focal deficit.",
        },
        "labs": [
            {"name": "Glucose", "value": "486 mg/dL", "reference_range": "70 - 140 mg/dL", "status": LabResult.HIGH},
            {"name": "Beta-hydroxybutyrate", "value": "6.8 mmol/L", "reference_range": "< 0.6 mmol/L", "status": LabResult.HIGH},
            {"name": "Potassium", "value": "4.1 mmol/L", "reference_range": "3.5 - 5.1 mmol/L", "status": LabResult.NORMAL},
        ],
        "differentials": [
            {"diagnosis": "Diabetic Ketoacidosis", "correct": True, "feedback": "Correct. Hyperglycaemia with ketonaemia, anion-gap acidosis and Kussmaul breathing after insulin omission is DKA. Note the normal potassium — total body stores are depleted and will fall with insulin."},
            {"diagnosis": "Hyperosmolar Hyperglycaemic State", "correct": False, "feedback": "Incorrect. HHS occurs in type 2 diabetes with markedly higher glucose and osmolality, minimal ketones and a less severe acidosis."},
            {"diagnosis": "Acute Pancreatitis", "correct": False, "feedback": "Incorrect. Pancreatitis can cause abdominal pain and hyperglycaemia, but the ketonaemia and anion-gap acidosis here point to DKA as the unifying diagnosis."},
        ],
    },
]

CASE_PROGRESS = [
    {"case": "case-101", "status": "in-progress", "completed_steps": 2},
    {"case": "case-104", "status": "completed", "completed_steps": 6},
    {"case": "case-106", "status": "completed", "completed_steps": 5},
]

QUIZ_QUESTIONS = [
    {
        "key": "qq-1",
        "subject": "Pulmonology",
        "yield_rating": QuizQuestion.HIGH,
        "block": "Cardio & Pulm",
        "vignette": "A 54-year-old male is brought to the emergency department because of sudden, severe shortness of breath and right-sided pleuritic chest pain that began 2 hours ago. He recently underwent a total hip replacement 10 days ago. On physical examination, he is tachycardic (HR 118 bpm) and tachypneic (RR 26 bpm). Pulse oximetry shows 88% on room air. Standard chest radiograph is normal. Which of the following is the most appropriate next step in diagnosis?",
        "options": [
            "Transthoracic echocardiogram",
            "CT pulmonary angiography (CTPA)",
            "D-dimer assay",
            "Ventilation-perfusion (V/Q) scan",
            "Duplex venous ultrasonography of the lower extremities",
        ],
        "correct_answer": 1,
        "explanation": "The clinical picture describes a patient with high pretest probability for a Pulmonary Embolism (PE), characterized by sudden dyspnea, pleuritic chest pain, tachycardia, tachypnea, hypoxemia, and a clear risk factor (major orthopedic surgery within 4 weeks, representing Virchow's triad: stasis, hypercoagulability, and endothelial injury). For patients with high pretest probability (Wells Score > 4), the next step is diagnostic imaging, and CT Pulmonary Angiography (CTPA) is the preferred gold standard diagnostic test. D-dimer is highly sensitive but non-specific, and is only appropriate for ruling out PE in low pretest probability cases.",
    },
    {
        "key": "qq-2",
        "subject": "Pediatrics / Infectious Disease",
        "yield_rating": QuizQuestion.HIGH,
        "block": "Pediatrics",
        "vignette": 'A 3-year-old girl is brought to the clinic by her mother due to a barky cough, hoarseness, and inspiratory stridor. The symptoms started 2 days ago as a mild rhinorrhea and low-grade fever, but worsened significantly overnight. On examination, the child is anxious, has mild subcostal retractions, and a distinct "seal-like" cough is heard. What is the primary etiologic agent of this condition?',
        "options": [
            "Respiratory syncytial virus (RSV)",
            "Parainfluenza virus type 1",
            "Adenovirus",
            "Haemophilus influenzae type b",
            "Bordetella pertussis",
        ],
        "correct_answer": 1,
        "explanation": 'This child is presenting with Croup (laryngotracheobronchitis), which is characterized by the classic "seal-like" barking cough, hoarseness, and inspiratory stridor, typically preceded by standard URI symptoms. The primary etiologic agent of croup is Parainfluenza virus (specifically Type 1). RSV is the primary cause of bronchiolitis in infants. H. influenzae b causes acute epiglottitis (toxic child, high fever, drooling, tripod position). Pertussis causes whooping cough (paroxysms of cough followed by an inspiratory whoop).',
    },
    {
        "key": "qq-3",
        "subject": "Rheumatology / Orthopedics",
        "yield_rating": QuizQuestion.HIGH,
        "block": "MSK",
        "vignette": "A 65-year-old female with a long-standing history of rheumatoid arthritis presents with a 2-day history of a swollen, extremely painful left knee. She is unable to bear weight. On exam, the left knee is warm, erythematous, and has a large effusion. Arthrocentesis is performed, yielding purulent fluid. Gram stain demonstrates Gram-positive cocci in clusters. Joint fluid analysis shows a leukocyte count of 85,000/µL with 92% neutrophils. What is the most appropriate initial management?",
        "options": [
            "Oral amoxicillin/clavulanate and rest",
            "Intra-articular corticosteroid injection",
            "Intravenous vancomycin and joint aspiration/drainage",
            "Intravenous ceftriaxone alone",
            "Colchicine and NSAID therapy",
        ],
        "correct_answer": 2,
        "explanation": "The patient presents with septic arthritis (warm, swollen, exquisitely painful joint, inability to bear weight, synovial fluid WBC > 50,000/µL with neutrophil predominance). Gram-positive cocci in clusters strongly indicate Staphylococcus aureus. Septic arthritis is a medical emergency that can rapidly destroy articular cartilage. Treatment requires immediate intravenous antibiotics (typically Vancomycin to cover MRSA empirically, tailored once cultures return) and joint source control via aspiration, arthroscopy, or open arthrotomy to drain the purulent effusion.",
    },
]

APPLICATIONS = [
    {"name": "Dr. Nadia Ferhat", "email": "nadia.ferhat@gmail.com", "specialty": "Gastroenterology", "days_ago": 2, "status": InstructorApplication.PENDING},
    {"name": "Dr. Youcef Brahimi", "email": "y.brahimi@chu.dz", "specialty": "Endocrinology", "days_ago": 4, "status": InstructorApplication.PENDING},
    {"name": "Dr. Amina Belkacemi", "email": "amina.b@med.edu", "specialty": "Hematology", "days_ago": 6, "status": InstructorApplication.PENDING},
    {"name": "Dr. Rachid Tlemceni", "email": "r.tlemceni@gmail.com", "specialty": "Rheumatology", "days_ago": 10, "status": InstructorApplication.APPROVED},
    {"name": "Dr. Zineb Aouari", "email": "zineb.a@hospital.net", "specialty": "Dermatology", "days_ago": 14, "status": InstructorApplication.REJECTED},
]

SUBJECT_MASTERY = [
    ("Cardiology", 88, 95),
    ("Pulmonology", 74, 70),
    ("Renal / Nephrology", 62, 48),
    ("Endocrinology", 81, 65),
    ("Pediatrics", 69, 64),
]

REVIEW_HISTORY = [
    ("Mon", 15, 80),
    ("Tue", 22, 72),
    ("Wed", 18, 83),
    ("Thu", 25, 76),
    ("Fri", 12, 90),
    ("Sat", 30, 81),
    ("Sun", 12, 78),
]

TRANSACTIONS = [
    {"type": Transaction.ENROLLMENT, "description": "The Cardio Sprint — new enrollment", "amount": 49, "hours_ago": 1, "status": Transaction.COMPLETED},
    {"type": Transaction.ENROLLMENT, "description": "ECG Masterclass — new enrollment", "amount": 29, "hours_ago": 3, "status": Transaction.COMPLETED},
    {"type": Transaction.PAYOUT, "description": "Monthly payout — August 2026", "amount": -8200, "days_ago": 8, "status": Transaction.COMPLETED},
    {"type": Transaction.ENROLLMENT, "description": "The Cardio Sprint — new enrollment", "amount": 49, "days_ago": 2, "status": Transaction.COMPLETED},
    {"type": Transaction.ENROLLMENT, "description": "ECG Masterclass — new enrollment", "amount": 29, "days_ago": 3, "status": Transaction.COMPLETED},
    {"type": Transaction.PAYOUT, "description": "Pending payout — September 2026", "amount": -3280, "days_ago": -5, "status": Transaction.PENDING},
]

HISTORIC_REVENUE = [
    (6, 4200),
    (5, 5800),
    (4, 6100),
    (3, 7400),
    (2, 8900),
    (1, 8200),
]

ACTIVITIES = [
    {"type": StudyActivity.FLASHCARD, "title": "Reviewed Aortic Dissection Card", "minutes_ago": 20, "status": "Completed"},
    {"type": StudyActivity.QUIZ, "title": "Finished Cardio & Pulm QBank Block", "minutes_ago": 120, "status": "85% Correct"},
    {"type": StudyActivity.CASE, "title": "Began Case 101: Acute Abdominal Pain", "days_ago": 1, "status": "In Progress"},
]


def upsert(model, key: str, lookup: dict, defaults: dict):
    """Create with a deterministic id, or refresh the existing row in place.

    `update_or_create(..., defaults={"id": ...})` would try to move the primary
    key on every re-run, so ids are only assigned on the create path.
    """

    obj = model.objects.filter(**lookup).first()
    if obj is None:
        obj = model(id=deterministic_uuid(key), **lookup, **defaults)
    else:
        for field, value in {**lookup, **defaults}.items():
            setattr(obj, field, value)
    obj.save()
    return obj


class Command(BaseCommand):
    help = "Load the Tiryaq demo catalogue, study content and demo accounts."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete previously seeded rows before re-inserting them.",
        )
        parser.add_argument(
            "--password",
            default=getattr(settings, "DEMO_PASSWORD", "password"),
            help="Password assigned to the demo accounts.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        password = options["password"]

        if options["reset"]:
            self._reset()

        student = self._seed_users(password)
        profiles = self._seed_instructors(password)
        courses = self._seed_courses(profiles)
        self._seed_reviews(courses)
        self._seed_enrollment(student, courses)
        decks = self._seed_flashcards()
        self._seed_cases()
        self._seed_case_progress(student)
        self._seed_quiz()
        self._seed_live_sessions(profiles, courses)
        self._seed_applications()
        self._seed_billing(profiles, courses)
        self._seed_analytics(student)

        self.stdout.write(self.style.SUCCESS("Demo data ready."))
        self.stdout.write(f"  student     Aya.Zmt@tiryaq.com / {password}")
        self.stdout.write(f"  instructor  amine.haddad@tiryaq.com / {password}")
        self.stdout.write(f"  admin       admin@tiryaq.com / {password}")
        self.stdout.write(f"  {len(courses)} courses · {len(decks)} decks")

    # ── internal helpers ────────────────────────────────────────────────────

    def _reset(self):
        self.stdout.write("Clearing seeded rows…")
        from apps.accounts.constants import DEMO_ACCOUNTS

        Transaction.objects.all().delete()
        LiveSession.objects.all().delete()
        Enrollment.objects.all().delete()
        CartItem.objects.all().delete()
        CourseReview.objects.all().delete()
        Course.objects.all().delete()
        InstructorApplication.objects.all().delete()
        Flashcard.objects.all().delete()
        Deck.objects.all().delete()
        ClinicalCase.objects.all().delete()
        QuizQuestion.objects.all().delete()
        StudyActivity.objects.all().delete()
        StudyProgress.objects.all().delete()
        SubjectMastery.objects.all().delete()
        ReviewHistoryEntry.objects.all().delete()
        User.objects.filter(
            email__in=[account["email"] for account in DEMO_ACCOUNTS.values()]
        ).delete()

    def _upsert_user(self, *, key, email, name, role, password, **extra):
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User(id=deterministic_uuid(key), email=email, username=email)

        user.email = email
        user.username = email
        user.name = name
        user.role = role
        for field, value in extra.items():
            setattr(user, field, value)
        user.set_password(password)
        user.is_active = True
        user.save()
        return user

    def _seed_users(self, password):
        from apps.accounts.constants import DEMO_ACCOUNTS

        admin_account = DEMO_ACCOUNTS[ADMIN]
        self._upsert_user(
            key="user-admin",
            email=admin_account["email"],
            name=admin_account["name"],
            role=ADMIN,
            password=password,
            is_staff=True,
            is_superuser=True,
        )

        student_account = DEMO_ACCOUNTS[STUDENT]
        return self._upsert_user(
            key="user-student",
            email=student_account["email"],
            name=student_account["name"],
            role=STUDENT,
            password=password,
            year=student_account.get("year", "MS-V"),
        )

    def _seed_instructors(self, password):
        profiles = {}
        for entry in INSTRUCTORS:
            user = self._upsert_user(
                key=f"user-{entry['key']}",
                email=entry["email"],
                name=entry["name"],
                role=INSTRUCTOR,
                password=password,
            )
            profile, _ = InstructorProfile.objects.update_or_create(
                user=user,
                defaults={
                    "specialty": entry["specialty"],
                    "rating": entry["rating"],
                    "student_count": entry["student_count"],
                    "bio": entry["bio"],
                    "is_verified": True,
                },
            )
            profiles[entry["key"]] = profile
        return profiles

    def _seed_courses(self, profiles):
        courses = {}
        for entry in COURSES:
            course = upsert(
                Course,
                entry["key"],
                lookup={"slug": entry["slug"]},
                defaults={
                    "instructor": profiles[entry["instructor"]],
                    "title": entry["title"],
                    "specialty": entry["specialty"],
                    "level": entry["level"],
                    "price": entry["price"],
                    "original_price": entry.get("original_price"),
                    "rating": entry["rating"],
                    "review_count": entry["review_count"],
                    "student_count": entry["student_count"],
                    "lesson_count": entry["lesson_count"],
                    "duration": entry["duration"],
                    "description": entry["description"],
                    "badges": entry["badges"],
                    "status": entry["status"],
                },
            )
            courses[entry["key"]] = course

            for module_index, module in enumerate(entry["modules"], start=1):
                # Module/lesson keys repeat across courses, so namespace them.
                module_key = f"{entry['key']}-{module['key']}"
                module_obj = upsert(
                    CourseModule,
                    module_key,
                    lookup={"course": course, "order": module_index},
                    defaults={"title": module["title"]},
                )
                for lesson_index, lesson in enumerate(module["lessons"], start=1):
                    lesson_obj = upsert(
                        Lesson,
                        f"{module_key}-{lesson['key']}",
                        lookup={"module": module_obj, "order": lesson_index},
                        defaults={
                            "title": lesson["title"],
                            "duration": lesson["duration"],
                            "type": lesson["type"],
                            "free": lesson["free"],
                        },
                    )
                    for resource in lesson.get("resources", []):
                        LessonResource.objects.update_or_create(
                            lesson=lesson_obj,
                            name=resource["name"],
                            defaults={
                                "type": resource["type"],
                                "size": resource["size"],
                            },
                        )
        return courses

    def _seed_reviews(self, courses):
        for entry in COURSE_REVIEWS:
            course = courses[entry["course"]]
            CourseReview.objects.update_or_create(
                course=course,
                author_name=entry["author"],
                defaults={"rating": entry["rating"], "body": entry["body"]},
            )

    def _seed_enrollment(self, student, courses):
        """The demo student is already partway through The Cardio Sprint."""

        course = courses["course-1"]
        enrollment, _ = Enrollment.objects.update_or_create(
            user=student,
            course=course,
            defaults={"progress": 34},
        )
        completed_keys = ["course-1-m-1-l-1-1", "course-1-m-1-l-1-2", "course-1-m-2-l-2-1"]
        for key in completed_keys:
            lesson = Lesson.objects.filter(id=deterministic_uuid(key)).first()
            if lesson:
                enrollment.completed_lessons.add(lesson)

    def _seed_flashcards(self):
        decks = {}
        for entry in FLASHCARD_DECKS:
            deck = upsert(
                Deck,
                entry["key"],
                lookup={"subject": entry["subject"], "name": entry["name"]},
                defaults={"is_system": True},
            )
            decks[entry["key"]] = deck

        default_difficulty = {
            "fc-1": Flashcard.GOOD,
            "fc-2": Flashcard.GOOD,
            "fc-3": Flashcard.HARD,
            "fc-4": Flashcard.EASY,
        }
        for entry in FLASHCARDS:
            Flashcard.objects.update_or_create(
                id=deterministic_uuid(entry["key"]),
                defaults={
                    "deck": decks[entry["deck"]],
                    "vignette": entry["vignette"],
                    "diagnosis": entry["diagnosis"],
                    "rationale": entry["rationale"],
                    "subject": entry["subject"],
                    "interval_days": entry["interval_days"],
                    "ease_factor": entry["ease_factor"],
                    "next_review_date": timezone.now(),
                    "difficulty": entry.get("difficulty") or default_difficulty.get(entry["key"]),
                },
            )
        return decks

    def _seed_cases(self):
        for order, entry in enumerate(CLINICAL_CASES, start=1):
            case, _ = ClinicalCase.objects.update_or_create(
                id=deterministic_uuid(entry["key"]),
                defaults={
                    "title": entry["title"],
                    "subject": entry["subject"],
                    "difficulty": entry.get("difficulty", ClinicalCase.INTERMEDIATE),
                    "tags": entry.get("tags", []),
                    "estimated_minutes": entry.get("estimated_minutes", 15),
                    "order": order,
                    "presenting_complaint": entry["presenting_complaint"],
                    "history_of_present_illness": entry["history_of_present_illness"],
                    "past_medical_history": entry["past_medical_history"],
                    "final_diagnosis": entry["final_diagnosis"],
                    "discussion": entry["discussion"],
                },
            )
            PhysicalExam.objects.update_or_create(
                case=case, defaults=dict(entry["physical_exam"])
            )
            for index, lab in enumerate(entry["labs"], start=1):
                LabResult.objects.update_or_create(
                    case=case,
                    name=lab["name"],
                    defaults={
                        "value": lab["value"],
                        "reference_range": lab["reference_range"],
                        "status": lab["status"],
                        "order": index,
                    },
                )
            for index, differential in enumerate(entry["differentials"], start=1):
                DifferentialDiagnosis.objects.update_or_create(
                    case=case,
                    diagnosis=differential["diagnosis"],
                    defaults={
                        "correct": differential["correct"],
                        "feedback": differential["feedback"],
                        "order": index,
                    },
                )

    def _seed_case_progress(self, student):
        for entry in CASE_PROGRESS:
            case = ClinicalCase.objects.filter(id=deterministic_uuid(entry["case"])).first()
            if case is None:
                continue
            total = case.total_steps
            completed = total if entry["status"] == "completed" else entry["completed_steps"]
            CaseProgress.objects.update_or_create(
                user=student,
                case=case,
                defaults={
                    "status": entry["status"],
                    "completed_steps": completed,
                    "total_steps": total,
                },
            )

    def _seed_quiz(self):
        for entry in QUIZ_QUESTIONS:
            QuizQuestion.objects.update_or_create(
                id=deterministic_uuid(entry["key"]),
                defaults={
                    "vignette": entry["vignette"],
                    "options": entry["options"],
                    "correct_answer": entry["correct_answer"],
                    "explanation": entry["explanation"],
                    "subject": entry["subject"],
                    "yield_rating": entry["yield_rating"],
                    "block": entry["block"],
                },
            )

    def _seed_live_sessions(self, profiles, courses):
        now = timezone.now()
        sessions = [
            {
                "key": "live-1",
                "title": "ECG Interpretation: Live Practice",
                "instructor": "inst-1",
                "course": "course-1",
                "scheduled_at": now - timedelta(minutes=30),
                "duration": "90m",
                "participant_count": 142,
                "max_participants": 200,
                "recording_available": False,
                "topic": "ACS pattern recognition and STEMI mimics",
            },
            {
                "key": "live-2",
                "title": "Stroke Syndromes Q&A",
                "instructor": "inst-2",
                "course": "course-2",
                "scheduled_at": now + timedelta(days=2),
                "duration": "60m",
                "participant_count": 0,
                "max_participants": 150,
                "recording_available": False,
                "topic": "Lateral medullary, locked-in syndrome, and top-of-basilar",
            },
            {
                "key": "live-3",
                "title": "Trauma Assessment Workshop",
                "instructor": "inst-3",
                "course": "course-3",
                "scheduled_at": now + timedelta(days=5),
                "duration": "120m",
                "participant_count": 0,
                "max_participants": 100,
                "recording_available": False,
                "topic": "ATLS primary and secondary survey walkthrough",
            },
            {
                "key": "live-4",
                "title": "Acid-Base Deep Dive",
                "instructor": "inst-4",
                "course": "course-4",
                "scheduled_at": now - timedelta(days=3),
                "duration": "90m",
                "participant_count": 89,
                "max_participants": 120,
                "recording_available": True,
                "topic": "Mixed acid-base disorders and compensation rules",
            },
            {
                "key": "live-5",
                "title": "Heart Failure Management Updates",
                "instructor": "inst-1",
                "course": "course-1",
                "scheduled_at": now - timedelta(days=7),
                "duration": "75m",
                "participant_count": 201,
                "max_participants": 200,
                "recording_available": True,
                "topic": "GDMT, SGLT2 inhibitors, and device therapy",
            },
        ]

        for entry in sessions:
            session = LiveSession(
                id=deterministic_uuid(entry["key"]),
                title=entry["title"],
                topic=entry["topic"],
                instructor=profiles[entry["instructor"]],
                course=courses.get(entry["course"]),
                scheduled_at=entry["scheduled_at"],
                duration=entry["duration"],
                participant_count=entry["participant_count"],
                max_participants=entry["max_participants"],
                recording_available=entry["recording_available"],
            )
            session.status = session.computed_status()
            upsert(
                LiveSession,
                entry["key"],
                lookup={"title": entry["title"]},
                defaults={
                    "topic": session.topic,
                    "instructor": session.instructor,
                    "course": session.course,
                    "scheduled_at": session.scheduled_at,
                    "duration": session.duration,
                    "participant_count": session.participant_count,
                    "max_participants": session.max_participants,
                    "status": session.status,
                    "recording_available": session.recording_available,
                },
            )

    def _seed_applications(self):
        now = timezone.now()
        for entry in APPLICATIONS:
            application, _ = InstructorApplication.objects.update_or_create(
                email=entry["email"],
                defaults={
                    "name": entry["name"],
                    "specialty": entry["specialty"],
                    "status": entry["status"],
                },
            )
            InstructorApplication.objects.filter(pk=application.pk).update(
                applied_at=now - timedelta(days=entry["days_ago"])
            )

    def _seed_billing(self, profiles, courses):
        profile = profiles["inst-1"]
        now = timezone.now()
        for index, entry in enumerate(TRANSACTIONS):
            date = now - timedelta(
                hours=entry.get("hours_ago", 0), days=entry.get("days_ago", 0)
            )
            Transaction.objects.update_or_create(
                instructor=profile,
                description=entry["description"],
                amount=entry["amount"],
                defaults={"type": entry["type"], "date": date, "status": entry["status"]},
            )

        for months_back, amount in HISTORIC_REVENUE:
            date = (now - timedelta(days=30 * months_back)).replace(day=15)
            Transaction.objects.update_or_create(
                instructor=profile,
                description=f"Historical enrollments — {date:%B %Y}",
                defaults={
                    "type": Transaction.ENROLLMENT,
                    "amount": amount,
                    "date": date,
                    "status": Transaction.COMPLETED,
                    "course": courses["course-1"],
                },
            )

    def _seed_analytics(self, student):
        progress, _ = StudyProgress.objects.update_or_create(
            user=student,
            defaults={
                "daily_goal": 20,
                "daily_completed": 12,
                "streak_days": 14,
                "total_cards_reviewed": 342,
                "accuracy_rate": 78.5,
                "total_hours_studied": 42.5,
                "cards_retention_rate": 86.4,
                "clinical_case_success_rate": 80.0,
                "last_study_date": timezone.localdate(),
            },
        )

        for subject, mastery, count in SUBJECT_MASTERY:
            SubjectMastery.objects.update_or_create(
                user=student,
                subject=subject,
                defaults={"mastery_percent": mastery, "count": count},
            )

        for order, (label, reviewed, accuracy) in enumerate(REVIEW_HISTORY, start=1):
            ReviewHistoryEntry.objects.update_or_create(
                user=student,
                label=label,
                defaults={
                    "reviewed_count": reviewed,
                    "accuracy": accuracy,
                    "order": order,
                },
            )

        now = timezone.now()
        for entry in ACTIVITIES:
            timestamp = now - timedelta(
                minutes=entry.get("minutes_ago", 0), days=entry.get("days_ago", 0)
            )
            StudyActivity.objects.update_or_create(
                user=student,
                title=entry["title"],
                defaults={
                    "type": entry["type"],
                    "status": entry["status"],
                    "timestamp": timestamp,
                },
            )

        return progress
