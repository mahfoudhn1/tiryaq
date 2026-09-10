import {
  Flashcard,
  FlashcardDifficulty,
  ClinicalCase,
  QuizQuestion,
  DashboardSummary,
  StudyAnalytics
} from '@/types/medical';

// Utility helper to simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// --- Mock Data ---

const MOCK_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    deckId: 'deck-cardio',
    vignette: 'A 62-year-old male presents with severe, tearing chest pain radiating to his back. His blood pressure is 185/110 mmHg in the right arm and 145/85 mmHg in the left arm. A chest X-ray shows mediastinal widening.',
    diagnosis: 'Aortic Dissection (Stanford Type A or B)',
    rationale: 'The sudden onset of severe "tearing" chest pain radiating to the back, coupled with asymmetric blood pressures between arms (>20 mmHg difference) and mediastinal widening on chest X-ray, is highly specific for aortic dissection. Stanford Type A involves the ascending aorta and requires emergency surgical intervention, while Stanford Type B involves the descending aorta and is typically managed medically with beta-blockers (e.g., esmolol) to control shear stress.',
    subject: 'Cardiology',
    intervalDays: 3,
    easeFactor: 2.5,
    nextReviewDate: new Date().toISOString(),
  },
  {
    id: 'fc-2',
    deckId: 'deck-pulm',
    vignette: 'A 28-year-old female presents with progressive dyspnea and a non-productive cough. Chest X-ray reveals bilateral hilar adenopathy. High-resolution chest CT shows perilymphatic nodules. Serum calcium and ACE levels are elevated.',
    diagnosis: 'Sarcoidosis',
    rationale: 'Bilateral hilar lymphadenopathy on CXR, elevated serum calcium, and elevated angiotensin-converting enzyme (ACE) levels in a young patient are classic for Sarcoidosis. Histopathology would reveal non-caseating granulomas composed of epithelioid histiocytes and multinucleated giant cells. Initial treatment consists of systemic corticosteroids for symptomatic patients or those with end-organ involvement.',
    subject: 'Pulmonology',
    intervalDays: 5,
    easeFactor: 2.6,
    nextReviewDate: new Date().toISOString(),
  },
  {
    id: 'fc-3',
    deckId: 'deck-renal',
    vignette: 'A 9-year-old boy presents with hematuria ("cola-colored urine"), periorbital edema, and hypertension. Two weeks ago, he was treated for a skin infection (impetigo). Urinalysis shows red blood cell casts and mild proteinuria.',
    diagnosis: 'Poststreptococcal Glomerulonephritis (PSGN)',
    rationale: 'PSGN occurs 1-4 weeks after a streptococcal pharyngeal or skin infection (e.g., Streptococcus pyogenes). It is a Type III hypersensitivity reaction causing immune complex deposition (subepithelial "humps" on electron microscopy). Classic features include hematuria (RBC casts), periorbital edema, hypertension, and low serum C3 complement levels.',
    subject: 'Renal / Nephrology',
    intervalDays: 1,
    easeFactor: 2.3,
    nextReviewDate: new Date().toISOString(),
  },
  {
    id: 'fc-4',
    deckId: 'deck-endo',
    vignette: 'A 45-year-old female presents with heat intolerance, weight loss despite increased appetite, and palpitations. On exam, she has a diffuse, non-tender goiter, proptosis, and pretibial myxedema.',
    diagnosis: 'Graves\' Disease',
    rationale: 'Graves\' disease is an autoimmune hyperthyroidism caused by Thyroid Stimulating Immunoglobulins (TSI) that act as agonists on TSH receptors. Pretibial myxedema (localized dermopathy) and ophthalmopathy (proptosis due to retro-orbital glycosaminoglycan accumulation) are highly specific and do not occur in other causes of hyperthyroidism.',
    subject: 'Endocrinology',
    intervalDays: 7,
    easeFactor: 2.7,
    nextReviewDate: new Date().toISOString(),
  }
];

const MOCK_CLINICAL_CASES: Record<string, ClinicalCase> = {
  'case-101': {
    id: 'case-101',
    title: 'Acute Right Lower Quadrant Abdominal Pain',
    presentingComplaint: 'Severe lower abdominal pain for 12 hours.',
    historyOfPresentIllness: 'A 24-year-old female presents with a 12-hour history of abdominal pain. The pain began as a dull, vague ache in the periumbilical region, but has since localized to the right lower quadrant (RLQ). She reports accompanying anorexia, nausea, and two episodes of non-bilious emesis. Her last menstrual period was 3 weeks ago, regular, and she active sexually using oral contraceptives.',
    pastMedicalHistory: 'Appendectomy: No. Prior abdominal surgeries: None. No chronic medical conditions, no known allergies.',
    physicalExam: {
      general: 'Ill-appearing, lying still on the gurney, favoring the right leg flexed.',
      vitals: 'Temp: 38.2°C (100.8°F), HR: 104 bpm, BP: 118/76 mmHg, RR: 18 bpm, SpO2: 99% on room air.',
      cardiovascular: 'Tachycardic, regular rhythm. No murmurs, rubs, or gallops.',
      respiratory: 'Lungs clear to auscultation bilaterally.',
      abdomen: 'Flat. Hypoactive bowel sounds. Marked tenderness in the RLQ at McBurney\'s point. Exquisite guarding and rebound tenderness are present. Positive Rovsing\'s sign (referred RLQ pain with LLQ palpation) and positive Psoas sign.',
      neurological: 'Alert and oriented x3. No focal deficits.',
    },
    labs: [
      { name: 'White Blood Cell (WBC)', value: '14.8 x 10^3/µL', referenceRange: '4.5 - 11.0 x 10^3/µL', status: 'High' },
      { name: 'Neutrophils', value: '82%', referenceRange: '40% - 70%', status: 'High' },
      { name: 'Hemoglobin', value: '13.5 g/dL', referenceRange: '12.0 - 15.5 g/dL', status: 'Normal' },
      { name: 'Platelets', value: '250 x 10^3/µL', referenceRange: '150 - 450 x 10^3/µL', status: 'Normal' },
      { name: 'Urine hCG (Pregnancy)', value: 'Negative', referenceRange: 'Negative', status: 'Normal' },
      { name: 'Serum Creatinine', value: '0.8 mg/dL', referenceRange: '0.6 - 1.1 mg/dL', status: 'Normal' },
    ],
    differentialDiagnosis: [
      {
        id: 'dd-1',
        diagnosis: 'Acute Appendicitis',
        correct: true,
        feedback: 'Correct! The migratory nature of the pain (periumbilical to RLQ), combined with systemic signs (fever, leukocytosis with neutrophilic shift), nausea/vomiting, McBurney\'s tenderness, guarding, and rebound, is a classic presentation of acute appendicitis. Operative intervention (laparoscopic appendectomy) is the definitive standard of care.'
      },
      {
        id: 'dd-2',
        diagnosis: 'Ruptured Ectopic Pregnancy',
        correct: false,
        feedback: 'Incorrect. While ectopic pregnancy can cause acute RLQ pain and pelvic tenderness, her urine hCG is strictly negative, which rules out active pregnancy.'
      },
      {
        id: 'dd-3',
        diagnosis: 'Ovarian Torsion',
        correct: false,
        feedback: 'Incorrect. Ovarian torsion presents with sudden-onset, severe, unilateral pelvic pain, often colicky, and may have a history of ovarian cysts. While possible, the classic migratory pain, fever, high WBC count, and localized peritoneal signs make appendicitis far more probable. However, ultrasound would be used to differentiate if diagnosis were ambiguous.'
      },
      {
        id: 'dd-4',
        diagnosis: 'Pelvic Inflammatory Disease (PID)',
        correct: false,
        feedback: 'Incorrect. PID presents with bilateral lower abdominal pain, cervical motion tenderness (Chandelier sign), purulent vaginal discharge, and dyspareunia. This patient lacks these features, and her pain is highly localized to McBurney\'s point.'
      }
    ],
    finalDiagnosis: 'Acute Appendicitis',
    discussion: 'Acute appendicitis is one of the most common surgical emergencies. The pathophysiology usually involves obstruction of the appendiceal lumen by a fecalith, lymphoid hyperplasia (often post-viral), or a foreign body. This leads to increased intraluminal pressure, venous congestion, lymphatic obstruction, and bacterial overgrowth, culminating in ischemia and perforation if untreated. Diagnosis is primarily clinical, but can be confirmed with ultrasound (particularly in children/pregnant females) or abdominal CT (revealing an enlarged appendix >6mm with wall thickening and periappendiceal stranding).'
  }
};

const MOCK_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'qq-1',
    vignette: 'A 54-year-old male is brought to the emergency department because of sudden, severe shortness of breath and right-sided pleuritic chest pain that began 2 hours ago. He recently underwent a total hip replacement 10 days ago. On physical examination, he is tachycardic (HR 118 bpm) and tachypneic (RR 26 bpm). Pulse oximetry shows 88% on room air. Standard chest radiograph is normal. Which of the following is the most appropriate next step in diagnosis?',
    options: [
      'Transthoracic echocardiogram',
      'CT pulmonary angiography (CTPA)',
      'D-dimer assay',
      'Ventilation-perfusion (V/Q) scan',
      'Duplex venous ultrasonography of the lower extremities'
    ],
    correctAnswer: 1, // CT pulmonary angiography (CTPA)
    explanation: 'The clinical picture describes a patient with high pretest probability for a Pulmonary Embolism (PE), characterized by sudden dyspnea, pleuritic chest pain, tachycardia, tachypnea, hypoxemia, and a clear risk factor (major orthopedic surgery within 4 weeks, representing Virchow\'s triad: stasis, hypercoagulability, and endothelial injury). For patients with high pretest probability (Wells Score > 4), the next step is diagnostic imaging, and CT Pulmonary Angiography (CTPA) is the preferred gold standard diagnostic test. D-dimer is highly sensitive but non-specific, and is only appropriate for ruling out PE in low pretest probability cases.',
    subject: 'Pulmonology',
    yieldRating: 'High'
  },
  {
    id: 'qq-2',
    vignette: 'A 3-year-old girl is brought to the clinic by her mother due to a barky cough, hoarseness, and inspiratory stridor. The symptoms started 2 days ago as a mild rhinorrhea and low-grade fever, but worsened significantly overnight. On examination, the child is anxious, has mild subcostal retractions, and a distinct "seal-like" cough is heard. What is the primary etiologic agent of this condition?',
    options: [
      'Respiratory syncytial virus (RSV)',
      'Parainfluenza virus type 1',
      'Adenovirus',
      'Haemophilus influenzae type b',
      'Bordetella pertussis'
    ],
    correctAnswer: 1, // Parainfluenza virus type 1
    explanation: 'This child is presenting with Croup (laryngotracheobronchitis), which is characterized by the classic "seal-like" barking cough, hoarseness, and inspiratory stridor, typically preceded by standard URI symptoms. The primary etiologic agent of croup is Parainfluenza virus (specifically Type 1). RSV is the primary cause of bronchiolitis in infants. H. influenzae b causes acute epiglottitis (toxic child, high fever, drooling, tripod position). Pertussis causes whooping cough (paroxysms of cough followed by an inspiratory whoop).',
    subject: 'Pediatrics / Infectious Disease',
    yieldRating: 'High'
  },
  {
    id: 'qq-3',
    vignette: 'A 65-year-old female with a long-standing history of rheumatoid arthritis presents with a 2-day history of a swollen, extremely painful left knee. She is unable to bear weight. On exam, the left knee is warm, erythematous, and has a large effusion. Arthrocentesis is performed, yielding purulent fluid. Gram stain demonstrates Gram-positive cocci in clusters. Joint fluid analysis shows a leukocyte count of 85,000/µL with 92% neutrophils. What is the most appropriate initial management?',
    options: [
      'Oral amoxicillin/clavulanate and rest',
      'Intra-articular corticosteroid injection',
      'Intravenous vancomycin and joint aspiration/drainage',
      'Intravenous ceftriaxone alone',
      'Colchicine and NSAID therapy'
    ],
    correctAnswer: 2, // Intravenous vancomycin and joint aspiration/drainage
    explanation: 'The patient presents with septic arthritis (warm, swollen, exquisitely painful joint, inability to bear weight, synovial fluid WBC > 50,000/µL with neutrophil predominance). Gram-positive cocci in clusters strongly indicate Staphylococcus aureus. Septic arthritis is a medical emergency that can rapidly destroy articular cartilage. Treatment requires immediate intravenous antibiotics (typically Vancomycin to cover MRSA empirically, tailored once cultures return) and joint source control via aspiration, arthroscopy, or open arthrotomy to drain the purulent effusion.',
    subject: 'Rheumatology / Orthopedics',
    yieldRating: 'High'
  }
];

const MOCK_DASHBOARD_SUMMARY: DashboardSummary = {
  dailyGoal: 20,
  dailyCompleted: 12,
  streakDays: 14,
  dueFlashcardsCount: 4,
  dueCasesCount: 1,
  dueQuizQuestionsCount: 3,
  recentActivity: [
    { id: 'act-1', type: 'flashcard', title: 'Reviewed Aortic Dissection Card', timestamp: '20 mins ago', status: 'Completed' },
    { id: 'act-2', type: 'quiz', title: 'Finished Cardio & Pulm QBank Block', timestamp: '2 hours ago', status: '85% Correct' },
    { id: 'act-3', type: 'case', title: 'Began Case 101: Acute Abdominal Pain', timestamp: 'Yesterday', status: 'In Progress' }
  ]
};

const MOCK_STUDY_ANALYTICS: StudyAnalytics = {
  progress: {
    dailyGoal: 20,
    dailyCompleted: 12,
    streakDays: 14,
    totalCardsReviewed: 342,
    subjectMastery: [
      { subject: 'Cardiology', masteryPercent: 88, count: 95 },
      { subject: 'Pulmonology', masteryPercent: 74, count: 70 },
      { subject: 'Renal / Nephrology', masteryPercent: 62, count: 48 },
      { subject: 'Endocrinology', masteryPercent: 81, count: 65 },
      { subject: 'Pediatrics', masteryPercent: 69, count: 64 }
    ],
    accuracyRate: 78.5,
    reviewHistory: [
      { date: 'Mon', reviewedCount: 15, accuracy: 80 },
      { date: 'Tue', reviewedCount: 22, accuracy: 72 },
      { date: 'Wed', reviewedCount: 18, accuracy: 83 },
      { date: 'Thu', reviewedCount: 25, accuracy: 76 },
      { date: 'Fri', reviewedCount: 12, accuracy: 90 },
      { date: 'Sat', reviewedCount: 30, accuracy: 81 },
      { date: 'Sun', reviewedCount: 12, accuracy: 78 }
    ]
  },
  totalHoursStudied: 42.5,
  cardsRetentionRate: 86.4,
  clinicalCaseSuccessRate: 80.0
};

// --- API Service Methods ---

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await delay(300);
  return { ...MOCK_DASHBOARD_SUMMARY };
}

export async function getDueFlashcards(): Promise<Flashcard[]> {
  await delay(300);
  return [...MOCK_FLASHCARDS];
}

export async function submitFlashcardRating(id: string, rating: FlashcardDifficulty): Promise<Flashcard> {
  await delay(300);
  const card = MOCK_FLASHCARDS.find(fc => fc.id === id);
  if (!card) {
    throw new Error(`Flashcard with ID ${id} not found`);
  }
  // Simulate spaced repetition updates
  const updatedCard = { ...card, difficulty: rating };
  if (rating === 'Easy') {
    updatedCard.intervalDays = card.intervalDays * 2.5;
    updatedCard.easeFactor = card.easeFactor + 0.15;
  } else if (rating === 'Good') {
    updatedCard.intervalDays = card.intervalDays * 1.8;
  } else if (rating === 'Hard') {
    updatedCard.intervalDays = Math.max(1, card.intervalDays * 0.8);
    updatedCard.easeFactor = Math.max(1.3, card.easeFactor - 0.15);
  } else {
    updatedCard.intervalDays = 1;
    updatedCard.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
  }
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + Math.round(updatedCard.intervalDays));
  updatedCard.nextReviewDate = nextDate.toISOString();

  // Update in local memory mock
  const idx = MOCK_FLASHCARDS.findIndex(fc => fc.id === id);
  MOCK_FLASHCARDS[idx] = updatedCard;

  // Track in dashboard activities
  MOCK_DASHBOARD_SUMMARY.dailyCompleted += 1;
  MOCK_DASHBOARD_SUMMARY.recentActivity.unshift({
    id: `act-${Date.now()}`,
    type: 'flashcard',
    title: `Rated ${card.subject} Card (${rating})`,
    timestamp: 'Just now',
    status: 'Completed'
  });
  if (MOCK_DASHBOARD_SUMMARY.recentActivity.length > 5) {
    MOCK_DASHBOARD_SUMMARY.recentActivity.pop();
  }

  return updatedCard;
}

export async function getClinicalCase(id: string): Promise<ClinicalCase> {
  await delay(300);
  const clinicalCase = MOCK_CLINICAL_CASES[id];
  if (!clinicalCase) {
    // If specific id is missing, return case-101 to avoid crash
    return MOCK_CLINICAL_CASES['case-101'];
  }
  return { ...clinicalCase };
}

export async function getQuizDeck(): Promise<QuizQuestion[]> {
  await delay(300);
  return [...MOCK_QUIZ_QUESTIONS];
}

export async function getStudyAnalytics(): Promise<StudyAnalytics> {
  await delay(300);
  // Update with current dashboard values to be consistent
  const analytics = { ...MOCK_STUDY_ANALYTICS };
  analytics.progress.dailyCompleted = MOCK_DASHBOARD_SUMMARY.dailyCompleted;
  analytics.progress.streakDays = MOCK_DASHBOARD_SUMMARY.streakDays;
  return analytics;
}
