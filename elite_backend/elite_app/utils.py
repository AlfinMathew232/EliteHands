from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response
from django.core.exceptions import ValidationError

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Use the default error message or a custom one if available
        error_message = None
        if hasattr(exc, 'detail') and exc.detail:
            error_message = str(exc.detail)
        elif hasattr(exc, 'message'):
            error_message = exc.message
        elif hasattr(exc, 'messages') and exc.messages:
            error_message = ', '.join([str(msg) for msg in exc.messages])
        
        # If we still don't have an error message, use the status text
        if not error_message:
            error_message = response.status_text
            
        # Create a consistent error response format
        response.data = {
            'status': 'error',
            'code': response.status_code,
            'message': error_message,
            'data': None
        }
    
    # Handle Django's ValidationError
    elif isinstance(exc, ValidationError):
        response = Response(
            {
                'status': 'error',
                'code': status.HTTP_400_BAD_REQUEST,
                'message': 'Validation error',
                'data': {
                    'errors': exc.message_dict if hasattr(exc, 'message_dict') else str(exc)
                }
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Handle all other uncaught exceptions
    else:
        response = Response(
            {
                'status': 'error',
                'code': status.HTTP_500_INTERNAL_SERVER_ERROR,
                'message': 'An unexpected error occurred',
                'data': None
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    return response
