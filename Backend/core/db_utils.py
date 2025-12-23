"""
Database utilities for data import and migration
"""
import json
import logging
from django.db import transaction
from timetable.models import Cohort, Section, Instructor, Course, TimetableEntry

logger = logging.getLogger(__name__)


def import_timetable_from_json(json_file_path):
    """
    Import timetable data from JSON file
    Expects format from Frontend/data/timetable.json
    
    Usage:
        from core.db_utils import import_timetable_from_json
        import_timetable_from_json('path/to/timetable.json')
    """
    try:
        with open(json_file_path, 'r') as f:
            data = json.load(f)
        
        # Get root key (e.g., "Term_1_AY_2025/2026_Timetable")
        root_key = list(data.keys())[0]
        groups = data[root_key]
        
        created_count = 0
        
        with transaction.atomic():
            for group_key, group_data in groups.items():
                # Parse cohort and section from group_key
                # Example: "BAPM_2023_Section_A"
                parts = group_key.split('_')
                
                if 'Section_' in group_key:
                    section_index = parts.index('Section')
                    cohort_name = '_'.join(parts[:section_index])
                    section_name = parts[section_index + 1]
                else:
                    cohort_name = group_key.replace('_', ' ')
                    section_name = 'General'
                
                # Get or create cohort
                cohort, _ = Cohort.objects.get_or_create(name=cohort_name)
                
                # Get or create section
                section, _ = Section.objects.get_or_create(
                    name=section_name,
                    cohort=cohort
                )
                
                # Process days and sessions
                for day, sessions in group_data.items():
                    if not isinstance(sessions, dict):
                        continue
                    
                    for session_id, session_data in sessions.items():
                        # Get or create instructor
                        instructor_name = session_data.get('Instructor', 'Unknown')
                        instructor, _ = Instructor.objects.get_or_create(name=instructor_name)
                        
                        # Get or create course
                        course_name = session_data.get('Course', 'Unknown')
                        course_code = session_data.get('Code', course_name[:10].upper())
                        course, _ = Course.objects.get_or_create(
                            code=course_code,
                            defaults={'name': course_name}
                        )
                        
                        # Create timetable entry
                        entry, created = TimetableEntry.objects.get_or_create(
                            cohort=cohort,
                            section=section,
                            instructor=instructor,
                            session=day,
                            time_interval=session_data.get('Time', ''),
                            defaults={
                                'course': course,
                                'type': session_data.get('Type', 'Lecture'),
                                'classroom': session_data.get('Classroom', 'N/A')
                            }
                        )
                        
                        if created:
                            created_count += 1
        
        logger.info(f"Successfully imported {created_count} timetable entries")
        return {
            'status': 'success',
            'imported': created_count,
            'message': f'Imported {created_count} timetable entries'
        }
    
    except FileNotFoundError:
        logger.error(f"JSON file not found: {json_file_path}")
        return {'status': 'error', 'message': 'File not found'}
    
    except Exception as e:
        logger.error(f"Error importing timetable: {str(e)}")
        return {'status': 'error', 'message': str(e)}


def get_timetable_stats():
    """Get summary statistics about timetable data"""
    stats = {
        'total_cohorts': Cohort.objects.count(),
        'total_sections': Section.objects.count(),
        'total_instructors': Instructor.objects.count(),
        'total_courses': Course.objects.count(),
        'total_entries': TimetableEntry.objects.count(),
    }
    return stats
