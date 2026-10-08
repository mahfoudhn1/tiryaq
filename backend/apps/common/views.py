from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class HealthCheckView(APIView):
    """Liveness probe that also verifies the Postgres connection."""

    permission_classes = [AllowAny]
    authentication_classes: list = []

    def get(self, request):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                cursor.fetchone()
        except Exception as exc:  # pragma: no cover - surfaced to ops only
            return Response({"status": "error", "database": str(exc)}, status=503)

        return Response(
            {
                "status": "ok",
                "database": connection.settings_dict["NAME"],
                "vendor": connection.vendor,
            }
        )
