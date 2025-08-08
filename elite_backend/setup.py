#!/usr/bin/env python
"""
Setup script for EliteHands Django backend
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

def setup_django():
    """Setup Django environment"""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'elite_backend.settings')
    django.setup()

def main():
    """Main setup function"""
    print("Setting up EliteHands Django backend...")
    
    # Setup Django
    setup_django()
    
    # Run migrations
    print("Running migrations...")
    execute_from_command_line(['manage.py', 'makemigrations', 'elite_app'])
    execute_from_command_line(['manage.py', 'migrate'])
    
    # Create superuser if needed
    print("Creating superuser...")
    try:
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@elitehands.ca',
                password='admin123',
                user_type='admin'
            )
            print("Superuser created: admin/admin123")
        else:
            print("Superuser already exists")
    except Exception as e:
        print(f"Error creating superuser: {e}")
    
    # Create sample data
    print("Creating sample data...")
    try:
        from elite_app.models import ServiceCategory, Service
        
        # Create service categories
        if not ServiceCategory.objects.exists():
            categories = [
                {
                    'name': 'Moving Services',
                    'description': 'Professional moving and relocation services',
                    'icon': 'truck'
                },
                {
                    'name': 'Cleaning Services',
                    'description': 'House and commercial cleaning services',
                    'icon': 'sparkles'
                },
                {
                    'name': 'Event Services',
                    'description': 'Event planning and management services',
                    'icon': 'calendar'
                }
            ]
            
            for cat_data in categories:
                ServiceCategory.objects.create(**cat_data)
            
            print("Service categories created")
        
        # Create sample services
        if not Service.objects.exists():
            moving_category = ServiceCategory.objects.get(name='Moving Services')
            cleaning_category = ServiceCategory.objects.get(name='Cleaning Services')
            event_category = ServiceCategory.objects.get(name='Event Services')
            
            services = [
                {
                    'category': moving_category,
                    'name': 'Residential Moving',
                    'description': 'Complete residential moving service',
                    'price': 299.99,
                    'duration_hours': 4
                },
                {
                    'category': moving_category,
                    'name': 'Commercial Moving',
                    'description': 'Office and commercial space moving',
                    'price': 499.99,
                    'duration_hours': 6
                },
                {
                    'category': cleaning_category,
                    'name': 'House Cleaning',
                    'description': 'Complete house cleaning service',
                    'price': 149.99,
                    'duration_hours': 3
                },
                {
                    'category': cleaning_category,
                    'name': 'Deep Cleaning',
                    'description': 'Thorough deep cleaning service',
                    'price': 249.99,
                    'duration_hours': 5
                },
                {
                    'category': event_category,
                    'name': 'Event Planning',
                    'description': 'Complete event planning and coordination',
                    'price': 599.99,
                    'duration_hours': 8
                }
            ]
            
            for service_data in services:
                Service.objects.create(**service_data)
            
            print("Sample services created")
        
    except Exception as e:
        print(f"Error creating sample data: {e}")
    
    print("Setup complete!")
    print("Run 'python manage.py runserver' to start the development server")

if __name__ == '__main__':
    main() 