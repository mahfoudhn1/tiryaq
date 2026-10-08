from rest_framework import mixins, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ReviewHistoryEntry, StudyActivity, SubjectMastery
from .serializers import (
    DashboardSummarySerializer,
    ReviewHistoryEntrySerializer,
    StudyActivitySerializer,
    SubjectMasterySerializer,
    StudyAnalyticsSerializer,
)
from .services import dashboard_summary, study_analytics


class DashboardSummaryView(APIView):
    """`GET /api/dashboard/summary/` — everything the dashboard renders."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        summary = dashboard_summary(request.user)
        return Response(DashboardSummarySerializer(summary).data)


class StudyAnalyticsView(APIView):
    """`GET /api/analytics/` — mastery, retention and weekly activity."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        analytics = study_analytics(request.user)
        return Response(StudyAnalyticsSerializer(analytics).data)


class SubjectMasteryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = SubjectMasterySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SubjectMastery.objects.filter(user=self.request.user)


class ReviewHistoryViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = ReviewHistoryEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReviewHistoryEntry.objects.filter(user=self.request.user)


class StudyActivityViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    serializer_class = StudyActivitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = StudyActivity.objects.filter(user=self.request.user)
        activity_type = self.request.query_params.get("type")
        if activity_type:
            queryset = queryset.filter(type=activity_type)
        limit = self.request.query_params.get("limit")
        if limit and limit.isdigit():
            queryset = queryset[: int(limit)]
        return queryset
