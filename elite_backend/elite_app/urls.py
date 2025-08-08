from django.urls import path
from . import views

app_name = 'elite_app'

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # User authentication
    path('auth/register/', views.UserRegistrationView.as_view(), name='user_register'),
    path('auth/staff/register/', views.StaffRegistrationView.as_view(), name='staff_register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user_login'),
    path('auth/logout/', views.UserLogoutView.as_view(), name='user_logout'),
    path('auth/profile/', views.UserProfileView.as_view(), name='user_profile'),
    
    # Staff management (admin only)
    path('staff/', views.StaffListView.as_view(), name='staff_list'),
    path('staff/assigned/', views.AssignedStaffListView.as_view(), name='assigned_staff'),
    path('staff/<int:staff_id>/', views.StaffDetailView.as_view(), name='staff_detail'),
    path('staff/<int:staff_id>/status/', views.StaffStatusView.as_view(), name='staff_status'),
    
    # Services
    path('services/categories/', views.ServiceCategoryListView.as_view(), name='service_categories'),
    path('services/', views.ServiceListView.as_view(), name='services'),
    path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service_detail'),
    
    # Bookings
    path('bookings/', views.BookingListView.as_view(), name='bookings'),
    path('bookings/<int:pk>/', views.BookingDetailView.as_view(), name='booking_detail'),
    
    # Reviews
    path('reviews/', views.ReviewListView.as_view(), name='reviews'),
    
    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:notification_id>/mark-read/', views.NotificationMarkAsReadView.as_view(), name='mark_notification_read'),
    
    # Messages
    path('messages/', views.MessageListView.as_view(), name='messages'),
    path('messages/<int:pk>/', views.MessageDetailView.as_view(), name='message_detail'),
    path('messages/<int:message_id>/mark-read/', views.MessageMarkAsReadView.as_view(), name='mark_message_read'),
]
