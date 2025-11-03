from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from django.utils import timezone

class User(AbstractUser):
    """Custom User model for EliteHands"""
    USER_TYPES = (
        ('customer', 'Customer'),
        ('staff', 'Staff'),
        ('admin', 'Administrator'),
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='customer')
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    province = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=10, blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    is_active_staff = models.BooleanField(default=True)  # For staff status
    position = models.CharField(max_length=100, blank=True, null=True)  # Staff position
    work_email = models.EmailField(blank=True, null=True)  # Staff work email
    work_phone = models.CharField(max_length=20, blank=True, null=True)  # Staff work phone
    reset_token = models.CharField(max_length=100, blank=True, null=True)  # For password reset
    reset_token_expires = models.DateTimeField(blank=True, null=True)  # Token expiration
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.username

    @property
    def is_staff_member(self):
        return self.user_type in ['staff', 'admin']

    @property
    def can_login(self):
        if self.user_type in ['staff', 'admin']:
            return self.is_active_staff and self.is_active
        return self.is_active

class ServiceCategory(models.Model):
    """Service categories like Moving, Cleaning, Events"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'service_categories'
        verbose_name_plural = 'Service Categories'

    def __str__(self):
        return self.name

class Service(models.Model):
    """Individual services within categories"""
    category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE, related_name='services')
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    duration_hours = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'services'

    def __str__(self):
        return f"{self.category.name} - {self.name}"

class Booking(models.Model):
    """Service bookings"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    
    booking_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    service = models.ForeignKey(Service, on_delete=models.CASCADE, related_name='bookings')
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='provider_bookings', null=True, blank=True)
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    special_instructions = models.TextField(blank=True, null=True)
    address = models.TextField()
    city = models.CharField(max_length=100)
    province = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'bookings'

    def __str__(self):
        return f"Booking {self.booking_id} - {self.customer.username}"

class Review(models.Model):
    """Customer reviews for services"""
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='review')
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='provider_reviews')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'

    def __str__(self):
        return f"Review by {self.customer.username} - {self.rating} stars"

class BookingAssignment(models.Model):
    """Assignment of staff to a booking with a specific role"""
    ROLE_CHOICES = (
        ('driver', 'Driver'),
        ('mover', 'Mover'),
        ('cleaner', 'Cleaner'),
        ('packing_specialist', 'Packing Specialist'),
        ('event_planner', 'Event Planner'),
        ('event_assistant', 'Event Assistant'),
        ('logistics', 'Logistics'),
        ('customer_service', 'Customer Service'),
        ('manager', 'Manager'),
    )

    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='assignments')
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignments')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    assigned_at = models.DateTimeField(auto_now_add=True)
    unassigned_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'booking_assignments'
        unique_together = ('booking', 'staff')

    def __str__(self):
        return f"Assignment {self.id} - Booking {self.booking.booking_id} -> {self.staff.username} ({self.role})"

class Notification(models.Model):
    """User notifications"""
    NOTIFICATION_TYPES = (
        ('booking_confirmed', 'Booking Confirmed'),
        ('booking_cancelled', 'Booking Cancelled'),
        ('booking_reminder', 'Booking Reminder'),
        ('payment_received', 'Payment Received'),
        ('review_received', 'Review Received'),
        ('message_received', 'Message Received'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'

    def __str__(self):
        return f"Notification for {self.user.username} - {self.title}"

class Message(models.Model):
    """Messages between customers and staff"""
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_messages')
    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='staff_messages')
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['-created_at']

    def __str__(self):
        return f"Message from {self.customer.username} to {self.staff.username} - {self.subject}"

class OTP(models.Model):
    """One-Time Password for password reset"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otps')
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"OTP for {self.user.email} ({'used' if self.is_used else 'active'})"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at

class LeaveRequest(models.Model):
    """Staff leave requests with approval workflow"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    staff = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leave_requests'
        ordering = ['-created_at']

    def __str__(self):
        return f"LeaveRequest {self.id} - {self.staff.username} ({self.status})"

class AppSettings(models.Model):
    """Persisted application-wide settings (singleton)"""
    site_name = models.CharField(max_length=100, default='EliteHands')
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(max_length=255, default='157 Gorge Rd E #402, Victoria, BC V9A 6Y2, Canada')
    map_embed_url = models.TextField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'app_settings'

    def __str__(self):
        return f"AppSettings (updated {self.updated_at})"
