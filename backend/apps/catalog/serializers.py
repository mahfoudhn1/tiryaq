from rest_framework import serializers

from apps.accounts.serializers import InstructorProfileSerializer

from .models import (
    CartItem,
    Course,
    CourseModule,
    CourseReview,
    Enrollment,
    Lesson,
    LessonResource,
)


class LessonResourceSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)

    class Meta:
        model = LessonResource
        fields = ["id", "name", "type", "size"]


class LessonSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#Lesson`."""

    id = serializers.UUIDField(read_only=True)
    completed = serializers.SerializerMethodField()
    resources = LessonResourceSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id",
            "title",
            "duration",
            "type",
            "free",
            "completed",
            "description",
            "resources",
        ]

    def get_completed(self, lesson) -> bool:
        completed_ids = self.context.get("completed_lesson_ids") or set()
        return lesson.id in completed_ids


class CourseModuleSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#CourseModule`."""

    id = serializers.UUIDField(read_only=True)
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = CourseModule
        fields = ["id", "title", "lessons"]


class LessonDetailSerializer(LessonSerializer):
    """Lesson payload for the player screen, including its course outline."""

    moduleId = serializers.UUIDField(source="module_id", read_only=True)
    moduleTitle = serializers.CharField(source="module.title", read_only=True)
    courseId = serializers.UUIDField(source="module.course_id", read_only=True)
    course = serializers.SerializerMethodField()

    class Meta(LessonSerializer.Meta):
        fields = LessonSerializer.Meta.fields + [
            "moduleId",
            "moduleTitle",
            "courseId",
            "course",
        ]

    def get_course(self, lesson):
        return CourseSerializer(
            lesson.module.course, context=self.context
        ).data


class CourseSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#Course`."""

    id = serializers.UUIDField(read_only=True)
    instructor = InstructorProfileSerializer(read_only=True)
    price = serializers.FloatField()
    originalPrice = serializers.FloatField(source="original_price", allow_null=True)
    rating = serializers.FloatField()
    reviewCount = serializers.IntegerField(source="review_count", read_only=True)
    studentCount = serializers.IntegerField(source="student_count", read_only=True)
    lessonCount = serializers.IntegerField(source="lesson_count", read_only=True)
    modules = CourseModuleSerializer(many=True, read_only=True)
    enrolled = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "slug",
            "instructor",
            "specialty",
            "level",
            "price",
            "originalPrice",
            "rating",
            "reviewCount",
            "studentCount",
            "lessonCount",
            "duration",
            "thumbnail",
            "description",
            "badges",
            "modules",
            "enrolled",
            "progress",
            "status",
        ]

    def _progress(self, course):
        enrollment_map = self.context.get("enrollment_map") or {}
        return enrollment_map.get(str(course.id))

    def get_enrolled(self, course) -> bool:
        return self._progress(course) is not None

    def get_progress(self, course):
        progress = self._progress(course)
        return progress.progress if progress else None


class CourseReviewSerializer(serializers.ModelSerializer):
    """Response shape used on the course detail page."""

    id = serializers.UUIDField(read_only=True)
    initials = serializers.CharField(read_only=True)
    author = serializers.SerializerMethodField()

    class Meta:
        model = CourseReview
        fields = ["id", "author", "initials", "rating", "date", "body"]

    def get_author(self, review) -> str:
        return review.author_name


class EnrollmentSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    courseId = serializers.UUIDField(source="course_id", read_only=True)
    course = CourseSerializer(read_only=True)
    progress = serializers.IntegerField(read_only=True)

    class Meta:
        model = Enrollment
        fields = ["id", "courseId", "course", "progress", "created_at"]


class CartItemSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#CartItem`."""

    courseId = serializers.UUIDField(source="course_id", write_only=False, required=False)
    title = serializers.CharField(source="course.title", read_only=True)
    price = serializers.FloatField(source="course.price", read_only=True)
    instructor = serializers.CharField(
        source="course.instructor.name", read_only=True
    )

    class Meta:
        model = CartItem
        fields = ["id", "courseId", "title", "price", "instructor"]

    def validate_courseId(self, value):
        if not Course.objects.filter(id=value, status=Course.PUBLISHED).exists():
            raise serializers.ValidationError("Course not found.")
        return value
