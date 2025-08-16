from django.urls import path
from . import views

app_name = 'auth'

urlpatterns = [
    # User registration
    path('register/', views.UserRegistrationView.as_view(), name='register'),
    
    # User login/logout
    path('login/', views.UserLoginView.as_view(), name='login'),
    path('logout/', views.UserLogoutView.as_view(), name='logout'),
    
    # User profile
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    
    # Password reset
    path('password/reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
]
