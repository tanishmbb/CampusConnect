from rest_framework import serializers
from .models import Company

class CompanySerializer(serializers.ModelSerializer):
    jobs_count = serializers.SerializerMethodField()
    selected_students_count = serializers.SerializerMethodField()

    class Meta:
        model = Company
        fields = [
            'id', 'name', 'description', 'industry', 'location', 'website',
            'contact_person', 'contact_email', 'logo', 'logo_url',
            'approval_status', 'is_active', 'created_at', 'jobs_count', 'selected_students_count'
        ]
        read_only_fields = ['id', 'created_at']

    def get_jobs_count(self, obj):
        return obj.jobs.count()

    def get_selected_students_count(self, obj):
        from applications.models import Application
        return Application.objects.filter(job__company=obj, status='SELECTED').count()
