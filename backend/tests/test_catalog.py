from django.test import TestCase
from rest_framework.test import APIClient

from apps.catalog.models import CartItem, Course, CourseReview, Enrollment

from .factories import auth_client, make_course, make_instructor, make_user


class CatalogApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.instructor_user, self.profile = make_instructor()
        self.course, self.module, self.lesson = make_course(self.profile)
        self.draft, _, _ = make_course(self.profile, slug="draft-course", title="Draft", status=Course.DRAFT)
        self.student = make_user("learner@example.com")

    def test_catalogue_is_public_and_hides_unpublished_courses(self):
        response = self.client.get("/api/courses/")
        self.assertEqual(response.status_code, 200)
        slugs = [course["slug"] for course in response.json()]
        self.assertEqual(slugs, ["test-course"])

    def test_catalogue_filters_and_sorts(self):
        make_course(
            self.profile,
            slug="cheap-neuro",
            title="Cheap Neuro",
            specialty="Neurology",
            level=Course.BEGINNER,
            price=10,
        )

        by_specialty = self.client.get("/api/courses/?specialty=Neurology").json()
        self.assertEqual([c["slug"] for c in by_specialty], ["cheap-neuro"])

        by_price = self.client.get("/api/courses/?sort=price-asc").json()
        self.assertEqual([c["price"] for c in by_price], [10.0, 100.0])

        by_search = self.client.get("/api/courses/?search=neuro").json()
        self.assertEqual(len(by_search), 1)

    def test_course_detail_accepts_a_slug_and_nests_the_curriculum(self):
        response = self.client.get("/api/courses/test-course/")
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["instructor"]["specialty"], "Cardiology")
        self.assertEqual(body["modules"][0]["lessons"][0]["title"], "Lesson One")
        self.assertFalse(body["enrolled"])

    def test_missing_course_returns_404(self):
        self.assertEqual(self.client.get("/api/courses/does-not-exist/").status_code, 404)

    def test_enrollment_requires_authentication_and_is_idempotent(self):
        self.assertEqual(self.client.post(f"/api/courses/{self.course.id}/enroll/").status_code, 401)

        client = auth_client(self.student)
        first = client.post(f"/api/courses/{self.course.id}/enroll/")
        self.assertEqual(first.status_code, 201)
        self.assertTrue(first.json()["success"])

        again = client.post(f"/api/courses/{self.course.id}/enroll/")
        self.assertEqual(again.status_code, 200)

        self.assertEqual(Enrollment.objects.filter(user=self.student).count(), 1)
        self.course.refresh_from_db()
        self.assertEqual(self.course.student_count, 11)

        listings = client.get("/api/enrollments/").json()
        self.assertEqual(len(listings), 1)
        self.assertTrue(listings[0]["enrolled"])

    def test_lesson_completion_updates_course_progress(self):
        client = auth_client(self.student)
        client.post(f"/api/courses/{self.course.id}/enroll/")

        response = client.post(f"/api/lessons/{self.lesson.id}/complete/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["progress"], 100)

        lesson = client.get(f"/api/lessons/{self.lesson.id}/").json()
        self.assertTrue(lesson["completed"])
        self.assertEqual(lesson["course"]["title"], "Test Course")

    def test_lesson_completion_requires_enrollment(self):
        client = auth_client(self.student)
        response = client.post(f"/api/lessons/{self.lesson.id}/complete/")
        self.assertEqual(response.status_code, 403)

    def test_course_reviews_endpoint(self):
        CourseReview.objects.create(
            course=self.course, author_name="Tarek M.", rating=5, body="Great course."
        )
        response = self.client.get(f"/api/courses/{self.course.id}/reviews/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()[0]["initials"], "TM")

    def test_detail_routes_accept_a_slug_as_well_as_an_id(self):
        """The client links by slug, so every detail route must resolve one."""

        CourseReview.objects.create(
            course=self.course, author_name="Slug Reviewer", rating=4, body="Works."
        )
        detail = self.client.get("/api/courses/test-course/")
        self.assertEqual(detail.status_code, 200)
        self.assertEqual(detail.json()["id"], str(self.course.id))

        reviews = self.client.get("/api/courses/test-course/reviews/")
        self.assertEqual(reviews.status_code, 200)
        self.assertEqual(reviews.json()[0]["author"], "Slug Reviewer")

    def test_curriculum_reports_completed_lessons(self):
        client = auth_client(self.student)
        client.post(f"/api/courses/{self.course.id}/enroll/")

        before = client.get(f"/api/courses/{self.course.id}/").json()
        self.assertFalse(before["modules"][0]["lessons"][0]["completed"])

        client.post(f"/api/lessons/{self.lesson.id}/complete/")

        after = client.get(f"/api/courses/{self.course.id}/").json()
        self.assertTrue(after["modules"][0]["lessons"][0]["completed"])
        self.assertEqual(after["progress"], 100)

        enrolments = client.get("/api/enrollments/").json()
        self.assertTrue(enrolments[0]["modules"][0]["lessons"][0]["completed"])

    def test_cart_add_list_and_remove(self):
        client = auth_client(self.student)
        created = client.post("/api/cart/", {"courseId": str(self.course.id)}, format="json")
        self.assertEqual(created.status_code, 201)
        self.assertEqual(created.json()["title"], "Test Course")

        listed = client.get("/api/cart/").json()
        self.assertEqual(len(listed), 1)

        removed = client.delete(f"/api/cart/{self.course.id}/")
        self.assertEqual(removed.status_code, 204)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_cart_rejects_unknown_courses(self):
        client = auth_client(self.student)
        response = client.post("/api/cart/", {"courseId": "not-a-uuid"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_instructor_can_list_only_their_own_courses(self):
        client = auth_client(self.instructor_user)
        mine = client.get("/api/courses/?mine=1").json()
        self.assertEqual({c["slug"] for c in mine}, {"test-course", "draft-course"})

        student_client = auth_client(self.student)
        self.assertEqual(student_client.get("/api/courses/?mine=1").json(), [])
