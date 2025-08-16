import os
import django
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates default test users for the system'

    def handle(self, *args, **options):
        # Create default admin user
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@elitehands.ca',
                'first_name': 'Admin',
                'last_name': 'User',
                'user_type': 'admin',
                'is_staff': True,
                'is_superuser': True,
                'is_verified': True,
                'is_active': True
            }
        )
        if created:
            admin.set_password('password123')
            admin.save()
            self.stdout.write(self.style.SUCCESS('Successfully created admin user'))
        else:
            if not admin.check_password('password123'):
                admin.set_password('password123')
                admin.save()
                self.stdout.write(self.style.SUCCESS('Updated admin password'))

        # Create default staff user
        staff, created = User.objects.get_or_create(
            username='staff',
            defaults={
                'email': 'staff@elitehands.ca',
                'first_name': 'Staff',
                'last_name': 'Member',
                'user_type': 'staff',
                'position': 'Customer Service',
                'work_email': 'staff@elitehands.ca',
                'work_phone': '1234567890',
                'is_verified': True,
                'is_active': True,
                'is_active_staff': True
            }
        )
        if created or not staff.check_password('password123'):
            staff.set_password('password123')
            staff.save()
            self.stdout.write(self.style.SUCCESS('Successfully created/updated staff user'))

        # Create default customer user
        customer, created = User.objects.get_or_create(
            username='customer',
            defaults={
                'email': 'customer@elitehands.ca',
                'first_name': 'John',
                'last_name': 'Doe',
                'user_type': 'customer',
                'phone': '1234567890',
                'address': '123 Main St',
                'city': 'Toronto',
                'province': 'ON',
                'postal_code': 'M1M 1M1',
                'is_verified': True,
                'is_active': True
            }
        )
        if created or not customer.check_password('password123'):
            customer.set_password('password123')
            customer.save()
            self.stdout.write(self.style.SUCCESS('Successfully created/updated customer user'))
