from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    DashboardSummaryView,
    ReviewHistoryViewSet,
    StudyActivityViewSet,
    StudyAnalyticsView,
    SubjectMasteryViewSet,
)

router = DefaultRouter()
router.register("analytics/subject-mastery", SubjectMasteryViewSet, basename="subject-mastery")
router.register("analytics/review-history", ReviewHistoryViewSet, basename="review-history")
router.register("analytics/activity", StudyActivityViewSet, basename="study-activity")

urlpatterns = [
    path("dashboard/summary/", DashboardSummaryView.as_view(), name="dashboard-summary"),
    path("analytics/", StudyAnalyticsView.as_view(), name="study-analytics"),
    *router.urls,
]
