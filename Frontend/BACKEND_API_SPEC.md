# Backend Implementation Checklist

## Required API Endpoints

The frontend expects these endpoints. Implement them in your Django REST Framework backend.

### ✅ 1. Create Room / Connect Camera

**Endpoint**: `POST /api/camera/connect/`

**Request Body**:

```json
{
  "room_name": "Lecture Hall A",
  "camera_ip": "192.168.1.50"
}
```

**Response** (201 Created):

```json
{
  "id": "uuid-or-id",
  "room_name": "Lecture Hall A",
  "camera_ip": "192.168.1.50",
  "status": "Active",
  "latest_people_count": 0,
  "last_updated": "2025-12-21T10:30:00Z"
}
```

**Error Response** (400 Bad Request):

```json
{
  "detail": "Invalid camera IP format"
}
```

### ✅ 2. Get All Rooms

**Endpoint**: `GET /api/camera/rooms/`

**Response** (200 OK):

```json
[
  {
    "id": "uuid-1",
    "room_name": "Lecture Hall A",
    "camera_ip": "192.168.1.50",
    "status": "Active",
    "latest_people_count": 25,
    "last_updated": "2025-12-21T10:30:00Z"
  },
  {
    "id": "uuid-2",
    "room_name": "Lab B",
    "camera_ip": "192.168.1.51",
    "status": "Inactive",
    "latest_people_count": 0,
    "last_updated": "2025-12-21T09:45:00Z"
  }
]
```

### ✅ 3. Get Single Room

**Endpoint**: `GET /api/camera/rooms/{room_id}/`

**Response** (200 OK):

```json
{
  "id": "uuid-1",
  "room_name": "Lecture Hall A",
  "camera_ip": "192.168.1.50",
  "status": "Active",
  "latest_people_count": 25,
  "last_updated": "2025-12-21T10:30:00Z"
}
```

**Error Response** (404 Not Found):

```json
{
  "detail": "Not found."
}
```

### ✅ 4. Get Room Count History

**Endpoint**: `GET /api/camera/counts/?room_id={room_id}`

**Query Parameters**:

- `room_id` (required): UUID or ID of the room
- `limit` (optional): Number of records to return (default: 100)
- `offset` (optional): For pagination

**Response** (200 OK):

```json
[
  {
    "id": "count-1",
    "room_id": "uuid-1",
    "timestamp": "2025-12-21T10:30:00Z",
    "people_count": 25
  },
  {
    "id": "count-2",
    "room_id": "uuid-1",
    "timestamp": "2025-12-21T10:29:00Z",
    "people_count": 24
  },
  {
    "id": "count-3",
    "room_id": "uuid-1",
    "timestamp": "2025-12-21T10:28:00Z",
    "people_count": 23
  }
]
```

### ⚠️ Legacy Endpoints (Optional)

These endpoints are called by legacy code. Keep them for backward compatibility.

**Endpoint**: `POST /api/camera/connect/`

- **Alternative format** (legacy):
  ```json
  {
    "ip": "192.168.1.50"
  }
  ```

**Endpoint**: `GET /api/camera/counts/`

- **Response**: Returns all counts across all rooms (paginated)

## Database Model Structure

### Room Model

```python
class Room(models.Model):
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room_name = models.CharField(max_length=255)
    camera_ip = models.GenericIPAddressField()

    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=[('Active', 'Active'), ('Inactive', 'Inactive')],
        default='Inactive'
    )

    # Camera data
    latest_people_count = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.room_name
```

### CameraCount Model

```python
class CameraCount(models.Model):
    # Core fields
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='counts')

    # Data
    timestamp = models.DateTimeField()
    people_count = models.IntegerField()

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['room', '-timestamp']),
        ]

    def __str__(self):
        return f"{self.room.room_name} - {self.people_count} people at {self.timestamp}"
```

## Serializers

```python
# serializers.py

from rest_framework import serializers
from .models import Room, CameraCount

class CameraCountSerializer(serializers.ModelSerializer):
    class Meta:
        model = CameraCount
        fields = ['id', 'room_id', 'timestamp', 'people_count']
        read_only_fields = ['id', 'created_at']

class RoomSerializer(serializers.ModelSerializer):
    latest_people_count = serializers.SerializerMethodField()
    last_updated = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'room_name', 'camera_ip', 'status',
            'latest_people_count', 'last_updated'
        ]
        read_only_fields = ['id', 'latest_people_count', 'last_updated']

    def get_latest_people_count(self, obj):
        latest = obj.counts.first()
        return latest.people_count if latest else 0

    def get_last_updated(self, obj):
        latest = obj.counts.first()
        return latest.timestamp if latest else obj.updated_at
```

## Views/ViewSets

```python
# views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .models import Room, CameraCount
from .serializers import RoomSerializer, CameraCountSerializer

class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

    def create(self, request, *args, **kwargs):
        # Handle both new and legacy format
        data = request.data.copy()

        # Support legacy format: {"ip": "..."}
        if 'ip' in data and 'camera_ip' not in data:
            data['camera_ip'] = data.pop('ip')

        # Support legacy format without room_name
        if 'room_name' not in data and 'camera_ip' in data:
            data['room_name'] = f"Room {data['camera_ip']}"

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class CameraCountViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CameraCount.objects.all()
    serializer_class = CameraCountSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['room_id']

    def get_queryset(self):
        queryset = super().get_queryset()
        room_id = self.request.query_params.get('room_id')
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        return queryset.order_by('-timestamp')
```

## URL Configuration

```python
# urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, CameraCountViewSet

router = DefaultRouter()
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'counts', CameraCountViewSet, basename='camera-count')

urlpatterns = [
    path('', include(router.urls)),
]
```

## Frontend Expected Behavior

| Action         | Expected API Call                 | Expected Response |
| -------------- | --------------------------------- | ----------------- |
| Load app       | GET /api/camera/rooms/            | List of rooms     |
| Add room       | POST /api/camera/connect/         | New room object   |
| Select room    | GET /api/camera/counts/?room_id=X | Count history     |
| Refresh counts | GET /api/camera/counts/?room_id=X | Updated counts    |

## Testing Checklist

- [ ] POST /api/camera/connect/ creates new room
- [ ] GET /api/camera/rooms/ returns all rooms
- [ ] GET /api/camera/rooms/{id}/ returns single room
- [ ] GET /api/camera/counts/?room_id=X returns counts for room
- [ ] Invalid IP address returns 400 error
- [ ] Missing room_id returns empty array
- [ ] Timestamps are in ISO 8601 format
- [ ] Response includes all required fields
- [ ] Pagination works (limit/offset)
- [ ] Status field is 'Active' or 'Inactive'
- [ ] latest_people_count is an integer
- [ ] last_updated is a datetime string

## Frontend & Backend Integration Notes

✅ **Authentication**

- Frontend supports Token-based auth via Authorization header
- Add `@authentication_classes([TokenAuthentication])`
- Add `@permission_classes([IsAuthenticated])`

✅ **CORS**

- Ensure CORS headers are properly set
- Frontend runs on different port than backend
- Add appropriate CORS middleware

✅ **Error Handling**

- Return `detail` field in error responses
- Use standard HTTP status codes (400, 404, 500)
- Include helpful error messages

✅ **Data Format**

- Use ISO 8601 for datetime fields
- Use string for IDs (UUIDs preferred)
- Use integer for counts

## Example cURL Tests

```bash
# Create room
curl -X POST http://localhost:8000/api/camera/connect/ \
  -H "Content-Type: application/json" \
  -d '{"room_name": "Lab A", "camera_ip": "192.168.1.50"}'

# Get all rooms
curl http://localhost:8000/api/camera/rooms/

# Get single room
curl http://localhost:8000/api/camera/rooms/uuid-here/

# Get counts for room
curl 'http://localhost:8000/api/camera/counts/?room_id=uuid-here'
```

## Migration Guide

If migrating from old endpoint structure:

1. Keep old `/api/camera/connect/` accepting `{"ip": "..."}` format
2. Also accept new `{"room_name": "", "camera_ip": ""}` format
3. Create Room objects automatically
4. Update frontend gradually
5. Maintain backward compatibility

## Support & Questions

- Check that all fields match Room interface definition
- Verify datetime format matches (ISO 8601)
- Test error responses are consistent
- Ensure pagination works correctly
- Test with empty room lists
- Test with old endpoint format

---

**Frontend Ready**: December 21, 2025
**Backend Implementation**: In Progress
**Integration Status**: Awaiting backend implementation
