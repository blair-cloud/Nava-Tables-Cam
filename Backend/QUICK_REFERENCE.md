# 🚀 QUICK REFERENCE - Django Backend

## ⚡ 5-Minute Start

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Configure database
cp .env.example .env
# Edit .env: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST

# 3. Initialize database
python manage.py migrate
python manage.py setup_admin

# 4. Load sample data (optional)
python manage.py load_sample_data

# 5. Run server
python manage.py runserver 0.0.0.0:8000

# Access:
# Admin: http://localhost:8000/admin/ (admin/admin123)
# API: http://localhost:8000/api/v1/
```

---

## 📋 Essential Database Models

```
Cohort (student batches)
├── name (unique)
└── relations: sections, timetable_entries

Section (A, B, C within cohort)
├── cohort (FK)
└── relations: timetable_entries

Instructor (teachers)
├── name (unique), email
└── relations: timetable_entries

Course (subjects)
├── code (unique), name
└── relations: timetable_entries

TimetableEntry (scheduled sessions)
├── cohort (FK)
├── section (FK)
├── instructor (FK)
├── course (FK)
├── session, time_interval, type, classroom

Camera (IP cameras)
├── ip_address, port, rtsp_path
├── status, location, fps
└── relations: counts

CameraCount (people records)
├── camera (FK)
├── people_count
├── inference_time_ms
└── timestamp (indexed)
```

---

## 🌐 API Quick Reference

### Timetable

```bash
# Get cohorts
GET /api/v1/cohorts/

# Get sections for cohort
GET /api/v1/sections/?cohort_id=1

# Get instructors
GET /api/v1/instructors/

# Get courses
GET /api/v1/courses/

# Student timetable ⭐
GET /api/v1/timetable/student/?cohort_id=1&section_id=1

# Instructor schedule ⭐
GET /api/v1/timetable/instructor/?instructor_id=1
```

### Camera

```bash
# Connect camera & start counting ⭐
POST /api/v1/camera/connect/
{"ip": "192.168.1.50", "name": "Lab Camera"}

# List cameras
GET /api/v1/cameras/

# Get latest count ⭐
GET /api/v1/cameras/1/latest-count/

# Get count history
GET /api/v1/cameras/1/counts/?limit=50

# Start/Stop processing
POST /api/v1/cameras/1/start/
POST /api/v1/cameras/1/stop/
```

---

## 🛠️ Management Commands

```bash
# Create admin user
python manage.py setup_admin

# Load sample data
python manage.py load_sample_data

# Import from JSON
python manage.py import_timetable ../Frontend/data/timetable.json

# Standard Django
python manage.py migrate
python manage.py makemigrations
python manage.py runserver
python manage.py test
```

---

## 🎥 YOLOv8 Camera Integration

```python
# Automatic when connecting camera:
# 1. Save camera info to database
# 2. Load YOLOv8 model (~200MB)
# 3. Open RTSP stream
# 4. Process frames in background
# 5. Save people count every 60 seconds

POST /api/v1/camera/connect/
{
  "ip": "192.168.1.50",
  "name": "Main Hall",
  "port": 554,
  "rtsp_path": "/stream1"
}

# Response:
{
  "status": "connected",
  "camera_id": 1,
  "message": "Processing started"
}

# Get latest count:
GET /api/v1/cameras/1/latest-count/

# Response:
{
  "people_count": 45,
  "frames_processed": 1800,
  "inference_time_ms": 12.5,
  "timestamp": "2025-12-20T14:30:00Z"
}
```

---

## 🔐 Environment Configuration

```bash
# .env file (copy from .env.example)

# Django
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=nava_db
DB_USER=nava_user
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# CORS (Frontend)
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Camera
CAMERA_PROCESSING_INTERVAL=60
YOLO_MODEL=yolov8n.pt
CAMERA_TIMEOUT=30

# Logging
LOG_LEVEL=INFO
```

---

## 📊 Project Stats

| Item                | Count |
| ------------------- | ----- |
| Total Files         | 50+   |
| Code Lines          | 3500+ |
| Models              | 7     |
| Serializers         | 10    |
| ViewSets            | 8     |
| API Endpoints       | 21    |
| Management Commands | 3     |
| Test Files          | 3     |

---

## 🗂️ Important Files

| File                     | Purpose                 |
| ------------------------ | ----------------------- |
| `config/settings.py`     | Main configuration      |
| `config/urls.py`         | URL routing             |
| `timetable/models.py`    | Timetable data models   |
| `camera/models.py`       | Camera models           |
| `camera/yolo_service.py` | YOLOv8 integration ⭐   |
| `camera/views.py`        | Camera API endpoints    |
| `timetable/views.py`     | Timetable API endpoints |
| `.env.example`           | Environment template    |
| `README.md`              | Main documentation      |

---

## 🚀 Production Deployment

```bash
# Using Gunicorn
gunicorn config.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4

# Set environment variables
export DEBUG=False
export SECRET_KEY="<random>"
export DB_NAME="nava_prod"
export ALLOWED_HOSTS="api.example.com"
export CORS_ALLOWED_ORIGINS="https://app.example.com"

# Run with systemd or supervisor
# See README.md for full deployment guide
```

---

## ✅ Testing

```bash
# Run all tests
python manage.py test

# Run specific app
python manage.py test timetable
python manage.py test camera

# Run with coverage (install coverage first)
coverage run --source='.' manage.py test
coverage report
```

---

## 🐛 Common Issues

| Issue                     | Solution                                                     |
| ------------------------- | ------------------------------------------------------------ |
| Database connection error | Check DB credentials in .env                                 |
| Port 8000 already in use  | `python manage.py runserver 8001`                            |
| Module not found          | Ensure venv activated, run `pip install -r requirements.txt` |
| Migration error           | `python manage.py migrate --fake-initial`                    |
| CORS error                | Update `CORS_ALLOWED_ORIGINS` in .env                        |
| Camera connection fails   | Check IP address and RTSP path                               |
| YOLOv8 download fails     | Check internet, will cache after first download              |

---

## 📚 Documentation

- **README.md** - Complete API documentation
- **SETUP_GUIDE.md** - Step-by-step setup
- **ARCHITECTURE.md** - System architecture
- **API_EXAMPLES.py** - Real-world usage examples
- **IMPLEMENTATION_SUMMARY.md** - Complete overview

---

## 🔗 Integration with Frontend

Frontend at `/Frontend/` connects via:

```typescript
const API = 'http://localhost:8000/api/v1';

// Get student timetable
GET /api/v1/timetable/student/?cohort_id=X&section_id=Y

// Connect camera
POST /api/v1/camera/connect/ { "ip": "..." }

// Get latest count
GET /api/v1/cameras/{id}/latest-count/
```

---

## 📞 Support Resources

- Django: https://docs.djangoproject.com/
- DRF: https://www.django-rest-framework.org/
- YOLOv8: https://docs.ultralytics.com/
- PostgreSQL: https://www.postgresql.org/docs/

---

## ⚙️ Version Info

- **Python**: 3.10+
- **Django**: 4.2.8
- **DRF**: 3.14.0
- **PostgreSQL**: 12+
- **YOLOv8**: 8.0.227
- **Status**: ✅ Production Ready (MVP)

---

**Last Updated**: December 20, 2025  
**Project**: Nava Table API - Django Backend  
**Version**: 1.0.0
