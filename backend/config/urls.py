from django.contrib import admin
from django.urls import include, path

from apps.common.views import HealthCheckView

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/health/", HealthCheckView.as_view(), name="health"),
    path("api/auth/", include("apps.accounts.auth_urls")),
    path("api/", include("apps.accounts.urls")),
    path("api/", include("apps.catalog.urls")),
    path("api/", include("apps.live.urls")),
    path("api/", include("apps.study.urls")),
    path("api/", include("apps.analytics.urls")),
    path("api/", include("apps.billing.urls")),
    path("api/", include("apps.moderation.urls")),
]
