import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.common.models import TimeStampedModel, UUIDModel, initials_for

from .constants import ROLE_CHOICES, STUDENT


class User(AbstractUser):
    """Platform user. Students, instructors and admins share one table."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=STUDENT)
    year = models.CharField(max_length=20, blank=True)
    avatar_url = models.URLField(blank=True)

    REQUIRED_FIELDS = ["email"]

    class Meta:
        ordering = ["name", "email"]

    def __str__(self) -> str:
        return self.name or self.email

    @property
    def display_name(self) -> str:
        return self.name or self.username or self.email

    @property
    def initials(self) -> str:
        return initials_for(self.display_name)

    @property
    def specialty(self) -> str:
        profile = getattr(self, "instructor_profile", None)
        return profile.specialty if profile else ""

    @property
    def is_admin_role(self) -> bool:
        return self.role == "ADMIN"

    @property
    def is_instructor_role(self) -> bool:
        return self.role == "INSTRUCTOR"

    @property
    def is_student_role(self) -> bool:
        return self.role == "STUDENT"


class InstructorProfile(UUIDModel, TimeStampedModel):
    """Public teaching profile. Powers the instructor blocks in the UI."""

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="instructor_profile",
    )
    specialty = models.CharField(max_length=120, blank=True)
    bio = models.TextField(blank=True)
    rating = models.FloatField(default=5.0)
    student_count = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField(default=False)

    class Meta:
        ordering = ["user__name"]

    def __str__(self) -> str:
        return f"{self.user.display_name} · {self.specialty}".strip(" ·")

    @property
    def name(self) -> str:
        return self.user.display_name

    @property
    def initials(self) -> str:
        return self.user.initials

    @property
    def course_count(self) -> int:
        return self.courses.count()


class InstructorApplication(UUIDModel, TimeStampedModel):
    """An instructor who applied to teach on the platform."""

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (APPROVED, "Approved"),
        (REJECTED, "Rejected"),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField()
    specialty = models.CharField(max_length=120)
    bio = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    applied_at = models.DateTimeField(auto_now_add=True)
    reviewed_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="reviewed_applications",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-applied_at"]

    def __str__(self) -> str:
        return f"{self.name} ({self.status})"

    @property
    def initials(self) -> str:
        return initials_for(self.name)
