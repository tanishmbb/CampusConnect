from django.contrib import admin
from .models import Job

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('title', 'company', 'job_type', 'salary_min', 'salary_max', 'minimum_cgpa', 'status', 'application_deadline')
    list_filter = ('status', 'job_type', 'company')
    search_fields = ('title', 'company__name', 'description')
