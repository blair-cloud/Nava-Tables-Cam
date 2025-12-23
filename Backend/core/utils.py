"""
Core utility functions and helpers
"""
import logging

logger = logging.getLogger(__name__)


def setup_logging():
    """
    Configure application-wide logging
    """
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    )
