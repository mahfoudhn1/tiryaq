"""Revenue numbers for the instructor portal."""

from collections import OrderedDict
from datetime import date

from django.db.models import Avg, Sum
from django.utils import timezone

from apps.catalog.models import Enrollment

from .models import Transaction

MONTH_LABELS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
]


def _sum(queryset) -> float:
    return float(queryset.aggregate(total=Sum("amount"))["total"] or 0)


def monthly_revenue(profile, months: int = 7) -> list[dict]:
    """Revenue series for the bar chart, oldest first."""

    today = timezone.localdate().replace(day=1)
    buckets: "OrderedDict[tuple[int, int], dict]" = OrderedDict()
    for offset in range(months - 1, -1, -1):
        month_index = today.month - 1 - offset
        year = today.year + month_index // 12
        month = month_index % 12 + 1
        buckets[(year, month)] = {"month": MONTH_LABELS[month - 1], "amount": 0.0}

    transactions = Transaction.objects.filter(
        instructor=profile,
        type=Transaction.ENROLLMENT,
        status=Transaction.COMPLETED,
    )
    for transaction in transactions:
        local = timezone.localtime(transaction.date)
        key = (local.year, local.month)
        if key in buckets:
            buckets[key]["amount"] += float(transaction.amount)

    return list(buckets.values())


def instructor_stats(profile) -> dict:
    courses = profile.courses.all()
    course_ids = list(courses.values_list("id", flat=True))
    now = timezone.localtime()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    enrollment_tx = Transaction.objects.filter(
        instructor=profile,
        type=Transaction.ENROLLMENT,
        status=Transaction.COMPLETED,
    )
    payout_completed = Transaction.objects.filter(
        instructor=profile, type=Transaction.PAYOUT, status=Transaction.COMPLETED
    )
    payout_pending = Transaction.objects.filter(
        instructor=profile, type=Transaction.PAYOUT, status=Transaction.PENDING
    )

    total_revenue = _sum(enrollment_tx)
    monthly = _sum(enrollment_tx.filter(date__gte=month_start))
    pending_payout = abs(_sum(payout_pending))

    enrollments = Enrollment.objects.filter(course_id__in=course_ids)

    return {
        "totalRevenue": total_revenue,
        "monthlyRevenue": monthly,
        "pendingPayout": pending_payout,
        "balance": total_revenue - abs(_sum(payout_completed)),
        "totalStudents": sum(course.student_count for course in courses),
        "totalCourses": len(course_ids),
        "avgRating": round(
            float(courses.aggregate(value=Avg("rating"))["value"] or 0), 1
        ),
        "totalEnrollments": enrollments.count(),
        "completionRate": round(
            float(enrollments.aggregate(value=Avg("progress"))["value"] or 0)
        ),
    }


def get_instructor_profile(user):
    """Instructor profile for a user, or a helpful error for the API layer."""

    profile = getattr(user, "instructor_profile", None)
    if profile is None:
        from rest_framework.exceptions import NotFound

        raise NotFound(
            "This account has no instructor profile. Approve an instructor "
            "application or create one in the Django admin."
        )
    return profile


def current_month_start() -> date:
    return timezone.localdate().replace(day=1)
