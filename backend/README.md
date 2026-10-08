# Tiryaq API (Django + DRF + PostgreSQL)

Backend for the Tiryaq clinical learning platform. It replaces every fixture the
Next.js client used to ship (`tiryaq/lib/mock/data.ts`,
`tiryaq/services/studyService.ts`) with real endpoints, and the frontend is
already wired to it.

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Django 5.2 + Django REST Framework 3.15 |
| Database | PostgreSQL (psycopg2) |
| Auth | JWT (`djangorestframework-simplejwt`), access + refresh with rotation and blacklisting |
| CORS | `django-cors-headers`, origin list from env |
| Filtering | `django-filter` |

## Quick start

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate    # optional but recommended
pip install -r requirements.txt

cp .env.example .env      # then edit the DB credentials
python manage.py migrate
python manage.py seed_demo          # idempotent demo data (add --reset to wipe first)
python manage.py runserver          # http://localhost:8000
```

Seeded accounts (password `password`):

| Role | Email |
| --- | --- |
| Student | `Aya.Zmt@tiryaq.com` |
| Instructor | `amine.haddad@tiryaq.com` |
| Admin | `admin@tiryaq.com` |

The Django admin lives at `/django-admin/` (the seeded admin is a superuser).

## Environment

| Variable | Default | Notes |
| --- | --- | --- |
| `DB_NAME` | `tiryaq` | |
| `DB_USER` | `mahfoud` | |
| `DB_PASSWORD` | `mahfoud1996` | |
| `DB_HOST` | `localhost` | |
| `DB_PORT` | `5432` | |
| `DJANGO_SECRET_KEY` | dev key | set a real one in production |
| `DJANGO_DEBUG` | `true` | |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | `testserver` is always appended |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,...` | the Next.js origin |
| `JWT_ACCESS_MINUTES` / `JWT_REFRESH_DAYS` | `60` / `14` | |
| `ALLOW_DEMO_LOGIN` | `DEBUG` | gates `POST /api/auth/demo-login/` |
| `DEMO_PASSWORD` | `password` | used by the seeder and instructor approval |

## Apps

| App | Models |
| --- | --- |
| `accounts` | `User` (roles STUDENT/INSTRUCTOR/ADMIN), `InstructorProfile`, `InstructorApplication` |
| `catalog` | `Course`, `CourseModule`, `Lesson`, `LessonResource`, `CourseReview`, `Enrollment`, `CartItem` |
| `live` | `LiveSession`, `LiveSessionRegistration` |
| `study` | `Deck`, `Flashcard`, `FlashcardReview`, `ClinicalCase`, `PhysicalExam`, `LabResult`, `DifferentialDiagnosis`, `QuizQuestion`, `QuizAttempt`, `QuizAnswer`, `CaseProgress` |
| `analytics` | `StudyProgress`, `SubjectMastery`, `ReviewHistoryEntry`, `StudyActivity` |
| `billing` | `Transaction` |
| `moderation` | view-only: admin console endpoints over the apps above |
| `common` | shared mixins/helpers + the `seed_demo` command |

## Endpoints

All JSON responses use the field names the TypeScript types expect
(`camelCase`, string ids), so the React components did not have to change.

### Auth — `/api/auth/`

| Method | Path | Notes |
| --- | --- | --- |
| POST | `register/` | creates a student, returns tokens + user |
| POST | `login/` | `{email, password}` → `{access, refresh, user}` |
| POST | `demo-login/` | `{role}` → signs in the seeded demo account; 404 until `seed_demo` runs |
| POST | `refresh/` | SimpleJWT token refresh (rotating) |
| POST | `logout/` | blacklists the supplied refresh token |
| GET/PATCH | `me/` | current user |

### Catalogue — `/api/`

| Method | Path | Notes |
| --- | --- | --- |
| GET | `courses/` | public; `specialty`, `level`, `maxPrice`, `minPrice`, `search`, `sort=popular\|newest\|rating\|price-asc\|price-desc`, `mine=1` |
| GET | `courses/{id-or-slug}/` | public |
| GET | `courses/{id}/reviews/` | public |
| POST | `courses/{id}/enroll/` | auth; idempotent, bumps `studentCount` |
| GET | `enrollments/` | the caller's enrolled courses (with progress) |
| GET/POST/DELETE | `cart/`, `cart/{courseId}/` | server-side cart |
| GET | `lessons/{id}/` | lesson + module + full course outline for the player |
| POST | `lessons/{id}/complete/` | marks a lesson done and recalculates course progress |

### Study — `/api/`

| Method | Path | Notes |
| --- | --- | --- |
| GET | `decks/` | `due`, `new`, `learning`, `mastered` counters per deck |
| GET | `flashcards/` | `?due=1&deck=&subject=&limit=` |
| POST | `flashcards/{id}/rate/` | `{rating}` ∈ Again/Hard/Good/Easy; applies the SM-2 style scheduler |
| GET | `cases/` | card list with per-user `status`, `completedSteps`, `totalSteps` |
| GET | `cases/{id}/` | full case: exam, labs, differentials, discussion |
| GET/POST | `cases/{id}/progress/` | read or update case progress (feeds the activity feed) |
| GET | `quiz-questions/` | `?subject=&block=&yield_rating=&limit=&random=1` |
| POST | `quiz-attempts/` | start a QBank session |
| POST | `quiz-attempts/{id}/answer/` | `{questionId, selectedIndex}` |
| POST | `quiz-attempts/{id}/finish/` | scores the attempt and logs study activity |

### Analytics — `/api/`

| Method | Path | Notes |
| --- | --- | --- |
| GET | `dashboard/summary/` | goals, streak, due counts, recent activity |
| GET | `analytics/` | mastery, retention, weekly review history |
| GET | `analytics/subject-mastery/`, `analytics/review-history/`, `analytics/activity/` | drill-downs |
| GET | `instructor/stats/`, `instructor/courses/`, `instructor/revenue/` | instructor portal (role-gated) |
| GET | `admin/stats/`, `admin/courses/`, `admin/instructor-applications/` | admin console (role-gated) |
| POST | `admin/courses/{id}/approve\|reject\|archive/` | course moderation |
| POST | `admin/instructor-applications/{id}/approve\|reject/` | approving provisions the instructor account + profile |
| GET | `health/` | liveness + database probe |

## Tests

```bash
python3 manage.py test          # 51 tests, ~8s
```

Coverage: auth/registration/roles, catalogue filtering and enrollment, lesson
completion, cart, the spaced-repetition maths, clinical case progress, QBank
scoring, dashboard/analytics aggregation, instructor revenue, and admin
moderation.

## Design decisions

- **Response shapes follow the frontend types.** Serializers emit `camelCase`
  with string ids and nested curriculum/case objects, so `types/medical.ts`
  stayed the contract for both sides.
- **Lists are not paginated** (`DEFAULT_PAGINATION_CLASS: None`) because the
  client maps responses straight onto arrays. Endpoints that can grow large
  accept `?limit=`.
- **UUID primary keys** keep ids stable and safe in URLs; `seed_demo` assigns
  deterministic `uuid5` ids so re-running it is idempotent.
- **Flashcard scheduling is global per card**, with every rating logged in
  `FlashcardReview` per user. Per-user card copies are the natural next step if
  you want independent schedules.
- **`demo-login` is a development affordance**; it is disabled automatically
  when `DJANGO_DEBUG` is false.
- Course moderation and instructor approval endpoints are role-gated on the
  `role` field of the user model rather than Django's `is_staff`.

## Deliberately left on the client

- **Medication nomenclature** (`tiryaq/lib/db.ts`, `hooks/useMedicationSearch.ts`)
  stays in IndexedDB so drug search keeps working offline; it is not modelled here.
- **The Redux cart slice** is still the local source of truth for the header badge.
  The equivalent server endpoints exist (`/api/cart/`, `POST /api/cart/`,
  `DELETE /api/cart/{courseId}/`) whenever the cart UI is built.
- **Clinical calculators** (`tiryaq/lib/calculators/*`) are pure functions and
  need no backend.

## Repository layout

`backend/` sits next to the `tiryaq/` Next.js repository, which is its own git
repo — so these files are not tracked by it. Run `git init` inside `backend/` if
you want it under version control.
