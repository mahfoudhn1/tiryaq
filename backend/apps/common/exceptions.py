"""Consistent error payloads: the Next.js client relies on `detail`."""

from rest_framework.views import exception_handler


def api_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    if isinstance(response.data, dict) and "detail" not in response.data:
        first_field, first_error = next(iter(response.data.items()))
        if isinstance(first_error, (list, tuple)) and first_error:
            response.data = {
                "detail": str(first_error[0]),
                "field": first_field,
                "errors": response.data,
            }
    return response
