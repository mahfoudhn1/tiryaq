from django.contrib.auth import get_user_model
from django.db.models import Sum
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import InstructorApplication, InstructorProfile
from apps.accounts.permissions import IsAdminRole
from apps.analytics.services import active_learner_count
from apps.billing.models import Transaction
from apps.catalog.models import Course

from .serializers import AdminCourseSerializer, AdminStatsSerializer

User = get_user_model()


class AdminStatsView(APIView):
    """`GET /api/admin/stats/` — platform health cards."""

    permission_classes = [IsAdminRole]

    def get(self, request):
        revenue = Transaction.objects.filter(
            type=Transaction.ENROLLMENT, status=Transaction.COMPLETED
        ).aggregate(total=Sum("amount"))["total"]

        stats = {
            "totalUsers": User.objects.count(),
            "totalInstructors": InstructorProfile.objects.count(),
            "totalCourses": Course.objects.count(),
            "totalRevenue": float(revenue or 0),
            "pendingApprovals": (
                InstructorApplication.objects.filter(
                    status=InstructorApplication.PENDING
                ).count()
                + Course.objects.filter(status=Course.DRAFT).count()
            ),
            "activeStudents": active_learner_count(),
        }
        return Response(AdminStatsSerializer(stats).data)


class AdminCourseModerationViewSet(viewsets.ReadOnlyModelViewSet):
    """Course moderation queue: list, publish, reject, archive."""

    serializer_class = AdminCourseSerializer
    permission_classes = [IsAdminRole]
    search_fields = ["title", "specialty", "instructor__user__name"]
    filterset_fields = ["status", "specialty"]

    def get_queryset(self):
        return Course.objects.select_related("instructor__user")

    def _set_status(self, new_status: str):
        course = self.get_object()
        course.status = new_status
        course.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(course).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._set_status(Course.PUBLISHED)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._set_status(Course.REJECTED)

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        return self._set_status(Course.ARCHIVED)
