from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.accounts.models import InstructorApplication
from apps.analytics.models import StudyActivity, StudyProgress
from apps.billing.models import Transaction

from .factories import auth_client, make_case, make_course, make_deck, make_instructor, make_user

User = get_user_model()


class AnalyticsApiTests(TestCase):
    def setUp(self):
        self.student = make_user("dash@example.com")
        self.deck, self.card = make_deck()
        self.case = make_case()
        self.client = auth_client(self.student)

    def test_dashboard_summary_shape(self):
        body = self.client.get("/api/dashboard/summary/").json()
        self.assertEqual(
            set(body),
            {
                "dailyGoal",
                "dailyCompleted",
                "streakDays",
                "dueFlashcardsCount",
                "dueCasesCount",
                "dueQuizQuestionsCount",
                "recentActivity",
            },
        )
        self.assertEqual(body["dueFlashcardsCount"], 1)
        self.assertEqual(body["dueCasesCount"], 1)

    def test_flashcard_rating_feeds_progress_and_activity(self):
        self.client.post(f"/api/flashcards/{self.card.id}/rate/", {"rating": "Good"}, format="json")

        progress = StudyProgress.objects.get(user=self.student)
        self.assertEqual(progress.total_cards_reviewed, 1)
        self.assertEqual(progress.streak_days, 1)
        self.assertEqual(progress.daily_completed, 1)
        self.assertEqual(progress.accuracy_rate, 100.0)

        activity = StudyActivity.objects.get(user=self.student)
        self.assertEqual(activity.type, StudyActivity.FLASHCARD)
        self.assertIn("Cardiology", activity.title)

        summary = self.client.get("/api/dashboard/summary/").json()
        self.assertEqual(summary["recentActivity"][0]["status"], "Completed")
        self.assertEqual(summary["recentActivity"][0]["timestamp"], "Just now")

    def test_again_rating_counts_as_a_miss(self):
        self.client.post(f"/api/flashcards/{self.card.id}/rate/", {"rating": "Again"}, format="json")
        progress = StudyProgress.objects.get(user=self.student)
        self.assertEqual(progress.accuracy_rate, 0.0)
        self.assertEqual(progress.streak_days, 1)

    def test_study_analytics_payload(self):
        self.client.post(f"/api/flashcards/{self.card.id}/rate/", {"rating": "Easy"}, format="json")
        body = self.client.get("/api/analytics/").json()

        self.assertEqual(body["progress"]["totalCardsReviewed"], 1)
        self.assertEqual(body["progress"]["subjectMastery"][0]["subject"], "Cardiology")
        self.assertEqual(body["progress"]["reviewHistory"][0]["reviewedCount"], 1)
        self.assertIn("totalHoursStudied", body)

    def test_case_progress_lands_in_the_activity_feed(self):
        self.client.post(f"/api/cases/{self.case.id}/progress/", {"completedSteps": 1}, format="json")
        activity = StudyActivity.objects.get(user=self.student, type=StudyActivity.CASE)
        self.assertEqual(activity.status, "In Progress")

        summary = self.client.get("/api/dashboard/summary/").json()
        self.assertEqual(summary["dueCasesCount"], 0)

    def test_quiz_attempt_updates_accuracy_and_daily_counter(self):
        attempt = self.client.post("/api/quiz-attempts/", {}, format="json").json()
        self.client.post(f"/api/quiz-attempts/{attempt['id']}/finish/", {}, format="json")

        progress = StudyProgress.objects.get(user=self.student)
        self.assertEqual(progress.daily_completed, 1)
        self.assertEqual(StudyActivity.objects.filter(type=StudyActivity.QUIZ).count(), 1)


class InstructorRevenueApiTests(TestCase):
    def setUp(self):
        self.instructor_user, self.profile = make_instructor()
        self.course, _, _ = make_course(self.profile, student_count=40)
        self.client = auth_client(self.instructor_user)

    def test_stats_reflect_the_ledger(self):
        Transaction.objects.create(
            instructor=self.profile,
            type=Transaction.ENROLLMENT,
            description="New enrollment",
            amount=100,
        )
        Transaction.objects.create(
            instructor=self.profile,
            type=Transaction.PAYOUT,
            description="Payout",
            amount=-40,
            status=Transaction.COMPLETED,
        )
        Transaction.objects.create(
            instructor=self.profile,
            type=Transaction.PAYOUT,
            description="Pending payout",
            amount=-25,
            status=Transaction.PENDING,
        )

        stats = self.client.get("/api/instructor/stats/").json()
        self.assertEqual(stats["totalRevenue"], 100.0)
        self.assertEqual(stats["monthlyRevenue"], 100.0)
        self.assertEqual(stats["balance"], 60.0)
        self.assertEqual(stats["pendingPayout"], 25.0)
        self.assertEqual(stats["totalCourses"], 1)
        self.assertEqual(stats["totalStudents"], 40)
        # avgRating is aggregated from the instructor's courses, not the profile.
        self.assertEqual(stats["avgRating"], 5.0)

    def test_revenue_endpoint_returns_series_and_transactions(self):
        Transaction.objects.create(
            instructor=self.profile,
            type=Transaction.ENROLLMENT,
            description="New enrollment",
            amount=100,
        )
        body = self.client.get("/api/instructor/revenue/").json()
        self.assertEqual(len(body["monthly"]), 7)
        self.assertEqual(body["monthly"][-1]["amount"], 100.0)
        self.assertEqual(body["transactions"][0]["description"], "New enrollment")

    def test_instructor_courses_endpoint(self):
        courses = self.client.get("/api/instructor/courses/").json()
        self.assertEqual([c["slug"] for c in courses], ["test-course"])

    def test_students_are_blocked(self):
        student_client = auth_client(make_user("blocked@example.com"))
        self.assertEqual(student_client.get("/api/instructor/stats/").status_code, 403)

    def test_missing_profile_returns_404(self):
        admin_client = auth_client(make_user("admin2@example.com", role="ADMIN"))
        response = admin_client.get("/api/instructor/stats/")
        self.assertEqual(response.status_code, 404)


class AdminConsoleApiTests(TestCase):
    def setUp(self):
        self.admin = make_user("boss@example.com", role="ADMIN")
        self.client = auth_client(self.admin)
        _, self.profile = make_instructor()
        self.course, _, _ = make_course(self.profile)
        self.draft, _, _ = make_course(self.profile, slug="pending-course", status="pending")

    def test_stats_count_pending_items(self):
        InstructorApplication.objects.create(
            name="Dr. Applicant", email="applicant@example.com", specialty="Neurology"
        )
        stats = self.client.get("/api/admin/stats/").json()
        self.assertEqual(stats["totalCourses"], 2)
        self.assertEqual(stats["pendingApprovals"], 2)  # 1 application + 1 pending course

    def test_application_approval_creates_an_instructor(self):
        application = InstructorApplication.objects.create(
            name="Dr. Applicant", email="applicant@example.com", specialty="Neurology"
        )
        response = self.client.post(f"/api/admin/instructor-applications/{application.id}/approve/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "approved")

        user = User.objects.get(email="applicant@example.com")
        self.assertEqual(user.role, "INSTRUCTOR")
        self.assertEqual(user.instructor_profile.specialty, "Neurology")

    def test_application_rejection(self):
        application = InstructorApplication.objects.create(
            name="Dr. Reject", email="reject@example.com", specialty="Dermatology"
        )
        response = self.client.post(f"/api/admin/instructor-applications/{application.id}/reject/")
        self.assertEqual(response.json()["status"], "rejected")
        self.assertFalse(User.objects.filter(email="reject@example.com").exists())

    def test_course_moderation_actions(self):
        listing = self.client.get("/api/admin/courses/?status=pending").json()
        self.assertEqual([c["title"] for c in listing], ["Test Course"])

        published = self.client.post(f"/api/admin/courses/{self.draft.id}/approve/").json()
        self.assertEqual(published["status"], "published")

        rejected = self.client.post(f"/api/admin/courses/{self.course.id}/reject/").json()
        self.assertEqual(rejected["status"], "rejected")

        archived = self.client.post(f"/api/admin/courses/{self.draft.id}/archive/").json()
        self.assertEqual(archived["status"], "archived")

    def test_non_admins_cannot_moderate(self):
        student_client = auth_client(make_user("someone@example.com"))
        self.assertEqual(student_client.get("/api/admin/stats/").status_code, 403)
        self.assertEqual(student_client.get("/api/admin/courses/").status_code, 403)
