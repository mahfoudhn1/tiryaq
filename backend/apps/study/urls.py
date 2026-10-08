from rest_framework.routers import DefaultRouter

from .views import (
    ClinicalCaseViewSet,
    DeckViewSet,
    FlashcardViewSet,
    QuizAttemptViewSet,
    QuizQuestionViewSet,
)

router = DefaultRouter()
router.register("decks", DeckViewSet, basename="deck")
router.register("flashcards", FlashcardViewSet, basename="flashcard")
router.register("cases", ClinicalCaseViewSet, basename="clinical-case")
router.register("quiz-questions", QuizQuestionViewSet, basename="quiz-question")
router.register("quiz-attempts", QuizAttemptViewSet, basename="quiz-attempt")

urlpatterns = router.urls
