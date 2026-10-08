from rest_framework import serializers

from .models import ReviewHistoryEntry, StudyActivity, StudyProgress, SubjectMastery


class SubjectMasterySerializer(serializers.ModelSerializer):
    masteryPercent = serializers.IntegerField(source="mastery_percent")

    class Meta:
        model = SubjectMastery
        fields = ["subject", "masteryPercent", "count"]


class ReviewHistoryEntrySerializer(serializers.ModelSerializer):
    date = serializers.CharField(source="label")
    reviewedCount = serializers.IntegerField(source="reviewed_count")
    accuracy = serializers.IntegerField()

    class Meta:
        model = ReviewHistoryEntry
        fields = ["date", "reviewedCount", "accuracy"]


class UserProgressSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#UserProgress`."""

    dailyGoal = serializers.IntegerField(source="daily_goal")
    dailyCompleted = serializers.IntegerField(source="daily_completed")
    streakDays = serializers.IntegerField(source="streak_days")
    totalCardsReviewed = serializers.IntegerField(source="total_cards_reviewed")
    accuracyRate = serializers.FloatField(source="accuracy_rate")
    subjectMastery = SubjectMasterySerializer(
        source="user.subject_mastery", many=True, read_only=True
    )
    reviewHistory = ReviewHistoryEntrySerializer(
        source="user.review_history", many=True, read_only=True
    )

    class Meta:
        model = StudyProgress
        fields = [
            "dailyGoal",
            "dailyCompleted",
            "streakDays",
            "totalCardsReviewed",
            "subjectMastery",
            "accuracyRate",
            "reviewHistory",
        ]


class StudyActivitySerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    timestamp = serializers.SerializerMethodField()

    class Meta:
        model = StudyActivity
        fields = ["id", "type", "title", "timestamp", "status"]

    def get_timestamp(self, activity) -> str:
        from apps.common.utils import humanize_delta

        return humanize_delta(activity.timestamp)


class DashboardSummarySerializer(serializers.Serializer):
    """Response shape used by `types/medical.ts#DashboardSummary`."""

    dailyGoal = serializers.IntegerField()
    dailyCompleted = serializers.IntegerField()
    streakDays = serializers.IntegerField()
    dueFlashcardsCount = serializers.IntegerField()
    dueCasesCount = serializers.IntegerField()
    dueQuizQuestionsCount = serializers.IntegerField()
    recentActivity = StudyActivitySerializer(many=True)


class StudyAnalyticsSerializer(serializers.Serializer):
    """Response shape used by `types/medical.ts#StudyAnalytics`."""

    progress = UserProgressSerializer()
    totalHoursStudied = serializers.FloatField()
    cardsRetentionRate = serializers.FloatField()
    clinicalCaseSuccessRate = serializers.FloatField()
