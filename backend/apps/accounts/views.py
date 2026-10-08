from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, PermissionDenied
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .constants import demo_email_for_role
from .models import InstructorApplication
from .permissions import IsAdminRole
from .serializers import (
    DemoLoginSerializer,
    InstructorApplicationSerializer,
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
    create_instructor_from_application,
    issue_tokens,
)

User = get_user_model()


def _auth_payload(user) -> dict:
    return {**issue_tokens(user), "user": UserSerializer(user).data}


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(_auth_payload(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = dict(serializer.validated_data)
        user = data.pop("user")
        return Response({**data, "user": UserSerializer(user).data})


class DemoLoginView(APIView):
    """Lets the login screen enter a seeded role without credentials (dev only)."""

    permission_classes = [AllowAny]

    def post(self, request):
        if not settings.ALLOW_DEMO_LOGIN:
            raise PermissionDenied("Demo login is disabled.")

        serializer = DemoLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = (serializer.validated_data.get("role") or "STUDENT").upper()
        email = serializer.validated_data.get("email") or demo_email_for_role(role)
        if not email:
            raise NotFound(f"No demo account is configured for role '{role}'.")

        user = (
            User.objects.filter(email__iexact=email)
            .select_related("instructor_profile")
            .first()
        )
        if user is None:
            raise NotFound(
                f"Demo account {email} is missing. Run `python manage.py seed_demo`."
            )

        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])
        return Response(_auth_payload(user))


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("refresh")
        if token:
            try:
                RefreshToken(token).blacklist()
            except TokenError:
                pass
        return Response(status=status.HTTP_205_RESET_CONTENT)


class MeView(RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class InstructorApplicationViewSet(viewsets.ModelViewSet):
    """Admin review queue for instructor applications.

    Any authenticated user may submit an application; only admins can read the
    queue, approve or reject. Instructors see only their own submissions.
    """

    serializer_class = InstructorApplicationSerializer
    queryset = InstructorApplication.objects.all()

    def get_permissions(self):
        if self.action == "create":
            return [IsAuthenticated()]
        return [IsAdminRole()]

    def get_queryset(self):
        queryset = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(name__icontains=search) | queryset.filter(
                specialty__icontains=search
            )
        return queryset

    def _review(self, request, pk, new_status):
        application = self.get_object()
        application.status = new_status
        application.reviewed_by = request.user
        application.reviewed_at = timezone.now()
        application.save(update_fields=["status", "reviewed_by", "reviewed_at", "updated_at"])

        if new_status == InstructorApplication.APPROVED:
            create_instructor_from_application(application, reviewer=request.user)

        return Response(self.get_serializer(application).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        return self._review(request, pk, InstructorApplication.APPROVED)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        return self._review(request, pk, InstructorApplication.REJECTED)
