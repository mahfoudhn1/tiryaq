import {
  Course, Instructor, LiveSession, InstructorApplication,
  AdminCourse, Transaction, InstructorStats, AdminStats,
} from '@/types/medical';

// ── Instructors ──────────────────────────────────────────────────────────────

export const MOCK_INSTRUCTORS: Instructor[] = [
  {
    id: 'inst-1',
    name: 'Dr. Amine Haddad',
    specialty: 'Cardiology',
    rating: 4.9,
    studentCount: 8240,
    courseCount: 3,
    bio: 'Interventional cardiologist with 15 years of clinical and teaching experience. Author of the CardioSprint series.',
    initials: 'AH',
  },
  {
    id: 'inst-2',
    name: 'Dr. Leila Mansouri',
    specialty: 'Neurology',
    rating: 4.8,
    studentCount: 5110,
    courseCount: 2,
    bio: 'Academic neurologist specialising in stroke and epilepsy. Known for making complex neuroanatomy accessible.',
    initials: 'LM',
  },
  {
    id: 'inst-3',
    name: 'Dr. Karim Ouali',
    specialty: 'Emergency Medicine',
    rating: 4.7,
    studentCount: 6380,
    courseCount: 4,
    bio: 'Emergency physician and simulation educator. Practical, high-yield teaching for every rotation and shelf exam.',
    initials: 'KO',
  },
  {
    id: 'inst-4',
    name: 'Dr. Aya Chikh',
    specialty: 'Nephrology',
    rating: 4.8,
    studentCount: 3920,
    courseCount: 2,
    bio: 'Nephrologist with a focus on acid-base disorders and AKI management. Consultant for two USMLE prep companies.',
    initials: 'SC',
  },
];

// ── Courses ──────────────────────────────────────────────────────────────────

export const MOCK_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'The Cardio Sprint',
    slug: 'cardiology-sprint',
    instructor: MOCK_INSTRUCTORS[0],
    specialty: 'Cardiology',
    level: 'Intermediate',
    price: 3000,
    originalPrice: 6000,
    rating: 4.9,
    reviewCount: 1284,
    studentCount: 8240,
    lessonCount: 42,
    duration: '18h 30m',
    description: 'A focused, high-yield cardiology course covering everything from basic cardiac physiology to advanced ECG interpretation, heart failure, arrhythmias, and ACS management. Built for MS-III/IV students and USMLE Step 2 CK prep.',
    badges: ['Best Seller', 'New'],
    enrolled: true,
    progress: 34,
    modules: [
      {
        id: 'm-1',
        title: 'Cardiac Anatomy & Physiology',
        lessons: [
          { id: 'l-1-1', title: 'Cardiac cycle and pressure-volume loops', duration: '28m', type: 'video', free: true, completed: true },
          { id: 'l-1-2', title: 'Coronary anatomy and blood supply', duration: '22m', type: 'video', free: false, completed: true },
          { id: 'l-1-3', title: 'Lecture slides — Anatomy unit', duration: '', type: 'resource', free: false, completed: false, resources: [{ id: 'r-1', name: 'Cardiac Anatomy Slides.pdf', type: 'slide', size: '4.2 MB' }] },
        ],
      },
      {
        id: 'm-2',
        title: 'ECG Interpretation',
        lessons: [
          { id: 'l-2-1', title: 'The systematic approach to ECG reading', duration: '35m', type: 'video', free: true, completed: true },
          { id: 'l-2-2', title: 'Arrhythmia recognition', duration: '40m', type: 'video', free: false, completed: false },
          { id: 'l-2-3', title: 'ST-segment changes and ACS', duration: '32m', type: 'video', free: false, completed: false },
          { id: 'l-2-4', title: 'High-yield ECG cheat sheet', duration: '', type: 'resource', free: false, completed: false, resources: [{ id: 'r-2', name: 'ECG Cheat Sheet.pdf', type: 'pdf', size: '1.8 MB' }] },
        ],
      },
      {
        id: 'm-3',
        title: 'Heart Failure',
        lessons: [
          { id: 'l-3-1', title: 'HFrEF vs HFpEF — pathophysiology', duration: '30m', type: 'video', free: false, completed: false },
          { id: 'l-3-2', title: 'Management ladder and GDMT', duration: '25m', type: 'video', free: false, completed: false },
          { id: 'l-3-3', title: 'Acute decompensated heart failure', duration: '28m', type: 'video', free: false, completed: false },
        ],
      },
    ],
  },
  {
    id: 'course-2',
    title: 'Neuro Made Simple',
    slug: 'neurology-made-simple',
    instructor: MOCK_INSTRUCTORS[1],
    specialty: 'Neurology',
    level: 'Beginner',
    price: 39,
    rating: 4.8,
    reviewCount: 876,
    studentCount: 5110,
    lessonCount: 35,
    duration: '14h 15m',
    description: 'Master clinical neurology from lesion localisation to stroke management. Covers the most-tested neurological syndromes with case-based teaching and high-yield mnemonics.',
    badges: ['Top Rated'],
    enrolled: false,
    modules: [
      {
        id: 'm-1',
        title: 'Neuroanatomy for Clinicians',
        lessons: [
          { id: 'l-1-1', title: 'The upper vs lower motor neuron', duration: '26m', type: 'video', free: true, completed: false },
          { id: 'l-1-2', title: 'Spinal cord syndromes', duration: '30m', type: 'video', free: false, completed: false },
        ],
      },
    ],
  },
  {
    id: 'course-3',
    title: 'Emergency Medicine Essentials',
    slug: 'emergency-medicine-essentials',
    instructor: MOCK_INSTRUCTORS[2],
    specialty: 'Emergency Medicine',
    level: 'Intermediate',
    price: 54,
    originalPrice: 69,
    rating: 4.7,
    reviewCount: 1050,
    studentCount: 6380,
    lessonCount: 56,
    duration: '22h',
    description: 'Everything you need to survive the ED rotation and nail shelf exams. ABCDE approach, trauma, toxicology, and the top presentations every student gets pimped on.',
    badges: ['Best Seller'],
    enrolled: false,
    modules: [
      {
        id: 'm-1',
        title: 'Critical Care Approach',
        lessons: [
          { id: 'l-1-1', title: 'Primary survey and ABCDE', duration: '20m', type: 'video', free: true, completed: false },
          { id: 'l-1-2', title: 'Airway management essentials', duration: '35m', type: 'video', free: false, completed: false },
        ],
      },
    ],
  },
  {
    id: 'course-4',
    title: 'Renal & Acid-Base Mastery',
    slug: 'renal-acid-base',
    instructor: MOCK_INSTRUCTORS[3],
    specialty: 'Nephrology',
    level: 'Advanced',
    price: 44,
    rating: 4.8,
    reviewCount: 620,
    studentCount: 3920,
    lessonCount: 30,
    duration: '12h',
    description: 'The definitive guide to renal pathophysiology, AKI, CKD, glomerulonephritis, and a step-by-step acid-base interpretation framework that never fails.',
    badges: ['New'],
    enrolled: false,
    modules: [
      {
        id: 'm-1',
        title: 'Glomerular Disorders',
        lessons: [
          { id: 'l-1-1', title: 'Nephritic vs nephrotic syndrome', duration: '32m', type: 'video', free: true, completed: false },
          { id: 'l-1-2', title: 'The big six glomerulonephritides', duration: '40m', type: 'video', free: false, completed: false },
        ],
      },
    ],
  },
  {
    id: 'course-5',
    title: 'Internal Medicine Bootcamp',
    slug: 'internal-medicine-bootcamp',
    instructor: MOCK_INSTRUCTORS[2],
    specialty: 'Internal Medicine',
    level: 'Intermediate',
    price: 2000,
    originalPrice: 6000,
    rating: 4.7,
    reviewCount: 2100,
    studentCount: 11200,
    lessonCount: 68,
    duration: '28h',
    description: 'A comprehensive internal medicine course covering all major organ systems. Perfect for clerkship prep, Step 2 CK, and NBME shelf exams.',
    badges: ['Best Seller', 'Top Rated'],
    enrolled: false,
    modules: [
      {
        id: 'm-1',
        title: 'Pulmonology',
        lessons: [
          { id: 'l-1-1', title: 'Approach to dyspnoea', duration: '22m', type: 'video', free: true, completed: false },
          { id: 'l-1-2', title: 'COPD and asthma management', duration: '35m', type: 'video', free: false, completed: false },
        ],
      },
    ],
  },
  {
    id: 'course-6',
    title: 'ECG Masterclass',
    slug: 'ecg-masterclass',
    instructor: MOCK_INSTRUCTORS[0],
    specialty: 'Cardiology',
    level: 'Beginner',
    price: 9000,
    rating: 4.9,
    reviewCount: 3450,
    studentCount: 15600,
    lessonCount: 24,
    duration: '8h',
    description: 'From the basics to advanced interpretation. Includes 50+ practice ECGs with detailed walkthroughs.',
    badges: ['Best Seller', 'Top Rated'],
    enrolled: false,
    modules: [
      {
        id: 'm-1',
        title: 'ECG Fundamentals',
        lessons: [
          { id: 'l-1-1', title: 'Leads, axes, and the basics', duration: '18m', type: 'video', free: true, completed: false },
          { id: 'l-1-2', title: 'Rate and rhythm analysis', duration: '24m', type: 'video', free: false, completed: false },
        ],
      },
    ],
  },
];

// ── Live Sessions ─────────────────────────────────────────────────────────────

export const MOCK_LIVE_SESSIONS: LiveSession[] = [
  {
    id: 'live-1',
    title: 'ECG Interpretation: Live Practice',
    instructor: MOCK_INSTRUCTORS[0],
    course: 'The Cardio Sprint',
    scheduledAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    duration: '90m',
    participantCount: 142,
    maxParticipants: 200,
    status: 'live',
    topic: 'ACS pattern recognition and STEMI mimics',
  },
  {
    id: 'live-2',
    title: 'Stroke Syndromes Q&A',
    instructor: MOCK_INSTRUCTORS[1],
    course: 'Neuro Made Simple',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: '60m',
    participantCount: 0,
    maxParticipants: 150,
    status: 'upcoming',
    topic: 'Lateral medullary, locked-in syndrome, and top-of-basilar',
  },
  {
    id: 'live-3',
    title: 'Trauma Assessment Workshop',
    instructor: MOCK_INSTRUCTORS[2],
    course: 'Emergency Medicine Essentials',
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: '120m',
    participantCount: 0,
    maxParticipants: 100,
    status: 'upcoming',
    topic: 'ATLS primary and secondary survey walkthrough',
  },
  {
    id: 'live-4',
    title: 'Acid-Base Deep Dive',
    instructor: MOCK_INSTRUCTORS[3],
    course: 'Renal & Acid-Base Mastery',
    scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: '90m',
    participantCount: 89,
    maxParticipants: 120,
    status: 'ended',
    recordingAvailable: true,
    topic: 'Mixed acid-base disorders and compensation rules',
  },
  {
    id: 'live-5',
    title: 'Heart Failure Management Updates',
    instructor: MOCK_INSTRUCTORS[0],
    course: 'The Cardio Sprint',
    scheduledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: '75m',
    participantCount: 201,
    maxParticipants: 200,
    status: 'ended',
    recordingAvailable: true,
    topic: 'GDMT, SGLT2 inhibitors, and device therapy',
  },
];

// ── Instructor Stats ──────────────────────────────────────────────────────────

export const MOCK_INSTRUCTOR_STATS: InstructorStats = {
  totalRevenue: 84320,
  monthlyRevenue: 9140,
  pendingPayout: 3280,
  balance: 5860,
  totalStudents: 8240,
  totalCourses: 3,
  avgRating: 4.9,
  totalEnrollments: 9105,
  completionRate: 67,
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', type: 'enrollment', description: 'The Cardio Sprint — new enrollment', amount: 49, date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), status: 'completed' },
  { id: 'tx-2', type: 'enrollment', description: 'ECG Masterclass — new enrollment', amount: 29, date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), status: 'completed' },
  { id: 'tx-3', type: 'payout', description: 'Monthly payout — August 2026', amount: -8200, date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
  { id: 'tx-4', type: 'enrollment', description: 'The Cardio Sprint — new enrollment', amount: 49, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
  { id: 'tx-5', type: 'enrollment', description: 'ECG Masterclass — new enrollment', amount: 29, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'completed' },
  { id: 'tx-6', type: 'payout', description: 'Pending payout — September 2026', amount: -3280, date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' },
];

export const MOCK_MONTHLY_REVENUE = [
  { month: 'Mar', amount: 4200 },
  { month: 'Apr', amount: 5800 },
  { month: 'May', amount: 6100 },
  { month: 'Jun', amount: 7400 },
  { month: 'Jul', amount: 8900 },
  { month: 'Aug', amount: 8200 },
  { month: 'Sep', amount: 9140 },
];

// ── Admin ─────────────────────────────────────────────────────────────────────

export const MOCK_ADMIN_STATS: AdminStats = {
  totalUsers: 24810,
  totalInstructors: 38,
  totalCourses: 94,
  totalRevenue: 412500,
  pendingApprovals: 5,
  activeStudents: 18340,
};

export const MOCK_INSTRUCTOR_APPLICATIONS: InstructorApplication[] = [
  { id: 'app-1', name: 'Dr. Nadia Ferhat', email: 'nadia.ferhat@gmail.com', specialty: 'Gastroenterology', appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', initials: 'NF' },
  { id: 'app-2', name: 'Dr. Youcef Brahimi', email: 'y.brahimi@chu.dz', specialty: 'Endocrinology', appliedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', initials: 'YB' },
  { id: 'app-3', name: 'Dr. Amina Belkacemi', email: 'amina.b@med.edu', specialty: 'Hematology', appliedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', initials: 'AB' },
  { id: 'app-4', name: 'Dr. Rachid Tlemceni', email: 'r.tlemceni@gmail.com', specialty: 'Rheumatology', appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'approved', initials: 'RT' },
  { id: 'app-5', name: 'Dr. Zineb Aouari', email: 'zineb.a@hospital.net', specialty: 'Dermatology', appliedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), status: 'rejected', initials: 'ZA' },
];

export const MOCK_ADMIN_COURSES: AdminCourse[] = [
  { id: 'ac-1', title: 'Gastroenterology Essentials', instructor: 'Dr. Nadia Ferhat', specialty: 'Gastroenterology', submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending', studentCount: 0 },
  { id: 'ac-2', title: 'The Cardio Sprint', instructor: 'Dr. Amine Haddad', specialty: 'Cardiology', submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), status: 'published', studentCount: 8240 },
  { id: 'ac-3', title: 'Neuro Made Simple', instructor: 'Dr. Leila Mansouri', specialty: 'Neurology', submittedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), status: 'published', studentCount: 5110 },
  { id: 'ac-4', title: 'Basic Dermatology', instructor: 'Dr. Zineb Aouari', specialty: 'Dermatology', submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), status: 'rejected', studentCount: 0 },
  { id: 'ac-5', title: 'Emergency Medicine Essentials', instructor: 'Dr. Karim Ouali', specialty: 'Emergency Medicine', submittedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), status: 'published', studentCount: 6380 },
  { id: 'ac-6', title: 'Old Pediatrics Course 2023', instructor: 'Dr. Karim Ouali', specialty: 'Pediatrics', submittedAt: new Date(Date.now() - 400 * 24 * 60 * 60 * 1000).toISOString(), status: 'archived', studentCount: 1200 },
];

// ── Course Reviews ─────────────────────────────────────────────────────────────

export const MOCK_COURSE_REVIEWS = [
  { id: 'rev-1', author: 'Tarek M.', initials: 'TM', rating: 5, date: '2026-08-10', body: "Best cardiology resource I've found. Dr. Haddad explains ACS in a way that actually sticks. Passed my shelf after going through this twice." },
  { id: 'rev-2', author: 'Fatima A.', initials: 'FA', rating: 5, date: '2026-07-28', body: 'The ECG section alone is worth the price. I could barely read a tracing before this course.' },
  { id: 'rev-3', author: 'Omar K.', initials: 'OK', rating: 4, date: '2026-07-15', body: "Really solid content. I'd like more practice questions embedded in the videos, but the explanations are excellent." },
];
