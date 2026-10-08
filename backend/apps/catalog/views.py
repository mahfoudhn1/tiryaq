from django.db.models import Prefetch
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .filters import CourseFilter
from .models import CartItem, Course, CourseReview, Enrollment, Lesson
from .serializers import (
    CartItemSerializer,
    CourseReviewSerializer,
    CourseSerializer,
    LessonDetailSerializer,
)

SORT_OPTIONS = {
    "popular": "-student_count",
    "newest": "-created_at",
    "rating": "-rating",
    "price-asc": "price",
    "price-desc": "-price",
    "title": "title",
}


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """Course catalogue.

    Browsing is public; `?mine=1` returns the caller's own courses (any status)
    and every write action requires authentication.
    """

    serializer_class = CourseSerializer
    filterset_class = CourseFilter
    search_fields = ["title", "specialty", "description"]
    lookup_field = "pk"

    def get_permissions(self):
        if self.action in {"list", "retrieve", "reviews"}:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Course.objects.with_curriculum()
        mine = self.request.query_params.get("mine")
        if mine and mine.lower() in {"1", "true", "yes"}:
            profile = getattr(self.request.user, "instructor_profile", None)
            if profile is None:
                return queryset.none()
            return queryset.filter(instructor=profile)

        # Review listings and staff browsing include unpublished courses.
        if self.action == "reviews":
            return queryset
        if self.request.user.is_authenticated and self.request.query_params.get("all"):
            return queryset

        return queryset.published()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["enrollment_map"] = {}
        context["completed_lesson_ids"] = set()
        request = self.request
        if request.user.is_authenticated:
            enrollments = list(
                Enrollment.objects.filter(user=request.user).prefetch_related(
                    "completed_lessons"
                )
            )
            context["enrollment_map"] = {str(e.course_id): e for e in enrollments}
            context["completed_lesson_ids"] = {
                lesson.id for enrollment in enrollments for lesson in enrollment.completed_lessons.all()
            }
        return context

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        ordering = SORT_OPTIONS.get(self.request.query_params.get("sort", "popular"))
        if ordering and not self.request.query_params.get("ordering"):
            queryset = queryset.order_by(ordering)
        return queryset

    def get_object(self):
        """Accept either a UUID or a slug on every detail route.

        `GET /api/courses/cardiology-sprint/` and
        `GET /api/courses/{uuid}/reviews/` both need to resolve.
        """

        queryset = self.filter_queryset(self.get_queryset())
        identifier = self.kwargs.get(self.lookup_field)
        course = queryset.filter(pk=identifier).first() if _is_uuid(identifier) else None
        if course is None:
            course = queryset.filter(slug=identifier).first()
        if course is None:
            raise NotFound("Course not found.")

        self.check_object_permissions(self.request, course)
        return course

    def _enrollment_map_context(self, course):
        context = self.get_serializer_context()
        enrollment = Enrollment.objects.filter(
            user=self.request.user, course=course
        ).first()
        if enrollment is not None:
            context["enrollment_map"] = {str(course.id): enrollment}
        return context

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        enrollment, created = Enrollment.objects.get_or_create(
            user=request.user, course=course
        )
        if created:
            Course.objects.filter(pk=course.pk).update(
                student_count=course.student_count + 1
            )
            CartItem.objects.filter(user=request.user, course=course).delete()

        serializer = CourseSerializer(
            course, context=self._enrollment_map_context(course)
        )
        return Response(
            {"success": True, "enrolled": True, "course": serializer.data},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    @action(detail=True, methods=["get"], permission_classes=[AllowAny])
    def reviews(self, request, pk=None):
        course = self.get_object()
        reviews = CourseReview.objects.filter(course=course)
        return Response(CourseReviewSerializer(reviews, many=True).data)


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    """Lesson player payload plus a completion endpoint."""

    serializer_class = LessonDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Lesson.objects.select_related(
            "module__course__instructor__user"
        ).prefetch_related(
            "resources",
            "module__course__modules__lessons__resources",
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        lesson = getattr(self, "_lesson", None)
        if lesson is None and self.action in {"retrieve", "complete"}:
            lesson = self.get_object()
            self._lesson = lesson
        if lesson is not None and self.request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(
                user=self.request.user, course=lesson.module.course
            ).first()
            context["completed_lesson_ids"] = (
                set(enrollment.completed_lessons.values_list("id", flat=True))
                if enrollment
                else set()
            )
            context["enrollment_map"] = (
                {str(lesson.module.course_id): enrollment} if enrollment else {}
            )
        return context

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        lesson = self.get_object()
        course = lesson.module.course
        enrollment = Enrollment.objects.filter(user=request.user, course=course).first()
        if enrollment is None:
            return Response(
                {"detail": "Enrol in the course to track lesson progress."},
                status=status.HTTP_403_FORBIDDEN,
            )

        enrollment.completed_lessons.add(lesson)
        progress = enrollment.recalculate_progress()
        enrollment.save(update_fields=["progress", "updated_at"])

        return Response(
            {
                "success": True,
                "lessonId": str(lesson.id),
                "courseId": str(course.id),
                "progress": progress,
            }
        )


def _is_uuid(value) -> bool:
    import uuid as uuid_module

    try:
        uuid_module.UUID(str(value))
    except (ValueError, AttributeError, TypeError):
        return False
    return True


class EnrollmentViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """`GET /api/enrollments/` returns the courses the caller is enrolled in."""

    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Enrollment.objects.filter(user=self.request.user)
            .select_related("course__instructor__user")
            .prefetch_related(
                "course__modules__lessons__resources",
                "completed_lessons",
            )
        )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        enrollments = list(self.get_queryset())
        context["enrollment_map"] = {str(e.course_id): e for e in enrollments}
        context["completed_lesson_ids"] = {
            lesson.id for enrollment in enrollments for lesson in enrollment.completed_lessons.all()
        }
        return context

    def list(self, request, *args, **kwargs):
        enrollments = self.get_queryset()
        courses = [enrollment.course for enrollment in enrollments]
        serializer = self.get_serializer(courses, many=True)
        return Response(serializer.data)


class CartItemViewSet(viewsets.ModelViewSet):
    """Server-side cart. Lookup is by course id to mirror the Redux slice."""

    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "course_id"
    lookup_url_kwarg = "course_id"

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user).select_related(
            "course__instructor__user"
        )

    def create(self, request, *args, **kwargs):
        course_id = request.data.get("courseId") or request.data.get("course_id")
        if not course_id:
            raise ValidationError({"detail": "courseId is required."})
        if not _is_uuid(course_id):
            raise ValidationError({"detail": "courseId must be a valid UUID."})
        if not Course.objects.filter(id=course_id, status=Course.PUBLISHED).exists():
            raise ValidationError({"detail": "Course not found."})

        item, created = CartItem.objects.get_or_create(
            user=request.user, course_id=course_id
        )
        serializer = self.get_serializer(item)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        deleted, _ = CartItem.objects.filter(
            user=request.user, course_id=kwargs.get("course_id")
        ).delete()
        if not deleted:
            return Response({"detail": "Not in cart."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
