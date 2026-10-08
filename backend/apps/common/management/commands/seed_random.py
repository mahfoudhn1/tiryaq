"""Seed the database with randomised users and clinical content.

Unlike `seed_demo` (which mirrors the frozen fixtures the UI was built
against), this command invents fresh, varied data so you can poke at the app
with a busy-looking database: several students, instructors, courses,
flashcard decks and a batch of randomised clinical cases.

Everything it creates is marked so it can be removed again:

    python manage.py seed_random                      # 12 students, 12 cases
    python manage.py seed_random --students 20 --cases 30
    python manage.py seed_random --seed 42            # reproducible run

Every run first removes the rows a previous run created, so the command is
safe to repeat; changing `--seed` yields a fresh random batch. Random users
live on the `@random.tiryaq.dev` domain, random cases carry the "Random" tag,
and random questions sit in the "Random" block, which is how they are found
again for cleanup.
"""

import random
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.accounts.constants import ADMIN, INSTRUCTOR, STUDENT
from apps.accounts.models import InstructorProfile
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

RANDOM_DOMAIN = "random.tiryaq.dev"
RANDOM_TAG = "Random"
RANDOM_BLOCK = "Random"

FIRST_NAMES = [
    "Aya", "Yacine", "Nadia", "Rami", "Salma", "Mehdi", "Lina", "Walid",
    "Imane", "Farid", "Hiba", "Karim", "Sirine", "Adel", "Maya", "Nour",
    "Rayan", "Wafa", "Tarek", "Donia", "Sami", "Asma", "Zaki", "Rania",
]

LAST_NAMES = [
    "Benali", "Haddad", "Mansouri", "Ouali", "Chikh", "Brahimi", "Ferhat",
    "Belkacemi", "Tlemceni", "Aouari", "Zerrouki", "Boumediene", "Cherif",
    "Larbi", "Meziane", "Saadi", "Hamdi", "Guerroudj", "Nasri", "Yahiaoui",
]

SPECIALTIES = [
    "Cardiology", "Pulmonology", "Neurology", "Gastroenterology",
    "Endocrinology", "Nephrology", "Pediatrics", "Infectious Disease",
    "Rheumatology", "Emergency Medicine", "Hematology", "Dermatology",
    "Oncology", "Psychiatry", "General Surgery",
]

STUDENT_YEARS = ["MS-I", "MS-II", "MS-III", "MS-IV", "MS-V", "Intern", "PGY-1", "PGY-2"]

LEVELS = [Course.BEGINNER, Course.INTERMEDIATE, Course.ADVANCED]

DECK_SUBJECTS = [
    "Cardiology", "Pulmonology", "Neurology", "Endocrinology",
    "Nephrology", "Gastroenterology", "Pediatrics", "Infectious Disease",
    "Hematology", "Rheumatology",
]

FLASHCARD_FACTS = [
    ("Roth spots and a new murmur in a febrile patient with known valve disease",
     "Infective Endocarditis", "Cardiology"),
    ("Pulsus paradoxus with hypotension and distended neck veins after a penetrating chest wound",
     "Cardiac Tamponade", "Cardiology"),
    ("Young tall male with sudden severe pleuritic pain and absent breath sounds, hyperresonant percussion",
     "Spontaneous Pneumothorax", "Pulmonology"),
    ("Recurrent haemoptysis, epistaxis and telangiectasias on lips and tongue",
     "Hereditary Haemorrhagic Telangiectasia", "Pulmonology"),
    ("Sudden painless monocular vision loss with a pale retina and cherry-red spot",
     "Central Retinal Artery Occlusion", "Neurology"),
    ("Proximal muscle weakness, heliotrope rash and Gottron papules",
     "Dermatomyositis", "Rheumatology"),
    ("Polyuria, polydipsia and nocturia with fasting glucose of 7.8 mmol/L",
     "Type 2 Diabetes Mellitus", "Endocrinology"),
    ("Weight loss, heat intolerance and a diffuse goitre with raised TSI",
     "Graves Disease", "Endocrinology"),
    ("Oliguria with muddy-brown granular casts and a rising creatinine after hypotension",
     "Acute Tubular Necrosis", "Nephrology"),
    ("Hematemesis with spider naevi, caput medusae and splenomegaly",
     "Portal Hypertension / Variceal Bleed", "Gastroenterology"),
    ("Barky cough and inspiratory stridor in a toddler after a viral prodrome",
     "Croup", "Pediatrics"),
    ("Fever with petechiae and neck stiffness in an unvaccinated child",
     "Bacterial Meningitis", "Infectious Disease"),
    ("Pallor, glossitis and pica in a patient with a beef tapeworm",
     "Vitamin B12 Deficiency", "Hematology"),
    ("Confluent erythema with Nikolsky sign after starting a new anticonvulsant",
     "Toxic Epidermal Necrolysis", "Dermatology"),
]

CASE_BLUEPRINTS = [
    {
        "subject": "Pulmonology",
        "title": "Fever and Productive Cough",
        "difficulty": ClinicalCase.INTERMEDIATE,
        "severity": "moderate",
        "tags": ["Pneumonia", "CAP"],
        "minutes": 15,
        "complaint": "Fever, productive cough and right-sided pleuritic chest pain for three days.",
        "hpi": "A {age}-year-old {sex} presents with a three-day history of fever, a cough productive of rust-coloured sputum, and pleuritic right-sided chest pain worse on deep inspiration. There is no haemoptysis, night sweats or weight loss.",
        "pmh": "Type 2 diabetes, ex-smoker, no drug allergies.",
        "diagnosis": "Community-Acquired Pneumonia",
        "discussion": "Assess severity with CURB-65. Streptococcus pneumoniae is the commonest organism. Co-amoxiclav plus a macrolide is reasonable for moderate severity; think of atypical organisms when the presentation is more indolent and auscultation is unimpressive.",
        "exam": {
            "general": "Flushed and mildly unwell, sitting up but not distressed.",
            "vitals": "Temp {temp}°C, HR {hr} bpm, BP {bp_sys}/{bp_dia} mmHg, RR {rr} bpm, SpO2 {spo2}% on air.",
            "cardiovascular": "Tachycardic, regular, no murmur.",
            "respiratory": "Reduced expansion at the right base with coarse crackles and bronchial breathing.",
            "abdomen": "Soft, non-tender.",
            "neurological": "Alert and orientated.",
        },
        "labs": [
            {"name": "White Blood Cell (WBC)", "value": "16.2 x 10^3/µL", "reference_range": "4.5 - 11.0 x 10^3/µL", "status": LabResult.HIGH},
            {"name": "C-reactive protein", "value": "168 mg/L", "reference_range": "< 5 mg/L", "status": LabResult.HIGH},
            {"name": "Sodium", "value": "132 mmol/L", "reference_range": "135 - 145 mmol/L", "status": LabResult.LOW},
        ],
        "differentials": [
            {"diagnosis": "Community-Acquired Pneumonia", "correct": True, "feedback": "Correct. Focal crackles, bronchial breathing and a raised WBC/CRP with fever make pneumonia the unifying diagnosis."},
            {"diagnosis": "Pulmonary Embolism", "correct": False, "feedback": "Incorrect. PE favours a clear chest and sudden dyspnoea without coarse focal crackles."},
            {"diagnosis": "Pulmonary Oedema", "correct": False, "feedback": "Incorrect. Oedema gives bibasal fine crackles, orthopnoea and an elevated JVP, not focal consolidation."},
            {"diagnosis": "Bronchogenic Carcinoma", "correct": False, "feedback": "Incorrect. Malignancy presents insidiously with weight loss and haemoptysis, not an acute febrile illness."},
        ],
    },
    {
        "subject": "Pulmonology",
        "title": "Sudden Dyspnoea After Immobilisation",
        "difficulty": ClinicalCase.ADVANCED,
        "severity": "severe",
        "tags": ["Pulmonary embolism", "Thromboembolism"],
        "minutes": 18,
        "complaint": "Sudden severe shortness of breath and pleuritic chest pain.",
        "hpi": "A {age}-year-old {sex} develops abrupt breathlessness and sharp chest pain while recovering from a long-haul flight. There has been no fever or productive cough.",
        "pmh": "Recent below-knee cast for an ankle fracture, combined oral contraceptive pill.",
        "diagnosis": "Pulmonary Embolism",
        "discussion": "Use the Wells score. A high pretest probability goes straight to CT pulmonary angiography; a low score with a negative D-dimer excludes PE. Anticoagulate immediately once the diagnosis is suspected unless contraindicated.",
        "exam": {
            "general": "Anxious, tachypnoeic and diaphoretic.",
            "vitals": "Temp 37.0°C, HR {hr} bpm, BP {bp_sys}/{bp_dia} mmHg, RR {rr} bpm, SpO2 {spo2}% on air.",
            "cardiovascular": "Tachycardic with a loud P2 and clear lungs.",
            "respiratory": "Clear to auscultation but marked tachypnoea; no wheeze.",
            "abdomen": "Soft, non-tender.",
            "neurological": "Alert; no syncope.",
        },
        "labs": [
            {"name": "D-dimer", "value": "2.9 mg/L FEU", "reference_range": "< 0.5 mg/L FEU", "status": LabResult.HIGH},
            {"name": "Troponin", "value": "62 ng/L", "reference_range": "< 14 ng/L", "status": LabResult.HIGH},
            {"name": "Arterial pH", "value": "7.49", "reference_range": "7.35 - 7.45", "status": LabResult.HIGH},
        ],
        "differentials": [
            {"diagnosis": "Pulmonary Embolism", "correct": True, "feedback": "Correct. Immobilisation, sudden dyspnoea, tachycardia and a raised D-dimer with clear lungs is classic PE; confirm with CTPA."},
            {"diagnosis": "Pneumothorax", "correct": False, "feedback": "Incorrect. A pneumothorax would reduce breath sounds and shift the trachea, and is not explained by immobilisation."},
            {"diagnosis": "Pneumonia", "correct": False, "feedback": "Incorrect. Pneumonia produces fever, focal crackles and sputum, none of which are present here."},
            {"diagnosis": "Acute Coronary Syndrome", "correct": False, "feedback": "Incorrect. ACS causes central crushing pain with ECG changes; the pleuritic pain and clear lungs favour PE."},
        ],
    },
    {
        "subject": "Cardiology",
        "title": "Crushing Central Chest Pain",
        "difficulty": ClinicalCase.ADVANCED,
        "severity": "severe",
        "tags": ["ACS", "STEMI"],
        "minutes": 20,
        "complaint": "Crushing central chest pain radiating to the jaw for 45 minutes.",
        "hpi": "A {age}-year-old {sex} describes sudden retrosternal pressure while at rest, radiating to the left arm and jaw, with sweating and nausea. It is not relieved by rest.",
        "pmh": "Hypertension, dyslipidaemia, current smoker.",
        "diagnosis": "ST-Elevation Myocardial Infarction",
        "discussion": "Activate primary PCI within 90 minutes of first medical contact. Give dual antiplatelet therapy, anticoagulation and analgesia. Inferior territory changes should prompt right-sided leads to look for RV involvement.",
        "exam": {
            "general": "Pale, clammy and distressed, clutching the chest.",
            "vitals": "Temp 36.7°C, HR {hr} bpm, BP {bp_sys}/{bp_dia} mmHg, RR {rr} bpm, SpO2 {spo2}% on air.",
            "cardiovascular": "Tachycardic, regular, no murmur, elevated JVP.",
            "respiratory": "Bibasal crackles.",
            "abdomen": "Soft, non-tender.",
            "neurological": "Alert and anxious, no focal deficit.",
        },
        "labs": [
            {"name": "High-sensitivity Troponin", "value": "512 ng/L", "reference_range": "< 14 ng/L", "status": LabResult.HIGH},
            {"name": "Potassium", "value": "3.4 mmol/L", "reference_range": "3.5 - 5.1 mmol/L", "status": LabResult.LOW},
            {"name": "Creatinine", "value": "1.1 mg/dL", "reference_range": "0.6 - 1.1 mg/dL", "status": LabResult.NORMAL},
        ],
        "differentials": [
            {"diagnosis": "ST-Elevation Myocardial Infarction", "correct": True, "feedback": "Correct. Persistent ST elevation in a territory with a strongly raised troponin is a STEMI — reperfuse immediately."},
            {"diagnosis": "Unstable Angina", "correct": False, "feedback": "Incorrect. Unstable angina gives dynamic ST depression or T inversion with a normal troponin."},
            {"diagnosis": "Aortic Dissection", "correct": False, "feedback": "Incorrect. Dissection produces tearing pain radiating to the back with pulse/blood-pressure differentials."},
            {"diagnosis": "Acute Pericarditis", "correct": False, "feedback": "Incorrect. Pericarditis causes positional pleuritic pain with diffuse concave ST elevation and PR depression."},
        ],
    },
    {
        "subject": "Cardiology",
        "title": "Palpitations and Irregular Pulse",
        "difficulty": ClinicalCase.INTERMEDIATE,
        "severity": "moderate",
        "tags": ["Atrial fibrillation", "Arrhythmia"],
        "minutes": 15,
        "complaint": "Palpitations and breathlessness for six hours.",
        "hpi": "A {age}-year-old {sex} reports the sudden onset of an irregular fast heartbeat with reduced exercise tolerance. There is no chest pain or syncope.",
        "pmh": "Hypertension on amlodipine; no prior arrhythmia.",
        "diagnosis": "Atrial Fibrillation with Rapid Ventricular Response",
        "discussion": "Control the rate with a beta-blocker or rate-limiting calcium channel blocker, and assess stroke risk with CHA2DS2-VASc before deciding on anticoagulation. Look for reversible precipitants such as thyrotoxicosis, sepsis and electrolyte disturbance.",
        "exam": {
            "general": "Comfortable at rest, mildly anxious.",
            "vitals": "Temp 36.9°C, HR {hr} bpm (irregularly irregular), BP {bp_sys}/{bp_dia} mmHg, RR {rr} bpm, SpO2 {spo2}% on air.",
            "cardiovascular": "Irregularly irregular pulse, no murmur, no JVP elevation.",
            "respiratory": "Clear to auscultation.",
            "abdomen": "Soft, non-tender.",
            "neurological": "Alert, no focal deficit.",
        },
        "labs": [
            {"name": "TSH", "value": "0.18 mIU/L", "reference_range": "0.4 - 4.0 mIU/L", "status": LabResult.LOW},
            {"name": "Potassium", "value": "3.9 mmol/L", "reference_range": "3.5 - 5.1 mmol/L", "status": LabResult.NORMAL},
            {"name": "Creatinine", "value": "0.9 mg/dL", "reference_range": "0.6 - 1.1 mg/dL", "status": LabResult.NORMAL},
        ],
        "differentials": [
            {"diagnosis": "Atrial Fibrillation with Rapid Ventricular Response", "correct": True, "feedback": "Correct. Irregularly irregular pulse with an uncontrolled rate is AF; rate-control and assess anticoagulation need."},
            {"diagnosis": "Atrial Flutter", "correct": False, "feedback": "Incorrect. Flutter is usually regular with a fixed block and saw-tooth flutter waves."},
            {"diagnosis": "Ventricular Tachycardia", "correct": False, "feedback": "Incorrect. VT is regular, broad-complex and typically causes haemodynamic compromise."},
            {"diagnosis": "Sinus Tachycardia", "correct": False, "feedback": "Incorrect. Sinus tachycardia is regular and has a clear physiological driver."},
        ],
    },
    {
        "subject": "Neurology",
        "title": "Sudden Unilateral Weakness",
        "difficulty": ClinicalCase.ADVANCED,
        "severity": "severe",
        "tags": ["Stroke", "Thrombolysis"],
        "minutes": 22,
        "complaint": "Right-sided weakness and difficulty speaking, onset one hour ago.",
        "hpi": "A {age}-year-old {sex} was suddenly unable to move the right arm and leg and speaks in short, effortful phrases. The last known well time was about one hour before arrival.",
        "pmh": "Atrial fibrillation, hypertension; anticoagulation status unclear.",
        "diagnosis": "Acute Ischaemic Stroke (Left Middle Cerebral Artery)",
        "discussion": "Non-contrast CT first excludes haemorrhage. Thrombolysis is considered within 4.5 hours of a clearly defined onset once contraindications are excluded; large-vessel occlusion may proceed to thrombectomy. The door-to-needle target is under 60 minutes.",
        "exam": {
            "general": "Alert but aphasic, unable to follow two-step commands.",
            "vitals": "Temp 36.8°C, HR {hr} bpm, BP {bp_sys}/{bp_dia} mmHg, RR {rr} bpm, SpO2 {spo2}%.",
            "cardiovascular": "Irregularly irregular pulse, no carotid bruit.",
            "respiratory": "Clear to auscultation, gag reflex intact.",
            "abdomen": "Soft, non-tender.",
            "neurological": "Dense right-sided hemiparesis with expressive aphasia and right hemianopia; no meningism.",
        },
        "labs": [
            {"name": "INR", "value": "2.8", "reference_range": "0.8 - 1.2", "status": LabResult.HIGH},
            {"name": "Glucose", "value": "118 mg/dL", "reference_range": "70 - 140 mg/dL", "status": LabResult.NORMAL},
            {"name": "Platelets", "value": "196 x 10^3/µL", "reference_range": "150 - 450 x 10^3/µL", "status": LabResult.NORMAL},
        ],
        "differentials": [
            {"diagnosis": "Acute Ischaemic Stroke (Left MCA)", "correct": True, "feedback": "Correct. Right hemiparesis with aphasia localises to the left MCA; a therapeutic INR contraindicates thrombolysis, so consider thrombectomy."},
            {"diagnosis": "Intracerebral Haemorrhage", "correct": False, "feedback": "Incorrect. Haemorrhage is excluded by the non-contrast CT before any reperfusion decision."},
            {"diagnosis": "Hypoglycaemic Encephalopathy", "correct": False, "feedback": "Incorrect. The glucose is normal, ruling out hypoglycaemia as a mimic."},
            {"diagnosis": "Complex Migraine", "correct": False, "feedback": "Incorrect. Migraine aura is typically positive (flashing lights, tingling) with a gradual march, not abrupt dense weakness."},
        ],
    },
    {
        "subject": "Neurology",
        "title": "Fever, Headache and Neck Stiffness",
        "difficulty": ClinicalCase.INTERMEDIATE,
        "severity": "severe",
        "tags": ["Meningitis", "Lumbar puncture"],
        "minutes": 18,
        "complaint": "Severe headache, fever and photophobia for 12 hours.",
        "hpi": "A {age}-year-old {sex} presents with a rapidly worsening headache, vomiting, photophobia and neck stiffness. Symptoms have escalated over half a day.",
        "pmh": "No chronic illness; immunisations up to date.",
        "diagnosis": "Bacterial Meningitis",
        "discussion": "Do not delay antibiotics for the lumbar puncture. Start empiric ceftriaxone plus dexamethasone (and add vancomycin where pneumococcal resistance is likely). CT before LP only when there are signs of raised intracranial pressure or focal deficit.",
        "exam": {
            "general": "Unwell, photophobic, lying still with eyes closed.",
            "vitals": "Temp {temp}°C, HR {hr} bpm, BP {bp_sys}/{bp_dia} mmHg, RR {rr} bpm, SpO2 {spo2}%.",
            "cardiovascular": "Tachycardic, regular, no murmur.",
            "respiratory": "Clear to auscultation.",
            "abdomen": "Soft, non-tender.",
            "neurological": "Neck stiffness and positive Kernig sign; no focal deficit, no rash.",
        },
        "labs": [
            {"name": "White Blood Cell (WBC)", "value": "19.8 x 10^3/µL", "reference_range": "4.5 - 11.0 x 10^3/µL", "status": LabResult.HIGH},
            {"name": "CSF glucose", "value": "24 mg/dL", "reference_range": "40 - 70 mg/dL", "status": LabResult.LOW},
            {"name": "CSF protein", "value": "180 mg/dL", "reference_range": "15 - 45 mg/dL", "status": LabResult.HIGH},
        ],
        "differentials": [
            {"diagnosis": "Bacterial Meningitis", "correct": True, "feedback": "Correct. Fever, meningism and a neutrophilic CSF picture with low glucose — start empiric antibiotics immediately."},
            {"diagnosis": "Viral Meningitis", "correct": False, "feedback": "Incorrect. Viral meningitis usually has a lymphocytic pleocytosis with normal glucose and a less toxic patient."},
            {"diagnosis": "Subarachnoid Haemorrhage", "correct": False, "feedback": "Incorrect. SAH causes a thunderclap headache without fever and shows blood on CT or xanthochromia on LP."},
            {"diagnosis": "Migraine", "correct": False, "feedback": "Incorrect. Migraine does not cause fever, neck stiffness or an inflammatory CSF profile."},
        ],
    },
    {
        "subject": "Endocrinology",
        "title": "Vomiting and Drowsiness in a Diabetic",
        "difficulty": ClinicalCase.INTERMEDIATE,
        "severity": "severe",
        "tags": ["DKA", "Metabolic acidosis"],
        "minutes": 18,
        "complaint": "Nausea, abdominal pain and drowsiness in a known diabetic.",
        "hpi": "A {age}-year-old {sex} with type 1 diabetes has had polyuria, polydipsia and vomiting after a respiratory infection, and stopped insulin when unable to eat. Breath smells of acetone.",
        "pmh": "Type 1 diabetes on basal-bolus insulin; no other medication.",
        "diagnosis": "Diabetic Ketoacidosis",
        "discussion": "Give intravenous 0.9% saline, a fixed-rate insulin infusion and meticulous potassium replacement — total body potassium is depleted even when the serum level looks normal. Add dextrose once glucose falls below 200 mg/dL so the insulin can continue until ketones clear.",
        "exam": {
            "general": "Drowsy but rousable, deep sighing respiration, dry mucous membranes, acetone breath.",
            "vitals": "Temp 37.7°C, HR {hr} bpm, BP {bp_sys}/{bp_dia} mmHg, RR {rr} bpm (Kussmaul), SpO2 {spo2}%.",
            "cardiovascular": "Tachycardic and volume-depleted, no murmur.",
            "respiratory": "Deep Kussmaul breathing, clear chest.",
            "abdomen": "Diffuse tenderness without guarding.",
            "neurological": "GCS 14, no focal deficit.",
        },
        "labs": [
            {"name": "Glucose", "value": "512 mg/dL", "reference_range": "70 - 140 mg/dL", "status": LabResult.HIGH},
            {"name": "Beta-hydroxybutyrate", "value": "7.1 mmol/L", "reference_range": "< 0.6 mmol/L", "status": LabResult.HIGH},
            {"name": "Potassium", "value": "4.3 mmol/L", "reference_range": "3.5 - 5.1 mmol/L", "status": LabResult.NORMAL},
        ],
        "differentials": [
            {"diagnosis": "Diabetic Ketoacidosis", "correct": True, "feedback": "Correct. Hyperglycaemia with ketonaemia, an anion-gap acidosis and Kussmaul breathing after insulin omission is DKA."},
            {"diagnosis": "Hyperosmolar Hyperglycaemic State", "correct": False, "feedback": "Incorrect. HHS occurs in type 2 diabetes with higher glucose and osmolality, minimal ketones and milder acidosis."},
            {"diagnosis": "Acute Pancreatitis", "correct": False, "feedback": "Incorrect. Pancreatitis does not explain the ketonaemia and anion-gap acidosis that unify this picture."},
            {"diagnosis": "Gastroenteritis", "correct": False, "feedback": "Incorrect. Gastroenteritis alone would not produce ketonaemia, acidosis or the characteristic breath."},
        ],
    },
    {
        "subject": "Gastroenterology",
        "title": "Severe Epigastric Pain Radiating to the Back",
        "difficulty": ClinicalCase.INTERMEDIATE,
        "severity": "moderate",
        "tags": ["Pancreatitis", "Gallstones"],
        "minutes": 15,
        "complaint": "Severe epigastric pain radiating to the back for eight hours.",
        "hpi": "A {age}-year-old {sex} presents with constant severe epigastric pain boring through to the back, relieved slightly by leaning forward, with vomiting.",
        "pmh": "Symptomatic gallstones, moderate alcohol intake.",
        "diagnosis": "Acute Pancreatitis",
        "discussion": "Diagnosis needs two of: characteristic pain, lipase over three times the upper limit of normal, and imaging evidence. Manage with aggressive fluids, analgesia and early enteral nutrition; treat the underlying cause (cholecystectomy for gallstones).",
        "exam": {
            "general": "In pain, lying with knees drawn up, sweaty.",
            "vitals": "Temp {temp}°C, HR {hr} bpm, BP {bp_sys}/{bp_dia} mmHg, RR {rr} bpm, SpO2 {spo2}%.",
            "cardiovascular": "Tachycardic, regular, no murmur.",
            "respiratory": "Clear to auscultation.",
            "abdomen": "Epigastric tenderness with guarding but no rebound; bowel sounds reduced.",
            "neurological": "Alert, no focal deficit.",
        },
        "labs": [
            {"name": "Lipase", "value": "1240 U/L", "reference_range": "10 - 140 U/L", "status": LabResult.HIGH},
            {"name": "ALT", "value": "98 U/L", "reference_range": "7 - 56 U/L", "status": LabResult.HIGH},
            {"name": "Calcium", "value": "8.2 mg/dL", "reference_range": "8.5 - 10.5 mg/dL", "status": LabResult.LOW},
        ],
        "differentials": [
            {"diagnosis": "Acute Pancreatitis", "correct": True, "feedback": "Correct. Epigastric pain boring to the back with lipase above three times the upper limit of normal is diagnostic."},
            {"diagnosis": "Perforated Peptic Ulcer", "correct": False, "feedback": "Incorrect. Perforation causes sudden generalised peritonism with free air on erect chest X-ray."},
            {"diagnosis": "Myocardial Infarction", "correct": False, "feedback": "Incorrect. Inferior MI can mimic epigastric pain, so check an ECG and troponin, but the lipase here is decisive."},
            {"diagnosis": "Acute Cholecystitis", "correct": False, "feedback": "Incorrect. Cholecystitis causes right upper quadrant pain with a positive Murphy sign and no dramatic lipase rise."},
        ],
    },
    {
        "subject": "Nephrology",
        "title": "Oliguria After Hypotension",
        "difficulty": ClinicalCase.INTERMEDIATE,
        "severity": "moderate",
        "tags": ["AKI", "Acute tubular necrosis"],
        "minutes": 15,
        "complaint": "Reduced urine output and lethargy after a hypotensive episode.",
        "hpi": "A {age}-year-old {sex} was treated for sepsis and hypotension, and since then has passed only small volumes of dark urine. There has been swelling of the ankles.",
        "pmh": "Hypertension; recent course of an NSAID for back pain.",
        "diagnosis": "Acute Kidney Injury (Acute Tubular Necrosis)",
        "discussion": "Distinguish prerenal from intrinsic injury: a transient response to fluids and a fractional excretion of urea under 35% favour prerenal, whereas muddy-brown granular casts and a non-response point to ATN. Remove nephrotoxins and manage fluid and electrolytes.",
        "exam": {
            "general": "Mildly unwell, dry mucous membranes but with ankle oedema.",
            "vitals": "Temp 36.9°C, HR {hr} bpm, BP {bp_sys}/{bp_dia} mmHg, RR {rr} bpm, SpO2 {spo2}%.",
            "cardiovascular": "No murmur; raised JVP; pitting oedema to mid-shin.",
            "respiratory": "Clear to auscultation.",
            "abdomen": "Soft, non-tender, no renal bruit.",
            "neurological": "Alert, no focal deficit.",
        },
        "labs": [
            {"name": "Creatinine", "value": "3.4 mg/dL", "reference_range": "0.6 - 1.1 mg/dL", "status": LabResult.HIGH},
            {"name": "Potassium", "value": "5.8 mmol/L", "reference_range": "3.5 - 5.1 mmol/L", "status": LabResult.HIGH},
            {"name": "Bicarbonate", "value": "18 mmol/L", "reference_range": "22 - 29 mmol/L", "status": LabResult.LOW},
        ],
        "differentials": [
            {"diagnosis": "Acute Kidney Injury (ATN)", "correct": True, "feedback": "Correct. Hypotension, nephrotoxins and muddy-brown casts with a rising creatinine and hyperkalaemia indicate ATN."},
            {"diagnosis": "Prerenal Azotaemia", "correct": False, "feedback": "Incorrect. Prerenal injury corrects rapidly with volume; the granular casts and hyperkalaemia favour established ATN."},
            {"diagnosis": "Acute Interstitial Nephritis", "correct": False, "feedback": "Incorrect. AIN is a hypersensitivity reaction with fever, rash, eosinophilia and sterile pyuria."},
            {"diagnosis": "Rhabdomyolysis", "correct": False, "feedback": "Incorrect. Rhabdomyolysis gives a very high creatine kinase and myoglobinuria after muscle injury."},
        ],
    },
    {
        "subject": "Pediatrics",
        "title": "Toddler with Barky Cough and Stridor",
        "difficulty": ClinicalCase.BEGINNER,
        "severity": "moderate",
        "tags": ["Croup", "Airway"],
        "minutes": 12,
        "complaint": "Barky cough and noisy breathing that worsened overnight.",
        "hpi": "A {age}-year-old child has a two-day history of coryza and fever, now with a seal-like barking cough and inspiratory stridor. There is no drooling or tripod positioning.",
        "pmh": "Born at term, immunisations up to date.",
        "diagnosis": "Croup (Laryngotracheobronchitis)",
        "discussion": "Parainfluenza type 1 is the commonest cause. A single dose of oral dexamethasone reduces airway oedema; nebulised adrenaline is reserved for moderate-to-severe stridor. Distinguish from epiglottitis (toxic, drooling, tripod posture) and bacterial tracheitis.",
        "exam": {
            "general": "Anxious but consolable, with a harsh barking cough.",
            "vitals": "Temp {temp}°C, HR {hr} bpm, BP {bp_sys}/{bp_dia} mmHg, RR {rr} bpm, SpO2 {spo2}%.",
            "cardiovascular": "Tachycardic, regular, no murmur.",
            "respiratory": "Inspiratory stridor at rest with mild subcostal recession.",
            "abdomen": "Soft, non-tender.",
            "neurological": "Alert, no focal deficit.",
        },
        "labs": [
            {"name": "White Blood Cell (WBC)", "value": "9.4 x 10^3/µL", "reference_range": "6.0 - 17.5 x 10^3/µL", "status": LabResult.NORMAL},
            {"name": "C-reactive protein", "value": "12 mg/L", "reference_range": "< 5 mg/L", "status": LabResult.HIGH},
            {"name": "Oxygen saturation", "value": "96%", "reference_range": "> 94%", "status": LabResult.NORMAL},
        ],
        "differentials": [
            {"diagnosis": "Croup", "correct": True, "feedback": "Correct. A barking cough with inspiratory stridor after a viral prodrome is croup — give dexamethasone."},
            {"diagnosis": "Epiglottitis", "correct": False, "feedback": "Incorrect. Epiglottitis causes a toxic, drooling child in a tripod position — a paediatric airway emergency."},
            {"diagnosis": "Bacterial Tracheitis", "correct": False, "feedback": "Incorrect. Tracheitis is toxic with thick secretions and often needs intubation, not a simple barky cough."},
            {"diagnosis": "Asthma", "correct": False, "feedback": "Incorrect. Asthma causes expiratory wheeze and polyphonic breath sounds rather than inspiratory stridor."},
        ],
    },
]


class SafeDict(dict):
    """Leave unknown placeholders untouched instead of raising."""

    def __missing__(self, key):
        return "{" + key + "}"


def render(template: str, context: dict) -> str:
    return template.format_map(SafeDict(context))


def random_patient(rng: random.Random, specialty: str) -> dict:
    """Random but plausible demographics and vital signs per case."""

    if specialty == "Pediatrics":
        age = rng.randint(2, 9)
    elif specialty in {"Cardiology", "Neurology", "Pulmonology"}:
        age = rng.randint(45, 82)
    else:
        age = rng.randint(20, 70)

    sex = rng.choice(["male", "female"])

    return {
        "age": age,
        "sex": sex,
        "temp": round(rng.uniform(36.6, 39.2), 1),
        "hr": rng.randint(88, 128),
        "bp_sys": rng.randint(92, 168),
        "bp_dia": rng.randint(56, 98),
        "rr": rng.randint(16, 30),
        "spo2": rng.randint(90, 99),
    }


class Command(BaseCommand):
    help = "Generate randomised users and clinical content for manual testing."

    def add_arguments(self, parser):
        parser.add_argument("--students", type=int, default=12, help="Number of random students.")
        parser.add_argument("--instructors", type=int, default=3, help="Number of random instructors.")
        parser.add_argument("--cases", type=int, default=12, help="Number of random clinical cases.")
        parser.add_argument("--decks", type=int, default=4, help="Number of random flashcard decks.")
        parser.add_argument("--quizzes", type=int, default=8, help="Number of random QBank questions.")
        parser.add_argument("--seed", type=int, default=None, help="RNG seed for a reproducible run.")
        parser.add_argument(
            "--password",
            default=getattr(settings, "DEMO_PASSWORD", "password"),
            help="Password assigned to every generated account.",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Accepted for symmetry; generated rows are always cleared first.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        rng = random.Random(options["seed"])
        password = options["password"]

        # The command owns every row it creates, so it always regenerates from a
        # clean slate. Re-running is then safe (no duplicate or primary-key
        # collisions) and a new --seed simply produces a different batch.
        self._reset()

        students = self._seed_students(rng, password, options["students"])
        profiles = self._seed_instructors(rng, password, options["instructors"])
        courses = self._seed_courses(rng, profiles)
        cases = self._seed_cases(rng, options["cases"])
        decks = self._seed_decks(rng, options["decks"], students[0] if students else None)
        self._seed_quizzes(rng, options["quizzes"])
        self._seed_live_sessions(rng, profiles, courses)
        self._seed_student_activity(rng, students, courses, cases)
        self._seed_billing(rng, profiles, courses, students)

        self.stdout.write(self.style.SUCCESS("Random data ready."))
        self.stdout.write(
            f"  students    {len(students)} · instructors {len(profiles)} · "
            f"cases {len(cases)} · decks {len(decks)}"
        )
        self.stdout.write(f"  every account below uses the password: {password}")
        for student in students[:5]:
            self.stdout.write(f"    student    {student.email}")
        for profile in profiles[:3]:
            self.stdout.write(f"    instructor {profile.user.email}")
        self.stdout.write("  (all emails end with @%s)" % RANDOM_DOMAIN)

    # ── internal helpers ────────────────────────────────────────────────────

    def _reset(self):
        self.stdout.write("Clearing previously generated random rows…")
        Transaction.objects.filter(instructor__user__email__endswith=RANDOM_DOMAIN).delete()
        LiveSession.objects.filter(instructor__user__email__endswith=RANDOM_DOMAIN).delete()
        Enrollment.objects.filter(user__email__endswith=RANDOM_DOMAIN).delete()
        CartItem.objects.filter(user__email__endswith=RANDOM_DOMAIN).delete()
        CourseReview.objects.filter(author__email__endswith=RANDOM_DOMAIN).delete()
        Course.objects.filter(instructor__user__email__endswith=RANDOM_DOMAIN).delete()
        ClinicalCase.objects.filter(tags__contains=[RANDOM_TAG]).delete()
        QuizQuestion.objects.filter(block=RANDOM_BLOCK).delete()
        Deck.objects.filter(owner__email__endswith=RANDOM_DOMAIN).delete()
        User.objects.filter(email__endswith=RANDOM_DOMAIN).delete()

    def _unique_email(self, first, last, index):
        base = f"{first.lower()}.{last.lower()}"
        return f"{base}{index}@{RANDOM_DOMAIN}"

    def _seed_students(self, rng, password, count):
        students = []
        for index in range(1, count + 1):
            first = rng.choice(FIRST_NAMES)
            last = rng.choice(LAST_NAMES)
            email = self._unique_email(first, last, index)
            user = User(
                id=deterministic_uuid(f"random-student-{index}"),
                email=email,
                username=email,
                name=f"{first} {last}",
                role=STUDENT,
                year=rng.choice(STUDENT_YEARS),
            )
            user.set_password(password)
            user.is_active = True
            user.save()
            students.append(user)
        return students

    def _seed_instructors(self, rng, password, count):
        profiles = []
        for index in range(1, count + 1):
            first = rng.choice(FIRST_NAMES)
            last = rng.choice(LAST_NAMES)
            email = f"dr.{first.lower()}.{last.lower()}{index}@{RANDOM_DOMAIN}"
            user = User(
                id=deterministic_uuid(f"random-instructor-{index}"),
                email=email,
                username=email,
                name=f"Dr. {first} {last}",
                role=INSTRUCTOR,
            )
            user.set_password(password)
            user.is_active = True
            user.save()
            specialty = rng.choice(SPECIALTIES)
            profile = InstructorProfile.objects.create(
                user=user,
                specialty=specialty,
                bio=f"Practising {specialty.lower()} specialist with an interest in case-based teaching.",
                rating=round(rng.uniform(4.2, 5.0), 1),
                student_count=rng.randint(50, 9000),
                is_verified=True,
            )
            profiles.append(profile)
        return profiles

    def _seed_courses(self, rng, profiles):
        courses = []
        created = 0
        for profile in profiles:
            for _ in range(rng.randint(1, 2)):
                created += 1
                slug = deterministic_uuid(f"random-course-{created}").hex
                specialty = profile.specialty or rng.choice(SPECIALTIES)
                course = Course.objects.create(
                    id=deterministic_uuid(f"random-course-{created}"),
                    instructor=profile,
                    title=f"{specialty} Intensive {created}",
                    slug=f"{slug[:12]}-{created}",
                    specialty=specialty,
                    level=rng.choice(LEVELS),
                    price=rng.choice([29, 39, 44, 49, 59, 79]),
                    rating=round(rng.uniform(4.0, 5.0), 1),
                    review_count=rng.randint(0, 400),
                    student_count=rng.randint(0, 5000),
                    description=f"A randomised {specialty.lower()} course generated for testing.",
                    badges=rng.sample(["New", "Best Seller", "Top Rated"], k=rng.randint(0, 2)),
                    status=Course.PUBLISHED,
                )
                module = CourseModule.objects.create(course=course, title="Overview", order=1)
                for lesson_index in range(1, rng.randint(3, 5)):
                    lesson = Lesson.objects.create(
                        module=module,
                        title=f"Lesson {lesson_index}: {specialty} essentials",
                        duration=f"{rng.randint(12, 40)}m",
                        type=Lesson.VIDEO,
                        free=lesson_index == 1,
                        order=lesson_index,
                    )
                    LessonResource.objects.create(
                        lesson=lesson, name="Slides.pdf", type=LessonResource.SLIDE,
                        size=f"{rng.uniform(1.0, 5.0):.1f} MB",
                    )
                course.lesson_count = course.total_lessons
                course.save(update_fields=["lesson_count"])
                courses.append(course)
        return courses

    def _seed_cases(self, rng, count):
        cases = []
        for index in range(1, count + 1):
            blueprint = rng.choice(CASE_BLUEPRINTS)
            context = random_patient(rng, blueprint["subject"])
            differentials = list(blueprint["differentials"])
            rng.shuffle(differentials)
            labs = list(blueprint["labs"])
            if len(labs) > 2 and rng.random() < 0.4:
                labs.pop(rng.randrange(len(labs)))

            title = render(blueprint["title"], context)
            case = ClinicalCase.objects.create(
                id=deterministic_uuid(f"random-case-{index}"),
                title=title,
                subject=blueprint["subject"],
                difficulty=blueprint["difficulty"],
                tags=[RANDOM_TAG, *blueprint["tags"]],
                estimated_minutes=blueprint["minutes"],
                order=100 + index,
                presenting_complaint=blueprint["complaint"],
                history_of_present_illness=render(blueprint["hpi"], context),
                past_medical_history=blueprint["pmh"],
                final_diagnosis=blueprint["diagnosis"],
                discussion=blueprint["discussion"],
            )
            PhysicalExam.objects.create(
                case=case,
                **{field: render(text, context) for field, text in blueprint["exam"].items()},
            )
            for lab_index, lab in enumerate(labs, start=1):
                LabResult.objects.create(
                    case=case, order=lab_index,
                    name=lab["name"], value=lab["value"],
                    reference_range=lab["reference_range"], status=lab["status"],
                )
            for diff_index, differential in enumerate(differentials, start=1):
                DifferentialDiagnosis.objects.create(
                    case=case, order=diff_index,
                    diagnosis=differential["diagnosis"],
                    correct=differential["correct"],
                    feedback=differential["feedback"],
                )
            cases.append(case)
        return cases

    def _seed_decks(self, rng, count, owner):
        decks = []
        for index in range(1, count + 1):
            subject = rng.choice(DECK_SUBJECTS)
            deck = Deck.objects.create(
                id=deterministic_uuid(f"random-deck-{index}"),
                name=f"{subject} Random Deck {index}",
                subject=subject,
                description="Auto-generated deck for testing.",
                is_system=False,
                owner=owner,
            )
            facts = [fact for fact in FLASHCARD_FACTS if fact[2] == subject] or FLASHCARD_FACTS
            for card_index in range(1, rng.randint(2, 4)):
                vignette, diagnosis, _card_subject = rng.choice(facts)
                Flashcard.objects.create(
                    id=deterministic_uuid(f"random-card-{index}-{card_index}"),
                    deck=deck,
                    vignette=vignette,
                    diagnosis=diagnosis,
                    rationale=f"Generated card; think {diagnosis.lower()} given the described findings.",
                    subject=subject,
                    interval_days=rng.choice([1.0, 2.0, 3.0, 5.0]),
                    ease_factor=round(rng.uniform(2.3, 2.8), 2),
                    next_review_date=timezone.now() - timedelta(days=rng.randint(0, 3)),
                )
            decks.append(deck)
        return decks

    def _seed_quizzes(self, rng, count):
        subjects = DECK_SUBJECTS
        for index in range(1, count + 1):
            subject = rng.choice(subjects)
            correct_index = rng.randrange(4)
            options = [
                f"Option A for question {index}",
                f"Option B for question {index}",
                f"Option C for question {index}",
                f"Option D for question {index}",
            ]
            options[correct_index] = f"Most likely diagnosis: {subject} scenario {index}"
            QuizQuestion.objects.create(
                id=deterministic_uuid(f"random-quiz-{index}"),
                vignette=(
                    f"A {rng.randint(20, 80)}-year-old patient presents with findings suggestive "
                    f"of a {subject.lower()} problem. Question {index} generated for testing."
                ),
                options=options,
                correct_answer=correct_index,
                explanation=f"Generated explanation {index} for the {subject} question.",
                subject=subject,
                yield_rating=rng.choice([QuizQuestion.HIGH, QuizQuestion.MEDIUM, QuizQuestion.LOW]),
                block=RANDOM_BLOCK,
            )

    def _seed_live_sessions(self, rng, profiles, courses):
        now = timezone.now()
        for index, profile in enumerate(profiles, start=1):
            course = rng.choice(courses) if courses else None
            session = LiveSession(
                id=deterministic_uuid(f"random-live-{index}"),
                title=f"Random Live Session {index}",
                topic=f"Case discussion #{index}",
                instructor=profile,
                course=course,
                scheduled_at=now + timedelta(days=rng.randint(-3, 6), hours=rng.randint(0, 8)),
                duration=rng.choice(["45m", "60m", "90m"]),
                participant_count=rng.randint(0, 150),
                max_participants=rng.choice([100, 150, 200]),
                recording_available=rng.random() < 0.4,
            )
            session.save()

    def _seed_student_activity(self, rng, students, courses, cases):
        now = timezone.now()
        for index, student in enumerate(students, start=1):
            StudyProgress.objects.create(
                user=student,
                daily_goal=rng.choice([15, 20, 25, 30]),
                daily_completed=rng.randint(0, 25),
                streak_days=rng.randint(0, 30),
                total_cards_reviewed=rng.randint(0, 800),
                accuracy_rate=round(rng.uniform(50, 95), 1),
                total_hours_studied=round(rng.uniform(0, 80), 1),
                cards_retention_rate=round(rng.uniform(55, 95), 1),
                clinical_case_success_rate=round(rng.uniform(40, 95), 1),
                last_study_date=timezone.localdate(),
            )
            for subject in rng.sample(DECK_SUBJECTS, k=rng.randint(2, 4)):
                SubjectMastery.objects.create(
                    user=student, subject=subject,
                    mastery_percent=rng.randint(20, 98), count=rng.randint(0, 60),
                )
            for order, label in enumerate(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], start=1):
                ReviewHistoryEntry.objects.create(
                    user=student, label=label,
                    reviewed_count=rng.randint(0, 40),
                    accuracy=rng.randint(50, 98), order=order,
                )
            StudyActivity.objects.create(
                user=student, type=StudyActivity.FLASHCARD,
                title=f"Random study session {index}", status="Completed",
                timestamp=now - timedelta(hours=rng.randint(0, 72)),
            )

            for course in rng.sample(courses, k=min(len(courses), rng.randint(1, 2))) if courses else []:
                enrollment = Enrollment.objects.create(
                    user=student, course=course, progress=rng.randint(0, 100),
                )
                lessons = list(Lesson.objects.filter(module__course=course))
                for lesson in rng.sample(lessons, k=min(len(lessons), rng.randint(0, len(lessons)))) if lessons else []:
                    enrollment.completed_lessons.add(lesson)
                enrollment.recalculate_progress()
                enrollment.save(update_fields=["progress"])

                CourseReview.objects.create(
                    author=student, course=course, author_name=student.name,
                    rating=rng.randint(3, 5),
                    body=f"Generated review from {student.name} — useful content for testing.",
                )

            if cases:
                case = rng.choice(cases)
                total = case.total_steps
                completed = rng.randint(0, total)
                status = (
                    CaseProgress.COMPLETED if completed >= total
                    else CaseProgress.IN_PROGRESS if completed
                    else CaseProgress.AVAILABLE
                )
                CaseProgress.objects.create(
                    user=student, case=case, status=status,
                    completed_steps=completed, total_steps=total,
                )

    def _seed_billing(self, rng, profiles, courses, students):
        now = timezone.now()
        for index, profile in enumerate(profiles, start=1):
            Transaction.objects.create(
                instructor=profile, type=Transaction.ENROLLMENT,
                description=f"Random enrollments batch {index}",
                amount=rng.randint(200, 9000),
                date=now - timedelta(days=rng.randint(0, 30)),
                status=Transaction.COMPLETED,
                course=rng.choice(courses) if courses else None,
                student=rng.choice(students) if students else None,
            )
            Transaction.objects.create(
                instructor=profile, type=Transaction.PAYOUT,
                description=f"Random payout {index}",
                amount=-rng.randint(500, 8000),
                date=now - timedelta(days=rng.randint(1, 20)),
                status=rng.choice([Transaction.COMPLETED, Transaction.PENDING]),
            )
