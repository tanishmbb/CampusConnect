from django.db import models

class Company(models.Model):
    APPROVAL_CHOICES = (
        ('PENDING', 'Pending Approval'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    industry = models.CharField(max_length=100)
    location = models.CharField(max_length=200)
    website = models.URLField(blank=True, default='')
    contact_person = models.CharField(max_length=150, blank=True, default='')
    contact_email = models.EmailField()
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    logo_url = models.CharField(max_length=500, blank=True, default='')
    approval_status = models.CharField(max_length=20, choices=APPROVAL_CHOICES, default='PENDING')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Companies'
        ordering = ['-created_at']

    def __str__(self):
        return self.name
