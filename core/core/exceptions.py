from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Returns consistent error shape across all endpoints:
    { "error": "message", "detail": ... }
    Never exposes stack traces or internal details.
    """
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'error': True,
            'message': '',
            'details': None,
        }

        if isinstance(response.data, dict):
            # Use 'detail' key if present (DRF default)
            if 'detail' in response.data:
                error_data['message'] = str(response.data['detail'])
            else:
                error_data['message'] = 'Validation failed.'
                error_data['details'] = response.data
        elif isinstance(response.data, list):
            error_data['message'] = 'Validation failed.'
            error_data['details'] = response.data
        else:
            error_data['message'] = str(response.data)

        response.data = error_data

    return response