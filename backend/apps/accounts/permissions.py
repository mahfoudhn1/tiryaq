from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    message = "Administrator access is required."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and user.role == "ADMIN")


class IsInstructorRole(permissions.BasePermission):
    message = "Instructor access is required."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(user and user.is_authenticated and user.role == "INSTRUCTOR")


class IsInstructorOrAdmin(permissions.BasePermission):
    message = "Instructor or administrator access is required."

    def has_permission(self, request, view) -> bool:
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and user.role in {"INSTRUCTOR", "ADMIN"}
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view) -> bool:
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.role == "ADMIN")
