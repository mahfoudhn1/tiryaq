from rest_framework.routers import DefaultRouter

from .views import CartItemViewSet, CourseViewSet, EnrollmentViewSet, LessonViewSet

router = DefaultRouter()
router.register("courses", CourseViewSet, basename="course")
router.register("lessons", LessonViewSet, basename="lesson")
router.register("enrollments", EnrollmentViewSet, basename="enrollment")
router.register("cart", CartItemViewSet, basename="cart-item")

urlpatterns = router.urls
