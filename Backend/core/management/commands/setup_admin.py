"""
Create initial superuser
Usage: python manage.py setup_admin
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create initial admin user'

    def handle(self, *args, **options):
        if User.objects.filter(username='admin').exists():
            self.stdout.write(self.style.WARNING('Admin user already exists'))
            return

        User.objects.create_superuser(
            username='admin',
            email='admin@nava.local',
            password='admin123'  # Change this!
        )

        self.stdout.write(
            self.style.SUCCESS('✓ Admin user created')
        )
        self.stdout.write('  Username: admin')
        self.stdout.write('  Password: admin123')
        self.stdout.write('  ⚠️  Change password in production!')
