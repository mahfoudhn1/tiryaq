import django_filters as filters

from .models import Course


class CourseFilter(filters.FilterSet):
    """Query params used by the marketplace screen."""

    specialty = filters.CharFilter(field_name="specialty", lookup_expr="iexact")
    level = filters.CharFilter(field_name="level", lookup_expr="iexact")
    maxPrice = filters.NumberFilter(field_name="price", lookup_expr="lte")
    minPrice = filters.NumberFilter(field_name="price", lookup_expr="gte")
    search = filters.CharFilter(method="filter_search")
    mine = filters.BooleanFilter(method="filter_mine")

    class Meta:
        model = Course
        fields = ["specialty", "level", "maxPrice", "minPrice", "search", "mine"]

    def filter_search(self, queryset, name, value):
        return queryset.filter(title__icontains=value) | queryset.filter(
            specialty__icontains=value
        )

    def filter_mine(self, queryset, name, value):
        if not value or not self.request:
            return queryset
        profile = getattr(self.request.user, "instructor_profile", None)
        if profile is None:
            return queryset.none()
        return queryset.filter(instructor=profile)
