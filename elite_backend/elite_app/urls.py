from django.urls import path, include
from . import views

app_name = 'elite_app'

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health_check'),
    
    # User authentication
    path('auth/', include('elite_app.auth_urls')),
    
    # Staff management (admin only)
    path('staff/', include('elite_app.staff_urls')),
    
    # Services
    path('services/categories/', views.ServiceCategoryListView.as_view(), name='service_categories'),
    path('services/', views.ServiceListView.as_view(), name='services'),
    path('services/<int:pk>/', views.ServiceDetailView.as_view(), name='service_detail'),
    # Admin services/categories CRUD
    path('admin/services/categories/', views.AdminCategoryListCreateView.as_view(), name='admin_service_categories'),
    path('admin/services/categories/<int:pk>/', views.AdminCategoryDetailView.as_view(), name='admin_service_category_detail'),
    path('admin/services/', views.AdminServiceListCreateView.as_view(), name='admin_services'),
    path('admin/services/<int:pk>/', views.AdminServiceDetailView.as_view(), name='admin_service_detail'),
    
    # Bookings
    path('bookings/', views.BookingListView.as_view(), name='bookings'),
    path('bookings/<int:pk>/', views.BookingDetailView.as_view(), name='booking_detail'),
    # Booking assignments
    path('admin/bookings/<int:booking_id>/assign/', views.AdminAssignBookingView.as_view(), name='admin_assign_booking'),
    path('admin/bookings/<int:booking_id>/assign/<int:staff_id>/', views.AdminUnassignBookingView.as_view(), name='admin_unassign_booking'),
    path('bookings/<int:booking_id>/assignments/', views.BookingAssignmentsListView.as_view(), name='booking_assignments'),
    path('staff/assignments/', views.StaffAssignmentsListView.as_view(), name='staff_assignments'),
    
    # Reviews
    path('reviews/', views.ReviewListView.as_view(), name='reviews'),
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review_detail'),
    # Admin Reviews moderation
    path('admin/reviews/', views.AdminReviewsListView.as_view(), name='admin_reviews'),
    path('admin/reviews/<int:review_id>/publish/', views.AdminReviewPublishView.as_view(), name='admin_review_publish'),
    
    # Notifications
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    path('notifications/<int:notification_id>/mark-read/', views.NotificationMarkAsReadView.as_view(), name='mark_notification_read'),
    
    # Messages
    path('messages/', views.MessageListView.as_view(), name='messages'),
    path('messages/<int:pk>/', views.MessageDetailView.as_view(), name='message_detail'),
    path('messages/<int:message_id>/mark-read/', views.MessageMarkAsReadView.as_view(), name='mark_message_read'),
    
    # Contact
    path('contact/', views.contact_form, name='contact_form'),
    
    # Admin endpoints
    path('admin/analytics/', views.AdminAnalyticsView.as_view(), name='admin_analytics'),
    path('admin/settings/', views.AdminSettingsView.as_view(), name='admin_settings'),
    # Leave Requests
    path('staff/leave-requests/', views.StaffLeaveRequestListCreateView.as_view(), name='staff_leave_requests'),
    path('admin/leave-requests/', views.AdminLeaveRequestsListView.as_view(), name='admin_leave_requests'),
    path('admin/leave-requests/<int:leave_id>/decision/', views.AdminLeaveRequestDecisionView.as_view(), name='admin_leave_request_decision'),
]
