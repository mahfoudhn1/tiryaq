export type FlashcardDifficulty = 'Again' | 'Hard' | 'Good' | 'Easy';

export interface Flashcard {
  id: string;
  deckId: string;
  vignette: string;       // Clinical vignette / patient scenario on front
  diagnosis: string;      // Back of card: core diagnosis
  rationale: string;      // Back of card: clinical high-yield explanation
  subject: string;        // e.g. "Cardiology", "Neurology", etc.
  difficulty?: FlashcardDifficulty;
  intervalDays: number;   // Spaced repetition tracking
  easeFactor: number;     // Spaced repetition ease modifier
  nextReviewDate: string; // ISO date string
}

export interface FlashcardDeck {
  id: string;
  name: string;
  subject: string;
  cardCount: number;
  dueCount: number;
}

export interface PhysicalExam {
  general: string;
  vitals: string;
  cardiovascular: string;
  respiratory: string;
  abdomen: string;
  neurological: string;
}

export interface LabResult {
  name: string;
  value: string;
  referenceRange: string;
  status: 'Normal' | 'High' | 'Low';
}

export interface DifferentialDiagnosis {
  id: string;
  diagnosis: string;
  correct: boolean;
  feedback: string;
}

export interface DiagnosticStep {
  id: string;
  name: string;
  type: 'Physical' | 'Lab' | 'Imaging' | 'Management';
  result: string;
}

export interface ClinicalCase {
  id: string;
  title: string;
  presentingComplaint: string;
  historyOfPresentIllness: string;
  pastMedicalHistory: string;
  physicalExam: PhysicalExam;
  labs: LabResult[];
  differentialDiagnosis: DifferentialDiagnosis[];
  finalDiagnosis: string;
  discussion: string; // high-yield clinical discussion
}

export interface QuizQuestion {
  id: string;
  vignette: string;
  options: string[];
  correctAnswer: number; // index (0-based) of the correct option
  explanation: string;
  subject: string;
  yieldRating: 'High' | 'Medium' | 'Low';
}

export interface SubjectMastery {
  subject: string;
  masteryPercent: number;
  count: number;
}

export interface ReviewHistoryEntry {
  date: string;
  reviewedCount: number;
  accuracy: number;
}

export interface UserProgress {
  dailyGoal: number;
  dailyCompleted: number;
  streakDays: number;
  totalCardsReviewed: number;
  subjectMastery: SubjectMastery[];
  accuracyRate: number;
  reviewHistory: ReviewHistoryEntry[];
}

export interface DashboardSummary {
  dailyGoal: number;
  dailyCompleted: number;
  streakDays: number;
  dueFlashcardsCount: number;
  dueCasesCount: number;
  dueQuizQuestionsCount: number;
  recentActivity: {
    id: string;
    type: 'flashcard' | 'case' | 'quiz';
    title: string;
    timestamp: string;
    status: string;
  }[];
}

export interface StudyAnalytics {
  progress: UserProgress;
  totalHoursStudied: number;
  cardsRetentionRate: number; // e.g. 88%
  clinicalCaseSuccessRate: number; // e.g. 75%
}

// ── Auth / Users ────────────────────────────────────────────────────────────

export type UserRole = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  initials: string;
  year?: string;       // e.g. "MS-V" for students
  specialty?: string;  // for instructors
  avatarUrl?: string;
}

// ── Instructor ───────────────────────────────────────────────────────────────

export interface Instructor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  studentCount: number;
  courseCount: number;
  bio: string;
  initials: string;
}

export interface InstructorStats {
  totalRevenue: number;
  monthlyRevenue: number;
  pendingPayout: number;
  balance: number;
  totalStudents: number;
  totalCourses: number;
  avgRating: number;
  totalEnrollments: number;
  completionRate: number;
}

export interface Transaction {
  id: string;
  type: 'payout' | 'enrollment' | 'subscription';
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

// ── Courses ──────────────────────────────────────────────────────────────────

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'resource' | 'quiz';
  free: boolean;
  completed?: boolean;
  description?: string;
  resources?: { id: string; name: string; type: 'pdf' | 'slide' | 'reference'; size: string }[];
}

export interface CourseModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  instructor: Instructor;
  specialty: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  studentCount: number;
  lessonCount: number;
  duration: string;
  thumbnail?: string;
  description: string;
  badges: string[];
  modules: CourseModule[];
  enrolled?: boolean;
  progress?: number;
}

export interface CourseReview {
  id: string;
  author: string;
  initials: string;
  rating: number;
  date: string;
  body: string;
}

// ── Live Sessions ─────────────────────────────────────────────────────────────

export interface LiveSession {
  id: string;
  title: string;
  instructor: Instructor;
  course: string;
  scheduledAt: string;
  duration: string;
  participantCount: number;
  maxParticipants: number;
  status: 'upcoming' | 'live' | 'ended';
  recordingAvailable?: boolean;
  topic: string;
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalInstructors: number;
  totalCourses: number;
  totalRevenue: number;
  pendingApprovals: number;
  activeStudents: number;
}

export interface InstructorApplication {
  id: string;
  name: string;
  email: string;
  specialty: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  initials: string;
}

export interface AdminCourse {
  id: string;
  title: string;
  instructor: string;
  specialty: string;
  submittedAt: string;
  status: 'pending' | 'published' | 'rejected' | 'archived';
  studentCount: number;
}

// ── Cart / Subscription ───────────────────────────────────────────────────────

export interface CartItem {
  courseId: string;
  title: string;
  price: number;
  instructor: string;
}
