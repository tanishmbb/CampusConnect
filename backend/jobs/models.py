from django.db import models
from django.conf import settings
from companies.models import Company
from students.models import Department, Skill

class Job(models.Model):
    JOB_TYPE_CHOICES = (
        ('FULL_TIME', 'Full Time'),
        ('INTERNSHIP', 'Internship'),
        ('PART_TIME', 'Part Time'),
    )

    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('PENDING_APPROVAL', 'Pending Approval'),
        ('ACTIVE', 'Active'),
        ('CLOSED', 'Closed'),
        ('REJECTED', 'Rejected'),
    )

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='jobs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    responsibilities = models.TextField(blank=True, default='')
    location = models.CharField(max_length=150)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, help_text='In Lakhs Per Annum (LPA)')
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, help_text='In Lakhs Per Annum (LPA)')
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='FULL_TIME')
    minimum_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=6.0)
    eligible_departments = models.ManyToManyField(Department, related_name='eligible_jobs', blank=True)
    graduation_year = models.IntegerField(default=2026)
    maximum_backlogs = models.IntegerField(default=0)
    application_deadline = models.DateField()
    required_skills = models.ManyToManyField(Skill, related_name='job_skills', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING_APPROVAL')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_jobs')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} @ {self.company.name} ({self.status})"
