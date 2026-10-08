from django.contrib import admin

from .models import (
    CartItem,
    Course,
    CourseModule,
    CourseReview,
    Enrollment,
    Lesson,
    LessonResource,
)


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0


class CourseModuleInline(admin.TabularInline):
    model = CourseModule
    extra = 0
    show_change_link = True


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["title", "instructor", "specialty", "level", "price", "status", "student_count"]
    list_filter = ["status", "level", "specialty"]
    search_fields = ["title", "slug", "specialty", "instructor__user__name"]
    prepopulated_fields = {"slug": ("title",)}
    inlines = [CourseModuleInline]
    actions = ["publish", "archive"]

    @admin.action(description="Publish selected courses")
    def publish(self, request, queryset):
        queryset.update(status=Course.PUBLISHED)

    @admin.action(description="Archive selected courses")
    def archive(self, request, queryset):
        queryset.update(status=Course.ARCHIVED)


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "order"]
    list_filter = ["course"]
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ["title", "module", "type", "duration", "free", "order"]
    list_filter = ["type", "free"]
    search_fields = ["title"]


@admin.register(LessonResource)
class LessonResourceAdmin(admin.ModelAdmin):
    list_display = ["name", "lesson", "type", "size"]
    list_filter = ["type"]


@admin.register(CourseReview)
class CourseReviewAdmin(admin.ModelAdmin):
    list_display = ["course", "author_name", "rating", "date"]
    list_filter = ["rating"]


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ["user", "course", "progress", "created_at"]
    list_filter = ["course"]
    search_fields = ["user__email", "course__title"]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ["user", "course", "created_at"]
    search_fields = ["user__email", "course__title"]
