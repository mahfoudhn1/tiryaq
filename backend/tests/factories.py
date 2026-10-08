"""Small object builders so the API tests stay readable."""

from datetime import timedelta

from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient

from apps.accounts.models import InstructorProfile
from apps.catalog.models import Course, CourseModule, Lesson
from apps.study.models import ClinicalCase, Deck, DifferentialDiagnosis, Flashcard, LabResult, QuizQuestion

User = get_user_model()

PASSWORD = "test-pass-1234"


def make_user(email: str, role: str = "STUDENT", **extra):
    user = User(email=email, username=email, role=role, name=extra.pop("name", email.split("@")[0]))
    for field, value in extra.items():
        setattr(user, field, value)
    user.set_password(PASSWORD)
    user.save()
    return user


def make_instructor(email: str = "teacher@example.com", specialty: str = "Cardiology"):
    user = make_user(email, role="INSTRUCTOR", name="Dr. Test Teacher")
    profile = InstructorProfile.objects.create(
        user=user, specialty=specialty, bio="Test bio", rating=4.8
    )
    return user, profile


def make_course(profile, slug: str = "test-course", **overrides):
    defaults = {
        "title": "Test Course",
        "specialty": "Cardiology",
        "level": Course.INTERMEDIATE,
        "price": 100,
        "status": Course.PUBLISHED,
        "instructor": profile,
        "student_count": 10,
        "lesson_count": 1,
    }
    defaults.update(overrides)
    course = Course.objects.create(slug=slug, **defaults)
    module = CourseModule.objects.create(course=course, title="Module One", order=1)
    lesson = Lesson.objects.create(
        module=module, title="Lesson One", order=1, free=True, duration="10m"
    )
    return course, module, lesson


def make_deck(subject: str = "Cardiology"):
    deck = Deck.objects.create(name=f"{subject} Deck", subject=subject)
    card = Flashcard.objects.create(
        deck=deck,
        vignette="A patient presents with chest pain.",
        diagnosis="Acute coronary syndrome",
        rationale="Because troponin.",
        subject=subject,
        interval_days=2.0,
        ease_factor=2.5,
        next_review_date=timezone.now() - timedelta(hours=1),
    )
    return deck, card


def make_case(subject: str = "Cardiology"):
    case = ClinicalCase.objects.create(
        title="Test Case",
        subject=subject,
        presenting_complaint="Chest pain",
        final_diagnosis="ACS",
        discussion="Test discussion",
    )
    LabResult.objects.create(case=case, name="Troponin", value="480 ng/L", status=LabResult.HIGH)
    DifferentialDiagnosis.objects.create(case=case, diagnosis="ACS", correct=True)
    return case


def make_question(subject: str = "Pulmonology"):
    return QuizQuestion.objects.create(
        vignette="A patient has sudden dyspnoea.",
        options=["Option A", "Option B", "Option C"],
        correct_answer=1,
        explanation="Because the evidence supports option B.",
        subject=subject,
        yield_rating=QuizQuestion.HIGH,
    )


def auth_client(user) -> APIClient:
    """APIClient authenticated with a JWT pair obtained the real way."""

    client = APIClient()
    response = client.post(
        "/api/auth/login/",
        {"email": user.email, "password": PASSWORD},
        format="json",
    )
    assert response.status_code == 200, response.content
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.json()['access']}")
    return client
