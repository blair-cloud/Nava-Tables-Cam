"""
YOLOv8 + OpenCV integration for people counting
This module handles real-time people detection from IP camera streams
"""
import cv2
import threading
import logging
from datetime import datetime
from ultralytics import YOLO
from django.utils import timezone
from .models import Camera, CameraCount, Room

logger = logging.getLogger(__name__)

# Global dictionary to store camera/room processing threads
_camera_threads = {}
_room_threads = {}
_camera_locks = {}
_room_locks = {}


class CameraProcessor:
    """
    Handles YOLOv8 inference on camera streams
    Supports both Camera and Room modes
    """
    
    def __init__(self, camera=None, room=None, model_path='yolov8n.pt'):
        """
        Initialize camera processor
        
        Args:
            camera: Camera model instance (legacy mode)
            room: Room model instance (new mode)
            model_path: Path to YOLOv8 model file
        """
        self.camera = camera
        self.room = room
        self.model_path = model_path
        self.model = None
        self.running = False
        self.cap = None
        
        context = room.name if room else camera.name
        logger.info(f"Initializing processor for: {context}")
    
    def load_model(self):
        """Load YOLOv8 model"""
        try:
            self.model = YOLO(self.model_path)
            logger.info(f"YOLOv8 model loaded: {self.model_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load YOLOv8 model: {str(e)}")
            return False
    
    def open_stream(self):
        """
        Open IP camera stream using OpenCV
        Supports RTSP, HTTP, MJPEG streams
        """
        try:
            # Get stream URL based on camera or room
            if self.room:
                stream_url = self.room.camera_ip
                context = self.room.name
            else:
                stream_url = self.camera.get_rtsp_url()
                context = self.camera.name
            
            logger.info(f"Attempting to connect to camera for {context}: {stream_url}")
            
            self.cap = cv2.VideoCapture(stream_url)
            
            # Set timeout
            self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            
            # Verify connection
            if not self.cap.isOpened():
                logger.error(f"Failed to open camera stream: {stream_url}")
                return False
            
            logger.info(f"Successfully connected to {context}")
            
            # Update status based on room or camera
            if self.room:
                self.room.status = 'active'
                self.room.save(update_fields=['status'])
            else:
                self.camera.status = 'active'
                self.camera.last_connection = timezone.now()
                self.camera.save(update_fields=['status', 'last_connection'])
            
            return True
        except Exception as e:
            logger.error(f"Error opening camera stream: {str(e)}")
            if self.room:
                self.room.status = 'offline'
                self.room.save(update_fields=['status'])
            else:
                self.camera.status = 'error'
                self.camera.save(update_fields=['status'])
            return False
    
    def process_frame(self, frame):
        """
        Run YOLOv8 inference on frame
        Filter for person class only
        
        Returns:
            (people_count, inference_time_ms)
        """
        if self.model is None:
            return 0, 0
        
        try:
            # Run inference
            results = self.model(frame, verbose=False, conf=0.45)
            
            # Filter for person class (class_id = 0 in COCO dataset)
            people_count = 0
            inference_time = 0
            
            for result in results:
                # Get inference time
                inference_time = result.speed['inference']
                
                # Filter detections for person class (0)
                if result.boxes is not None:
                    for box in result.boxes:
                        if int(box.cls[0]) == 0:  # Person class
                            people_count += 1
            
            return people_count, inference_time
        except Exception as e:
            logger.error(f"Error during inference: {str(e)}")
            return 0, 0
    
    def aggregate_counts(self, frame_counts, interval_seconds=60):
        """
        Aggregate frame-level counts to interval-level counts
        (e.g., average count over 60 seconds)
        
        Args:
            frame_counts: List of people counts per frame
            interval_seconds: Aggregation interval
            
        Returns:
            Aggregated count (average)
        """
        if not frame_counts:
            return 0
        
        # Return maximum count in interval (more conservative for attendance)
        return max(frame_counts)
    
    def save_count(self, people_count, frames_processed, avg_inference_time):
        """
        Save count to database (for both Camera and Room modes)
        """
        try:
            if self.room:
                CameraCount.objects.create(
                    room=self.room,
                    people_count=people_count,
                    frames_processed=frames_processed,
                    inference_time_ms=avg_inference_time
                )
                # Update room's last_updated timestamp
                self.room.last_updated = timezone.now()
                self.room.save(update_fields=['last_updated'])
                logger.info(
                    f"Saved count for {self.room.name}: {people_count} people "
                    f"({frames_processed} frames, {avg_inference_time:.2f}ms)"
                )
            else:
                CameraCount.objects.create(
                    camera=self.camera,
                    people_count=people_count,
                    frames_processed=frames_processed,
                    inference_time_ms=avg_inference_time
                )
                logger.info(
                    f"Saved count for {self.camera.name}: {people_count} people "
                    f"({frames_processed} frames, {avg_inference_time:.2f}ms)"
                )
        except Exception as e:
            logger.error(f"Failed to save count: {str(e)}")
    
    def run(self, interval_seconds=60):
        """
        Main processing loop
        Runs indefinitely until stopped
        
        Args:
            interval_seconds: Interval for aggregating and saving counts
        """
        if not self.load_model():
            self.camera.status = 'error'
            self.camera.save(update_fields=['status'])
            return
        
        if not self.open_stream():
            return
        
        self.running = True
        frame_count = 0
        frame_counts = []
        inference_times = []
        
        logger.info(f"Starting processing loop for {self.camera.name}")
        
        try:
            while self.running:
                ret, frame = self.cap.read()
                
                if not ret:
                    logger.warning(f"Failed to read frame from {self.camera.name}")
                    # Try to reconnect
                    self.open_stream()
                    continue
                
                # Resize frame if needed (for performance)
                if frame.shape[0] > 1080:
                    scale = 1080 / frame.shape[0]
                    frame = cv2.resize(frame, None, fx=scale, fy=scale)
                
                # Process frame
                people_count, inference_time = self.process_frame(frame)
                frame_counts.append(people_count)
                inference_times.append(inference_time)
                frame_count += 1
                
                # Every interval_seconds, save aggregated count
                if frame_count >= interval_seconds * self.camera.fps:
                    aggregated_count = self.aggregate_counts(frame_counts)
                    avg_inference_time = sum(inference_times) / len(inference_times) if inference_times else 0
                    
                    self.save_count(aggregated_count, frame_count, avg_inference_time)
                    
                    # Reset for next interval
                    frame_count = 0
                    frame_counts = []
                    inference_times = []
        
        except Exception as e:
            logger.error(f"Error in processing loop for {self.camera.name}: {str(e)}")
            self.camera.status = 'error'
            self.camera.save(update_fields=['status'])
        
        finally:
            self.stop()
    
    def stop(self):
        """Stop processing and cleanup"""
        self.running = False
        
        if self.cap is not None:
            self.cap.release()
        
        if self.room:
            self.room.status = 'inactive'
            self.room.save(update_fields=['status'])
            logger.info(f"Stopped processing for {self.room.name}")
        else:
            self.camera.status = 'inactive'
            self.camera.save(update_fields=['status'])
            logger.info(f"Stopped processing for {self.camera.name}")


def start_camera_processing(camera, model_path='yolov8n.pt'):
    """
    Start background processing for a camera
    Uses threading (or Celery for production)
    
    Args:
        camera: Camera model instance
        model_path: Path to YOLOv8 model
    """
    camera_id = camera.id
    
    # Prevent duplicate threads
    if camera_id in _camera_threads:
        if _camera_threads[camera_id].is_alive():
            logger.warning(f"Processing already running for camera {camera.name}")
            return False
    
    # Create processor and thread
    processor = CameraProcessor(camera, model_path)
    
    thread = threading.Thread(
        target=processor.run,
        args=(60,),  # 60 second interval
        daemon=False,
        name=f"camera-processor-{camera_id}"
    )
    
    # Store reference
    _camera_threads[camera_id] = thread
    _camera_locks[camera_id] = threading.Lock()
    
    # Start thread
    thread.start()
    logger.info(f"Started processing thread for camera: {camera.name}")
    
    return True


def stop_camera_processing(camera):
    """
    Stop background processing for a camera
    
    Args:
        camera: Camera model instance or camera_id
    """
    camera_id = camera.id if hasattr(camera, 'id') else camera
    
    if camera_id not in _camera_threads:
        logger.warning(f"No processing thread found for camera {camera_id}")
        return False
    
    thread = _camera_threads[camera_id]
    if thread.is_alive():
        logger.info(f"Stopping processing for camera {camera_id}")
        # Note: Set running=False on processor to gracefully stop
        # This would require storing processor reference
        return True
    
    return False


def get_camera_status(camera_id):
    """Get current status of camera processing"""
    if camera_id not in _camera_threads:
        return 'not_started'
    
    thread = _camera_threads[camera_id]
    return 'running' if thread.is_alive() else 'stopped'


def start_room_processing(room, model_path='yolov8n.pt'):
    """
    Start background processing for a room
    Uses threading
    
    Args:
        room: Room model instance
        model_path: Path to YOLOv8 model
    """
    room_id = room.id
    
    # Prevent duplicate threads
    if room_id in _room_threads:
        if _room_threads[room_id].is_alive():
            logger.warning(f"Processing already running for room {room.name}")
            return False
    
    # Create processor and thread
    processor = CameraProcessor(room=room, model_path=model_path)
    
    thread = threading.Thread(
        target=processor.run,
        args=(60,),  # 60 second interval
        daemon=False,
        name=f"room-processor-{room_id}"
    )
    
    # Store reference
    _room_threads[room_id] = thread
    _room_locks[room_id] = threading.Lock()
    
    # Start thread
    thread.start()
    logger.info(f"Started processing thread for room: {room.name}")
    
    return True


def stop_room_processing(room):
    """
    Stop background processing for a room
    
    Args:
        room: Room model instance or room_id
    """
    room_id = room.id if hasattr(room, 'id') else room
    
    if room_id not in _room_threads:
        logger.warning(f"No processing thread found for room {room_id}")
        return False
    
    thread = _room_threads[room_id]
    if thread.is_alive():
        logger.info(f"Stopping processing for room {room_id}")
        return True
    
    return False


def get_room_status(room_id):
    """Get current status of room camera processing"""
    if room_id not in _room_threads:
        return 'not_started'
    
    thread = _room_threads[room_id]
    return 'running' if thread.is_alive() else 'stopped'
