from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from elite_app.models import ServiceCategory, Service
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate database with default services and users'

    def handle(self, *args, **options):
        self.stdout.write('Starting to populate default data...')
        
        # Create default users
        self.create_default_users()
        
        # Create default service categories
        self.create_service_categories()
        
        # Create default services
        self.create_default_services()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully populated default data!')
        )

    def create_default_users(self):
        """Create default user accounts"""
        self.stdout.write('Creating default users...')
        
        # Create admin user
        admin_user, created = User.objects.get_or_create(
            email='admin@elitehands.ca',
            defaults={
                'username': 'admin',
                'first_name': 'Admin',
                'last_name': 'User',
                'user_type': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_active_staff': True,
                'phone': '+1-555-0001',
                'city': 'Victoria',
                'province': 'BC',
                'postal_code': 'V8V 1Z8',
                'is_verified': True,
            }
        )
        # Always ensure flags and password are correct for admin
        updated = False
        if not admin_user.is_active_staff:
            admin_user.is_active_staff = True
            updated = True
        if not admin_user.is_active:
            admin_user.is_active = True
            updated = True
        if not admin_user.is_staff:
            admin_user.is_staff = True
            updated = True
        if not admin_user.is_superuser:
            admin_user.is_superuser = True
            updated = True
        # Reset password to a known default for development/testing
        admin_user.set_password('password123')
        admin_user.save()
        self.stdout.write('  ✓ Admin user ensured/updated')
        
        # Create staff user
        staff_user, created = User.objects.get_or_create(
            email='staff@elitehands.ca',
            defaults={
                'username': 'staff',
                'first_name': 'Staff',
                'last_name': 'Member',
                'user_type': 'staff',
                'is_staff': True,
                'is_active_staff': True,
                'phone': '+1-555-0002',
                'city': 'Victoria',
                'province': 'BC',
                'postal_code': 'V8V 1Z8',
                'position': 'Service Coordinator',
                'work_email': 'staff@elitehands.ca',
                'work_phone': '+1-555-0002',
                'is_verified': True,
            }
        )
        # Always ensure flags and password for staff
        if not staff_user.is_active_staff:
            staff_user.is_active_staff = True
        if not staff_user.is_staff:
            staff_user.is_staff = True
        if not staff_user.is_active:
            staff_user.is_active = True
        staff_user.set_password('password123')
        staff_user.save()
        self.stdout.write('  ✓ Staff user ensured/updated')
        
        # Create customer user
        customer_user, created = User.objects.get_or_create(
            email='customer@elitehands.ca',
            defaults={
                'username': 'customer',
                'first_name': 'John',
                'last_name': 'Doe',
                'user_type': 'customer',
                'phone': '+1-555-0003',
                'city': 'Victoria',
                'province': 'BC',
                'postal_code': 'V8V 1Z8',
                'is_verified': True,
            }
        )
        # Always ensure customer is active and has known password
        if not customer_user.is_active:
            customer_user.is_active = True
        customer_user.set_password('password123')
        customer_user.save()
        self.stdout.write('  ✓ Customer user ensured/updated')

    def create_service_categories(self):
        """Create default service categories"""
        self.stdout.write('Creating service categories...')
        
        categories_data = [
            {
                'id': 1,
                'name': 'Moving Services',
                'description': 'Professional moving services for residential and commercial clients. We handle everything from packing to unpacking with care and precision.',
                'icon': 'truck',
            },
            {
                'id': 2,
                'name': 'Cleaning Services',
                'description': 'Comprehensive cleaning solutions for homes, offices, and commercial spaces. Using eco-friendly products and professional techniques.',
                'icon': 'sparkles',
            },
            {
                'id': 3,
                'name': 'Event Services',
                'description': 'Full-service event management from planning to execution. Perfect for corporate events, weddings, and private parties.',
                'icon': 'calendar',
            },
        ]
        
        for cat_data in categories_data:
            category, created = ServiceCategory.objects.get_or_create(
                id=cat_data['id'],
                defaults={
                    'name': cat_data['name'],
                    'description': cat_data['description'],
                    'icon': cat_data['icon'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created category: {category.name}')
            else:
                self.stdout.write(f'  - Category already exists: {category.name}')

    def create_default_services(self):
        """Create default services for each category"""
        self.stdout.write('Creating default services...')
        
        # Moving Services
        moving_category = ServiceCategory.objects.get(id=1)
        moving_services = [
            {
                'name': 'Residential Moving',
                'description': 'Complete residential moving service including packing, loading, transportation, and unpacking. Perfect for homes and apartments.',
                'price': Decimal('300.00'),
                'duration_hours': 8,
            },
            {
                'name': 'Commercial Moving',
                'description': 'Professional office and commercial space moving services. We handle sensitive equipment and ensure minimal business disruption.',
                'price': Decimal('500.00'),
                'duration_hours': 12,
            },
            {
                'name': 'Long Distance Moving',
                'description': 'Cross-province and long-distance moving services with secure transportation and tracking.',
                'price': Decimal('800.00'),
                'duration_hours': 24,
            },
            {
                'name': 'Storage Solutions',
                'description': 'Secure storage facilities for short-term and long-term storage needs with climate control.',
                'price': Decimal('150.00'),
                'duration_hours': 4,
            },
            {
                'name': 'Specialty Item Moving',
                'description': 'Specialized moving services for pianos, artwork, antiques, and other valuable items.',
                'price': Decimal('400.00'),
                'duration_hours': 6,
            },
        ]
        
        for service_data in moving_services:
            service, created = Service.objects.get_or_create(
                category=moving_category,
                name=service_data['name'],
                defaults={
                    'description': service_data['description'],
                    'price': service_data['price'],
                    'duration_hours': service_data['duration_hours'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created service: {service.name}')
        
        # Cleaning Services
        cleaning_category = ServiceCategory.objects.get(id=2)
        cleaning_services = [
            {
                'name': 'Residential Cleaning',
                'description': 'Regular house cleaning service including all rooms, kitchen, bathrooms, and common areas.',
                'price': Decimal('120.00'),
                'duration_hours': 4,
            },
            {
                'name': 'Commercial Cleaning',
                'description': 'Professional office and commercial space cleaning with eco-friendly products.',
                'price': Decimal('200.00'),
                'duration_hours': 6,
            },
            {
                'name': 'Deep Cleaning',
                'description': 'Thorough deep cleaning service that reaches every corner, including inside appliances and fixtures.',
                'price': Decimal('180.00'),
                'duration_hours': 8,
            },
            {
                'name': 'Move In/Out Cleaning',
                'description': 'Specialized cleaning for move-in and move-out situations, ensuring spotless spaces.',
                'price': Decimal('160.00'),
                'duration_hours': 6,
            },
            {
                'name': 'Post-Construction Cleaning',
                'description': 'Professional cleaning after construction or renovation projects, removing dust and debris.',
                'price': Decimal('250.00'),
                'duration_hours': 10,
            },
            {
                'name': 'Specialized Cleaning',
                'description': 'Custom cleaning services for specific needs like carpet cleaning, window cleaning, and more.',
                'price': Decimal('140.00'),
                'duration_hours': 5,
            },
        ]
        
        for service_data in cleaning_services:
            service, created = Service.objects.get_or_create(
                category=cleaning_category,
                name=service_data['name'],
                defaults={
                    'description': service_data['description'],
                    'price': service_data['price'],
                    'duration_hours': service_data['duration_hours'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created service: {service.name}')
        
        # Event Services
        event_category = ServiceCategory.objects.get(id=3)
        event_services = [
            {
                'name': 'Wedding Planning',
                'description': 'Complete wedding planning and coordination services from venue selection to day-of coordination.',
                'price': Decimal('800.00'),
                'duration_hours': 40,
            },
            {
                'name': 'Corporate Events',
                'description': 'Professional corporate event management including conferences, meetings, and company parties.',
                'price': Decimal('600.00'),
                'duration_hours': 24,
            },
            {
                'name': 'Birthday Parties',
                'description': 'Fun and memorable birthday party planning and coordination for all ages.',
                'price': Decimal('300.00'),
                'duration_hours': 12,
            },
            {
                'name': 'Venue Decoration',
                'description': 'Professional venue decoration and setup services for any type of event.',
                'price': Decimal('200.00'),
                'duration_hours': 8,
            },
            {
                'name': 'Catering Services',
                'description': 'Full-service catering with menu planning, food preparation, and service coordination.',
                'price': Decimal('400.00'),
                'duration_hours': 16,
            },
        ]
        
        for service_data in event_services:
            service, created = Service.objects.get_or_create(
                category=event_category,
                name=service_data['name'],
                defaults={
                    'description': service_data['description'],
                    'price': service_data['price'],
                    'duration_hours': service_data['duration_hours'],
                    'is_active': True,
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created service: {service.name}')
