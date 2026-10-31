from rest_framework import serializers
from .models import Application
from jobs.serializers import JobSerializer
from students.serializers import StudentProfileSerializer
from jobs.models import Job
from students.models import StudentProfile

class ApplicationSerializer(serializers.ModelSerializer):
    job_details = JobSerializer(source='job', read_only=True)
    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(), source='job', write_only=True, required=False
    )
    job = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(), required=False
    )
    student_details = StudentProfileSerializer(source='student', read_only=True)
    interviews_count = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id', 'student', 'student_details', 'job', 'job_id', 'job_details',
            'resume', 'resume_url', 'cover_letter', 'status', 'applied_at', 'updated_at',
            'interviews_count'
        ]
        read_only_fields = ['id', 'student', 'applied_at', 'updated_at']

    def get_interviews_count(self, obj):
        return obj.interviews.count()

    def validate(self, attrs):
        user = self.context['request'].user
        if not hasattr(user, 'student_profile'):
            raise serializers.ValidationError("Only students can apply for jobs.")

        student = user.student_profile
        job = attrs.get('job')

        if not job:
            raise serializers.ValidationError({"job": "Job selection is required."})

        # 1. Prevent duplicate application
        if Application.objects.filter(student=student, job=job).exists():
            raise serializers.ValidationError("You have already applied to this job.")

        # 2. Check job status
        if job.status != 'ACTIVE':
            raise serializers.ValidationError("This job is not currently accepting applications.")

        # 3. CGPA eligibility
        if float(student.cgpa) < float(job.minimum_cgpa):
            raise serializers.ValidationError(
                f"You are not eligible because the required CGPA is {job.minimum_cgpa}, and your CGPA is {student.cgpa}."
            )

        # 4. Department eligibility
        eligible_depts = job.eligible_departments.all()
        if eligible_depts.exists():
            if not student.department or not eligible_depts.filter(id=student.department.id).exists():
                allowed = ', '.join([d.code for d in eligible_depts])
                dept_code = student.department.code if student.department else 'None'
                raise serializers.ValidationError(
                    f"You are not eligible because your department is {dept_code}, but this job is open to {allowed}."
                )

        # 5. Backlogs eligibility
        if student.backlogs > job.maximum_backlogs:
            raise serializers.ValidationError(
                f"You are not eligible because you have {student.backlogs} backlogs (max allowed: {job.maximum_backlogs})."
            )

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        student = user.student_profile
        validated_data['student'] = student

        if not validated_data.get('resume') and not validated_data.get('resume_url'):
            if student.resume:
                validated_data['resume'] = student.resume
            elif student.resume_url:
                validated_data['resume_url'] = student.resume_url

        return super().create(validated_data)
