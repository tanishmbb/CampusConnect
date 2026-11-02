from django.contrib import admin
from .models import Interview

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ('application', 'interview_date', 'interview_time', 'interview_type', 'status')
    list_filter = ('interview_type', 'status', 'interview_date')
    search_fields = ('application__student__user__username', 'application__job__title')
