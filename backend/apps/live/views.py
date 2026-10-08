from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import LiveSession
from .serializers import LiveSessionSerializer


class LiveSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """Browse live classes; registration requires an account."""

    serializer_class = LiveSessionSerializer
    filterset_fields = ["status"]
    search_fields = ["title", "topic"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = LiveSession.objects.select_related(
            "instructor__user", "course"
        )
        status_filter = self.request.query_params.get("filter")
        if status_filter and status_filter != "all":
            ids = [
                session.id
                for session in queryset
                if session.computed_status() == status_filter
            ]
            return queryset.filter(id__in=ids)
        return queryset

    @action(detail=True, methods=["post"])
    def register(self, request, pk=None):
        session = self.get_object()
        if session.is_full:
            raise ValidationError({"detail": "This session is full."})

        created = session.register(request.user)
        serializer = self.get_serializer(session)
        return Response(
            {
                "registered": True,
                "alreadyRegistered": not created,
                "session": serializer.data,
            }
        )
