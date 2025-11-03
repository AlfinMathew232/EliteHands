from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from django.shortcuts import render
from django.db.models import Q
from .models import User, ServiceCategory, Service, Booking, Review, Notification, Message, BookingAssignment, LeaveRequest, AppSettings
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer, StaffSerializer, StaffRegistrationSerializer,
    ServiceCategorySerializer, ServiceSerializer, BookingSerializer,
    BookingCreateSerializer, ReviewSerializer, NotificationSerializer, MessageSerializer, MessageCreateSerializer,
    BookingAssignmentSerializer, LeaveRequestSerializer, AppSettingsSerializer
)
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import SessionAuthentication

# In development, allow session-auth API calls without CSRF for convenience
class CsrfExemptSessionAuthentication(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # Disable CSRF check for API views using session auth (DEV ONLY)

class UserRegistrationView(APIView):
    """User registration endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            login(request, user)
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StaffRegistrationView(APIView):
    """Staff registration endpoint (admin only)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Only admins can register staff'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = StaffRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Staff registered successfully',
                'user': StaffSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLoginView(APIView):
    """User login endpoint"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            login(request, user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        # Debug logging for development to diagnose login failures
        try:
            print('[LOGIN DEBUG] Incoming data:', request.data)
            print('[LOGIN DEBUG] Serializer errors:', serializer.errors)
        except Exception:
            pass
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLogoutView(APIView):
    """User logout endpoint"""
    permission_classes = [permissions.AllowAny]
    authentication_classes = [JWTAuthentication, CsrfExemptSessionAuthentication]
    
    def post(self, request):
        # Clear the session
        logout(request)
        response = Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
        
        # Clear any cookies that might have been set
        response.delete_cookie('accessToken')
        response.delete_cookie('refreshToken')
        response.delete_cookie('isAuthenticated')
        
        return response

class UserProfileView(APIView):
    """User profile endpoint"""
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for now
    # Enable JWT and session auth so request.user is populated when a token/cookie is present
    authentication_classes = [JWTAuthentication, CsrfExemptSessionAuthentication]
    
    def get(self, request):
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        else:
            return Response({'message': 'No active session'}, status=status.HTTP_401_UNAUTHORIZED)
    
    def put(self, request):
        if not request.user.is_authenticated:
            return Response({'message': 'Authentication required'}, status=status.HTTP_401_UNAUTHORIZED)
        
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class StaffListView(APIView):
    """List all staff members (staff and admin)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type not in ['staff', 'admin']:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        staff_members = User.objects.filter(user_type__in=['staff', 'admin']).exclude(id=request.user.id)
        serializer = StaffSerializer(staff_members, many=True)
        return Response(serializer.data)

class AssignedStaffListView(APIView):
    """List staff assigned to the current customer's bookings"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.user_type != 'customer':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        provider_ids = (
            Booking.objects.filter(customer=request.user, provider__isnull=False)
            .values_list('provider_id', flat=True)
            .distinct()
        )
        staff_members = User.objects.filter(id__in=provider_ids)
        serializer = StaffSerializer(staff_members, many=True)
        return Response(serializer.data)

class StaffDetailView(APIView):
    """Get, update, and delete staff member (admin only)"""
    
    def get(self, request, staff_id=None):
        """Get staff details or list all staff if no ID provided"""
        if not request.user.user_type == 'admin':
            return Response({'error': 'Only admins can view staff details'}, status=status.HTTP_403_FORBIDDEN)
        
        if staff_id:
            try:
                user = User.objects.get(id=staff_id)
                serializer = UserSerializer(user)
                return Response(serializer.data)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            # If no ID provided, return ALL users for admin
            users = User.objects.all().order_by('-created_at') if hasattr(User, 'created_at') else User.objects.all()
            serializer = UserSerializer(users, many=True)
            return Response(serializer.data)
    
    def post(self, request):
        """Create a new staff member (admin only)"""
        if not request.user.user_type == 'admin':
            return Response({'error': 'Only admins can create staff accounts'}, status=status.HTTP_403_FORBIDDEN)
            
        serializer = StaffRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            staff = serializer.save()
            return Response(
                {'message': 'Staff created successfully', 'staff': StaffSerializer(staff).data},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, staff_id):
        """Update staff member details (admin only)"""
        if not request.user.user_type == 'admin':
            return Response({'error': 'Only admins can update staff accounts'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            staff = User.objects.get(id=staff_id, user_type='staff')
        except User.DoesNotExist:
            return Response({'error': 'Staff member not found'}, status=status.HTTP_404_NOT_FOUND)
            
        # Don't allow changing username/email via this endpoint
        if 'username' in request.data or 'email' in request.data:
            return Response(
                {'error': 'Cannot change username or email via this endpoint'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        serializer = StaffSerializer(staff, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {'message': 'Staff updated successfully', 'staff': serializer.data},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, staff_id):
        """Delete a staff member (admin only)"""
        if not request.user.user_type == 'admin':
            return Response({'error': 'Only admins can delete staff accounts'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            # Allow deleting any user type (including customers or staff). Optionally, prevent self-delete.
            user_to_delete = User.objects.get(id=staff_id)
            # Optional safeguard: prevent deleting own account to avoid locking out admin session
            if user_to_delete.id == request.user.id:
                return Response({'error': 'You cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)
            user_to_delete.delete()
            return Response(
                {'message': 'Staff member deleted successfully'},
                status=status.HTTP_204_NO_CONTENT
            )
        except User.DoesNotExist:
            return Response({'error': 'Staff member not found'}, status=status.HTTP_404_NOT_FOUND)

class StaffStatusView(APIView):
    """Toggle staff status (admin only)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, staff_id):
        if not request.user.user_type == 'admin':
            return Response({'error': 'Only admins can update staff status'}, status=status.HTTP_403_FORBIDDEN)
            
        try:
            staff = User.objects.get(id=staff_id, user_type='staff')
            # Toggle the is_active_staff status
            staff.is_active_staff = not staff.is_active_staff
            staff.save()
            
            return Response({
                'message': f"Staff member {'activated' if staff.is_active_staff else 'deactivated'} successfully",
                'staff': StaffSerializer(staff).data
            })
        except User.DoesNotExist:
            return Response({'error': 'Staff member not found'}, status=status.HTTP_404_NOT_FOUND)

class ServiceCategoryListView(generics.ListAPIView):
    """List all service categories"""
    queryset = ServiceCategory.objects.filter(is_active=True)
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]

class ServiceListView(generics.ListAPIView):
    """List all services"""
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Service.objects.filter(is_active=True)
        category_id = self.request.query_params.get('category', None)
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

class ServiceDetailView(generics.RetrieveAPIView):
    """Get service details"""
    queryset = Service.objects.filter(is_active=True)
    serializer_class = ServiceSerializer
    permission_classes = [permissions.AllowAny]

class BookingListView(generics.ListCreateAPIView):
    """List and create bookings"""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication, CsrfExemptSessionAuthentication]
    
    def get_queryset(self):
        if self.request.user.user_type in ['staff', 'admin']:
            return Booking.objects.all()
        return Booking.objects.filter(customer=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingSerializer

    def create(self, request, *args, **kwargs):
        # Validate with create serializer (sets customer and total_amount)
        create_serializer = BookingCreateSerializer(data=request.data, context={'request': request})
        create_serializer.is_valid(raise_exception=True)
        instance = create_serializer.save()
        # Respond with full booking serializer (includes total_amount and names)
        output = BookingSerializer(instance).data
        headers = self.get_success_headers(output)
        return Response(output, status=status.HTTP_201_CREATED, headers=headers)

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, and delete booking details"""
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    
    def get_queryset(self):
        if self.request.user.user_type in ['staff', 'admin']:
            return Booking.objects.all()
        return Booking.objects.filter(customer=self.request.user)

class ReviewListView(generics.ListCreateAPIView):
    """List and create reviews"""
    serializer_class = ReviewSerializer
    authentication_classes = [JWTAuthentication, CsrfExemptSessionAuthentication]
    
    def get_permissions(self):
        # Allow public access for GET (used by homepage testimonials)
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        # Require auth for creating reviews
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        # If the request asks for published reviews, return those for public display
        published_param = self.request.query_params.get('published')
        if published_param is not None:
            val = str(published_param).lower() in ['1', 'true', 'yes']
            if val:
                return Review.objects.filter(published=True).order_by('-created_at')
        # Otherwise, return the current user's reviews (requires authentication)
        if getattr(self.request, 'user', None) and self.request.user.is_authenticated:
            return Review.objects.filter(customer=self.request.user)
        # Unauthenticated and not asking for published -> empty
        return Review.objects.none()
    
    def perform_create(self, serializer):
        # Only allow reviews for completed bookings by the same customer
        booking = Booking.objects.filter(id=self.request.data.get('booking')).first()
        if not booking or booking.customer != self.request.user or booking.status != 'completed':
            from rest_framework.exceptions import ValidationError
            raise ValidationError('You can only review completed bookings you have made.')
        # Ensure provider is set (model requires non-null)
        provider = booking.provider
        if provider is None:
            # Try to infer from booking assignments
            assignment = BookingAssignment.objects.filter(booking=booking).order_by('assigned_at').first()
            if assignment:
                provider = assignment.staff
        if provider is None:
            from rest_framework.exceptions import ValidationError
            raise ValidationError('This booking has no assigned provider to review yet.')
        serializer.save(customer=self.request.user, provider=provider)

class ReviewDetailView(generics.RetrieveUpdateAPIView):
    """Retrieve and update a single review (customer can edit their own review)"""
    serializer_class = ReviewSerializer
    authentication_classes = [JWTAuthentication, CsrfExemptSessionAuthentication]

    def get_queryset(self):
        return Review.objects.filter(customer=self.request.user)

class NotificationListView(generics.ListAPIView):
    """List user notifications"""
    serializer_class = NotificationSerializer
    
    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

class NotificationMarkAsReadView(APIView):
    """Mark notification as read"""
    
    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({'message': 'Notification marked as read'})
        except Notification.DoesNotExist:
            return Response({'error': 'Notification not found'}, status=status.HTTP_404_NOT_FOUND)

class MessageListView(generics.ListCreateAPIView):
    """List and create messages"""
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        if self.request.user.user_type in ['staff', 'admin']:
            return Message.objects.filter(staff=self.request.user)
        return Message.objects.filter(customer=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return MessageCreateSerializer
        return MessageSerializer

class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, and delete message details"""
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        if self.request.user.user_type in ['staff', 'admin']:
            return Message.objects.filter(staff=self.request.user)
        return Message.objects.filter(customer=self.request.user)

class MessageMarkAsReadView(APIView):
    """Mark message as read"""
    
    def post(self, request, message_id):
        try:
            message = Message.objects.get(id=message_id)
            if (request.user.user_type in ['staff', 'admin'] and message.staff == request.user) or \
               (request.user.user_type == 'customer' and message.customer == request.user):
                message.is_read = True
                message.save()
                return Response({'message': 'Message marked as read'})
            else:
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        except Message.DoesNotExist:
            return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def contact_form(request):
    """Contact form submission endpoint"""
    from django.core.mail import send_mail
    from django.conf import settings
    
    try:
        data = request.data
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        subject = data.get('subject')
        message = data.get('message')
        
        # Send email to admin
        email_subject = f"Contact Form: {subject}"
        email_message = f"""
        New contact form submission:
        
        Name: {name}
        Email: {email}
        Phone: {phone}
        Subject: {subject}
        
        Message:
        {message}
        """
        
        send_mail(
            email_subject,
            email_message,
            settings.DEFAULT_FROM_EMAIL,
            [settings.DEFAULT_FROM_EMAIL],  # Send to admin email
            fail_silently=False,
        )
        
        return Response({
            'message': 'Your message has been sent successfully!'
        })
        
    except Exception as e:
        return Response({
            'error': 'Failed to send message. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({'status': 'healthy', 'message': 'EliteHands API is running'})

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def contact_form(request):
    """Contact form submission endpoint"""
    from django.core.mail import send_mail
    from django.conf import settings
    
    try:
        data = request.data
        name = data.get('name')
        email = data.get('email')
        phone = data.get('phone')
        subject = data.get('subject')
        message = data.get('message')
        
        # Send email to admin
        email_subject = f"Contact Form: {subject}"
        email_message = f"""
        New contact form submission:
        
        Name: {name}
        Email: {email}
        Phone: {phone}
        Subject: {subject}
        Message: {message}
        """
        
        # For now, just log the message (in production, you'd send actual emails)
        print(f"Contact form submission: {email_subject}")
        print(email_message)
        
        return Response({
            'message': 'Your message has been sent successfully!'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Failed to send message. Please try again.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Admin Analytics View
class AdminAnalyticsView(APIView):
    """Admin analytics endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication, CsrfExemptSessionAuthentication]
    
    def get(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Get time range from query params
            time_range = request.query_params.get('time_range', '30d')
            
            # Calculate analytics data
            from django.utils import timezone
            from datetime import timedelta
            
            if time_range == '7d':
                start_date = timezone.now() - timedelta(days=7)
            elif time_range == '30d':
                start_date = timezone.now() - timedelta(days=30)
            elif time_range == '90d':
                start_date = timezone.now() - timedelta(days=90)
            elif time_range == '1y':
                start_date = timezone.now() - timedelta(days=365)
            else:
                start_date = timezone.now() - timedelta(days=30)
            
            # Get basic stats
            total_users = User.objects.count()
            total_bookings = Booking.objects.count()
            total_revenue = sum(booking.total_amount for booking in Booking.objects.filter(status='completed') if booking.total_amount)
            
            # Calculate average rating
            reviews = Review.objects.all()
            average_rating = sum(review.rating for review in reviews) / len(reviews) if reviews else 0
            
            # Monthly stats (simplified)
            monthly_stats = [
                {'month': 'Jan', 'bookings': 120, 'revenue': 15000},
                {'month': 'Feb', 'bookings': 150, 'revenue': 18000},
                {'month': 'Mar', 'bookings': 180, 'revenue': 22000},
                {'month': 'Apr', 'bookings': 200, 'revenue': 25000},
                {'month': 'May', 'bookings': 220, 'revenue': 28000},
                {'month': 'Jun', 'bookings': 250, 'revenue': 32000}
            ]
            
            # Top services
            top_services = []
            for service in Service.objects.all()[:4]:
                bookings_count = Booking.objects.filter(service=service).count()
                revenue = sum(booking.total_amount for booking in Booking.objects.filter(service=service, status='completed') if booking.total_amount)
                top_services.append({
                    'name': service.name,
                    'bookings': bookings_count,
                    'revenue': revenue
                })
            
            # Recent bookings
            recent_bookings = []
            for booking in Booking.objects.all()[:5]:
                recent_bookings.append({
                    'id': booking.id,
                    'customer': f"{booking.customer.first_name} {booking.customer.last_name}",
                    'service': booking.service.name,
                    'amount': float(booking.total_amount) if booking.total_amount else 0,
                    'status': booking.status
                })
            
            analytics_data = {
                'totalUsers': total_users,
                'totalBookings': total_bookings,
                'totalRevenue': total_revenue,
                'averageRating': round(average_rating, 1),
                'monthlyStats': monthly_stats,
                'topServices': top_services,
                'recentBookings': recent_bookings,
                'userGrowth': [
                    {'month': 'Jan', 'users': 100},
                    {'month': 'Feb', 'users': 150},
                    {'month': 'Mar', 'users': 200},
                    {'month': 'Apr', 'users': 280},
                    {'month': 'May', 'users': 350},
                    {'month': 'Jun', 'users': 450}
                ],
                'revenueGrowth': [
                    {'month': 'Jan', 'revenue': 10000},
                    {'month': 'Feb', 'revenue': 15000},
                    {'month': 'Mar', 'revenue': 20000},
                    {'month': 'Apr', 'revenue': 28000},
                    {'month': 'May', 'revenue': 35000},
                    {'month': 'Jun', 'revenue': 45000}
                ]
            }
            
            return Response(analytics_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Admin Settings View
class AdminSettingsView(APIView):
    """Admin settings endpoint"""
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication, CsrfExemptSessionAuthentication]
    
    def get(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        # Return persisted settings
        settings_obj, _ = AppSettings.objects.get_or_create(id=1)
        data = AppSettingsSerializer(settings_obj).data
        return Response(data, status=status.HTTP_200_OK)
    
    def put(self, request):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        try:
            settings_obj, _ = AppSettings.objects.get_or_create(id=1)
            serializer = AppSettingsSerializer(settings_obj, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Admin Categories CRUD
class AdminCategoryListCreateView(generics.ListCreateAPIView):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication, CsrfExemptSessionAuthentication]

    def create(self, request, *args, **kwargs):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication, CsrfExemptSessionAuthentication]

    def update(self, request, *args, **kwargs):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

# Admin Services CRUD
class AdminServiceListCreateView(generics.ListCreateAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication, CsrfExemptSessionAuthentication]

    def create(self, request, *args, **kwargs):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

class AdminServiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication, CsrfExemptSessionAuthentication]

    def update(self, request, *args, **kwargs):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

# Booking Assignments
class AdminAssignBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, booking_id):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        booking = Booking.objects.filter(id=booking_id).first()
        if not booking:
            return Response({'error': 'Booking not found'}, status=status.HTTP_404_NOT_FOUND)
        assignments = request.data if isinstance(request.data, list) else request.data.get('assignments', [])
        created = []
        for item in assignments:
            staff_id = item.get('staff')
            role = item.get('role', 'crew')
            staff = User.objects.filter(id=staff_id, user_type__in=['staff','admin']).first()
            if staff:
                obj, _ = BookingAssignment.objects.get_or_create(booking=booking, staff=staff, defaults={'role': role})
                if obj.role != role:
                    obj.role = role
                    obj.save()
                created.append(obj)
        return Response(BookingAssignmentSerializer(created, many=True).data, status=status.HTTP_200_OK)

class AdminUnassignBookingView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, booking_id, staff_id):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        obj = BookingAssignment.objects.filter(booking_id=booking_id, staff_id=staff_id).first()
        if not obj:
            return Response({'error': 'Assignment not found'}, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class BookingAssignmentsListView(generics.ListAPIView):
    serializer_class = BookingAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        booking_id = self.kwargs.get('booking_id')
        qs = BookingAssignment.objects.filter(booking_id=booking_id)
        # Customers can see assignments only for their booking
        if self.request.user.user_type == 'customer':
            if not Booking.objects.filter(id=booking_id, customer=self.request.user).exists():
                return BookingAssignment.objects.none()
        return qs

class StaffAssignmentsListView(generics.ListAPIView):
    serializer_class = BookingAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type in ['staff','admin']:
            return BookingAssignment.objects.filter(staff=self.request.user).order_by('-assigned_at')
        return BookingAssignment.objects.none()

# Reviews moderation (Admin)
class AdminReviewsListView(generics.ListAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type != 'admin':
            return Review.objects.none()
        return Review.objects.all().order_by('-created_at')

class AdminReviewPublishView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, review_id):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        review = Review.objects.filter(id=review_id).first()
        if not review:
            return Response({'error': 'Review not found'}, status=status.HTTP_404_NOT_FOUND)
        published = bool(request.data.get('published', True))
        review.published = published
        review.save()
        return Response(ReviewSerializer(review).data, status=status.HTTP_200_OK)

# Leave Requests
class StaffLeaveRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LeaveRequest.objects.filter(staff=self.request.user)

    def perform_create(self, serializer):
        serializer.save(staff=self.request.user, status='pending')

class AdminLeaveRequestsListView(generics.ListAPIView):
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.user_type != 'admin':
            return LeaveRequest.objects.none()
        return LeaveRequest.objects.all().order_by('-created_at')

class AdminLeaveRequestDecisionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, leave_id):
        if request.user.user_type != 'admin':
            return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
        decision = request.data.get('decision')
        if decision not in ['approve','reject']:
            return Response({'error': 'Decision must be approve or reject'}, status=status.HTTP_400_BAD_REQUEST)
        leave = LeaveRequest.objects.filter(id=leave_id).first()
        if not leave:
            return Response({'error': 'Leave request not found'}, status=status.HTTP_404_NOT_FOUND)
        leave.status = 'approved' if decision == 'approve' else 'rejected'
        leave.save()
        return Response(LeaveRequestSerializer(leave).data, status=status.HTTP_200_OK)
