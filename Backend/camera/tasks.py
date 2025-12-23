"""
Celery tasks for camera processing (optional)
Use this for production deployment with background workers
"""
from celery import shared_task
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def process_camera_stream(self, camera_id):
    """
    Celery task to process camera stream
    Can be scheduled using celery-beat for automatic processing
    
    Usage:
        # One-time
        process_camera_stream.delay(camera_id=1)
        
        # Scheduled (add to CELERY_BEAT_SCHEDULE)
        'process_camera_1': {
            'task': 'camera.tasks.process_camera_stream',
            'args': (1,),
            'schedule': crontab(minute='*/5'),  # Every 5 minutes
        }
    """
    from .models import Camera
    from .yolo_service import start_camera_processing
    
    try:
        camera = Camera.objects.get(id=camera_id)
        logger.info(f"[Celery] Starting processing for camera: {camera.name}")
        
        start_camera_processing(camera, settings.YOLO_MODEL)
        
        logger.info(f"[Celery] Processing task completed for camera: {camera.name}")
        return {
            'status': 'success',
            'camera_id': camera_id,
            'message': f'Processing started for {camera.name}'
        }
    
    except Camera.DoesNotExist:
        logger.error(f"[Celery] Camera not found: {camera_id}")
        return {
            'status': 'error',
            'camera_id': camera_id,
            'message': 'Camera not found'
        }
    
    except Exception as exc:
        logger.error(f"[Celery] Error processing camera {camera_id}: {str(exc)}")
        # Retry after 60 seconds
        raise self.retry(exc=exc, countdown=60)
