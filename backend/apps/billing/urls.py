from django.urls import path

from .views import InstructorCoursesView, InstructorRevenueView, InstructorStatsView

urlpatterns = [
    path("instructor/stats/", InstructorStatsView.as_view(), name="instructor-stats"),
    path("instructor/courses/", InstructorCoursesView.as_view(), name="instructor-courses"),
    path("instructor/revenue/", InstructorRevenueView.as_view(), name="instructor-revenue"),
]
