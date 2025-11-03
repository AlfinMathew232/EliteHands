from django.middleware.csrf import get_token
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
@authentication_classes([])
@ensure_csrf_cookie
def get_csrf_token(request):
    """
    View to get CSRF token for the current session
    """
    return JsonResponse({'csrfToken': get_token(request)})
