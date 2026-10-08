from datetime import timedelta

from django.db import models
from django.utils import timezone

from apps.common.models import TimeStampedModel, UUIDModel


class Deck(UUIDModel, TimeStampedModel):
    """A named group of flashcards (subject deck)."""

    name = models.CharField(max_length=150)
    subject = models.CharField(max_length=120, db_index=True)
    description = models.TextField(blank=True)
    is_system = models.BooleanField(default=True)
    owner = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="decks",
    )

    class Meta:
        ordering = ["subject", "name"]

    def __str__(self) -> str:
        return f"{self.name} ({self.subject})"

    @property
    def card_count(self) -> int:
        return self.cards.count()

    @property
    def due_count(self) -> int:
        return self.cards.filter(next_review_date__lte=timezone.now()).count()


class Flashcard(UUIDModel, TimeStampedModel):
    """A clinical vignette card tracked with an SM-2 style scheduler."""

    AGAIN = "Again"
    HARD = "Hard"
    GOOD = "Good"
    EASY = "Easy"
    DIFFICULTY_CHOICES = [
        (AGAIN, "Again"),
        (HARD, "Hard"),
        (GOOD, "Good"),
        (EASY, "Easy"),
    ]

    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="cards")
    vignette = models.TextField()
    diagnosis = models.CharField(max_length=300)
    rationale = models.TextField(blank=True)
    subject = models.CharField(max_length=120, db_index=True)
    difficulty = models.CharField(
        max_length=10, choices=DIFFICULTY_CHOICES, blank=True, null=True
    )
    interval_days = models.FloatField(default=1.0)
    ease_factor = models.FloatField(default=2.5)
    next_review_date = models.DateTimeField(default=timezone.now, db_index=True)
    created_by = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="created_flashcards",
    )

    class Meta:
        ordering = ["next_review_date", "subject"]

    def __str__(self) -> str:
        return self.diagnosis

    @property
    def is_due(self) -> bool:
        return self.next_review_date <= timezone.now()

    def apply_rating(self, rating: str) -> None:
        """Spaced repetition update, mirroring the previous client algorithm."""

        if rating == self.EASY:
            self.interval_days *= 2.5
            self.ease_factor = self.ease_factor + 0.15
        elif rating == self.GOOD:
            self.interval_days *= 1.8
        elif rating == self.HARD:
            self.interval_days = max(1.0, self.interval_days * 0.8)
            self.ease_factor = max(1.3, self.ease_factor - 0.15)
        else:
            self.interval_days = 1.0
            self.ease_factor = max(1.3, self.ease_factor - 0.2)

        self.difficulty = rating
        self.next_review_date = timezone.now() + timedelta(
            days=round(self.interval_days)
        )

    def rate(self, rating: str, user=None) -> "FlashcardReview":
        self.apply_rating(rating)
        self.save(
            update_fields=[
                "difficulty",
                "interval_days",
                "ease_factor",
                "next_review_date",
                "updated_at",
            ]
        )
        return FlashcardReview.objects.create(
            card=self,
            user=user,
            rating=rating,
            interval_after=self.interval_days,
            ease_after=self.ease_factor,
        )


class FlashcardReview(UUIDModel, TimeStampedModel):
    """Audit trail of every rating a learner submits."""

    card = models.ForeignKey(Flashcard, on_delete=models.CASCADE, related_name="reviews")
    user = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="flashcard_reviews",
    )
    rating = models.CharField(max_length=10, choices=Flashcard.DIFFICULTY_CHOICES)
    reviewed_at = models.DateTimeField(default=timezone.now)
    interval_after = models.FloatField(default=1.0)
    ease_after = models.FloatField(default=2.5)

    class Meta:
        ordering = ["-reviewed_at"]

    def __str__(self) -> str:
        return f"{self.card.diagnosis} · {self.rating}"


class ClinicalCase(UUIDModel, TimeStampedModel):
    """Case-based clinical reasoning exercise."""

    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    DIFFICULTY_CHOICES = [
        (BEGINNER, "Beginner"),
        (INTERMEDIATE, "Intermediate"),
        (ADVANCED, "Advanced"),
    ]

    title = models.CharField(max_length=250)
    subject = models.CharField(max_length=120, db_index=True)
    difficulty = models.CharField(
        max_length=20, choices=DIFFICULTY_CHOICES, default=INTERMEDIATE
    )
    tags = models.JSONField(default=list, blank=True)
    estimated_minutes = models.PositiveSmallIntegerField(default=15)
    presenting_complaint = models.TextField()
    history_of_present_illness = models.TextField(blank=True)
    past_medical_history = models.TextField(blank=True)
    final_diagnosis = models.CharField(max_length=250)
    discussion = models.TextField(blank=True)
    is_published = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "title"]

    def __str__(self) -> str:
        return self.title

    @property
    def total_steps(self) -> int:
        """A case is worked through as one step per lab and differential."""

        return self.labs.count() + self.differentials.count()


class CaseProgress(UUIDModel, TimeStampedModel):
    """Per-learner state for a clinical case."""

    AVAILABLE = "available"
    IN_PROGRESS = "in-progress"
    COMPLETED = "completed"
    STATUS_CHOICES = [
        (AVAILABLE, "Available"),
        (IN_PROGRESS, "In progress"),
        (COMPLETED, "Completed"),
    ]

    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="case_progress"
    )
    case = models.ForeignKey(
        ClinicalCase, on_delete=models.CASCADE, related_name="progress_records"
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=AVAILABLE
    )
    completed_steps = models.PositiveSmallIntegerField(default=0)
    total_steps = models.PositiveSmallIntegerField(default=0)
    last_viewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = [("user", "case")]
        ordering = ["-updated_at"]
        verbose_name_plural = "Case progress"

    def __str__(self) -> str:
        return f"{self.user.email} · {self.case.title} ({self.status})"


class PhysicalExam(UUIDModel, TimeStampedModel):
    case = models.OneToOneField(
        ClinicalCase, on_delete=models.CASCADE, related_name="physical_exam"
    )
    general = models.TextField(blank=True)
    vitals = models.TextField(blank=True)
    cardiovascular = models.TextField(blank=True)
    respiratory = models.TextField(blank=True)
    abdomen = models.TextField(blank=True)
    neurological = models.TextField(blank=True)

    def __str__(self) -> str:
        return f"Exam · {self.case.title}"


class LabResult(UUIDModel, TimeStampedModel):
    NORMAL = "Normal"
    HIGH = "High"
    LOW = "Low"
    STATUS_CHOICES = [(NORMAL, "Normal"), (HIGH, "High"), (LOW, "Low")]

    case = models.ForeignKey(ClinicalCase, on_delete=models.CASCADE, related_name="labs")
    name = models.CharField(max_length=150)
    value = models.CharField(max_length=80)
    reference_range = models.CharField(max_length=80, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default=NORMAL)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self) -> str:
        return f"{self.name}: {self.value}"


class DifferentialDiagnosis(UUIDModel, TimeStampedModel):
    case = models.ForeignKey(
        ClinicalCase, on_delete=models.CASCADE, related_name="differentials"
    )
    diagnosis = models.CharField(max_length=250)
    correct = models.BooleanField(default=False)
    feedback = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "diagnosis"]

    def __str__(self) -> str:
        return self.diagnosis


class QuizQuestion(UUIDModel, TimeStampedModel):
    """A single board-style multiple choice question."""

    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    YIELD_CHOICES = [(HIGH, "High"), (MEDIUM, "Medium"), (LOW, "Low")]

    vignette = models.TextField()
    options = models.JSONField(default=list)
    correct_answer = models.PositiveSmallIntegerField(default=0)
    explanation = models.TextField(blank=True)
    subject = models.CharField(max_length=120, db_index=True)
    yield_rating = models.CharField(max_length=10, choices=YIELD_CHOICES, default=HIGH)
    block = models.CharField(max_length=120, blank=True)
    is_published = models.BooleanField(default=True)

    class Meta:
        ordering = ["subject", "created_at"]

    def __str__(self) -> str:
        return f"[{self.subject}] {self.vignette[:60]}"

    def clean(self):
        from django.core.exceptions import ValidationError

        if not isinstance(self.options, list) or len(self.options) < 2:
            raise ValidationError({"options": "Provide at least two answer options."})
        if not 0 <= self.correct_answer < len(self.options):
            raise ValidationError(
                {"correct_answer": "correct_answer must index into options."}
            )


class QuizAttempt(UUIDModel, TimeStampedModel):
    """A timed QBank session."""

    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="quiz_attempts"
    )
    subject = models.CharField(max_length=120, blank=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    score = models.PositiveIntegerField(default=0)
    total = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self) -> str:
        return f"{self.user.email} · {self.score}/{self.total}"

    @property
    def accuracy(self) -> float:
        return round(self.score / self.total * 100, 1) if self.total else 0.0


class QuizAnswer(UUIDModel, TimeStampedModel):
    attempt = models.ForeignKey(
        QuizAttempt, on_delete=models.CASCADE, related_name="answers"
    )
    question = models.ForeignKey(
        QuizQuestion, on_delete=models.CASCADE, related_name="answers"
    )
    selected_index = models.PositiveSmallIntegerField()
    is_correct = models.BooleanField(default=False)
    answered_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["answered_at"]
        unique_together = [("attempt", "question")]

    def __str__(self) -> str:
        return f"{self.question_id}: {self.selected_index}"
