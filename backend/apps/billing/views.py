from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsInstructorOrAdmin
from apps.catalog.serializers import CourseSerializer

from .models import Transaction
from .serializers import TransactionSerializer
from .services import get_instructor_profile, instructor_stats, monthly_revenue


class InstructorStatsView(APIView):
    """`GET /api/instructor/stats/` — headline cards of the instructor portal."""

    permission_classes = [IsInstructorOrAdmin]

    def get(self, request):
        profile = get_instructor_profile(request.user)
        return Response(instructor_stats(profile))


class InstructorCoursesView(APIView):
    """`GET /api/instructor/courses/` — courses owned by the caller."""

    permission_classes = [IsInstructorOrAdmin]

    def get(self, request):
        profile = get_instructor_profile(request.user)
        courses = profile.courses.with_curriculum()
        serializer = CourseSerializer(
            courses, many=True, context={"request": request, "enrollment_map": {}}
        )
        return Response(serializer.data)


class InstructorRevenueView(APIView):
    """`GET /api/instructor/revenue/` — stats, ledger and monthly series."""

    permission_classes = [IsInstructorOrAdmin]

    def get(self, request):
        profile = get_instructor_profile(request.user)
        transactions = Transaction.objects.filter(instructor=profile)[:50]
        return Response(
            {
                "stats": instructor_stats(profile),
                "transactions": TransactionSerializer(transactions, many=True).data,
                "monthly": monthly_revenue(profile),
            }
        )
