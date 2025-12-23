"""
Load sample timetable data
Usage: python manage.py load_sample_data
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from timetable.models import Cohort, Section, Instructor, Course, TimetableEntry


class Command(BaseCommand):
    help = 'Load sample timetable data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Loading sample data...')

        with transaction.atomic():
            # Create cohorts
            cohort_bapm = Cohort.objects.create(name='BAPM 2023')
            cohort_bcs = Cohort.objects.create(name='BCS 2024')

            # Create sections
            Section.objects.create(name='Section A', cohort=cohort_bapm)
            Section.objects.create(name='Section B', cohort=cohort_bapm)
            Section.objects.create(name='Section A', cohort=cohort_bcs)

            # Create instructors
            inst_john = Instructor.objects.create(name='Dr. John Smith', email='john@university.edu')
            inst_jane = Instructor.objects.create(name='Prof. Jane Doe', email='jane@university.edu')
            inst_bob = Instructor.objects.create(name='Mr. Bob Wilson', email='bob@university.edu')

            # Create courses
            course_econ = Course.objects.create(code='ECON101', name='Managerial Economics')
            course_prog = Course.objects.create(code='CS101', name='Programming Fundamentals')
            course_db = Course.objects.create(code='CS201', name='Database Systems')

            # Create timetable entries
            section_a = Section.objects.get(name='Section A', cohort=cohort_bapm)
            
            TimetableEntry.objects.create(
                cohort=cohort_bapm,
                section=section_a,
                instructor=inst_john,
                course=course_econ,
                session='Monday',
                time_interval='9:00-10:00',
                type='Lecture',
                classroom='Main Hall'
            )

            TimetableEntry.objects.create(
                cohort=cohort_bapm,
                section=section_a,
                instructor=inst_jane,
                course=course_prog,
                session='Monday',
                time_interval='10:30-12:30',
                type='Lab',
                classroom='Computer Lab 1'
            )

            TimetableEntry.objects.create(
                cohort=cohort_bapm,
                section=section_a,
                instructor=inst_bob,
                course=course_db,
                session='Wednesday',
                time_interval='14:00-16:00',
                type='Lecture',
                classroom='Room 301'
            )

        self.stdout.write(self.style.SUCCESS('Sample data loaded successfully!'))
