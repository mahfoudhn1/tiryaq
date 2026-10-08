from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from .factories import PASSWORD, auth_client, make_user

User = get_user_model()


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = make_user("student@example.com")

    def test_login_returns_tokens_and_user(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": self.student.email, "password": PASSWORD},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("access", body)
        self.assertIn("refresh", body)
        self.assertEqual(body["user"]["role"], "STUDENT")
        self.assertEqual(body["user"]["initials"], "ST")

    def test_login_rejects_a_bad_password(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": self.student.email, "password": "wrong-password"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)
        self.assertIn("Incorrect email", response.json()["detail"])

    def test_register_creates_a_student(self):
        response = self.client.post(
            "/api/auth/register/",
            {"name": "New Learner", "email": "new@example.com", "password": "super-secret-42"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["user"]["role"], "STUDENT")
        self.assertTrue(User.objects.filter(email="new@example.com").exists())

    def test_me_requires_authentication(self):
        self.assertEqual(self.client.get("/api/auth/me/").status_code, 401)

    def test_me_and_patch(self):
        client = auth_client(self.student)
        self.assertEqual(client.get("/api/auth/me/").json()["email"], self.student.email)

        response = client.patch("/api/auth/me/", {"name": "Renamed Learner"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["name"], "Renamed Learner")

    def test_logout_blacklists_the_refresh_token(self):
        tokens = self.client.post(
            "/api/auth/login/",
            {"email": self.student.email, "password": PASSWORD},
            format="json",
        ).json()

        response = self.client.post("/api/auth/logout/", {"refresh": tokens["refresh"]}, format="json")
        self.assertEqual(response.status_code, 205)

        reuse = self.client.post("/api/auth/refresh/", {"refresh": tokens["refresh"]}, format="json")
        self.assertEqual(reuse.status_code, 401)

    def test_demo_login_covers_every_role(self):
        from apps.accounts.constants import DEMO_ACCOUNTS

        for role, account in DEMO_ACCOUNTS.items():
            make_user(account["email"], role=role, name=account["name"])

        for role in DEMO_ACCOUNTS:
            response = self.client.post("/api/auth/demo-login/", {"role": role}, format="json")
            self.assertEqual(response.status_code, 200, role)
            self.assertEqual(response.json()["user"]["role"], role)

    def test_demo_login_reports_missing_accounts(self):
        response = self.client.post("/api/auth/demo-login/", {"role": "ADMIN"}, format="json")
        self.assertEqual(response.status_code, 404)
        self.assertIn("seed_demo", response.json()["detail"])

    def test_application_can_be_submitted_and_is_admin_only_to_read(self):
        client = auth_client(self.student)
        created = client.post(
            "/api/admin/instructor-applications/",
            {"name": "Dr. Applicant", "email": "applicant@example.com", "specialty": "Neurology"},
            format="json",
        )
        self.assertEqual(created.status_code, 201)

        # Students cannot read the review queue.
        self.assertEqual(client.get("/api/admin/instructor-applications/").status_code, 403)
