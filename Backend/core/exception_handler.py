"""
Custom exception handler for DRF
"""
from rest_framework.response import Response
from rest_framework.views import exception_handler
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that logs and returns clean error responses
    """
    response = exception_handler(exc, context)
    
    if response is None:
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return Response(
            {'error': 'An unexpected error occurred'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    logger.warning(f"API Exception: {exc.__class__.__name__} - {str(exc)}")
    return response
 