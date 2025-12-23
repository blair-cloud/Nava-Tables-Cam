# API Testing Guide - Room-Based Camera Management

## Prerequisites

- Backend running: `python manage.py runserver`
- Base URL: `http://localhost:8000`
- Optional: Postman, curl, or REST client

## Complete Testing Workflow

### 1. Test Room Creation

**Request:**
```bash
curl -X POST http://localhost:8000/api/rooms/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lecture Hall A",
    "camera_ip": "http://192.168.1.50:8080/video",
    "is_active": true
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "name": "Lecture Hall A",
  "camera_ip": "http://192.168.1.50:8080/video",
  "is_active": true,
  "status": "active",
  "latest_count": 0,
  "last_updated": null,
  "created_at": "2025-01-01T10:00:00Z"
}
```

**What happens:**
- Room is created in database
- Camera processing thread starts
- Initial status is set to "active"

---

### 2. Create Second Room

**Request:**
```bash
curl -X POST http://localhost:8000/api/rooms/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lab 2",
    "camera_ip": "http://192.168.1.51:8080/video",
    "is_active": true
  }'
```

**Expected Response (201 Created):**
```json
{
  "id": 2,
  "name": "Lab 2",
  "camera_ip": "http://192.168.1.51:8080/video",
  "is_active": true,
  "status": "active",
  "latest_count": 0,
  "last_updated": null,
  "created_at": "2025-01-01T10:01:00Z"
}
```

---

### 3. List All Rooms

**Request:**
```bash
curl -X GET http://localhost:8000/api/rooms/
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Lecture Hall A",
    "camera_ip": "http://192.168.1.50:8080/video",
    "is_active": true,
    "status": "active",
    "latest_count": 0,
    "last_updated": null,
    "created_at": "2025-01-01T10:00:00Z"
  },
  {
    "id": 2,
    "name": "Lab 2",
    "camera_ip": "http://192.168.1.51:8080/video",
    "is_active": true,
    "status": "active",
    "latest_count": 0,
    "last_updated": null,
    "created_at": "2025-01-01T10:01:00Z"
  }
]
```

---

### 4. Get Specific Room

**Request:**
```bash
curl -X GET http://localhost:8000/api/rooms/1/
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "name": "Lecture Hall A",
  "camera_ip": "http://192.168.1.50:8080/video",
  "is_active": true,
  "status": "active",
  "latest_count": 0,
  "last_updated": null,
  "created_at": "2025-01-01T10:00:00Z"
}
```

---

### 5. Wait for Counts (60+ seconds)

At this point, if a real camera is connected, the background thread will be processing frames. After 60 seconds, you should see count data.

**Simulating count data (manual test):**
```bash
# Login to Django shell
python manage.py shell

# Manually create some counts for testing
from camera.models import Room, CameraCount
room = Room.objects.get(id=1)
CameraCount.objects.create(room=room, people_count=12)
CameraCount.objects.create(room=room, people_count=14)
CameraCount.objects.create(room=room, people_count=10)
```

---

### 6. Get Room Count History

**Request (after counts exist):**
```bash
curl -X GET "http://localhost:8000/api/rooms/1/counts/?limit=10"
```

**Expected Response (200 OK):**
```json
[
  {
    "id": 3,
    "people_count": 10,
    "frames_processed": 1800,
    "inference_time_ms": 24.2,
    "timestamp": "2025-01-01T10:02:30Z"
  },
  {
    "id": 2,
    "people_count": 14,
    "frames_processed": 1800,
    "inference_time_ms": 25.1,
    "timestamp": "2025-01-01T10:01:30Z"
  },
  {
    "id": 1,
    "people_count": 12,
    "frames_processed": 1800,
    "inference_time_ms": 24.5,
    "timestamp": "2025-01-01T10:00:30Z"
  }
]
```

---

### 7. Update Room

**Request:**
```bash
curl -X PATCH http://localhost:8000/api/rooms/1/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Lecture Hall",
    "is_active": false
  }'
```

**Expected Response (200 OK):**
```json
{
  "id": 1,
  "name": "Main Lecture Hall",
  "camera_ip": "http://192.168.1.50:8080/video",
  "is_active": false,
  "status": "active",
  "latest_count": 12,
  "last_updated": "2025-01-01T10:02:30Z",
  "created_at": "2025-01-01T10:00:00Z"
}
```

---

### 8. Stop Camera Processing

**Request:**
```bash
curl -X POST http://localhost:8000/api/rooms/1/stop/
```

**Expected Response (200 OK):**
```json
{
  "status": "Camera processing stopped"
}
```

**What happens:**
- Camera processing thread stops
- Room status changes to "inactive"
- No more count data will be saved

---

### 9. Delete Room

**Request:**
```bash
curl -X DELETE http://localhost:8000/api/rooms/1/
```

**Expected Response (204 No Content):**
- Empty response body
- Room deleted from database
- All associated counts remain in database (soft delete)

---

## Error Testing

### Test: Duplicate Room Name

**Request:**
```bash
curl -X POST http://localhost:8000/api/rooms/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lecture Hall A",
    "camera_ip": "http://192.168.1.52:8080/video"
  }'
```

**Expected Response (400 Bad Request):**
```json
{
  "name": [
    "room with this name already exists."
  ]
}
```

---

### Test: Invalid Camera IP (Optional if validation exists)

**Request:**
```bash
curl -X POST http://localhost:8000/api/rooms/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid Room",
    "camera_ip": "invalid-url"
  }'
```

**Expected Response:**
- Room may still be created, but processing will fail
- Status will be "offline" if camera unreachable

---

### Test: Room Not Found

**Request:**
```bash
curl -X GET http://localhost:8000/api/rooms/999/
```

**Expected Response (404 Not Found):**
```json
{
  "detail": "Not found."
}
```

---

## Frontend Testing

### Test Workflow in React

1. **Navigate to Camera Tab**
   ```
   http://localhost:5173/ → Click "Camera" tab
   ```

2. **Create a Room**
   - Room Name: `Frontend Test Room`
   - Camera IP: `http://192.168.1.100:8080/video`
   - Click: "Add Room & Start Camera"

3. **Verify Room Appears**
   - Should appear in RoomTable
   - Status should be "active"
   - Latest Count should be 0 (initially)

4. **Select Room**
   - Click room in table
   - RoomDetails should load

5. **Wait for Counts**
   - After 60+ seconds, click "Refresh"
   - Should see count history

6. **Test Error States**
   - Try creating duplicate room → see error
   - Stop camera → status becomes "inactive"

---

## Database Verification

```bash
# Open Django shell
python manage.py shell

# Verify Room model
from camera.models import Room
rooms = Room.objects.all()
print(f"Total rooms: {rooms.count()}")
for room in rooms:
    print(f"  - {room.name}: {room.status}")

# Verify CameraCount records
from camera.models import CameraCount
counts = CameraCount.objects.filter(room__isnull=False)
print(f"Total room counts: {counts.count()}")
for count in counts[:5]:
    print(f"  - {count.room.name}: {count.people_count} people @ {count.timestamp}")

# Check processing status
from camera.yolo_service import get_room_status
status = get_room_status(1)
print(f"Room 1 processing status: {status}")
```

---

## Performance Testing

### Test: High Load (Multiple Rooms)

**Create 10 rooms:**
```bash
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/rooms/ \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Room $i\",
      \"camera_ip\": \"http://192.168.1.$((100+$i)):8080/video\"
    }"
  sleep 1
done
```

**Expected behavior:**
- All rooms created successfully
- Each gets its own processing thread
- System remains responsive

---

### Test: Memory Usage

Monitor while rooms process:
```bash
# In separate terminal
watch -n 1 'ps aux | grep -E "python|yolo" | grep -v grep'
```

---

## Common Issues & Fixes

### Issue: "Port already in use"
```bash
# Kill process using port 8000
lsof -ti:8000 | xargs kill -9
```

### Issue: "No module named 'camera'"
```bash
# Ensure you're in Backend directory
cd Backend
python manage.py runserver
```

### Issue: "Camera not connecting"
```bash
# Check if camera URL is valid
curl http://192.168.1.50:8080/video

# Check logs
tail -f logs/camera.log
```

### Issue: "No counts appearing"
```bash
# Verify thread is running
python manage.py shell
from camera.yolo_service import get_room_status
print(get_room_status(1))  # Should be 'running'

# Manually create test counts
from camera.models import Room, CameraCount
room = Room.objects.get(id=1)
CameraCount.objects.create(room=room, people_count=5)
```

---

## Summary

This testing workflow verifies:
✅ Room CRUD operations
✅ Camera processing lifecycle
✅ Count data persistence
✅ Error handling
✅ Frontend integration
✅ Performance under load
✅ Database integrity

All tests should pass before deploying to production.
