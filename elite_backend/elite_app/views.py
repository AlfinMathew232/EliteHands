from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import login, logout
from django.shortcuts import render
from django.db.models import Q
from .models import User, ServiceCategory, Service, Booking, Review, Notification, Message
from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer, StaffSerializer, StaffRegistrationSerializer,
    ServiceCategorySerializer, ServiceSerializer, BookingSerializer,
    BookingCreateSerializer, ReviewSerializer, NotificationSerializer, MessageSerializer, MessageCreateSerializer
)

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
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserLogoutView(APIView):
    """User logout endpoint"""
    
    def post(self, request):
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

class UserProfileView(APIView):
    """User profile endpoint"""
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access for now
    
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
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, staff_id):
        if request.user.user_type != 'admin':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            staff = User.objects.get(id=staff_id, user_type__in=['staff', 'admin'])
            serializer = StaffSerializer(staff)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'error': 'Staff member not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def put(self, request, staff_id):
        if request.user.user_type != 'admin':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            staff = User.objects.get(id=staff_id, user_type__in=['staff', 'admin'])
            serializer = StaffSerializer(staff, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'Staff member not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, staff_id):
        if request.user.user_type != 'admin':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            staff = User.objects.get(id=staff_id, user_type__in=['staff', 'admin'])
            staff.is_active_staff = False
            staff.save()
            return Response({'message': 'Staff member deactivated'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Staff member not found'}, status=status.HTTP_404_NOT_FOUND)

class StaffStatusView(APIView):
    """Toggle staff status (admin only)"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, staff_id):
        if request.user.user_type != 'admin':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            staff = User.objects.get(id=staff_id, user_type__in=['staff', 'admin'])
            staff.is_active_staff = not staff.is_active_staff
            staff.save()
            status_text = "activated" if staff.is_active_staff else "deactivated"
            return Response({'message': f'Staff member {status_text}'}, status=status.HTTP_200_OK)
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
    
    def get_queryset(self):
        if self.request.user.user_type in ['staff', 'admin']:
            return Booking.objects.all()
        return Booking.objects.filter(customer=self.request.user)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BookingCreateSerializer
        return BookingSerializer

class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, and delete booking details"""
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        if self.request.user.user_type in ['staff', 'admin']:
            return Booking.objects.all()
        return Booking.objects.filter(customer=self.request.user)

class ReviewListView(generics.ListCreateAPIView):
    """List and create reviews"""
    serializer_class = ReviewSerializer
    
    def get_queryset(self):
        return Review.objects.filter(customer=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

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

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({'status': 'healthy', 'message': 'EliteHands API is running'})
