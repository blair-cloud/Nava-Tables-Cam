# Generated migration for Room model

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('camera', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(help_text='Unique room name', max_length=255, unique=True)),
                ('camera_ip', models.CharField(help_text='Camera IP address or URL', max_length=255)),
                ('is_active', models.BooleanField(default=True)),
                ('status', models.CharField(choices=[('active', 'Active'), ('inactive', 'Inactive'), ('offline', 'Offline')], default='inactive', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('last_updated', models.DateTimeField(blank=True, help_text='Last time counts were updated', null=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='room',
            index=models.Index(fields=['name'], name='camera_room_name_idx'),
        ),
        migrations.AddIndex(
            model_name='room',
            index=models.Index(fields=['-created_at'], name='camera_room_created_idx'),
        ),
        migrations.AlterField(
            model_name='cameracount',
            name='camera',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='counts', to='camera.camera'),
        ),
        migrations.AddField(
            model_name='cameracount',
            name='room',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='counts', to='camera.room'),
        ),
        migrations.AddIndex(
            model_name='cameracount',
            index=models.Index(fields=['room', '-timestamp'], name='camera_camerac_room_id_timestamp_idx'),
        ),
    ]
