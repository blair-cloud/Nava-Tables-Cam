"""
Timetable app views and viewsets
"""
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.status import HTTP_400_BAD_REQUEST
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
import logging

from .models import Cohort, Section, Instructor, Course, TimetableEntry
from .serializers import (
    CohortSerializer, SectionSerializer, InstructorSerializer,
    CourseSerializer, TimetableEntrySerializer,
    TimetableStudentViewSerializer, TimetableInstructorViewSerializer
)

logger = logging.getLogger(__name__)


class CohortViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Cohort ViewSet
    GET /api/v1/cohorts/ - List all cohorts
    GET /api/v1/cohorts/{id}/ - Retrieve specific cohort
    """
    queryset = Cohort.objects.all()
    serializer_class = CohortSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class SectionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Section ViewSet
    GET /api/v1/sections/ - List all sections
    GET /api/v1/sections/?cohort_id={id} - Filter by cohort
    GET /api/v1/sections/{id}/ - Retrieve specific section
    """
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['cohort']
    ordering_fields = ['name', 'created_at']
    ordering = ['cohort', 'name']


class InstructorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Instructor ViewSet
    GET /api/v1/instructors/ - List all instructors
    GET /api/v1/instructors/?search={name} - Search by name
    GET /api/v1/instructors/{id}/ - Retrieve specific instructor
    """
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Course ViewSet
    GET /api/v1/courses/ - List all courses
    GET /api/v1/courses/?search={code_or_name} - Search by code or name
    GET /api/v1/courses/{id}/ - Retrieve specific course
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'name', 'created_at']
    ordering = ['code']


class TimetableEntryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    TimetableEntry ViewSet with custom actions for student and instructor views
    
    GET /api/v1/timetable/ - List all timetable entries
    GET /api/v1/timetable/student/?cohort_id={id}&section_id={id} - Student view
    GET /api/v1/timetable/instructor/?instructor_id={id} - Instructor view
    """
    queryset = TimetableEntry.objects.select_related(
        'cohort', 'section', 'instructor', 'course'
    )
    serializer_class = TimetableEntrySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['cohort', 'section', 'instructor', 'course', 'session', 'type']
    ordering_fields = ['session', 'time_interval', 'created_at']
    ordering = ['session', 'time_interval']
    
    @action(detail=False, methods=['get'])
    def student(self, request):
        """
        Student timetable view
        Required: cohort_id, section_id
        
        Example: GET /api/v1/timetable/student/?cohort_id=1&section_id=2
        """
        cohort_id = request.query_params.get('cohort_id')
        section_id = request.query_params.get('section_id')
        
        if not cohort_id or not section_id:
            return Response(
                {'error': 'Both cohort_id and section_id are required'},
                status=HTTP_400_BAD_REQUEST
            )
        
        try:
            queryset = self.queryset.filter(cohort_id=cohort_id, section_id=section_id)
            serializer = TimetableStudentViewSerializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in student timetable view: {str(e)}")
            return Response(
                {'error': 'Failed to retrieve timetable'},
                status=HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'])
    def instructor(self, request):
        """
        Instructor timetable view
        Required: instructor_id
        
        Example: GET /api/v1/timetable/instructor/?instructor_id=1
        """
        instructor_id = request.query_params.get('instructor_id')
        
        if not instructor_id:
            return Response(
                {'error': 'instructor_id is required'},
                status=HTTP_400_BAD_REQUEST
            )
        
        try:
            queryset = self.queryset.filter(instructor_id=instructor_id)
            serializer = TimetableInstructorViewSerializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in instructor timetable view: {str(e)}")
            return Response(
                {'error': 'Failed to retrieve assignments'},
                status=HTTP_400_BAD_REQUEST
            )
