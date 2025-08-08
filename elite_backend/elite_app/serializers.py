from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, ServiceCategory, Service, Booking, Review, Notification, Message

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
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 
                 'last_name', 'phone', 'city', 'province']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        return user

class StaffRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for staff registration (admin only)"""
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'confirm_password', 'first_name', 
                 'last_name', 'phone', 'position', 'work_email', 'work_phone']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords don't match.")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        validated_data['user_type'] = 'staff'
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login"""
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if user and user.can_login:
            data['user'] = user
            return data
        raise serializers.ValidationError("Invalid credentials or account is inactive.")

class ServiceCategorySerializer(serializers.ModelSerializer):
    """Serializer for ServiceCategory model"""
    class Meta:
        model = ServiceCategory
        fields = '__all__'

class ServiceSerializer(serializers.ModelSerializer):
    """Serializer for Service model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    class Meta:
        model = Service
        fields = ['id', 'category', 'category_name', 'name', 'description', 
                 'price', 'duration_hours', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class BookingSerializer(serializers.ModelSerializer):
    """Serializer for Booking model"""
    customer_name = serializers.CharField(source='customer.get_full_name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    provider_name = serializers.CharField(source='provider.get_full_name', read_only=True)
    
    class Meta:
        model = Booking
        fields = ['id', 'booking_id', 'customer', 'customer_name', 'service', 'service_name',
                 'provider', 'provider_name', 'scheduled_date', 'scheduled_time', 'status',
                 'total_amount', 'special_instructions', 'address', 'city', 'province',
                 'postal_code', 'created_at', 'updated_at']
        read_only_fields = ['id', 'booking_id', 'created_at', 'updated_at']

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
    
    class Meta:
        model = Review
        fields = ['id', 'booking', 'customer', 'customer_name', 'provider', 'provider_name',
                 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'customer', 'provider', 'created_at']

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