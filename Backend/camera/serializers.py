"""
Camera app serializers
"""
from rest_framework import serializers
from .models import Camera, CameraCount, Room


class RoomSerializer(serializers.ModelSerializer):
    """Serializer for Room model with latest count information"""
    latest_count = serializers.SerializerMethodField()
    last_updated = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = [
            'id', 'name', 'camera_ip', 'is_active', 'status',
            'latest_count', 'last_updated', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'status']
    
    def get_latest_count(self, obj):
        """Get the most recent people count for this room"""
        return obj.get_latest_count()
    
    def get_last_updated(self, obj):
        """Get the timestamp of the most recent count"""
        timestamp = obj.get_latest_count_timestamp()
        if timestamp:
            return timestamp.isoformat()
        return None


class RoomCountSerializer(serializers.ModelSerializer):
    """Serializer for CameraCount filtered by room"""
    class Meta:
        model = CameraCount
        fields = ['id', 'people_count', 'frames_processed', 'inference_time_ms', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class CameraSerializer(serializers.ModelSerializer):
    """Serializer for Camera model"""
    rtsp_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Camera
        fields = [
            'id', 'name', 'ip_address', 'port', 'status', 'is_active',
            'location', 'resolution_width', 'resolution_height', 'fps',
            'created_at', 'updated_at', 'last_connection', 'rtsp_url'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_connection', 'status']
    
    def get_rtsp_url(self, obj):
        """Return RTSP URL if credentials available"""
        if obj.username and obj.password:
            return obj.get_rtsp_url()
        return f"rtsp://{obj.ip_address}:{obj.port}{obj.rtsp_path}"


class CameraCountSerializer(serializers.ModelSerializer):
    """Serializer for CameraCount model"""
    camera_name = serializers.CharField(source='camera.name', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    
    class Meta:
        model = CameraCount
        fields = [
            'id', 'camera', 'camera_name', 'room', 'room_name', 'people_count',
            'frames_processed', 'inference_time_ms', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class CameraCountDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for camera count history"""
    class Meta:
        model = CameraCount
        fields = [
            'id', 'people_count', 'frames_processed',
            'inference_time_ms', 'timestamp'
        ]


class CameraConnectSerializer(serializers.Serializer):
    """
    Serializer for camera connection request
    POST /api/v1/camera/connect/
    {
        "camera_id": 1  (or "ip": "192.168.1.100" for new camera)
    }
    """
    camera_id = serializers.IntegerField(required=False, allow_null=True)
    ip = serializers.IPAddressField(required=False, allow_blank=True)
    name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    port = serializers.IntegerField(default=554, required=False)
    rtsp_path = serializers.CharField(max_length=255, default='', required=False, allow_blank=True)
    
    def validate(self, data):
        """Validate that either camera_id or ip is provided"""
        camera_id = data.get('camera_id')
        ip = data.get('ip')
        
        if not camera_id and not ip:
            raise serializers.ValidationError(
                'Either camera_id or ip must be provided'
            )
        
        return data
