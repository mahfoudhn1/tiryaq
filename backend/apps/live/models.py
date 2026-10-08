from datetime import timedelta

from django.db import models
from django.utils import timezone

from apps.accounts.models import InstructorProfile
from apps.catalog.models import Course
from apps.common.models import TimeStampedModel, UUIDModel
from apps.common.utils import parse_duration_to_minutes


class LiveSession(UUIDModel, TimeStampedModel):
    """A scheduled or running live class."""

    UPCOMING = "upcoming"
    LIVE = "live"
    ENDED = "ended"
    STATUS_CHOICES = [
        (UPCOMING, "Upcoming"),
        (LIVE, "Live"),
        (ENDED, "Ended"),
    ]

    title = models.CharField(max_length=200)
    topic = models.CharField(max_length=250, blank=True)
    instructor = models.ForeignKey(
        InstructorProfile, on_delete=models.CASCADE, related_name="live_sessions"
    )
    course = models.ForeignKey(
        Course,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="live_sessions",
    )
    scheduled_at = models.DateTimeField()
    duration = models.CharField(max_length=20, default="60m")
    participant_count = models.PositiveIntegerField(default=0)
    max_participants = models.PositiveIntegerField(default=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=UPCOMING)
    recording_available = models.BooleanField(default=False)

    class Meta:
        ordering = ["-scheduled_at"]

    def __str__(self) -> str:
        return self.title

    @property
    def ends_at(self):
        return self.scheduled_at + timedelta(minutes=parse_duration_to_minutes(self.duration))

    def computed_status(self) -> str:
        """Status derived from the clock, falling back to the stored value."""

        now = timezone.now()
        if now < self.scheduled_at:
            return self.UPCOMING
        if now <= self.ends_at:
            return self.LIVE
        return self.ENDED

    def save(self, *args, **kwargs):
        if self.scheduled_at:
            self.status = self.computed_status()
        super().save(*args, **kwargs)

    @property
    def is_full(self) -> bool:
        return self.participant_count >= self.max_participants

    def register(self, user) -> bool:
        """Register a user, returning True only for a new seat."""

        registration, created = LiveSessionRegistration.objects.get_or_create(
            session=self, user=user
        )
        if created:
            LiveSession.objects.filter(pk=self.pk).update(
                participant_count=models.F("participant_count") + 1
            )
            self.participant_count += 1
        return created


class LiveSessionRegistration(UUIDModel, TimeStampedModel):
    session = models.ForeignKey(
        LiveSession, on_delete=models.CASCADE, related_name="registrations"
    )
    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="live_registrations"
    )

    class Meta:
        unique_together = [("session", "user")]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user.email} → {self.session.title}"
