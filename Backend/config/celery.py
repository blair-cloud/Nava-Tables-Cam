"""
Celery configuration for Nava Table API Backend
"""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

app = Celery('nava_backend')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
