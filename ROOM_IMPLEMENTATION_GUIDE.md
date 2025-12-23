# Room-Based Camera Management System - Implementation Guide

## Overview

This document outlines the complete room-based camera management system that has been implemented for the Nava Table API. The system enables users to manage IP cameras organized by rooms with real-time people counting using YOLOv8.

## Architecture

### Backend (Django)

#### Database Models

**Room Model** (`camera/models.py`)
- `id`: Primary key (auto-increment)
- `name`: Unique room name (string)
- `camera_ip`: Camera IP address or streaming URL (string)
- `is_active`: Boolean flag to enable/disable room (default: True)
- `status`: Room status - 'active', 'inactive', 'offline' (default: 'inactive')
- `created_at`: Timestamp when room was created
- `updated_at`: Timestamp when room was last modified
- `last_updated`: Timestamp of the most recent people count

**CameraCount Model** (Updated)
- Now supports both `camera` and `room` ForeignKeys
- Maintains backward compatibility with existing Camera-based counts
- Includes indexes on (`room`, `-timestamp`) for efficient querying

#### API Endpoints

**Create Room & Start Camera**
```
POST /api/rooms/
Content-Type: application/json

{
  "name": "Lecture Hall A",
  "camera_ip": "http://192.168.1.50:8080/video",
  "is_active": true
}

Response:
{
  "id": 1,
  "name": "Lecture Hall A",
  "camera_ip": "http://192.168.1.50:8080/video",
  "is_active": true,
  "status": "active",
  "latest_count": 12,
  "last_updated": "2025-01-01T10:05:30Z",
  "created_at": "2025-01-01T10:00:00Z"
}
```

**List All Rooms**
```
GET /api/rooms/

Response:
[
  {
    "id": 1,
    "name": "Lecture Hall A",
    "camera_ip": "http://192.168.1.50:8080/video",
    "is_active": true,
    "status": "active",
    "latest_count": 12,
    "last_updated": "2025-01-01T10:05:30Z",
    "created_at": "2025-01-01T10:00:00Z"
  },
  ...
]
```

**Get Room Details**
```
GET /api/rooms/{room_id}/

Response:
{
  "id": 1,
  "name": "Lecture Hall A",
  "camera_ip": "http://192.168.1.50:8080/video",
  "is_active": true,
  "status": "active",
  "latest_count": 12,
  "last_updated": "2025-01-01T10:05:30Z",
  "created_at": "2025-01-01T10:00:00Z"
}
```

**Get Room Count History**
```
GET /api/rooms/{room_id}/counts/?limit=100

Response:
[
  {
    "id": 1,
    "people_count": 12,
    "frames_processed": 1800,
    "inference_time_ms": 25.5,
    "timestamp": "2025-01-01T10:05:30Z"
  },
  {
    "id": 2,
    "people_count": 14,
    "frames_processed": 1800,
    "inference_time_ms": 24.8,
    "timestamp": "2025-01-01T10:04:30Z"
  },
  ...
]
```

**Stop Camera Processing**
```
POST /api/rooms/{room_id}/stop/

Response:
{
  "status": "Camera processing stopped"
}
```

**Update Room**
```
PATCH /api/rooms/{room_id}/
Content-Type: application/json

{
  "name": "Updated Room Name",
  "is_active": false
}
```

**Delete Room**
```
DELETE /api/rooms/{room_id}/
```

### YOLOv8 Worker (Background Processing)

**Features:**
- One background thread per room
- Real-time people counting using YOLOv8 nano model
- Frame-level inference with 60-second aggregation intervals
- Automatic stream reconnection on failure
- Graceful error handling and status updates

**Key Functions:**
- `start_room_processing(room, model_path='yolov8n.pt')`: Start camera worker thread
- `stop_room_processing(room)`: Stop camera worker thread
- `get_room_status(room_id)`: Get current processing status

**Processing Flow:**
1. Load YOLOv8 model
2. Connect to camera stream via OpenCV
3. Process frames at camera's native FPS
4. Detect people (YOLO class 0) per frame
5. Aggregate counts every 60 seconds
6. Save to database
7. Update room's `last_updated` timestamp

### Serializers

**RoomSerializer**
- Serializes Room model with latest count and last_updated timestamp
- Read-only fields: `id`, `created_at`, `status`

**RoomCountSerializer**
- Serializes CameraCount records for room-based queries
- Includes: `people_count`, `frames_processed`, `inference_time_ms`, `timestamp`

### Frontend (React + TypeScript)

#### Types

```typescript
interface Room {
  id: string | number;
  name: string;
  camera_ip: string;
  is_active: boolean;
  status: "active" | "inactive" | "offline";
  latest_count: number;
  last_updated: string | null;
  created_at?: string;
}

interface CameraCount {
  id?: string;
  room_id?: string;
  people_count: number;
  frames_processed?: number;
  inference_time_ms?: number;
  timestamp: string;
}
```

#### API Service

```typescript
cameraApi.createRoom(roomName, cameraIp): Promise<Room>
cameraApi.getRooms(): Promise<Room[]>
cameraApi.getRoom(roomId): Promise<Room>
cameraApi.getRoomCounts(roomId): Promise<CameraCount[]>
cameraApi.stopRoom(roomId): Promise<{ status: string }>
cameraApi.updateRoom(roomId, data): Promise<Room>
cameraApi.deleteRoom(roomId): Promise<{ status: string }>
```

#### Components

**AddRoomForm**
- Two-column form with Room Name and Camera IP fields
- Client-side IP validation (regex)
- Error messaging
- Loading state management
- Calls `onSubmit` handler on successful validation

**RoomTable**
- Displays list of all rooms in a border-style table
- Columns: Room Name, Camera IP, Status (color-coded), Latest Count, Last Updated
- Click row to select room
- Shows room count and loading states

**RoomDetails**
- Shows time-series count history for selected room
- Header displays room name, IP, and refresh button
- Scrollable table with Timestamp and People Count columns
- Refresh functionality to reload counts from API

**CameraTab**
- Main orchestration component
- State management for rooms and selected room
- Error handling and display
- Integrates all three components in vertical layout

## Database Setup

### Migrations

Run the following command to apply migrations:

```bash
python manage.py migrate
```

This creates:
1. `camera_room` table with proper indexes
2. Adds `room` ForeignKey to `camera_cameracount` table
3. Creates indexes for efficient querying:
   - `camera_room_name_idx`: On `room.name`
   - `camera_room_created_idx`: On `room.created_at`
   - `camera_camerac_room_id_timestamp_idx`: On `cameracount.room_id` and `timestamp`

### PostgreSQL Optimization

If using PostgreSQL in production:

```sql
-- Verify indexes were created
SELECT indexname FROM pg_indexes WHERE tablename = 'camera_room';
SELECT indexname FROM pg_indexes WHERE tablename = 'camera_cameracount';

-- Optional: Create additional materialized view for real-time stats
CREATE MATERIALIZED VIEW room_count_stats AS
SELECT 
  room_id,
  COUNT(*) as total_counts,
  MAX(people_count) as peak_count,
  AVG(people_count) as avg_count,
  MAX(timestamp) as latest_timestamp
FROM camera_cameracount
WHERE room_id IS NOT NULL
GROUP BY room_id;

-- Refresh stats (schedule with Celery Beat)
REFRESH MATERIALIZED VIEW room_count_stats;
```

## Configuration

### Settings

Add to `config/settings.py`:

```python
# YOLOv8 Model Configuration
YOLO_MODEL = 'yolov8n.pt'  # nano model (lightweight)
CAMERA_PROCESSING_INTERVAL = 60  # seconds (for aggregation)
CAMERA_TIMEOUT = 30  # seconds (connection timeout)
```

### Logging

Configure logging in `config/settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/camera.log',
        },
    },
    'loggers': {
        'camera': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## Error Handling

### Backend

**Common Errors:**

1. **Duplicate Room Name**
   - Status: 400 Bad Request
   - Message: "room with this name already exists"

2. **Invalid Camera IP**
   - Status: 400 Bad Request
   - Message: "Camera could not be reached"

3. **Processing Failure**
   - Status: 500 Internal Server Error
   - Room status set to 'offline'
   - YOLOv8 thread stops gracefully

### Frontend

**Error States:**

1. **Network Error**
   - Error message displayed in red banner
   - User can retry via Refresh button

2. **Invalid Input**
   - Form validation with user-friendly messages
   - IP regex validation

3. **API Errors**
   - Caught and displayed in error section
   - Detailed error messages from backend

## Testing

### Backend Testing

```python
# Test creating a room
from camera.models import Room
room = Room.objects.create(
    name="Test Room",
    camera_ip="http://192.168.1.50:8080/video"
)

# Test API endpoint
from rest_framework.test import APIClient
client = APIClient()
response = client.post('/api/rooms/', {
    'name': 'Test Room 2',
    'camera_ip': 'http://192.168.1.51:8080/video'
})
assert response.status_code == 201
```

### Frontend Testing

```typescript
// Test API service
import { cameraApi } from '../services/api';

const newRoom = await cameraApi.createRoom(
  'Test Room',
  'http://192.168.1.50:8080/video'
);
expect(newRoom.name).toBe('Test Room');
expect(newRoom.status).toBe('active');
```

## Performance Considerations

### Optimization Tips

1. **Database Queries**
   - Use `select_related()` for Camera/Room ForeignKeys
   - Use `prefetch_related()` for reverse relations
   - Example:
     ```python
     rooms = Room.objects.prefetch_related(
         Prefetch('counts', queryset=CameraCount.objects.all()[:100])
     )
     ```

2. **YOLOv8 Model Loading**
   - Load model once at application startup
   - Share model instance across threads
   - Use GPU if available: `model = YOLO('yolov8n.pt').to('cuda')`

3. **Frame Processing**
   - Resize frames for faster inference
   - Skip frames if processing falls behind
   - Use lower FPS for performance monitoring

4. **API Response Caching**
   - Cache room list (5-minute TTL)
   - Cache count history (1-minute TTL)
   - Implementation:
     ```python
     from django.views.decorators.cache import cache_page
     
     @cache_page(60)  # 60 seconds
     def get_rooms(request):
         ...
     ```

## Deployment Checklist

- [ ] Run migrations: `python manage.py migrate`
- [ ] Create superuser: `python manage.py createsuperuser`
- [ ] Test camera endpoints with Postman/curl
- [ ] Configure YOLOv8 model path in settings
- [ ] Set up logging directory: `mkdir -p logs/`
- [ ] Configure PostgreSQL indexes
- [ ] Set DEBUG = False in production
- [ ] Configure ALLOWED_HOSTS
- [ ] Test room creation and camera processing
- [ ] Verify count data saves to database
- [ ] Monitor system logs for errors
- [ ] Set up Celery Beat for stats refresh (optional)
- [ ] Configure SSL/HTTPS
- [ ] Set up monitoring/alerting for failed cameras

## Known Limitations & Future Improvements

### Current Limitations

1. **Single Model Instance**: YOLOv8 model shared across all threads (can cause bottlenecks)
2. **No Authentication**: Currently no API key/token validation
3. **No Rate Limiting**: No requests-per-minute limits
4. **No Persistent Thread State**: Thread status lost on app restart
5. **Basic Aggregation**: Simple max() aggregation over interval

### Future Enhancements

1. **Multi-GPU Support**: Distribute processing across GPUs
2. **Advanced Analytics**: Occupancy trends, peak hours, capacity warnings
3. **Person Tracking**: Track individuals over time
4. **Privacy Features**: Anonymization, face blurring
5. **Alerts System**: Threshold-based alerts (capacity warnings)
6. **WebSocket Support**: Real-time count updates
7. **Authentication**: JWT or OAuth2
8. **Rate Limiting**: Per-user or per-IP limits
9. **Data Retention**: Automatic purging of old counts
10. **Backup Camera Support**: Failover to secondary cameras

## Support & Troubleshooting

### Common Issues

**Issue: Camera not connecting**
- Check camera URL format
- Verify network connectivity: `ping <camera-ip>`
- Check firewall rules
- Review logs: `tail -f logs/camera.log`

**Issue: Low count accuracy**
- Verify camera resolution (minimum 640x480)
- Check lighting conditions
- Adjust YOLOv8 confidence threshold
- Use larger model: `yolov8s.pt` or `yolov8m.pt`

**Issue: High CPU usage**
- Reduce FPS or frame size
- Use lighter model: `yolov8n.pt`
- Enable GPU processing
- Reduce number of concurrent rooms

**Issue: Memory leaks**
- Check for frame release: `cap.release()`
- Monitor thread count: `ps aux | grep python`
- Review error logs for uncaught exceptions

### Debug Mode

Enable verbose logging:

```python
# config/settings.py
LOGGING['loggers']['camera']['level'] = 'DEBUG'

# Run with logging
python manage.py runserver --verbosity=2
```

## References

- YOLOv8 Docs: https://docs.ultralytics.com/
- Django REST Framework: https://www.django-rest-framework.org/
- OpenCV Docs: https://docs.opencv.org/
- React Docs: https://react.dev/
