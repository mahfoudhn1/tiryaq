from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import AdminCourseModerationViewSet, AdminStatsView

router = DefaultRouter()
router.register("admin/courses", AdminCourseModerationViewSet, basename="admin-course")

urlpatterns = [
    path("admin/stats/", AdminStatsView.as_view(), name="admin-stats"),
    *router.urls,
]
