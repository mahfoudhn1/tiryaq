"""Derived study statistics.

Everything the dashboard and analytics screens need is assembled here so the
views stay thin and the numbers stay consistent between endpoints.
"""

from datetime import timedelta

from django.db.models import Avg, Q
from django.utils import timezone

from apps.study.models import ClinicalCase, Flashcard, QuizAnswer, QuizQuestion

from .models import ReviewHistoryEntry, StudyActivity, StudyProgress, SubjectMastery

WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def get_progress(user) -> StudyProgress:
    progress, _ = StudyProgress.objects.get_or_create(user=user)
    return progress


def _record_activity(user, activity_type: str, title: str, status: str = "") -> StudyActivity:
    return StudyActivity.objects.create(
        user=user,
        type=activity_type,
        title=title,
        status=status,
        timestamp=timezone.now(),
    )


def _bump_review_history(user, correct: bool) -> None:
    """Keep the current week's bar in sync with the latest review."""

    today = timezone.localdate()
    label = WEEKDAY_LABELS[today.weekday()]
    entry = (
        ReviewHistoryEntry.objects.filter(user=user, recorded_on=today).first()
        or ReviewHistoryEntry.objects.create(
            user=user,
            label=label,
            order=today.weekday(),
            recorded_on=today,
        )
    )
    total = entry.reviewed_count
    previous_accuracy = entry.accuracy
    entry.reviewed_count = total + 1
    entry.accuracy = round(
        ((previous_accuracy * total) + (100 if correct else 0)) / entry.reviewed_count
    )
    entry.save(update_fields=["reviewed_count", "accuracy", "updated_at"])


def _bump_subject_mastery(user, subject: str, correct: bool) -> None:
    if not subject:
        return
    mastery, _ = SubjectMastery.objects.get_or_create(user=user, subject=subject)
    total = mastery.count
    mastery.mastery_percent = round(
        ((mastery.mastery_percent * total) + (100 if correct else 0))
        / (total + 1)
    )
    mastery.count = total + 1
    mastery.save(update_fields=["mastery_percent", "count", "updated_at"])


def record_flashcard_review(user, card: Flashcard, review) -> StudyProgress:
    progress = get_progress(user)
    progress.register_study_day()
    progress.total_cards_reviewed += 1
    # 'Again' counts as a miss for accuracy and retention purposes.
    correct = review.rating != Flashcard.AGAIN
    total_accuracy_samples = progress.total_cards_reviewed
    progress.accuracy_rate = round(
        (
            (progress.accuracy_rate * (total_accuracy_samples - 1))
            + (100 if correct else 0)
        )
        / total_accuracy_samples,
        1,
    )
    progress.cards_retention_rate = progress.accuracy_rate
    progress.save()

    _record_activity(
        user,
        StudyActivity.FLASHCARD,
        f"Rated {card.subject} Card ({review.rating})",
        status="Completed",
    )
    _bump_review_history(user, correct)
    _bump_subject_mastery(user, card.subject, correct)
    return progress


def record_quiz_attempt(user, attempt) -> StudyProgress:
    progress = get_progress(user)
    progress.register_study_day()
    progress.accuracy_rate = attempt.accuracy or progress.accuracy_rate
    progress.save(update_fields=["accuracy_rate", "daily_completed", "streak_days", "last_study_date", "updated_at"])

    _record_activity(
        user,
        StudyActivity.QUIZ,
        f"Finished {attempt.subject or 'Mixed'} QBank Block",
        status=f"{attempt.accuracy:g}% Correct",
    )
    return progress


def record_case_activity(user, case: ClinicalCase, progress) -> StudyActivity:
    """Log (or refresh) the case entry in the dashboard activity feed."""

    title = f"Case: {case.title}"
    status = {
        "completed": "Completed",
        "in-progress": "In Progress",
    }.get(progress.status, "Started")

    activity = StudyActivity.objects.filter(
        user=user, type=StudyActivity.CASE, title=title
    ).first()
    if activity is None:
        return _record_activity(user, StudyActivity.CASE, title, status=status)

    activity.status = status
    activity.timestamp = timezone.now()
    activity.save(update_fields=["status", "timestamp", "updated_at"])
    return activity


def dashboard_summary(user) -> dict:
    progress = get_progress(user)
    now = timezone.now()

    due_flashcards = Flashcard.objects.filter(next_review_date__lte=now).count()
    total_cases = ClinicalCase.objects.filter(is_published=True).count()
    touched_cases = (
        StudyActivity.objects.filter(user=user, type=StudyActivity.CASE)
        .values("title")
        .distinct()
        .count()
    )
    answered_questions = (
        QuizAnswer.objects.filter(attempt__user=user)
        .values("question_id")
        .distinct()
        .count()
    )
    total_questions = QuizQuestion.objects.filter(is_published=True).count()

    return {
        "dailyGoal": progress.daily_goal,
        "dailyCompleted": progress.daily_completed,
        "streakDays": progress.streak_days,
        "dueFlashcardsCount": due_flashcards,
        "dueCasesCount": max(total_cases - touched_cases, 0),
        "dueQuizQuestionsCount": max(total_questions - answered_questions, 0),
        "recentActivity": StudyActivity.objects.filter(user=user)[:5],
    }


def study_analytics(user) -> dict:
    progress = get_progress(user)
    progress.refresh_daily_window()

    return {
        "progress": progress,
        "totalHoursStudied": progress.total_hours_studied,
        "cardsRetentionRate": progress.cards_retention_rate,
        "clinicalCaseSuccessRate": progress.clinical_case_success_rate,
    }


def platform_average_accuracy() -> float:
    """Used by the admin console as a health metric."""

    return round(
        StudyProgress.objects.aggregate(value=Avg("accuracy_rate"))["value"] or 0.0,
        1,
    )


def active_learner_count(days: int = 7) -> int:
    since = timezone.now() - timedelta(days=days)
    return (
        StudyActivity.objects.filter(
            Q(timestamp__gte=since) | Q(created_at__gte=since)
        )
        .values("user_id")
        .distinct()
        .count()
    )
