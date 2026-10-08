from rest_framework import serializers

from .models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    """Response shape used by `types/medical.ts#Transaction`."""

    id = serializers.UUIDField(read_only=True)
    amount = serializers.FloatField()
    date = serializers.DateTimeField()

    class Meta:
        model = Transaction
        fields = ["id", "type", "description", "amount", "date", "status"]
