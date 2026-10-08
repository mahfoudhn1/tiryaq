from rest_framework.routers import DefaultRouter

from .views import InstructorApplicationViewSet

router = DefaultRouter()
router.register(
    "admin/instructor-applications",
    InstructorApplicationViewSet,
    basename="instructor-application",
)

urlpatterns = router.urls
