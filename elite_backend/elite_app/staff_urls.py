from django.urls import path
from . import views

app_name = 'staff_management'

urlpatterns = [
    # Staff list and create
    path('', views.StaffDetailView.as_view(), name='staff-list'),
    path('create/', views.StaffDetailView.as_view(), name='staff-create'),
    
    # Staff detail, update, delete
    path('<int:staff_id>/', views.StaffDetailView.as_view(), name='staff-detail'),
    
    # Staff status toggle
    path('<int:staff_id>/status/', views.StaffStatusView.as_view(), name='staff-status'),
    
    # Assigned staff for customers
    path('assigned/', views.AssignedStaffListView.as_view(), name='assigned-staff'),
]
