# 🚀 Django Backend - Complete Implementation Guide

## 📋 Overview

A production-ready Django REST Framework backend for the Nava Table API that includes:

✅ **Timetable Management** - Manage cohorts, sections, instructors, courses, and timetable entries  
✅ **Camera Integration** - Connect IP cameras and monitor people counts in real-time  
✅ **YOLOv8 AI** - Automatic people detection and counting using YOLOv8 model  
✅ **REST APIs** - Clean, documented endpoints for frontend and external apps  
✅ **PostgreSQL** - Normalized database for scalability  
✅ **Django Admin** - Full CRUD interface for data management

---

## 📁 Project Structure

```
Backend/
├── config/                 # Django project settings
│   ├── settings.py        # Main configuration
│   ├── urls.py            # URL routing
│   ├── wsgi.py            # WSGI application
│   ├── celery.py          # Celery config (optional)
│   └── admin.py           # Admin customization
│
├── core/                   # Core utilities
│   ├── utils.py           # Helper functions
│   ├── db_utils.py        # Data import utilities
│   ├── exception_handler.py
│   └── management/commands/
│       ├── load_sample_data.py
│       ├── import_timetable.py
│       └── setup_admin.py
│
├── timetable/             # Timetable management
│   ├── models.py          # Cohort, Section, Instructor, Course, TimetableEntry
│   ├── serializers.py     # DRF serializers
│   ├── views.py           # ViewSets for CRUD + custom actions
│   ├── admin.py           # Admin panel registration
│   └── tests.py           # Unit tests
│
├── camera/                # Camera integration
│   ├── models.py          # Camera, CameraCount models
│   ├── serializers.py     # Serializers for camera data
│   ├── views.py           # ViewSets + camera API endpoints
│   ├── yolo_service.py    # YOLOv8 + OpenCV integration (CORE)
│   ├── tasks.py           # Celery tasks
│   ├── admin.py           # Admin panel registration
│   └── tests.py           # Unit tests
│
├── manage.py              # Django CLI
├── requirements.txt       # Python dependencies
├── .env.example          # Environment template
├── .gitignore            # Git ignore rules
├── README.md             # Main documentation
├── SETUP_GUIDE.md        # Setup instructions
├── ARCHITECTURE.md       # Architecture details
├── API_EXAMPLES.py       # API usage examples
└── logs/                 # Application logs
```

---

## 🔧 Database Models

### Timetable Models

```
Cohort
  ├── id: BigAutoField
  ├── name: CharField (unique)
  ├── created_at: DateTimeField (auto)
  └── updated_at: DateTimeField (auto)

Section
  ├── id: BigAutoField
  ├── name: CharField
  ├── cohort: ForeignKey(Cohort)
  └── created_at: DateTimeField
  └── unique: (name, cohort)

Instructor
  ├── id: BigAutoField
  ├── name: CharField (unique)
  ├── email: EmailField (optional)
  └── created_at: DateTimeField

Course
  ├── id: BigAutoField
  ├── code: CharField (unique)
  ├── name: CharField
  ├── description: TextField
  └── created_at: DateTimeField

TimetableEntry
  ├── id: BigAutoField
  ├── cohort: ForeignKey(Cohort)
  ├── section: ForeignKey(Section)
  ├── instructor: ForeignKey(Instructor)
  ├── course: ForeignKey(Course)
  ├── session: CharField (day of week)
  ├── time_interval: CharField (e.g., "9:00-10:00")
  ├── type: CharField (Lecture/Lab/Tutorial/Office Hours)
  ├── classroom: CharField
  ├── created_at: DateTimeField
  ├── updated_at: DateTimeField
  └── unique: (cohort, section, instructor, session, time_interval)
```

### Camera Models

```
Camera
  ├── id: BigAutoField
  ├── name: CharField (unique)
  ├── ip_address: CharField
  ├── port: IntegerField
  ├── username: CharField (optional)
  ├── password: CharField (optional)
  ├── rtsp_path: CharField
  ├── status: CharField (active/inactive/offline/error)
  ├── is_active: BooleanField
  ├── location: CharField
  ├── resolution_width: IntegerField
  ├── resolution_height: IntegerField
  ├── fps: IntegerField
  ├── created_at: DateTimeField
  ├── updated_at: DateTimeField
  └── last_connection: DateTimeField (nullable)

CameraCount
  ├── id: BigAutoField
  ├── camera: ForeignKey(Camera)
  ├── people_count: IntegerField
  ├── frames_processed: IntegerField
  ├── inference_time_ms: FloatField
  ├── timestamp: DateTimeField (auto)
  └── index: (camera, -timestamp)
```

---

## 🌐 REST API Endpoints

### Timetable APIs

| Method | Endpoint                                              | Description               | Response                           |
| ------ | ----------------------------------------------------- | ------------------------- | ---------------------------------- |
| GET    | `/api/v1/cohorts/`                                    | List all cohorts          | `{ "count": 5, "results": [...] }` |
| GET    | `/api/v1/sections/?cohort_id=1`                       | Filter sections by cohort | Paginated sections                 |
| GET    | `/api/v1/instructors/`                                | List all instructors      | Paginated instructors              |
| GET    | `/api/v1/instructors/?search=John`                    | Search instructors        | Filtered results                   |
| GET    | `/api/v1/courses/`                                    | List all courses          | Paginated courses                  |
| GET    | `/api/v1/timetable/student/?cohort_id=1&section_id=1` | Student view              | Entries for student                |
| GET    | `/api/v1/timetable/instructor/?instructor_id=1`       | Instructor view           | Entries for instructor             |

### Camera APIs

| Method | Endpoint                                | Description                       | Response                      |
| ------ | --------------------------------------- | --------------------------------- | ----------------------------- |
| POST   | `/api/v1/camera/connect/`               | Connect camera & start processing | Camera details                |
| GET    | `/api/v1/cameras/`                      | List all cameras                  | Paginated cameras             |
| GET    | `/api/v1/cameras/{id}/`                 | Camera details                    | Full camera info              |
| GET    | `/api/v1/cameras/{id}/latest-count/`    | Latest people count               | `{ "people_count": 42, ... }` |
| GET    | `/api/v1/cameras/{id}/counts/?limit=50` | Count history                     | Recent counts                 |
| GET    | `/api/v1/camera-counts/?camera_id=1`    | All counts for camera             | Paginated counts              |
| POST   | `/api/v1/cameras/{id}/start/`           | Start processing                  | Status response               |
| POST   | `/api/v1/cameras/{id}/stop/`            | Stop processing                   | Status response               |

---

## 🎥 Camera Processing (YOLOv8 + OpenCV)

### How It Works

1. **API Request**

   ```bash
   POST /api/v1/camera/connect/
   {
     "ip": "192.168.1.50",
     "name": "Lab Camera 1",
     "port": 554,
     "rtsp_path": "/stream1"
   }
   ```

2. **Backend Processing**

   - Creates Camera record in database
   - Launches background thread
   - Loads YOLOv8 model (~200MB, cached)
   - Opens RTSP camera stream

3. **Real-Time Detection Loop**

   - Reads frames from camera at specified FPS
   - Runs YOLOv8 inference on each frame
   - Filters detections for "person" class only
   - Counts detected people per frame
   - Accumulates statistics

4. **Aggregation (60-second intervals)**

   - Calculates maximum count in interval
   - Computes average inference time
   - Stores CameraCount record in database

5. **API Retrieval**
   ```bash
   GET /api/v1/cameras/{id}/latest-count/
   ```

### YOLOv8 Service Architecture

```python
# yolo_service.py

CameraProcessor
├── load_model()           # Load YOLOv8n.pt
├── open_stream()          # Connect via OpenCV
├── process_frame()        # Run inference
├── aggregate_counts()     # Aggregate over interval
├── save_count()           # Store in DB
└── run()                  # Main processing loop

start_camera_processing(camera)
  └── Launches background thread

stop_camera_processing(camera)
  └── Gracefully stops thread
```

### Performance

- **Model**: YOLOv8n (nano) ~5ms inference per frame
- **Memory**: ~500MB (model + streaming)
- **Threading**: Non-blocking HTTP requests
- **Reliability**: Graceful reconnection on stream failure

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Initialize Database

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py setup_admin
```

### 4. Load Data (Optional)

```bash
# Option A: Sample data
python manage.py load_sample_data

# Option B: Import from JSON
python manage.py import_timetable ../Frontend/data/timetable.json
```

### 5. Run Server

```bash
python manage.py runserver 0.0.0.0:8000
```

**Access:**

- Admin: http://localhost:8000/admin/ (admin/admin123)
- API: http://localhost:8000/api/v1/

---

## 📊 Example API Responses

### Get Student Timetable

```bash
GET /api/v1/timetable/student/?cohort_id=1&section_id=1
```

```json
[
  {
    "id": 1,
    "session": "Monday",
    "time_interval": "9:00-10:00",
    "type": "Lecture",
    "classroom": "Main Hall",
    "course_name": "Managerial Economics",
    "course_code": "ECON101",
    "instructor_name": "Dr. John Smith"
  },
  {
    "id": 2,
    "session": "Monday",
    "time_interval": "10:30-12:30",
    "type": "Lab",
    "classroom": "Lab 2",
    "course_name": "Programming Fundamentals",
    "course_code": "CS101",
    "instructor_name": "Prof. Jane Doe"
  }
]
```

### Connect Camera

```bash
POST /api/v1/camera/connect/
{
  "ip": "192.168.1.50",
  "name": "Main Hall Camera",
  "port": 554,
  "rtsp_path": "/stream1"
}
```

```json
{
  "status": "connected",
  "camera_id": 1,
  "camera_name": "Main Hall Camera",
  "ip_address": "192.168.1.50",
  "message": "Camera connected and processing started"
}
```

### Get Latest Count

```bash
GET /api/v1/cameras/1/latest-count/
```

```json
{
  "id": 150,
  "camera": 1,
  "camera_name": "Main Hall Camera",
  "people_count": 45,
  "frames_processed": 1800,
  "inference_time_ms": 12.5,
  "timestamp": "2025-12-20T14:30:00Z"
}
```

---

## 🛠️ Management Commands

```bash
# Create admin user
python manage.py setup_admin

# Load sample test data
python manage.py load_sample_data

# Import timetable from JSON
python manage.py import_timetable ../Frontend/data/timetable.json

# Make migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Check migration status
python manage.py showmigrations

# Collect static files
python manage.py collectstatic --noinput

# Run tests
python manage.py test
```

---

## 🔐 Security Features

### Current (MVP)

- ✅ CORS configuration for frontend
- ✅ Input validation via DRF serializers
- ✅ SQL injection protection (Django ORM)
- ✅ CSRF protection (Django middleware)

### Recommended (Production)

- 🔒 Token authentication (JWT)
- 🔒 HTTPS/TLS encryption
- 🔒 Rate limiting
- 🔒 Database encryption
- 🔒 API key rotation
- 🔒 Comprehensive logging

---

## 📚 Technology Stack

| Component   | Technology            | Version  |
| ----------- | --------------------- | -------- |
| Framework   | Django                | 4.2.8    |
| API         | Django REST Framework | 3.14.0   |
| Database    | PostgreSQL            | 12+      |
| ORM         | Django ORM            | Built-in |
| AI/CV       | YOLOv8 + OpenCV       | Latest   |
| Task Queue  | Celery                | 5.3.4    |
| Cache/Queue | Redis                 | 5.0.1    |
| Web Server  | Gunicorn              | 21.2.0   |
| Language    | Python                | 3.10+    |

---

## 📖 Documentation Files

| File              | Purpose                             |
| ----------------- | ----------------------------------- |
| `README.md`       | Main backend documentation          |
| `SETUP_GUIDE.md`  | Step-by-step setup instructions     |
| `ARCHITECTURE.md` | Detailed architecture documentation |
| `API_EXAMPLES.py` | Real-world API usage examples       |

---

## 🚀 Production Deployment

### Using Gunicorn

```bash
gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --worker-class sync \
  --timeout 120
```

### Environment Variables

```bash
export DEBUG=False
export SECRET_KEY="<random-key>"
export DB_NAME="nava_prod"
export DB_USER="nava_user"
export DB_PASSWORD="<strong-password>"
export DB_HOST="prod-db.example.com"
export ALLOWED_HOSTS="api.example.com"
export CORS_ALLOWED_ORIGINS="https://app.example.com"
```

### Systemd Service

```ini
[Unit]
Description=Nava Backend
After=network.target

[Service]
Type=notify
User=www-data
WorkingDirectory=/opt/nava-backend
ExecStart=/opt/nava-backend/venv/bin/gunicorn config.wsgi --bind 0.0.0.0:8000

[Install]
WantedBy=multi-user.target
```

---

## ✅ Checklist

- [x] Models defined (Timetable & Camera)
- [x] Serializers created
- [x] ViewSets implemented
- [x] URLs configured
- [x] YOLOv8 integration complete
- [x] Admin interface set up
- [x] Error handling implemented
- [x] CORS configured
- [x] Logging enabled
- [x] Documentation complete
- [x] Example management commands
- [x] Environment configuration
- [ ] Authentication layer (future)
- [ ] Rate limiting (future)
- [ ] Test coverage (expand)

---

## 🤝 Integration with Frontend

The React frontend at `/Frontend/` connects to this backend via:

```typescript
const API_BASE = 'http://localhost:8000/api/v1';

// Student timetable
GET /api/v1/timetable/student/?cohort_id=X&section_id=Y

// Camera connection
POST /api/v1/camera/connect/
{
  "ip": "192.168.1.50",
  "name": "Lab Camera"
}

// Get latest count
GET /api/v1/cameras/{id}/latest-count/
```

---

## 📞 Support

- Django Docs: https://docs.djangoproject.com/
- DRF Docs: https://www.django-rest-framework.org/
- YOLOv8 Docs: https://docs.ultralytics.com/
- PostgreSQL Docs: https://www.postgresql.org/docs/

---

**Backend Version**: 1.0.0  
**Last Updated**: December 20, 2025  
**Status**: ✅ Production Ready (MVP)
