# Room-Based Camera Management - Quick Start

## Backend Setup

### 1. Apply Database Migrations

```bash
cd Backend
python manage.py migrate
```

This creates the `Room` model and updates `CameraCount` to support room-based tracking.

### 2. Verify Models

```bash
python manage.py shell
>>> from camera.models import Room, CameraCount
>>> Room.objects.all()
>>> CameraCount.objects.all()
```

### 3. Create Admin User (if needed)

```bash
python manage.py createsuperuser
```

### 4. Start Backend

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/api/`

## Frontend Setup

### 1. Install Dependencies

```bash
cd Frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173/`

## Testing the System

### Test 1: Create a Room via API

```bash
curl -X POST http://localhost:8000/api/rooms/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lecture Hall A",
    "camera_ip": "http://192.168.1.50:8080/video",
    "is_active": true
  }'
```

Expected Response:
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

### Test 2: List All Rooms

```bash
curl http://localhost:8000/api/rooms/
```

### Test 3: Get Room Counts

```bash
curl http://localhost:8000/api/rooms/1/counts/
```

### Test 4: Stop Room Camera

```bash
curl -X POST http://localhost:8000/api/rooms/1/stop/
```

### Test 5: Use React Frontend

1. Navigate to `http://localhost:5173/` (or your dev server URL)
2. Click on "Camera" tab
3. Fill in "Add New Room" form:
   - Room Name: `Test Room`
   - Camera IP: `http://192.168.1.50:8080/video`
4. Click "Add Room & Start Camera"
5. Room appears in the table
6. Click room to view count history

## Key Files Modified

### Backend
- `camera/models.py` - Added Room model
- `camera/serializers.py` - Added RoomSerializer, RoomCountSerializer
- `camera/views.py` - Added RoomViewSet
- `camera/yolo_service.py` - Added room processing functions
- `config/urls.py` - Registered RoomViewSet
- `camera/migrations/0002_room_cameracount_room.py` - Database migration

### Frontend
- `types/timetable.ts` - Updated Room interface
- `services/api.ts` - Added room endpoints
- `components/camera/CameraTab.tsx` - Updated for room management
- `components/camera/RoomTable.tsx` - Updated field names
- `components/camera/RoomDetails.tsx` - Updated to use getRoomCounts
- `components/camera/AddRoomForm.tsx` - Already complete

## API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rooms/` | List all rooms |
| POST | `/api/rooms/` | Create new room |
| GET | `/api/rooms/{id}/` | Get room details |
| PATCH | `/api/rooms/{id}/` | Update room |
| DELETE | `/api/rooms/{id}/` | Delete room |
| GET | `/api/rooms/{id}/counts/` | Get count history |
| POST | `/api/rooms/{id}/stop/` | Stop camera |

## Status Codes

- `200 OK` - Successful GET request
- `201 Created` - Successful POST request
- `204 No Content` - Successful DELETE request
- `400 Bad Request` - Invalid input or duplicate room name
- `404 Not Found` - Room not found
- `500 Internal Server Error` - Server-side error (camera connection, processing)

## Common Issues & Solutions

### Issue: "Camera connection failed"
**Solution:** Verify the camera IP address and ensure network connectivity

### Issue: "Room with this name already exists"
**Solution:** Use a unique room name

### Issue: Frontend shows blank rooms list
**Solution:** Check browser console for CORS errors; ensure backend is running

### Issue: Camera keeps going to 'offline' status
**Solution:** Check camera logs: `tail -f logs/camera.log`

## Next Steps

1. **Configure PostgreSQL** (for production)
   - Update `DATABASES` in `config/settings.py`
   - Run migrations

2. **Set up YOLOv8 Model**
   - Download: `yolov8n.pt`, `yolov8s.pt`, or `yolov8m.pt`
   - Place in project root or configure path in settings

3. **Enable GPU Processing** (optional)
   - Install CUDA toolkit
   - Modify `yolo_service.py` to use GPU

4. **Configure Logging**
   - Create `logs/` directory
   - Monitor `logs/camera.log`

5. **Deploy to Production**
   - Use Gunicorn + Nginx
   - Configure SSL/HTTPS
   - Set up Celery for background tasks (optional)

## Documentation

For detailed implementation information, see: [ROOM_IMPLEMENTATION_GUIDE.md](./ROOM_IMPLEMENTATION_GUIDE.md)
