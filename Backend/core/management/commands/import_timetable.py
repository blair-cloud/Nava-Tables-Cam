"""
Import timetable from JSON file
Usage: python manage.py import_timetable ../Frontend/data/timetable.json
"""
from django.core.management.base import BaseCommand, CommandError
from core.db_utils import import_timetable_from_json
import os


class Command(BaseCommand):
    help = 'Import timetable data from JSON file'

    def add_arguments(self, parser):
        parser.add_argument('json_file', type=str, help='Path to JSON file')

    def handle(self, *args, **options):
        json_file = options['json_file']

        if not os.path.exists(json_file):
            raise CommandError(f'File not found: {json_file}')

        self.stdout.write(f'Importing from: {json_file}')

        result = import_timetable_from_json(json_file)

        if result['status'] == 'success':
            self.stdout.write(
                self.style.SUCCESS(f"✓ {result['message']}")
            )
        else:
            raise CommandError(f"✗ {result['message']}")
