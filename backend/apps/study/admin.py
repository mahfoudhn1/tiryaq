from django.contrib import admin

from .models import (
    CaseProgress,
    ClinicalCase,
    Deck,
    DifferentialDiagnosis,
    Flashcard,
    FlashcardReview,
    LabResult,
    PhysicalExam,
    QuizAnswer,
    QuizAttempt,
    QuizQuestion,
)


class LabResultInline(admin.TabularInline):
    model = LabResult
    extra = 0


class DifferentialInline(admin.TabularInline):
    model = DifferentialDiagnosis
    extra = 0


@admin.register(Deck)
class DeckAdmin(admin.ModelAdmin):
    list_display = ["name", "subject", "is_system", "owner"]
    list_filter = ["subject", "is_system"]
    search_fields = ["name", "subject"]


@admin.register(Flashcard)
class FlashcardAdmin(admin.ModelAdmin):
    list_display = ["diagnosis", "subject", "deck", "difficulty", "interval_days", "next_review_date"]
    list_filter = ["subject", "difficulty", "deck"]
    search_fields = ["diagnosis", "vignette", "subject"]


@admin.register(FlashcardReview)
class FlashcardReviewAdmin(admin.ModelAdmin):
    list_display = ["card", "user", "rating", "reviewed_at"]
    list_filter = ["rating"]
    date_hierarchy = "reviewed_at"


@admin.register(ClinicalCase)
class ClinicalCaseAdmin(admin.ModelAdmin):
    list_display = ["title", "subject", "final_diagnosis", "is_published"]
    list_filter = ["subject", "is_published"]
    search_fields = ["title", "final_diagnosis", "presenting_complaint"]
    inlines = [LabResultInline, DifferentialInline]


@admin.register(PhysicalExam)
class PhysicalExamAdmin(admin.ModelAdmin):
    list_display = ["case", "vitals"]


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    list_display = ["__str__", "subject", "yield_rating", "is_published"]
    list_filter = ["subject", "yield_rating", "is_published"]
    search_fields = ["vignette", "explanation"]


@admin.register(CaseProgress)
class CaseProgressAdmin(admin.ModelAdmin):
    list_display = ["user", "case", "status", "completed_steps", "total_steps"]
    list_filter = ["status"]
    search_fields = ["user__email", "case__title"]


class QuizAnswerInline(admin.TabularInline):
    model = QuizAnswer
    extra = 0
    readonly_fields = ["question", "selected_index", "is_correct"]


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ["user", "subject", "score", "total", "started_at", "completed_at"]
    list_filter = ["subject"]
    inlines = [QuizAnswerInline]
