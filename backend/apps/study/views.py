from django.db.models import Count, Q
from django.utils import timezone
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    CaseProgress,
    ClinicalCase,
    Deck,
    Flashcard,
    QuizAnswer,
    QuizAttempt,
    QuizQuestion,
)
from .serializers import (
    CaseProgressSerializer,
    ClinicalCaseListSerializer,
    ClinicalCaseSerializer,
    DeckSerializer,
    FlashcardRatingSerializer,
    FlashcardSerializer,
    QuizAnswerSubmitSerializer,
    QuizAttemptSerializer,
    QuizQuestionSerializer,
)

DEFAULT_LIMIT = 20


def _apply_limit(queryset, request, default=None):
    raw = request.query_params.get("limit") or default
    if not raw:
        return queryset
    try:
        limit = max(1, min(int(raw), 200))
    except (TypeError, ValueError):
        return queryset
    return queryset[:limit]


class DeckViewSet(viewsets.ReadOnlyModelViewSet):
    """Subject decks with card/due counters."""

    serializer_class = DeckSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["subject"]

    def get_queryset(self):
        now = timezone.now()
        # Annotated names differ from the model properties, which cannot be
        # overwritten by an annotation.
        queryset = Deck.objects.annotate(
            card_total=Count("cards", distinct=True),
            due_total=Count(
                "cards",
                filter=Q(cards__next_review_date__lte=now),
                distinct=True,
            ),
            new_total=Count(
                "cards", filter=Q(cards__difficulty__isnull=True), distinct=True
            ),
            learning_total=Count(
                "cards",
                filter=Q(cards__difficulty__in=[Flashcard.AGAIN, Flashcard.HARD]),
                distinct=True,
            ),
            mastered_total=Count(
                "cards",
                filter=Q(cards__difficulty__in=[Flashcard.GOOD, Flashcard.EASY]),
                distinct=True,
            ),
        )
        if self.request.query_params.get("due") in {"1", "true"}:
            queryset = queryset.filter(due_total__gt=0)
        return queryset


class FlashcardViewSet(viewsets.ModelViewSet):
    """Flashcards with a spaced-repetition rating endpoint."""

    serializer_class = FlashcardSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["subject", "deck"]

    def get_queryset(self):
        queryset = Flashcard.objects.select_related("deck")
        if self.request.query_params.get("due") in {"1", "true"}:
            queryset = queryset.filter(next_review_date__lte=timezone.now())
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        queryset = _apply_limit(queryset, request, default=DEFAULT_LIMIT)
        return Response(self.get_serializer(queryset, many=True).data)

    @action(detail=True, methods=["post"])
    def rate(self, request, pk=None):
        card = self.get_object()
        serializer = FlashcardRatingSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        review = card.rate(serializer.validated_data["rating"], user=request.user)

        from apps.analytics.services import record_flashcard_review

        record_flashcard_review(request.user, card, review)

        return Response(self.get_serializer(card).data)


class ClinicalCaseViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ClinicalCaseSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["title", "presenting_complaint", "final_diagnosis", "subject"]
    filterset_fields = ["subject", "difficulty"]

    def get_queryset(self):
        queryset = ClinicalCase.objects.filter(is_published=True).prefetch_related(
            "labs", "differentials"
        )
        if self.action == "list":
            queryset = queryset.select_related("physical_exam")
        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return ClinicalCaseListSerializer
        return ClinicalCaseSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        if getattr(self, "action", None) == "list" and self.request.user.is_authenticated:
            context["case_progress_map"] = {
                str(progress.case_id): progress
                for progress in CaseProgress.objects.filter(user=self.request.user)
            }
        return context

    @action(detail=True, methods=["get", "post"])
    def progress(self, request, pk=None):
        """Read or update the caller's progress through a case."""

        case = self.get_object()
        record, _ = CaseProgress.objects.get_or_create(
            user=request.user, case=case, defaults={"total_steps": case.total_steps}
        )

        if request.method == "POST":
            serializer = CaseProgressSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data

            if "status" in data:
                record.status = data["status"]
            if "completed_steps" in data:
                record.completed_steps = data["completed_steps"]
            record.total_steps = case.total_steps
            if record.status == CaseProgress.COMPLETED:
                record.completed_steps = record.total_steps
            elif record.status == CaseProgress.AVAILABLE and record.completed_steps:
                record.status = CaseProgress.IN_PROGRESS
            record.last_viewed_at = timezone.now()
            record.save()

            from apps.analytics.services import record_case_activity

            record_case_activity(request.user, case, record)

        return Response(
            {
                "caseId": str(case.id),
                "status": record.status,
                "completedSteps": record.completed_steps,
                "totalSteps": record.total_steps or case.total_steps,
            }
        )


class QuizQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """QBank question bank."""

    serializer_class = QuizQuestionSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ["vignette", "subject", "explanation"]
    filterset_fields = ["subject", "yield_rating", "block"]

    def get_queryset(self):
        queryset = QuizQuestion.objects.filter(is_published=True)
        if self.request.query_params.get("random") in {"1", "true"}:
            queryset = queryset.order_by("?")
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        queryset = _apply_limit(queryset, request)
        return Response(self.get_serializer(queryset, many=True).data)


class QuizAttemptViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """Track a QBank session: create, answer, finish."""

    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user).prefetch_related(
            "answers"
        )

    def _fresh(self, attempt):
        """Re-read the attempt so the prefetched answers reflect a new write."""

        return self.get_queryset().get(pk=attempt.pk)

    def create(self, request, *args, **kwargs):
        subject = request.data.get("subject", "")
        question_ids = request.data.get("questionIds") or []
        total = len(question_ids) if isinstance(question_ids, list) else 0
        if not total:
            queryset = QuizQuestion.objects.filter(is_published=True)
            if subject:
                queryset = queryset.filter(subject=subject)
            total = queryset.count()

        attempt = QuizAttempt.objects.create(
            user=request.user, subject=subject, total=total
        )
        return Response(
            self.get_serializer(attempt).data, status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=["post"])
    def answer(self, request, pk=None):
        attempt = self.get_object()
        if attempt.completed_at:
            raise ValidationError({"detail": "This attempt is already finished."})

        serializer = QuizAnswerSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        question_id = serializer.validated_data["questionId"]
        selected_index = serializer.validated_data["selectedIndex"]

        question = QuizQuestion.objects.filter(id=question_id).first()
        if question is None:
            raise ValidationError({"detail": "Question not found."})
        if selected_index >= len(question.options):
            raise ValidationError({"detail": "selectedIndex is out of range."})

        is_correct = selected_index == question.correct_answer
        QuizAnswer.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={"selected_index": selected_index, "is_correct": is_correct},
        )

        attempt.score = attempt.answers.filter(is_correct=True).count()
        attempt.save(update_fields=["score", "updated_at"])

        return Response(self.get_serializer(self._fresh(attempt)).data)

    @action(detail=True, methods=["post"])
    def finish(self, request, pk=None):
        attempt = self.get_object()
        attempt.completed_at = timezone.now()
        attempt.score = attempt.answers.filter(is_correct=True).count()
        attempt.total = attempt.total or attempt.answers.count()
        attempt.save(update_fields=["completed_at", "score", "total", "updated_at"])

        from apps.analytics.services import record_quiz_attempt

        record_quiz_attempt(request.user, attempt)

        return Response(self.get_serializer(self._fresh(attempt)).data)
