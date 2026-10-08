from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from apps.study.models import CaseProgress, Flashcard, FlashcardReview, QuizAttempt

from .factories import auth_client, make_case, make_deck, make_question, make_user


class StudyApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = make_user("studier@example.com")
        self.deck, self.card = make_deck()
        self.case = make_case()
        self.question = make_question()

    def test_endpoints_require_authentication(self):
        for path in ["/api/decks/", "/api/flashcards/", "/api/cases/", "/api/quiz-questions/"]:
            self.assertEqual(self.client.get(path).status_code, 401, path)

    def test_deck_counters(self):
        response = auth_client(self.student).get("/api/decks/")
        self.assertEqual(response.status_code, 200)
        deck = response.json()[0]
        self.assertEqual(deck["cardCount"], 1)
        self.assertEqual(deck["dueCount"], 1)
        self.assertEqual(deck["learningCount"], 0)
        self.assertEqual(deck["masteredCount"], 0)

    def test_due_filter_and_limit(self):
        client = auth_client(self.student)
        self.assertEqual(len(client.get("/api/flashcards/?due=1").json()), 1)

        # Push the card into the future and it drops out of the due queue.
        Flashcard.objects.filter(pk=self.card.pk).update(
            next_review_date=timezone.now() + timedelta(days=30)
        )
        self.assertEqual(client.get("/api/flashcards/?due=1").json(), [])
        self.assertEqual(len(client.get("/api/flashcards/").json()), 1)

    def test_rating_applies_the_spaced_repetition_math(self):
        client = auth_client(self.student)
        response = client.post(
            f"/api/flashcards/{self.card.id}/rate/", {"rating": "Easy"}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["intervalDays"], 5.0)  # 2 * 2.5
        self.assertAlmostEqual(body["easeFactor"], 2.65, places=2)
        self.assertEqual(body["difficulty"], "Easy")

        self.card.refresh_from_db()
        self.assertGreater(self.card.next_review_date, self.card.created_at)
        self.assertEqual(FlashcardReview.objects.filter(card=self.card, user=self.student).count(), 1)

    def test_rating_rejects_unknown_values(self):
        client = auth_client(self.student)
        response = client.post(
            f"/api/flashcards/{self.card.id}/rate/", {"rating": "Perfect"}, format="json"
        )
        self.assertEqual(response.status_code, 400)

    def test_clinical_case_list_and_detail(self):
        client = auth_client(self.student)
        listing = client.get("/api/cases/").json()
        self.assertEqual(len(listing), 1)
        self.assertEqual(listing[0]["status"], "available")
        self.assertEqual(listing[0]["totalSteps"], 2)  # one lab + one differential

        detail = client.get(f"/api/cases/{self.case.id}/").json()
        self.assertEqual(detail["finalDiagnosis"], "ACS")
        self.assertEqual(detail["labs"][0]["referenceRange"], "")
        self.assertTrue(detail["differentialDiagnosis"][0]["correct"])

    def test_case_progress_round_trip(self):
        client = auth_client(self.student)
        started = client.post(
            f"/api/cases/{self.case.id}/progress/", {"completedSteps": 1}, format="json"
        )
        self.assertEqual(started.json()["status"], "in-progress")

        finished = client.post(
            f"/api/cases/{self.case.id}/progress/", {"status": "completed"}, format="json"
        )
        self.assertEqual(finished.json()["completedSteps"], 2)

        record = CaseProgress.objects.get(user=self.student, case=self.case)
        self.assertEqual(record.status, "completed")

        listing = client.get("/api/cases/").json()
        self.assertEqual(listing[0]["status"], "completed")

    def test_quiz_attempt_scores_answers(self):
        client = auth_client(self.student)
        attempt = client.post("/api/quiz-attempts/", {}, format="json").json()
        self.assertEqual(attempt["total"], 1)

        wrong = client.post(
            f"/api/quiz-attempts/{attempt['id']}/answer/",
            {"questionId": str(self.question.id), "selectedIndex": 0},
            format="json",
        ).json()
        self.assertEqual(wrong["score"], 0)
        self.assertFalse(wrong["answers"][0]["isCorrect"])

        right = client.post(
            f"/api/quiz-attempts/{attempt['id']}/answer/",
            {"questionId": str(self.question.id), "selectedIndex": self.question.correct_answer},
            format="json",
        ).json()
        self.assertEqual(right["score"], 1)

        finished = client.post(f"/api/quiz-attempts/{attempt['id']}/finish/").json()
        self.assertEqual(finished["accuracy"], 100.0)
        self.assertIsNotNone(finished["completed_at"])
        self.assertEqual(QuizAttempt.objects.get(pk=attempt["id"]).score, 1)

    def test_quiz_answer_rejects_out_of_range_indexes(self):
        client = auth_client(self.student)
        attempt = client.post("/api/quiz-attempts/", {}, format="json").json()
        response = client.post(
            f"/api/quiz-attempts/{attempt['id']}/answer/",
            {"questionId": str(self.question.id), "selectedIndex": 99},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
