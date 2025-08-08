from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, ServiceCategory, Service, Booking, Review, Notification

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'is_verified', 'is_active')
    list_filter = ('user_type', 'is_verified', 'is_active', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('EliteHands Profile', {
            'fields': ('user_type', 'phone', 'address', 'city', 'province', 'postal_code', 'profile_picture', 'is_verified')
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('EliteHands Profile', {
            'fields': ('user_type', 'phone', 'city', 'province')
        }),
    )

@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('name',)

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'duration_hours', 'is_active', 'created_at')
    list_filter = ('category', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'category__name')
    ordering = ('category', 'name')
    list_select_related = ('category',)

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('booking_id', 'customer', 'service', 'scheduled_date', 'scheduled_time', 'status', 'total_amount')
    list_filter = ('status', 'scheduled_date', 'created_at')
    search_fields = ('booking_id', 'customer__username', 'customer__email', 'service__name')
    ordering = ('-created_at',)
    list_select_related = ('customer', 'service', 'provider')
    readonly_fields = ('booking_id', 'created_at', 'updated_at')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('customer', 'provider', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('customer__username', 'provider__username', 'comment')
    ordering = ('-created_at',)
    list_select_related = ('customer', 'provider')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    ordering = ('-created_at',)
    list_select_related = ('user',)
