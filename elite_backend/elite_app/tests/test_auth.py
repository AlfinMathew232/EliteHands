import json
from datetime import timedelta
from django.urls import reverse
from django.test import TestCase, Client
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from elite_app.models import User, OTP

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.client = Client()
        self.user_data = {
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User',
            'phone': '+1234567890',
            'user_type': 'customer'
        }
        self.user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            phone='+1234567890',
            user_type='customer'
        )
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123',
            first_name='Admin',
            last_name='User',
            phone='+1987654321',
            user_type='admin'
        )

    def test_user_registration(self):
        """Test user registration with valid data"""
        url = reverse('user-register')
        data = self.user_data.copy()
        data['email'] = 'newuser@example.com'
        data['password2'] = 'testpass123'
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', response.data)
        self.assertEqual(User.objects.count(), 3)  # 2 from setup + 1 new

    def test_user_login(self):
        """Test user login with valid credentials"""
        url = reverse('user-login')
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])

    def test_password_reset_flow(self):
        """Test complete password reset flow"""
        # 1. Request password reset
        reset_request_url = reverse('password-reset-request')
        data = {'email': 'test@example.com'}
        
        response = self.client.post(reset_request_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 2. Verify OTP was created
        otp = OTP.objects.filter(user=self.user).first()
        self.assertIsNotNone(otp)
        
        # 3. Verify OTP
        verify_otp_url = reverse('password-reset-verify-otp')
        data = {
            'email': 'test@example.com',
            'otp': otp.otp
        }
        
        response = self.client.post(verify_otp_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('reset_token', response.data)
        
        # Refresh user to get the reset token
        self.user.refresh_from_db()
        reset_token = self.user.reset_token
        
        # 4. Reset password with new password
        reset_confirm_url = reverse('password-reset-confirm')
        data = {
            'reset_token': reset_token,
            'new_password': 'newpass123',
            'new_password2': 'newpass123'
        }
        
        response = self.client.post(reset_confirm_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 5. Verify new password works
        login_url = reverse('user-login')
        data = {
            'email': 'test@example.com',
            'password': 'newpass123'
        }
        
        response = self.client.post(login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data)

    def test_expired_otp(self):
        """Test that expired OTP cannot be used"""
        # Create an expired OTP
        otp = OTP.objects.create(
            user=self.user,
            otp='123456',
            created_at=timezone.now() - timedelta(hours=1),
            expires_at=timezone.now() - timedelta(minutes=30),
            is_used=False
        )
        
        verify_otp_url = reverse('password-reset-verify-otp')
        data = {
            'email': 'test@example.com',
            'otp': '123456'
        }
        
        response = self.client.post(verify_otp_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Invalid or expired OTP')

    def test_used_otp(self):
        """Test that used OTP cannot be reused"""
        # Create a used OTP
        otp = OTP.objects.create(
            user=self.user,
            otp='123456',
            expires_at=timezone.now() + timedelta(minutes=30),
            is_used=True
        )
        
        verify_otp_url = reverse('password-reset-verify-otp')
        data = {
            'email': 'test@example.com',
            'otp': '123456'
        }
        
        response = self.client.post(verify_otp_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Invalid or expired OTP')
