"""
Camera app initialization
"""
from django.apps import AppConfig  # pyright: ignore[reportMissingImports]


class CameraConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'camera'
    
    def ready(self):
        """
        Initialize camera app
        """
        import logging
        logger = logging.getLogger(__name__)
        logger.info("Camera app initialized")
