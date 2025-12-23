"""
Comprehensive backend architecture and structure guide
"""

# ============================================================================

# PROJECT STRUCTURE

# ============================================================================

BACKEND_STRUCTURE = """
Backend/
├── manage.py # Django management script
├── requirements.txt # Python dependencies
├── .env.example # Environment variables template
├── .gitignore # Git ignore rules
├── README.md # Backend documentation
├── SETUP_GUIDE.md # Setup instructions
├── API_EXAMPLES.py # API usage examples
│
├── config/ # Django project config
│ ├── **init**.py
│ ├── settings.py # Main Django settings
│ ├── urls.py # URL routing
│ ├── wsgi.py # WSGI application
│ ├── celery.py # Celery configuration
│ └── admin.py # Admin customization
│
├── core/ # Core app
│ ├── **init**.py
│ ├── apps.py
│ ├── models.py # (Empty, utility models)
│ ├── serializers.py # (If needed)
│ ├── views.py # (If needed)
│ ├── utils.py # Utility functions
│ ├── db_utils.py # Database utilities
│ ├── exception_handler.py # Custom exception handler
│ ├── management/
│ │ ├── **init**.py
│ │ └── commands/
│ │ ├── **init**.py
│ │ ├── load_sample_data.py # Load test data
│ │ ├── import_timetable.py # Import from JSON
│ │ └── setup_admin.py # Create admin user
│ └── tests.py
│
├── timetable/ # Timetable app
│ ├── **init**.py
│ ├── apps.py
│ ├── models.py # Timetable models
│ ├── serializers.py # DRF serializers
│ ├── views.py # ViewSets and APIViews
│ ├── admin.py # Admin registration
│ ├── tests.py # Unit tests
│ └── urls.py # (Not needed, uses router)
│
├── camera/ # Camera app
│ ├── **init**.py
│ ├── apps.py
│ ├── models.py # Camera models
│ ├── serializers.py # DRF serializers
│ ├── views.py # ViewSets and APIViews
│ ├── yolo_service.py # YOLOv8 + OpenCV integration
│ ├── tasks.py # Celery tasks (optional)
│ ├── admin.py # Admin registration
│ ├── tests.py # Unit tests
│ └── urls.py # (Not needed, uses router)
│
├── logs/ # Log files
│ └── django.log
│
├── static/ # Static files (CSS, JS)
├── templates/ # HTML templates (if needed)
└── media/ # User uploaded files
"""

# ============================================================================

# DATA MODELS ARCHITECTURE

# ============================================================================

DATA_MODELS = """
TIMETABLE APP MODELS:

1. Cohort
   ├── Fields: id, name (unique), created_at, updated_at
   ├── Relations: has many Sections, TimetableEntries
   └── Purpose: Represent student cohorts/batches
2. Section
   ├── Fields: id, name, cohort_id (FK), created_at
   ├── Relations: belongs to Cohort, has many TimetableEntries
   └── Purpose: Represent sections within a cohort
3. Instructor
   ├── Fields: id, name (unique), email, created_at
   ├── Relations: has many TimetableEntries
   └── Purpose: Represent instructors/teachers
4. Course
   ├── Fields: id, code (unique), name, description, created_at
   ├── Relations: has many TimetableEntries
   └── Purpose: Represent courses/subjects
5. TimetableEntry
   ├── Fields: id, cohort_id (FK), section_id (FK), instructor_id (FK),
   │ course_id (FK), session (day), time_interval, type, classroom,
   │ created_at, updated_at
   ├── Relations: belongs to Cohort, Section, Instructor, Course
   ├── Unique: (cohort, section, instructor, session, time_interval)
   └── Purpose: Represent scheduled sessions

CAMERA APP MODELS:

6. Camera
   ├── Fields: id, name (unique), ip_address, port, rtsp_path,
   │ username, password, status, is_active, location,
   │ resolution_width/height, fps, created_at, updated_at,
   │ last_connection
   ├── Relations: has many CameraCount records
   ├── Status: active, inactive, offline, error
   └── Purpose: Store IP camera information
7. CameraCount
   ├── Fields: id, camera_id (FK), people_count, frames_processed,
   │ inference_time_ms, timestamp
   ├── Relations: belongs to Camera
   ├── Indexes: (camera, -timestamp) for efficient queries
   └── Purpose: Store people count readings
   """

# ============================================================================

# API DESIGN ARCHITECTURE

# ============================================================================

API_ARCHITECTURE = """
REST API Design Principles:

1. Resource-Oriented URLs

   - /api/v1/cohorts/ (nouns, not verbs)
   - /api/v1/cameras/
   - /api/v1/timetable/

2. HTTP Methods

   - GET: Retrieve resources (safe, idempotent)
   - POST: Create resources
   - PUT/PATCH: Update resources
   - DELETE: Remove resources

3. Status Codes

   - 200 OK: Success
   - 201 Created: Resource created
   - 400 Bad Request: Invalid input
   - 404 Not Found: Resource not found
   - 500 Internal Server Error: Server error

4. Response Format (JSON)
   {
   "count": 100,
   "next": "http://...?page=2",
   "previous": null,
   "results": [...]
   }

5. Filtering & Pagination

   - Page-based: ?page=1&page_size=50
   - Filtering: ?cohort_id=1&status=active
   - Search: ?search=John
   - Ordering: ?ordering=-created_at

6. CORS Configuration
   - Allows http://localhost:3000 (frontend)
   - Add more origins in .env
     """

# ============================================================================

# YOLOV8 + OPENCV INTEGRATION ARCHITECTURE

# ============================================================================

YOLO_ARCHITECTURE = """
Camera Processing Pipeline:

┌─────────────────────────────────────────────────────────────┐
│ 1. API Request: POST /camera/connect/ │
│ Input: IP address, camera name, RTSP path │
└──────────────────────┬──────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Create/Get Camera in Database │
│ - Save IP, credentials, location │
│ - Set status to 'active' │
└──────────────────────┬──────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Start Background Processing (Threading) │
│ - Create CameraProcessor instance │
│ - Launch thread (or Celery worker) │
│ - Register in \_camera_threads dict │
└──────────────────────┬──────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Load YOLOv8 Model │
│ - Download yolov8n.pt (~200MB) on first use │
│ - Cached in ~/.yolo/ for reuse │
│ - Model: Object detection trained on COCO dataset │
└──────────────────────┬──────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Open Camera Stream with OpenCV │
│ - cv2.VideoCapture(rtsp_url) │
│ - Handle disconnections gracefully │
│ - Read frames at specified FPS │
└──────────────────────┬──────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Process Frame Loop (60 second interval) │
│ For each frame: │
│ - Resize frame for faster inference │
│ - Run YOLOv8 model (async) │
│ - Get predictions with confidence scores │
│ - Filter for class_id=0 (person only) │
│ - Count detected persons per frame │
│ - Accumulate counts and inference times │
└──────────────────────┬──────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Aggregate Counts (every 60 seconds) │
│ - Take maximum count in interval │
│ - Calculate average inference time │
│ - Prepare for database storage │
└──────────────────────┬──────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Save to Database (CameraCount) │
│ - Store: people_count, frames_processed, inference_time │
│ - Timestamp automatically set │
│ - Index by camera_id and timestamp │
└──────────────────────┬──────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Retrieve via API │
│ GET /api/v1/cameras/{id}/latest-count/ │
│ GET /api/v1/cameras/{id}/counts/?limit=100 │
│ GET /api/v1/camera-counts/?camera_id={id} │
└─────────────────────────────────────────────────────────────┘

Performance Considerations:

- Model: YOLOv8n (nano) ~5ms/frame
- Inference: ~30 FPS with RTX 3080
- Memory: ~500MB total (model + streaming)
- Threading: Non-blocking HTTP requests
- Graceful degradation: Continues on frame read failure
  """

# ============================================================================

# AUTHENTICATION & SECURITY

# ============================================================================

SECURITY_NOTES = """
Current State (MVP):

- No authentication required
- CORS enabled for frontend URL
- Suitable for internal network deployment

Future Enhancements:

1. Token Authentication (REST Framework)

   - Issue JWT tokens to frontend
   - Validate token on each request
   - Refresh token mechanism

2. API Key Authentication

   - Generate unique keys per app/user
   - Include in X-API-Key header

3. HTTPS/TLS

   - Encrypt data in transit
   - Valid SSL certificate

4. Database Encryption

   - Encrypt sensitive camera credentials
   - Use django-encrypted-model-fields

5. Rate Limiting

   - Prevent API abuse
   - django-ratelimit package

6. Input Validation
   - Validate IP addresses
   - Sanitize string inputs
   - Use serializer validation
     """

# ============================================================================

# DEPLOYMENT CHECKLIST

# ============================================================================

DEPLOYMENT_CHECKLIST = """
Pre-Production:
☐ Set DEBUG=False
☐ Generate new SECRET_KEY
☐ Configure PostgreSQL database
☐ Set ALLOWED_HOSTS to production domain
☐ Set CORS_ALLOWED_ORIGINS to frontend URL
☐ Create admin user
☐ Load production data
☐ Test all API endpoints
☐ Test camera connections
☐ Configure logging
☐ Set up backups

Server Setup:
☐ Use Gunicorn or uWSGI
☐ Use Nginx as reverse proxy
☐ Enable SSL/TLS
☐ Configure supervisor/systemd for auto-restart
☐ Set up Redis (for Celery)
☐ Start Celery workers
☐ Configure Celery Beat (if using scheduled tasks)
☐ Set up monitoring/alerting
☐ Configure log rotation

Performance:
☐ Enable query optimization
☐ Add database indexes
☐ Configure caching
☐ Set up CDN for static files
☐ Monitor CPU/memory usage
☐ Monitor API response times
"""

print("Backend architecture documentation loaded!")
print("See README.md for more information.")
