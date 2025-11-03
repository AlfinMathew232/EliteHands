from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'email', 'username', 'password', 'password2',
            'first_name', 'last_name', 'phone', 'user_type'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
            'email': {'required': True},
            'phone': {'required': True},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Set default user type to 'customer' if not provided
        attrs.setdefault('user_type', 'customer')
        
        # Validate user type
        if attrs['user_type'] not in dict(User.USER_TYPES).keys():
            raise serializers.ValidationError({"user_type": "Invalid user type."})
            
        return attrs

    def create(self, validated_data):
        # Remove password2 from the data
        validated_data.pop('password2', None)
        
        # Create user
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login (accepts email OR username)"""
    email = serializers.EmailField(required=False)
    username = serializers.CharField(required=False)
    password = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        email = attrs.get('email')
        username = attrs.get('username')
        password = attrs.get('password')

        if not password:
            raise serializers.ValidationError('Password is required.', code='authorization')

        # Resolve username to email if only username provided
        if not email and username:
            try:
                user_obj = User.objects.get(username=username)
                email = user_obj.email
            except User.DoesNotExist:
                raise serializers.ValidationError('Unable to log in with provided credentials.', code='authorization')

        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )

            if not user:
                msg = 'Unable to log in with provided credentials.'
                raise serializers.ValidationError(msg, code='authorization')

            if not user.is_active:
                msg = 'User account is disabled.'
                raise serializers.ValidationError(msg, code='authorization')

            if user.user_type == 'staff' and not getattr(user, 'is_active_staff', True):
                msg = 'Staff account is not active.'
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = 'Must include "email" or "username" and "password".'
            raise serializers.ValidationError(msg, code='authorization')

        attrs['user'] = user
        return attrs

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
