from django.contrib import admin

from .models import LiveSession, LiveSessionRegistration


@admin.register(LiveSession)
class LiveSessionAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "instructor",
        "course",
        "scheduled_at",
        "duration",
        "status",
        "participant_count",
    ]
    list_filter = ["status", "recording_available"]
    search_fields = ["title", "topic", "instructor__user__name"]
    date_hierarchy = "scheduled_at"


@admin.register(LiveSessionRegistration)
class LiveSessionRegistrationAdmin(admin.ModelAdmin):
    list_display = ["session", "user", "created_at"]
    search_fields = ["session__title", "user__email"]
