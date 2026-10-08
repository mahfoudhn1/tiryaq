from rest_framework import serializers

from .models import (
    CaseProgress,
    ClinicalCase,
    Deck,
    DifferentialDiagnosis,
    Flashcard,
    LabResult,
    PhysicalExam,
    QuizAnswer,
    QuizAttempt,
    QuizQuestion,
)


class DeckSerializer(serializers.ModelSerializer):
    """Response shape used by the flashcards overview screen."""

    id = serializers.UUIDField(read_only=True)
    cardCount = serializers.SerializerMethodField()
    dueCount = serializers.SerializerMethodField()
    newCount = serializers.SerializerMethodField()
    learningCount = serializers.SerializerMethodField()
    masteredCount = serializers.SerializerMethodField()

    class Meta:
        model = Deck
        fields = [
            "id",
            "name",
            "subject",
            "description",
            "cardCount",
            "dueCount",
            "newCount",
            "learningCount",
            "masteredCount",
        ]

    def get_cardCount(self, deck) -> int:
        return deck.card_total if hasattr(deck, "card_total") else deck.card_count

    def get_dueCount(self, deck) -> int:
        return deck.due_total if hasattr(deck, "due_total") else deck.due_count

    def get_newCount(self, deck) -> int:
        return (
            deck.new_total
            if hasattr(deck, "new_total")
            else deck.cards.filter(difficulty__isnull=True).count()
        )

    def get_learningCount(self, deck) -> int:
        return (
            deck.learning_total
            if hasattr(deck, "learning_total")
            else deck.cards.filter(difficulty__in=[Flashcard.AGAIN, Flashcard.HARD]).count()
        )

    def get_masteredCount(self, deck) -> int:
        return (
            deck.mastered_total
            if hasattr(deck, "mastered_total")
            else deck.cards.filter(difficulty__in=[Flashcard.GOOD, Flashcard.EASY]).count()
        )


class FlashcardSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#Flashcard`."""

    id = serializers.UUIDField(read_only=True)
    deckId = serializers.UUIDField(source="deck_id", read_only=True)
    intervalDays = serializers.FloatField(source="interval_days")
    easeFactor = serializers.FloatField(source="ease_factor")
    nextReviewDate = serializers.DateTimeField(source="next_review_date")

    class Meta:
        model = Flashcard
        fields = [
            "id",
            "deckId",
            "vignette",
            "diagnosis",
            "rationale",
            "subject",
            "difficulty",
            "intervalDays",
            "easeFactor",
            "nextReviewDate",
        ]
        read_only_fields = ["id", "deckId", "nextReviewDate"]

    def validate_easeFactor(self, value):
        if value < 1.3:
            raise serializers.ValidationError("easeFactor must be at least 1.3.")
        return value


class FlashcardRatingSerializer(serializers.Serializer):
    rating = serializers.ChoiceField(choices=Flashcard.DIFFICULTY_CHOICES)


class PhysicalExamSerializer(serializers.ModelSerializer):
    class Meta:
        model = PhysicalExam
        fields = [
            "general",
            "vitals",
            "cardiovascular",
            "respiratory",
            "abdomen",
            "neurological",
        ]


class LabResultSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    referenceRange = serializers.CharField(source="reference_range", read_only=True)

    class Meta:
        model = LabResult
        fields = ["id", "name", "value", "referenceRange", "status"]


class DifferentialDiagnosisSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)

    class Meta:
        model = DifferentialDiagnosis
        fields = ["id", "diagnosis", "correct", "feedback"]


class ClinicalCaseListSerializer(serializers.ModelSerializer):
    """Card shape for the clinical cases screen."""

    id = serializers.UUIDField(read_only=True)
    specialty = serializers.CharField(source="subject")
    status = serializers.SerializerMethodField()
    completedSteps = serializers.SerializerMethodField()
    totalSteps = serializers.SerializerMethodField()
    estimatedTime = serializers.SerializerMethodField()

    class Meta:
        model = ClinicalCase
        fields = [
            "id",
            "title",
            "specialty",
            "difficulty",
            "status",
            "completedSteps",
            "totalSteps",
            "estimatedTime",
            "tags",
        ]

    def _progress(self, case):
        progress_map = self.context.get("case_progress_map") or {}
        return progress_map.get(str(case.id))

    def get_status(self, case) -> str:
        progress = self._progress(case)
        return progress.status if progress else "available"

    def get_completedSteps(self, case) -> int:
        progress = self._progress(case)
        return progress.completed_steps if progress else 0

    def get_totalSteps(self, case) -> int:
        progress = self._progress(case)
        if progress and progress.total_steps:
            return progress.total_steps
        return case.total_steps

    def get_estimatedTime(self, case) -> str:
        return f"{case.estimated_minutes} min"


class CaseProgressSerializer(serializers.ModelSerializer):
    """Payload accepted by `POST /api/cases/{id}/progress/`."""

    completedSteps = serializers.IntegerField(
        source="completed_steps", required=False, min_value=0
    )
    status = serializers.ChoiceField(
        choices=[choice[0] for choice in CaseProgress.STATUS_CHOICES], required=False
    )

    class Meta:
        model = CaseProgress
        fields = ["status", "completedSteps", "total_steps", "last_viewed_at"]
        read_only_fields = ["total_steps", "last_viewed_at"]


class ClinicalCaseSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#ClinicalCase`."""

    id = serializers.UUIDField(read_only=True)
    presentingComplaint = serializers.CharField(source="presenting_complaint")
    historyOfPresentIllness = serializers.CharField(
        source="history_of_present_illness", allow_blank=True
    )
    pastMedicalHistory = serializers.CharField(
        source="past_medical_history", allow_blank=True
    )
    physicalExam = serializers.SerializerMethodField()
    labs = LabResultSerializer(many=True, read_only=True)
    differentialDiagnosis = DifferentialDiagnosisSerializer(
        source="differentials", many=True, read_only=True
    )
    finalDiagnosis = serializers.CharField(source="final_diagnosis")

    class Meta:
        model = ClinicalCase
        fields = [
            "id",
            "title",
            "presentingComplaint",
            "historyOfPresentIllness",
            "pastMedicalHistory",
            "physicalExam",
            "labs",
            "differentialDiagnosis",
            "finalDiagnosis",
            "discussion",
        ]

    def get_physicalExam(self, case):
        exam = getattr(case, "physical_exam", None)
        if exam is None:
            return None
        return PhysicalExamSerializer(exam).data


class QuizQuestionSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#QuizQuestion`."""

    id = serializers.UUIDField(read_only=True)
    correctAnswer = serializers.IntegerField(source="correct_answer")
    yieldRating = serializers.CharField(source="yield_rating")

    class Meta:
        model = QuizQuestion
        fields = [
            "id",
            "vignette",
            "options",
            "correctAnswer",
            "explanation",
            "subject",
            "yieldRating",
            "block",
        ]


class QuizAnswerSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    questionId = serializers.UUIDField(source="question_id", read_only=True)
    selectedIndex = serializers.IntegerField(source="selected_index", read_only=True)
    isCorrect = serializers.BooleanField(source="is_correct", read_only=True)

    class Meta:
        model = QuizAnswer
        fields = ["id", "questionId", "selectedIndex", "isCorrect"]


class QuizAttemptSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    answers = QuizAnswerSerializer(many=True, read_only=True)
    accuracy = serializers.FloatField(read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "subject",
            "started_at",
            "completed_at",
            "score",
            "total",
            "accuracy",
            "answers",
        ]
        read_only_fields = ["started_at", "completed_at", "score", "total"]


class QuizAnswerSubmitSerializer(serializers.Serializer):
    questionId = serializers.UUIDField()
    selectedIndex = serializers.IntegerField(min_value=0)
