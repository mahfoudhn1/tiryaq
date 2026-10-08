from rest_framework import serializers

from apps.catalog.models import Course


class AdminCourseSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#AdminCourse`."""

    id = serializers.UUIDField(read_only=True)
    instructor = serializers.CharField(source="instructor.name", read_only=True)
    submittedAt = serializers.DateTimeField(source="created_at", read_only=True)
    studentCount = serializers.IntegerField(source="student_count", read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "instructor",
            "specialty",
            "submittedAt",
            "status",
            "studentCount",
        ]


class AdminStatsSerializer(serializers.Serializer):
    """Response shape used by `types/medical.ts#AdminStats`."""

    totalUsers = serializers.IntegerField()
    totalInstructors = serializers.IntegerField()
    totalCourses = serializers.IntegerField()
    totalRevenue = serializers.FloatField()
    pendingApprovals = serializers.IntegerField()
    activeStudents = serializers.IntegerField()
