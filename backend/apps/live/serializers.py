from rest_framework import serializers

from apps.accounts.serializers import InstructorProfileSerializer

from .models import LiveSession


class LiveSessionSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#LiveSession`."""

    id = serializers.UUIDField(read_only=True)
    instructor = InstructorProfileSerializer(read_only=True)
    course = serializers.SerializerMethodField()
    scheduledAt = serializers.DateTimeField(source="scheduled_at", read_only=True)
    participantCount = serializers.IntegerField(source="participant_count", read_only=True)
    maxParticipants = serializers.IntegerField(source="max_participants", read_only=True)
    recordingAvailable = serializers.BooleanField(
        source="recording_available", read_only=True
    )
    status = serializers.SerializerMethodField()

    class Meta:
        model = LiveSession
        fields = [
            "id",
            "title",
            "instructor",
            "course",
            "scheduledAt",
            "duration",
            "participantCount",
            "maxParticipants",
            "status",
            "recordingAvailable",
            "topic",
        ]

    def get_course(self, session) -> str:
        return session.course.title if session.course else ""

    def get_status(self, session) -> str:
        return session.computed_status()
