from django.db import models

from apps.accounts.models import InstructorProfile
from apps.common.models import TimeStampedModel, UUIDModel


class CourseQuerySet(models.QuerySet):
    def published(self):
        return self.filter(status=Course.PUBLISHED)

    def with_curriculum(self):
        return self.prefetch_related(
            "modules__lessons__resources",
            "instructor__user",
        )


class Course(UUIDModel, TimeStampedModel):
    """A paid course taught by an instructor."""

    DRAFT = "pending"
    PUBLISHED = "published"
    REJECTED = "rejected"
    ARCHIVED = "archived"
    STATUS_CHOICES = [
        (DRAFT, "Pending"),
        (PUBLISHED, "Published"),
        (REJECTED, "Rejected"),
        (ARCHIVED, "Archived"),
    ]

    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    LEVEL_CHOICES = [
        (BEGINNER, "Beginner"),
        (INTERMEDIATE, "Intermediate"),
        (ADVANCED, "Advanced"),
    ]

    instructor = models.ForeignKey(
        InstructorProfile,
        on_delete=models.CASCADE,
        related_name="courses",
    )
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    specialty = models.CharField(max_length=120, db_index=True)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default=INTERMEDIATE)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    original_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    rating = models.FloatField(default=5.0)
    review_count = models.PositiveIntegerField(default=0)
    student_count = models.PositiveIntegerField(default=0)
    lesson_count = models.PositiveIntegerField(default=0)
    duration = models.CharField(max_length=40, blank=True)
    thumbnail = models.URLField(blank=True)
    description = models.TextField(blank=True)
    badges = models.JSONField(default=list, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)

    objects = CourseQuerySet.as_manager()

    class Meta:
        ordering = ["-student_count", "title"]

    def __str__(self) -> str:
        return self.title

    @property
    def total_lessons(self) -> int:
        return sum(module.lessons.count() for module in self.modules.all())


class CourseModule(UUIDModel, TimeStampedModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
        unique_together = [("course", "order")]

    def __str__(self) -> str:
        return f"{self.course.title} · {self.title}"


class Lesson(UUIDModel, TimeStampedModel):
    VIDEO = "video"
    RESOURCE = "resource"
    QUIZ = "quiz"
    TYPE_CHOICES = [
        (VIDEO, "Video"),
        (RESOURCE, "Resource"),
        (QUIZ, "Quiz"),
    ]

    module = models.ForeignKey(
        CourseModule, on_delete=models.CASCADE, related_name="lessons"
    )
    title = models.CharField(max_length=200)
    duration = models.CharField(max_length=20, blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=VIDEO)
    free = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["module__order", "order"]

    def __str__(self) -> str:
        return self.title


class LessonResource(UUIDModel, TimeStampedModel):
    PDF = "pdf"
    SLIDE = "slide"
    REFERENCE = "reference"
    TYPE_CHOICES = [
        (PDF, "PDF"),
        (SLIDE, "Slides"),
        (REFERENCE, "Reference"),
    ]

    lesson = models.ForeignKey(
        Lesson, on_delete=models.CASCADE, related_name="resources"
    )
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default=PDF)
    size = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class CourseReview(UUIDModel, TimeStampedModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="reviews")
    author = models.ForeignKey(
        "accounts.User",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="course_reviews",
    )
    author_name = models.CharField(max_length=150)
    rating = models.PositiveSmallIntegerField(default=5)
    body = models.TextField()
    date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ["-date"]

    def __str__(self) -> str:
        return f"{self.author_name} → {self.course.title}"

    @property
    def initials(self) -> str:
        from apps.common.models import initials_for

        return initials_for(self.author_name)


class Enrollment(UUIDModel, TimeStampedModel):
    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="enrollments"
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    progress = models.PositiveSmallIntegerField(default=0)
    completed_lessons = models.ManyToManyField(
        Lesson, blank=True, related_name="completed_by"
    )
    last_accessed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = [("user", "course")]

    def __str__(self) -> str:
        return f"{self.user.email} → {self.course.title}"

    def recalculate_progress(self) -> int:
        lesson_ids = list(
            Lesson.objects.filter(module__course=self.course).values_list("id", flat=True)
        )
        total = len(lesson_ids)
        if not total:
            self.progress = 0
        else:
            done = self.completed_lessons.filter(id__in=lesson_ids).count()
            self.progress = round(done / total * 100)
        return self.progress


class CartItem(UUIDModel, TimeStampedModel):
    user = models.ForeignKey(
        "accounts.User", on_delete=models.CASCADE, related_name="cart_items"
    )
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="cart_items")

    class Meta:
        ordering = ["-created_at"]
        unique_together = [("user", "course")]

    def __str__(self) -> str:
        return f"{self.user.email} · {self.course.title}"
