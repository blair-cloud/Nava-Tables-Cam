"""
Django admin configuration
"""
from django.contrib import admin
from timetable.models import Cohort, Section, Instructor, Course, TimetableEntry
from camera.models import Camera, CameraCount


@admin.register(Cohort)
class CohortAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at', 'updated_at']
    search_fields = ['name']
    ordering = ['name']


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'cohort', 'created_at']
    search_fields = ['name', 'cohort__name']
    list_filter = ['cohort', 'created_at']
    ordering = ['cohort', 'name']


@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'created_at']
    search_fields = ['name', 'email']
    list_filter = ['created_at']
    ordering = ['name']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'created_at']
    search_fields = ['code', 'name']
    ordering = ['code']


@admin.register(TimetableEntry)
class TimetableEntryAdmin(admin.ModelAdmin):
    list_display = ['cohort', 'section', 'instructor', 'course', 'session', 'time_interval', 'type']
    search_fields = ['cohort__name', 'instructor__name', 'course__code']
    list_filter = ['session', 'type', 'cohort', 'created_at']
    ordering = ['cohort', 'section', 'session', 'time_interval']


@admin.register(Camera)
class CameraAdmin(admin.ModelAdmin):
    list_display = ['name', 'ip_address', 'status', 'is_active', 'location', 'last_connection']
    search_fields = ['name', 'ip_address', 'location']
    list_filter = ['status', 'is_active', 'created_at']
    readonly_fields = ['created_at', 'updated_at', 'last_connection', 'status']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'location', 'is_active')
        }),
        ('Connection Details', {
            'fields': ('ip_address', 'port', 'rtsp_path', 'username', 'password')
        }),
        ('Configuration', {
            'fields': ('resolution_width', 'resolution_height', 'fps')
        }),
        ('Status', {
            'fields': ('status', 'last_connection'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    ordering = ['-created_at']


@admin.register(CameraCount)
class CameraCountAdmin(admin.ModelAdmin):
    list_display = ['camera', 'people_count', 'frames_processed', 'inference_time_ms', 'timestamp']
    search_fields = ['camera__name']
    list_filter = ['camera', 'timestamp']
    readonly_fields = ['camera', 'timestamp']
    ordering = ['-timestamp']
    
    def has_add_permission(self, request):
        """Prevent manual adding of counts"""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Prevent deleting counts"""
        return False
