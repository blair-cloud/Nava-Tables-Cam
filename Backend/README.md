# Nava Table API - Backend

Professional Django REST Framework backend for timetable management and AI-powered people counting.

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- PostgreSQL 12+
- Redis (optional, for Celery)

### Installation

1. **Clone and navigate:**

```bash
cd Backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**

```bash
pip install -r requirements.txt
```

3. **Configure environment:**

```bash
cp .env.example .env
# Edit .env with your database and API credentials
```

4. **Initialize database:**

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

5. **Create logs directory:**

```bash
mkdir logs
```

6. **Run server:**

```bash
python manage.py runserver 0.0.0.0:8000
```

Access admin at: `http://localhost:8000/admin/`

---

## 📊 API Documentation

### Base URL: `/api/v1/`

### Timetable APIs

#### Get All Cohorts

```
GET /api/v1/cohorts/
```

**Response:**

```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "name": "BAPM 2023",
      "created_at": "2025-12-20T10:00:00Z",
      "updated_at": "2025-12-20T10:00:00Z"
    }
  ]
}
```

#### Get Sections by Cohort

```
GET /api/v1/sections/?cohort_id=1
```

**Response:**

```json
{
  "count": 2,
  "results": [
    {
      "id": 1,
      "name": "Section A",
      "cohort": 1,
      "cohort_name": "BAPM 2023",
      "created_at": "2025-12-20T10:00:00Z"
    },
    {
      "id": 2,
      "name": "Section B",
      "cohort": 1,
      "cohort_name": "BAPM 2023",
      "created_at": "2025-12-20T10:00:00Z"
    }
  ]
}
```

#### Get All Instructors

```
GET /api/v1/instructors/
GET /api/v1/instructors/?search=John
```

**Response:**

```json
{
  "count": 25,
  "results": [
    {
      "id": 1,
      "name": "Dr. John Smith",
      "email": "john.smith@university.edu",
      "created_at": "2025-12-20T10:00:00Z"
    }
  ]
}
```

#### Student Timetable View

```
GET /api/v1/timetable/student/?cohort_id=1&section_id=1
```

**Response:**

```json
[
  {
    "id": 1,
    "session": "Monday",
    "time_interval": "9:00-10:00",
    "type": "Lecture",
    "classroom": "Hall A",
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

#### Instructor Timetable View

```
GET /api/v1/timetable/instructor/?instructor_id=1
```

**Response:**

```json
[
  {
    "id": 1,
    "session": "Monday",
    "time_interval": "9:00-10:00",
    "type": "Lecture",
    "classroom": "Hall A",
    "course_name": "Managerial Economics",
    "course_code": "ECON101",
    "cohort_name": "BAPM 2023",
    "section_name": "Section A"
  }
]
```

### Camera APIs

#### List Cameras

```
GET /api/v1/cameras/
GET /api/v1/cameras/?status=active
GET /api/v1/cameras/?search=Lab
```

**Response:**

```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "name": "Main Hall Camera",
      "ip_address": "192.168.1.50",
      "port": 554,
      "status": "active",
      "is_active": true,
      "location": "Main Hall",
      "resolution_width": 1920,
      "resolution_height": 1080,
      "fps": 30,
      "created_at": "2025-12-20T10:00:00Z",
      "updated_at": "2025-12-20T10:00:00Z",
      "last_connection": "2025-12-20T14:30:00Z",
      "rtsp_url": "rtsp://admin:password@192.168.1.50:554/stream1"
    }
  ]
}
```

#### Connect Camera (Start Processing)

```
POST /api/v1/camera/connect/
Content-Type: application/json

{
  "ip": "192.168.1.50",
  "name": "Lab Camera 1",
  "port": 554,
  "rtsp_path": "/stream1"
}
```

OR (existing camera):

```json
{
  "camera_id": 1
}
```

**Response:**

```json
{
  "status": "connected",
  "camera_id": 1,
  "camera_name": "Lab Camera 1",
  "ip_address": "192.168.1.50",
  "message": "Camera connected and processing started"
}
```

#### Get Latest Count

```
GET /api/v1/cameras/1/latest-count/
```

**Response:**

```json
{
  "id": 150,
  "camera": 1,
  "camera_name": "Lab Camera 1",
  "people_count": 45,
  "frames_processed": 1800,
  "inference_time_ms": 12.5,
  "timestamp": "2025-12-20T14:30:00Z"
}
```

#### Get Count History

```
GET /api/v1/cameras/1/counts/?limit=50
```

**Response:**

```json
[
  {
    "id": 150,
    "people_count": 45,
    "frames_processed": 1800,
    "inference_time_ms": 12.5,
    "timestamp": "2025-12-20T14:30:00Z"
  },
  {
    "id": 149,
    "people_count": 42,
    "frames_processed": 1800,
    "inference_time_ms": 11.8,
    "timestamp": "2025-12-20T14:29:00Z"
  }
]
```

#### Get All Camera Counts

```
GET /api/v1/camera-counts/
GET /api/v1/camera-counts/?camera_id=1
```

---

## 🎥 Camera Processing

### How It Works

1. **Connect Camera:**

   ```python
   POST /api/v1/camera/connect/ with camera IP
   ```

2. **YOLOv8 Processing Starts:**

   - Opens RTSP/IP camera stream
   - Loads YOLOv8 model (nano by default)
   - Processes each frame
   - Filters detections for `person` class only

3. **Aggregation (every 60 seconds):**

   - Stores maximum people count in that interval
   - Logs inference statistics
   - Saves to PostgreSQL

4. **Retrieve Data:**
   ```python
   GET /api/v1/cameras/{id}/latest-count/
   ```

### Configuration

In `.env`:

```
CAMERA_PROCESSING_INTERVAL=60          # Seconds between saves
YOLO_MODEL=yolov8n.pt                  # Model size: n, s, m, l, x
CAMERA_TIMEOUT=30                      # Connection timeout
CAMERA_FRAME_RATE=30                   # FPS to read
```

### Performance Notes

- **Model:** YOLOv8n (nanoparticle) is fastest (~5ms inference)
- **Frame Skip:** Only processes every Nth frame if needed
- **Threading:** Uses background threads (production: Celery)
- **Memory:** ~500MB for YOLOv8n + streaming

---

## 🔧 Database Models

### Timetable Models

```
Cohort
├── name (unique)
└── sections → Section

Section
├── name
├── cohort (FK)
└── timetable_entries → TimetableEntry

Instructor
├── name (unique)
├── email
└── timetable_entries → TimetableEntry

Course
├── code (unique)
├── name
└── timetable_entries → TimetableEntry

TimetableEntry
├── cohort (FK)
├── section (FK)
├── instructor (FK)
├── course (FK)
├── session (day of week)
├── time_interval
├── type (lecture/lab/tutorial)
└── classroom
```

### Camera Models

```
Camera
├── name (unique)
├── ip_address
├── port
├── rtsp_path
├── username / password
├── status (active/inactive/offline/error)
├── is_active
├── location
├── fps
└── counts → CameraCount

CameraCount
├── camera (FK)
├── people_count
├── frames_processed
├── inference_time_ms
└── timestamp (indexed)
```

---

## 📦 Data Import

### Import Timetable from JSON

```python
from core.db_utils import import_timetable_from_json

result = import_timetable_from_json('path/to/timetable.json')
# Returns: {'status': 'success', 'imported': 245}
```

### Check Statistics

```python
from core.db_utils import get_timetable_stats

stats = get_timetable_stats()
print(stats)
# {
#   'total_cohorts': 5,
#   'total_sections': 15,
#   'total_instructors': 35,
#   'total_courses': 120,
#   'total_entries': 450
# }
```

---

## 🛠️ Management Commands

### Load Initial Data

```bash
python manage.py shell
>>> from core.db_utils import import_timetable_from_json
>>> import_timetable_from_json('../Frontend/data/timetable.json')
```

### Check Migrations

```bash
python manage.py showmigrations
python manage.py migrate --plan
```

---

## 🔐 CORS & Security

CORS is enabled for frontend on `http://localhost:3000`.

Update in `settings.py`:

```python
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://yourdomain.com',
]
```

---

## 🚀 Production Deployment

### Using Gunicorn

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### Docker (Optional)

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Environment Variables Required

- `SECRET_KEY` - Django secret
- `DB_NAME`, `DB_USER`, `DB_PASSWORD` - PostgreSQL
- `CORS_ALLOWED_ORIGINS` - Frontend URL
- `YOLO_MODEL` - YOLOv8 variant
- `DEBUG=False`

---

## 📝 Logging

Logs are stored in `logs/django.log`

Log levels configurable in `.env`:

```
LOG_LEVEL=INFO  # DEBUG, INFO, WARNING, ERROR, CRITICAL
```

---

## 🧪 Testing

Run tests:

```bash
python manage.py test
```

---

## 📞 Support

For issues or questions, refer to:

- Django Docs: https://docs.djangoproject.com/
- DRF Docs: https://www.django-rest-framework.org/
- YOLOv8 Docs: https://docs.ultralytics.com/
