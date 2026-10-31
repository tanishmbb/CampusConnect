from django.db import models
from applications.models import Application

class Interview(models.Model):
    TYPE_CHOICES = (
        ('ONLINE', 'Online Video Call'),
        ('OFFLINE', 'In-Person / On Campus'),
        ('TECHNICAL', 'Technical Round'),
        ('HR', 'HR Round'),
    )

    STATUS_CHOICES = (
        ('SCHEDULED', 'Scheduled'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='interviews')
    interview_date = models.DateField()
    interview_time = models.TimeField()
    interview_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='ONLINE')
    location_or_link = models.CharField(max_length=500)
    interviewer = models.CharField(max_length=200, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SCHEDULED')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['interview_date', 'interview_time']

    def __str__(self):
        return f"Interview for {self.application.student.user.username} @ {self.application.job.title} on {self.interview_date}"
