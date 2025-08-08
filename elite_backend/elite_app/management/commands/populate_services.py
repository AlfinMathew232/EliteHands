from django.core.management.base import BaseCommand
from elite_app.models import ServiceCategory, Service

class Command(BaseCommand):
    help = 'Populate the database with sample services'

    def handle(self, *args, **options):
        self.stdout.write('Creating service categories...')
        
        # Create service categories
        moving_category, created = ServiceCategory.objects.get_or_create(
            name='Moving Services',
            defaults={
                'description': 'Professional residential and commercial moving services',
                'icon': 'truck'
            }
        )
        if created:
            self.stdout.write(f'Created category: {moving_category.name}')
        
        cleaning_category, created = ServiceCategory.objects.get_or_create(
            name='Cleaning Services',
            defaults={
                'description': 'Deep cleaning and maintenance services',
                'icon': 'sparkles'
            }
        )
        if created:
            self.stdout.write(f'Created category: {cleaning_category.name}')
        
        events_category, created = ServiceCategory.objects.get_or_create(
            name='Event Services',
            defaults={
                'description': 'Complete event planning and coordination',
                'icon': 'calendar'
            }
        )
        if created:
            self.stdout.write(f'Created category: {events_category.name}')
        
        self.stdout.write('Creating services...')
        
        # Moving Services
        services_data = [
            # Moving Services
            {
                'category': moving_category,
                'name': 'Residential Moving',
                'description': 'Complete residential moving service including packing, loading, transport, and unloading',
                'price': 450.00,
                'duration_hours': 6
            },
            {
                'category': moving_category,
                'name': 'Commercial Moving',
                'description': 'Professional commercial moving for offices and businesses',
                'price': 800.00,
                'duration_hours': 8
            },
            {
                'category': moving_category,
                'name': 'Furniture Assembly',
                'description': 'Professional furniture assembly and setup service',
                'price': 120.00,
                'duration_hours': 2
            },
            
            # Cleaning Services
            {
                'category': cleaning_category,
                'name': 'Deep Cleaning',
                'description': 'Comprehensive cleaning for your entire home',
                'price': 150.00,
                'duration_hours': 4
            },
            {
                'category': cleaning_category,
                'name': 'Regular Maintenance',
                'description': 'Weekly or bi-weekly cleaning service',
                'price': 80.00,
                'duration_hours': 2
            },
            {
                'category': cleaning_category,
                'name': 'Move-in/Move-out Cleaning',
                'description': 'Thorough cleaning for moving transitions',
                'price': 200.00,
                'duration_hours': 6
            },
            
            # Event Services
            {
                'category': events_category,
                'name': 'Wedding Planning',
                'description': 'Complete wedding planning and coordination services',
                'price': 500.00,
                'duration_hours': 8
            },
            {
                'category': events_category,
                'name': 'Corporate Events',
                'description': 'Professional corporate event planning and execution',
                'price': 300.00,
                'duration_hours': 6
            },
            {
                'category': events_category,
                'name': 'Birthday Parties',
                'description': 'Fun and memorable birthday celebration planning',
                'price': 150.00,
                'duration_hours': 4
            }
        ]
        
        for service_data in services_data:
            service, created = Service.objects.get_or_create(
                category=service_data['category'],
                name=service_data['name'],
                defaults=service_data
            )
            if created:
                self.stdout.write(f'Created service: {service.name} - ${service.price}')
        
        self.stdout.write(self.style.SUCCESS('Successfully populated services!')) 