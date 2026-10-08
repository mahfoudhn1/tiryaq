from django.db import models
from django.utils import timezone

from apps.common.models import TimeStampedModel, UUIDModel


class StudyProgress(UUIDModel, TimeStampedModel):
    """One row per learner holding the dashboard headline numbers."""

    user = models.OneToOneField(
        "accounts.User", on_delete=models.CASCADE, related_name="study_progress"
    )
    daily_goal = models.PositiveIntegerField(default=20)
    daily_completed = models.PositiveIntegerField(default=0)
    streak_days = models.PositiveIntegerField(default=0)
    total_cards_reviewed = models.PositiveIntegerField(default=0)
    accuracy_rate = models.FloatField(default=0.0)
    total_hours_studied = models.FloatField(default=0.0)
    cards_retention_rate = models.FloatField(default=0.0)
    clinical_case_success_rate = models.FloatField(default=0.0)
    last_study_date = models.DateField(null=True, blank=True)

    def __str__(self) -> str:
        return f"Progress · {self.user.email}"

    def register_study_day(self) -> None:
        """Bump the streak/daily counter for activity happening right now."""

        today = timezone.localdate()
        if self.last_study_date is None:
            self.streak_days = 1
            self.daily_completed = 1
        elif self.last_study_date == today:
            self.daily_completed += 1
        elif (today - self.last_study_date).days == 1:
            self.streak_days += 1
            self.daily_completed = 1
        else:
            self.streak_days = 1
            self.daily_completed = 1
        self.last_study_date = today

    def refresh_daily_window(self) -> None:
        """Zero the daily counter when the learner has skipped a day."""

        today = timezone.localdate()
        if self.last_study_date and self.last_study_date != today:
            self.daily_completed = 0


class SubjectMastery(UUIDModel, TimeStampedModel):
    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="subject_mastery"
    )
    subject = models.CharField(max_length=120)
    mastery_percent = models.PositiveSmallIntegerField(default=0)
    count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-mastery_percent"]
        unique_together = [("user", "subject")]
        verbose_name_plural = "Subject mastery"

    def __str__(self) -> str:
        return f"{self.subject} · {self.mastery_percent}%"


class ReviewHistoryEntry(UUIDModel, TimeStampedModel):
    """One bucket of the weekly review chart."""

    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="review_history"
    )
    label = models.CharField(max_length=12)
    reviewed_count = models.PositiveIntegerField(default=0)
    accuracy = models.PositiveSmallIntegerField(default=0)
    order = models.PositiveSmallIntegerField(default=0)
    recorded_on = models.DateField(default=timezone.localdate)

    class Meta:
        ordering = ["order", "recorded_on"]

    def __str__(self) -> str:
        return f"{self.label}: {self.reviewed_count} reviews"


class StudyActivity(UUIDModel, TimeStampedModel):
    """Feed entry shown on the dashboard."""

    FLASHCARD = "flashcard"
    CASE = "case"
    QUIZ = "quiz"
    TYPE_CHOICES = [
        (FLASHCARD, "Flashcard"),
        (CASE, "Clinical case"),
        (QUIZ, "Quiz"),
    ]

    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="study_activities"
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=250)
    status = models.CharField(max_length=80, blank=True)
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-timestamp"]
        verbose_name_plural = "Study activity"

    def __str__(self) -> str:
        return f"{self.get_type_display()} · {self.title}"
