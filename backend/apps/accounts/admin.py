from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import InstructorApplication, InstructorProfile, User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ["email", "name", "role", "year", "is_staff", "is_active"]
    list_filter = ["role", "is_staff", "is_active"]
    search_fields = ["email", "name"]
    ordering = ["email"]
    fieldsets = DjangoUserAdmin.fieldsets + (
        ("Tiryaq", {"fields": ("name", "role", "year", "avatar_url")}),
    )
    add_fieldsets = DjangoUserAdmin.add_fieldsets + (
        ("Tiryaq", {"fields": ("name", "email", "role", "year")}),
    )


@admin.register(InstructorProfile)
class InstructorProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "specialty", "rating", "student_count", "is_verified"]
    list_filter = ["specialty", "is_verified"]
    search_fields = ["user__name", "user__email", "specialty"]


@admin.register(InstructorApplication)
class InstructorApplicationAdmin(admin.ModelAdmin):
    list_display = ["name", "email", "specialty", "status", "applied_at"]
    list_filter = ["status", "specialty"]
    search_fields = ["name", "email", "specialty"]
