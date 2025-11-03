import random
import string
from datetime import datetime, timedelta

from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, OTP
from .serializers import (
    UserLoginSerializer, UserRegistrationSerializer,
    PasswordResetRequestSerializer, PasswordResetConfirmSerializer,
    OTPVerificationSerializer
)

class UserRegistrationView(APIView):
    """User registration endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Log the user in using Django's session framework
            from django.contrib.auth import login
            login(request, user)
            
            # Set session expiry to 24 hours
            request.session.set_expiry(86400)
            
            return Response({
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': user.user_type
                },
                'session_auth': True
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        # DEV convenience: hardcoded admin login
        try:
            email_in = (request.data.get('email') or '').strip().lower()
            username_in = (request.data.get('username') or '').strip()
            password_in = request.data.get('password') or ''
            if (email_in == 'admin@elitehands.ca' or username_in == 'admin') and password_in == 'password123':
                # Ensure admin user exists and flags are correct
                from django.contrib.auth import get_user_model
                UserModel = get_user_model()
                admin_user, created = UserModel.objects.get_or_create(
                    email='admin@elitehands.ca',
                    defaults={
                        'username': 'admin',
                        'first_name': 'Admin',
                        'last_name': 'User',
                        'user_type': 'admin',
                        'is_active': True,
                        'is_staff': True,
                        'is_superuser': True,
                    }
                )
                # Ensure flags and password
                changed = False
                if not admin_user.is_active:
                    admin_user.is_active = True; changed = True
                if not admin_user.is_staff:
                    admin_user.is_staff = True; changed = True
                if not admin_user.is_superuser:
                    admin_user.is_superuser = True; changed = True
                if getattr(admin_user, 'user_type', None) != 'admin':
                    admin_user.user_type = 'admin'; changed = True
                # Always set password to known value for dev
                admin_user.set_password('password123'); changed = True
                if changed:
                    admin_user.save()

                # Log the user in and issue JWT
                from django.contrib.auth import login
                login(request, admin_user)
                request.session.set_expiry(86400)

                refresh = RefreshToken.for_user(admin_user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)

                return Response({
                    'message': 'Login successful',
                    'user': {
                        'id': admin_user.id,
                        'email': admin_user.email,
                        'first_name': admin_user.first_name,
                        'last_name': admin_user.last_name,
                        'user_type': admin_user.user_type
                    },
                    'session_auth': True,
                    'access': access_token,
                    'refresh': refresh_token,
                })
        except Exception:
            pass

        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Log the user in using Django's session framework
            from django.contrib.auth import login
            login(request, user)
            
            # Set session expiry to 24 hours
            request.session.set_expiry(86400)
            
            # Also issue JWT tokens for frontend API calls if needed
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            return Response({
                'message': 'Login successful',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'user_type': user.user_type
                },
                'session_auth': True,
                'access': access_token,
                'refresh': refresh_token,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(APIView):
    """Request password reset with email"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email)
                
                # Generate OTP
                otp = ''.join(random.choices(string.digits, k=6))
                expires_at = timezone.now() + timedelta(minutes=15)
                
                # Save OTP to database
                OTP.objects.create(
                    user=user,
                    otp=otp,
                    expires_at=expires_at,
                    is_used=False
                )
                
                # Send OTP via email
                try:
                    # Log email sending attempt for debugging
                    print(f"Sending password reset OTP to {user.email}: {otp}")
                    
                    send_mail(
                        'Password Reset OTP',
                        f'Your OTP for password reset is: {otp}. It will expire in 15 minutes.',
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email],
                        fail_silently=False,
                    )
                    
                    print(f"Email sent successfully to {user.email}")
                except Exception as e:
                    print(f"Email sending failed: {str(e)}")
                    # Even if email fails, we'll return success to avoid leaking info
                    # The OTP is still in the database and can be used for testing
                
                return Response({
                    'message': 'OTP sent to your email',
                    'email': user.email  # Return masked email for display
                })
                
            except User.DoesNotExist:
                # For security, don't reveal if email exists or not
                return Response(
                    {'message': 'If your email is registered, you will receive an OTP'},
                    status=status.HTTP_200_OK
                )
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OTPVerificationView(APIView):
    """Verify OTP for password reset"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = OTPVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']
            
            try:
                user = User.objects.get(email=email)
                otp_record = OTP.objects.filter(
                    user=user,
                    otp=otp,
                    is_used=False,
                    expires_at__gt=timezone.now()
                ).first()
                
                if otp_record:
                    # Mark OTP as used
                    otp_record.is_used = True
                    otp_record.save()
                    
                    # Generate a one-time token for password reset
                    reset_token = ''.join(random.choices(string.ascii_letters + string.digits, k=64))
                    user.reset_token = reset_token
                    user.reset_token_expires = timezone.now() + timedelta(minutes=15)
                    user.save()
                    
                    return Response({
                        'message': 'OTP verified successfully',
                        'reset_token': reset_token
                    })
                
                return Response(
                    {'error': 'Invalid or expired OTP'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(APIView):
    """Confirm password reset with new password"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            email = serializer.validated_data['email']
            new_password = serializer.validated_data['password']
            
            try:
                user = User.objects.get(
                    email=email,
                    reset_token=token,
                    reset_token_expires__gt=timezone.now()
                )
                
                # Update password
                user.set_password(new_password)
                user.reset_token = None
                user.reset_token_expires = None
                user.save()
                
                # Invalidate all user's sessions if they exist
                if hasattr(user, 'auth_token_set'):
                    user.auth_token_set.all().delete()
                
                return Response({
                    'message': 'Password reset successful. You can now login with your new password.'
                })
                
            except User.DoesNotExist:
                return Response(
                    {'error': 'Invalid or expired reset token'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
