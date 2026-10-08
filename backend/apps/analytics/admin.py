from django.contrib import admin

from .models import ReviewHistoryEntry, StudyActivity, StudyProgress, SubjectMastery


@admin.register(StudyProgress)
class StudyProgressAdmin(admin.ModelAdmin):
    list_display = [
        "user",
        "streak_days",
        "daily_completed",
        "daily_goal",
        "accuracy_rate",
        "total_hours_studied",
    ]
    search_fields = ["user__email"]


@admin.register(SubjectMastery)
class SubjectMasteryAdmin(admin.ModelAdmin):
    list_display = ["user", "subject", "mastery_percent", "count"]
    list_filter = ["subject"]
    search_fields = ["user__email", "subject"]


@admin.register(ReviewHistoryEntry)
class ReviewHistoryEntryAdmin(admin.ModelAdmin):
    list_display = ["user", "label", "reviewed_count", "accuracy", "recorded_on"]
    date_hierarchy = "recorded_on"


@admin.register(StudyActivity)
class StudyActivityAdmin(admin.ModelAdmin):
    list_display = ["user", "type", "title", "status", "timestamp"]
    list_filter = ["type"]
    search_fields = ["user__email", "title"]
