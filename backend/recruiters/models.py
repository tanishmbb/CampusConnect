from django.db import models
from django.conf import settings
from companies.models import Company

class RecruiterProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='recruiter_profile')
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True, related_name='recruiters')
    designation = models.CharField(max_length=150, blank=True, default='Talent Acquisition Lead')
    phone = models.CharField(max_length=20, blank=True, default='')

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.company.name if self.company else 'Unassigned'}"
