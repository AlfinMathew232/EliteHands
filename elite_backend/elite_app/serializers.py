from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User, ServiceCategory, Service, Booking, Review, Notification, Message, BookingAssignment, LeaveRequest, AppSettings

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'user_type', 
                 'phone', 'address', 'city', 'province', 'postal_code', 'profile_picture', 
                 'is_verified', 'is_active_staff', 'position', 'work_email', 'work_phone', 'created_at']
        read_only_fields = ['id', 'created_at']

class StaffSerializer(serializers.ModelSerializer):
    """Serializer for Staff management"""
    full_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                 'position', 'work_email', 'work_phone', 'is_active_staff', 'status',
                 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    
    def get_status(self, obj):
        return "Active" if obj.is_active_staff else "Inactive"

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 
                 'last_name', 'phone', 'city', 'province']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user

class StaffRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for staff registration (admin only)"""
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 
                 'last_name', 'phone', 'position', 'work_email', 'work_phone']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Passwords don't match.")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        position = (validated_data.get('position') or '').strip().lower()
        # Map position to user_type
        if position == 'admin':
            validated_data['user_type'] = 'admin'
        elif position == 'customer':
            validated_data['user_type'] = 'customer'
        else:
            validated_data['user_type'] = 'staff'
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login (accepts email OR username)"""
    email = serializers.CharField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField()

    def validate(self, data):
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not password:
            raise serializers.ValidationError("Password is required.")

        if not (username or email):
            raise serializers.ValidationError("Either username or email is required.")

        # If email is provided, resolve to the user's username for authenticate()
        # Normalize email and resolve to username if provided
        login_username = username
        if email and not login_username:
            email_norm = (email or '').strip().lower()
            try:
                user_lookup = User.objects.filter(email__iexact=email_norm).first()
                if not user_lookup:
                    raise User.DoesNotExist
                login_username = user_lookup.username
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials or account is inactive.")

        user = authenticate(username=login_username, password=password)
        if user and getattr(user, 'can_login', True):
            data['user'] = user
            return data
        raise serializers.ValidationError("Invalid credentials or account is inactive.")

class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'category', 'category_name', 'name', 'description', 
                 'price', 'duration_hours', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class ServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer for ServiceCategory model"""
    services = serializers.SerializerMethodField()

    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'description', 'icon', 'is_active', 'created_at', 'services']

    def get_services(self, obj):
        # Only include ACTIVE services for public consumption
        qs = obj.services.filter(is_active=True)
        return ServiceSerializer(qs, many=True).data

class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model"""
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    provider_name = serializers.CharField(source='provider.get_full_name', read_only=True)
    latest_review = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = ['id', 'booking_id', 'customer', 'customer_name', 'service', 'service_name',
                 'provider', 'provider_name', 'scheduled_date', 'scheduled_time', 'status',
                 'total_amount', 'special_instructions', 'address', 'city', 'province',
                 'postal_code', 'created_at', 'updated_at', 'latest_review']
        read_only_fields = ['id', 'booking_id', 'created_at', 'updated_at']

    def get_latest_review(self, obj):
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = getattr(request, 'user', None)
        if user and getattr(user, 'is_authenticated', False):
            review = Review.objects.filter(booking=obj, customer=user).order_by('-created_at').first()
            if review:
                return ReviewSerializer(review).data
        return None

class BookingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating bookings"""
    class Meta:
        model = Booking
        fields = ['service', 'scheduled_date', 'scheduled_time', 'special_instructions',
                 'address', 'city', 'province', 'postal_code']

    def create(self, validated_data):
        # Set the customer to the current user
        validated_data['customer'] = self.context['request'].user
        # Calculate total amount based on service price
        service = validated_data['service']
        validated_data['total_amount'] = service.price
        return super().create(validated_data)

class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    provider_name = serializers.CharField(source='provider.get_full_name', read_only=True)
    service_name = serializers.CharField(source='booking.service.name', read_only=True)
    comment = serializers.CharField(allow_blank=True, required=False)
    
    class Meta:
        model = Review
        fields = ['id', 'booking', 'customer', 'customer_name', 'provider', 'provider_name',
                 'service_name', 'rating', 'comment', 'published', 'created_at']
        read_only_fields = ['id', 'customer', 'provider', 'created_at']

class BookingAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for BookingAssignment model"""
    staff_name = serializers.CharField(source='staff.get_full_name', read_only=True)

    class Meta:
        model = BookingAssignment
        fields = ['id', 'booking', 'staff', 'staff_name', 'role', 'assigned_at', 'unassigned_at']
        read_only_fields = ['id', 'assigned_at', 'unassigned_at']

class LeaveRequestSerializer(serializers.ModelSerializer):
    """Serializer for LeaveRequest model"""
    staff_name = serializers.CharField(source='staff.get_full_name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = ['id', 'staff', 'staff_name', 'start_date', 'end_date', 'reason', 'status', 'created_at', 'updated_at']
        read_only_fields = ['id', 'status', 'created_at', 'updated_at', 'staff']

class AppSettingsSerializer(serializers.ModelSerializer):
    """Serializer for AppSettings persisted configuration"""
    class Meta:
        model = AppSettings
        fields = ['site_name', 'contact_email', 'contact_phone', 'address', 'map_embed_url', 'updated_at']
        read_only_fields = ['updated_at']

class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'title', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    """Serializer for Message model"""
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    staff_name = serializers.CharField(source='staff.get_full_name', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'customer', 'customer_name', 'staff', 'staff_name', 'booking',
                 'subject', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']

class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages"""
    class Meta:
        model = Message
        fields = ['staff', 'booking', 'subject', 'message']

    def create(self, validated_data):
        # Set the customer to the current user
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)

class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField(required=True)
    
    def validate_email(self, value):
        # Convert email to lowercase
        return value.lower()

class OTPVerificationSerializer(serializers.Serializer):
    """Serializer for OTP verification"""
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=6, min_length=6, required=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        otp = attrs.get('otp')
        
        if not email or not otp:
            raise serializers.ValidationError("Email and OTP are required.")
            
        return attrs

class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    token = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
        validators=[validate_password]
    )
    
    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value