from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.db.models import Q
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from .constants import INSTRUCTOR, STUDENT
from .models import InstructorApplication, InstructorProfile

User = get_user_model()


def issue_tokens(user) -> dict:
    """Access/refresh pair for a user (rotation handled by SimpleJWT)."""

    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


class UserSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#User`."""

    id = serializers.UUIDField(read_only=True)
    initials = serializers.CharField(read_only=True)
    specialty = serializers.CharField(read_only=True)
    avatarUrl = serializers.URLField(source="avatar_url", read_only=True)

    class Meta:
        model = User
        fields = ["id", "name", "email", "role", "initials", "year", "specialty", "avatarUrl"]
        read_only_fields = ["id", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["name", "email", "password", "year"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data["email"].strip()
        user = User(
            username=email,
            role=STUDENT,
            **{**validated_data, "email": email},
        )
        user.set_password(password)
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    def validate(self, attrs):
        identifier = attrs["email"].strip()
        user = (
            User.objects.filter(Q(email__iexact=identifier) | Q(username__iexact=identifier))
            .select_related("instructor_profile")
            .first()
        )
        if user is None or not user.check_password(attrs["password"]):
            raise AuthenticationFailed("Incorrect email or password.")
        if not user.is_active:
            raise AuthenticationFailed("This account has been deactivated.")

        return {"user": user, **issue_tokens(user)}


class DemoLoginSerializer(serializers.Serializer):
    role = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)


class InstructorProfileSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#Instructor`."""

    id = serializers.UUIDField(read_only=True)
    name = serializers.CharField(read_only=True)
    rating = serializers.FloatField(read_only=True)
    studentCount = serializers.IntegerField(source="student_count", read_only=True)
    courseCount = serializers.IntegerField(source="course_count", read_only=True)
    initials = serializers.CharField(read_only=True)

    class Meta:
        model = InstructorProfile
        fields = [
            "id",
            "name",
            "specialty",
            "rating",
            "studentCount",
            "courseCount",
            "bio",
            "initials",
        ]


class InstructorApplicationSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#InstructorApplication`."""

    id = serializers.UUIDField(read_only=True)
    initials = serializers.CharField(read_only=True)
    appliedAt = serializers.DateTimeField(source="applied_at", read_only=True)

    class Meta:
        model = InstructorApplication
        fields = ["id", "name", "email", "specialty", "appliedAt", "status", "initials"]
        read_only_fields = ["id", "status", "appliedAt", "initials"]


def create_instructor_from_application(application: InstructorApplication, reviewer=None):
    """Approving an application provisions the instructor account + profile."""

    user, created = User.objects.get_or_create(
        email__iexact=application.email,
        defaults={
            "email": application.email,
            "username": application.email,
            "name": application.name,
            "role": INSTRUCTOR,
        },
    )
    if not created:
        user.role = INSTRUCTOR
        user.save(update_fields=["role"])
    if not user.has_usable_password():
        from django.conf import settings

        user.set_password(settings.DEMO_PASSWORD)
        user.save(update_fields=["password"])

    InstructorProfile.objects.update_or_create(
        user=user,
        defaults={
            "specialty": application.specialty,
            "bio": application.bio,
            "is_verified": True,
        },
    )
    return user
