from django.db import models
from django.utils import timezone

from apps.accounts.models import InstructorProfile
from apps.catalog.models import Course
from apps.common.models import TimeStampedModel, UUIDModel


class Transaction(UUIDModel, TimeStampedModel):
    """Ledger entry behind the instructor revenue screen."""

    PAYOUT = "payout"
    ENROLLMENT = "enrollment"
    SUBSCRIPTION = "subscription"
    TYPE_CHOICES = [
        (PAYOUT, "Payout"),
        (ENROLLMENT, "Enrollment"),
        (SUBSCRIPTION, "Subscription"),
    ]

    COMPLETED = "completed"
    PENDING = "pending"
    FAILED = "failed"
    STATUS_CHOICES = [
        (COMPLETED, "Completed"),
        (PENDING, "Pending"),
        (FAILED, "Failed"),
    ]

    instructor = models.ForeignKey(
        InstructorProfile, on_delete=models.CASCADE, related_name="transactions"
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    description = models.CharField(max_length=250)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(default=timezone.now, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=COMPLETED)
    course = models.ForeignKey(
        Course, null=True, blank=True, on_delete=models.SET_NULL, related_name="transactions"
    )
    student = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="payments",
    )

    class Meta:
        ordering = ["-date"]

    def __str__(self) -> str:
        return f"{self.description} ({self.amount})"
