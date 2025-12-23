"""
Quick start guide for backend setup
"""

# ============================================================================

# STEP 1: Environment Setup

# ============================================================================

# On Windows PowerShell:

# python -m venv venv

# .\venv\Scripts\Activate.ps1

# On macOS/Linux:

# python3 -m venv venv

# source venv/bin/activate

# ============================================================================

# STEP 2: Install Dependencies

# ============================================================================

# pip install -r requirements.txt

# ============================================================================

# STEP 3: Configure .env

# ============================================================================

# Copy .env.example to .env and update:

# - DEBUG=False (production)

# - SECRET_KEY (generate a new one)

# - Database credentials

# - CORS_ALLOWED_ORIGINS

# ============================================================================

# STEP 4: Initialize Database

# ============================================================================

# python manage.py makemigrations

# python manage.py migrate

# python manage.py setup_admin

# ============================================================================

# STEP 5: Load Data

# ============================================================================

# Option 1: Load sample data

# python manage.py load_sample_data

# Option 2: Import from JSON

# python manage.py import_timetable ../Frontend/data/timetable.json

# ============================================================================

# STEP 6: Run Server

# ============================================================================

# python manage.py runserver 0.0.0.0:8000

# Access:

# - Admin: http://localhost:8000/admin/

# - API: http://localhost:8000/api/v1/

# ============================================================================

# STEP 7: Test with curl

# ============================================================================

# Get cohorts:

# curl http://localhost:8000/api/v1/cohorts/

# Get student timetable:

# curl "http://localhost:8000/api/v1/timetable/student/?cohort_id=1&section_id=1"

# Connect camera:

# curl -X POST http://localhost:8000/api/v1/camera/connect/ \

# -H "Content-Type: application/json" \

# -d '{"ip": "192.168.1.50", "name": "Lab Camera"}'

# ============================================================================

# STEP 8: Production Deployment

# ============================================================================

# Using Gunicorn:

# gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4

# Environment variables for production:

# export DEBUG=False

# export SECRET_KEY="generate-random-key"

# export DB_NAME=nava_prod

# export DB_USER=nava_user

# export DB_PASSWORD="strong-password"

# export DB_HOST=db.example.com

# export ALLOWED_HOSTS=api.example.com,www.example.com

# export CORS_ALLOWED_ORIGINS=https://app.example.com

# ============================================================================

# STEP 9: Optional - Celery Setup (for async processing)

# ============================================================================

# Start Celery worker (requires Redis):

# celery -A config worker -l info

# Start Celery beat (scheduler):

# celery -A config beat -l info

# ============================================================================

# STEP 10: Monitoring & Maintenance

# ============================================================================

# Check migrations:

# python manage.py showmigrations

# Create new migrations:

# python manage.py makemigrations

# Collect static files:

# python manage.py collectstatic --noinput

# Clear old logs:

# rm logs/django.log

# ============================================================================

# Admin Credentials (after setup_admin)

# ============================================================================

# Username: admin

# Password: admin123

# URL: http://localhost:8000/admin/

# ⚠️ CHANGE PASSWORD IN PRODUCTION!

# ============================================================================

# Database Schema

# ============================================================================

# Timetable schema will be created automatically via migrations.

#

# Models:

# - Cohort (student batches)

# - Section (A, B, C within cohort)

# - Instructor (teachers)

# - Course (subjects)

# - TimetableEntry (scheduled sessions)

#

# Camera schema:

# - Camera (IP camera info)

# - CameraCount (people count records)

# ============================================================================

# API Endpoints Summary

# ============================================================================

API_ENDPOINTS = {
'Timetable': {
'GET /api/v1/cohorts/': 'List all cohorts',
'GET /api/v1/sections/': 'List sections (filter by ?cohort_id=)',
'GET /api/v1/instructors/': 'List instructors',
'GET /api/v1/courses/': 'List courses',
'GET /api/v1/timetable/student/': 'Student view (?cohort_id=&section_id=)',
'GET /api/v1/timetable/instructor/': 'Instructor view (?instructor_id=)',
},
'Camera': {
'POST /api/v1/camera/connect/': 'Connect camera and start processing',
'GET /api/v1/cameras/': 'List all cameras',
'GET /api/v1/cameras/{id}/': 'Camera details',
'GET /api/v1/cameras/{id}/latest-count/': 'Latest people count',
'GET /api/v1/cameras/{id}/counts/': 'Count history',
'POST /api/v1/cameras/{id}/start/': 'Start processing',
'POST /api/v1/cameras/{id}/stop/': 'Stop processing',
}
}

# ============================================================================

# Troubleshooting

# ============================================================================

TROUBLESHOOTING = {
'Database connection error': 'Check DB credentials in .env, ensure PostgreSQL is running',
'Port already in use': 'Change port: python manage.py runserver 8001',
'Module not found': 'Ensure virtual env activated, run: pip install -r requirements.txt',
'Migration error': 'Check database permissions, run: python manage.py migrate --fake-initial',
'CORS error': 'Update CORS_ALLOWED_ORIGINS in .env with frontend URL',
'YOLOv8 model missing': 'First connection will auto-download model (~200MB)',
'Camera stream fails': 'Check IP/RTSP path, test with ffmpeg',
}

print("Backend setup complete! ✓")
print("Access admin at: http://localhost:8000/admin/")
print("API documentation: Check README.md")
