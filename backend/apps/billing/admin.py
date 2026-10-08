from django.contrib import admin

from .models import Transaction


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ["date", "instructor", "type", "description", "amount", "status"]
    list_filter = ["type", "status"]
    search_fields = ["description", "instructor__user__name", "instructor__user__email"]
    date_hierarchy = "date"
    autocomplete_fields: list = []
