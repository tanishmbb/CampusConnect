from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('RECRUITER', 'Recruiter'),
        ('ADMIN', 'Placement Officer/Admin'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='STUDENT')
    phone = models.CharField(max_length=20, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def is_student(self):
        return self.role == 'STUDENT'

    def is_recruiter(self):
        return self.role == 'RECRUITER'

    def is_admin_role(self):
        return self.role == 'ADMIN' or self.is_staff or self.is_superuser

    def __str__(self):
        return f"{self.username} ({self.role})"
