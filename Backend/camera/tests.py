"""
Camera tests
"""
from django.test import TestCase
from rest_framework.test import APIClient
from .models import Camera, CameraCount


class CameraAPITests(TestCase):
    """Test camera API endpoints"""
    
    def setUp(self):
        self.client = APIClient()
        self.camera = Camera.objects.create(
            name='Test Camera',
            ip_address='192.168.1.100',
            location='Test Room'
        )
    
    def test_list_cameras(self):
        """Test listing cameras"""
        response = self.client.get('/api/v1/cameras/')
        self.assertEqual(response.status_code, 200)
    
    def test_camera_detail(self):
        """Test camera detail endpoint"""
        response = self.client.get(f'/api/v1/cameras/{self.camera.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['name'], 'Test Camera')
