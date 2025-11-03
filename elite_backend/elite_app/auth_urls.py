from django.urls import path, include
from . import views
from .views_auth import PasswordResetRequestView, OTPVerificationView, PasswordResetConfirmView, UserLoginView
from .auth_utils import get_csrf_token

app_name = 'auth'

urlpatterns = [
    # User registration
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    
    # User login/logout
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    
    # User profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    
    # Password reset with OTP
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/verify-otp/', OTPVerificationView.as_view(), name='verify_otp'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # CSRF Token
    path('csrf/', get_csrf_token, name='get_csrf_token'),
]
