from rest_framework import serializers
from .models import Interview
from applications.serializers import ApplicationSerializer
from applications.models import Application

class InterviewSerializer(serializers.ModelSerializer):
    application_details = ApplicationSerializer(source='application', read_only=True)
    application_id = serializers.PrimaryKeyRelatedField(
        queryset=Application.objects.all(), source='application', write_only=True
    )
    student_name = serializers.CharField(source='application.student.user.get_full_name', read_only=True)
    student_roll = serializers.CharField(source='application.student.roll_number', read_only=True)
    job_title = serializers.CharField(source='application.job.title', read_only=True)
    company_name = serializers.CharField(source='application.job.company.name', read_only=True)

    class Meta:
        model = Interview
        fields = [
            'id', 'application', 'application_id', 'application_details',
            'interview_date', 'interview_time', 'interview_type', 'location_or_link',
            'interviewer', 'notes', 'status', 'created_at',
            'student_name', 'student_roll', 'job_title', 'company_name'
        ]
        read_only_fields = ['id', 'application', 'created_at']
