from rest_framework import serializers
from .models import Job
from companies.serializers import CompanySerializer
from companies.models import Company
from students.models import Department, Skill
from students.serializers import DepartmentSerializer, SkillSerializer

class JobSerializer(serializers.ModelSerializer):
    company_details = CompanySerializer(source='company', read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source='company', write_only=True, required=False
    )
    eligible_department_details = DepartmentSerializer(source='eligible_departments', many=True, read_only=True)
    eligible_department_ids = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='eligible_departments', many=True, write_only=True, required=False
    )
    required_skill_details = SkillSerializer(source='required_skills', many=True, read_only=True)
    required_skill_names = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = [
            'id', 'company', 'company_id', 'company_details', 'title', 'description', 'responsibilities',
            'location', 'salary_min', 'salary_max', 'job_type', 'minimum_cgpa',
            'eligible_departments', 'eligible_department_ids', 'eligible_department_details',
            'graduation_year', 'maximum_backlogs', 'application_deadline',
            'required_skills', 'required_skill_names', 'required_skill_details',
            'status', 'created_by', 'created_at', 'applications_count'
        ]
        read_only_fields = ['id', 'company', 'created_by', 'created_at']

    def get_applications_count(self, obj):
        return obj.applications.count()

    def create(self, validated_data):
        dept_ids = validated_data.pop('eligible_departments', [])
        req_skills = validated_data.pop('required_skills', [])
        skill_names = validated_data.pop('required_skill_names', [])
        user = self.context['request'].user

        # Auto-assign company from recruiter if not specified
        if 'company' not in validated_data and hasattr(user, 'recruiter_profile') and user.recruiter_profile.company:
            validated_data['company'] = user.recruiter_profile.company

        validated_data['created_by'] = user
        job = Job.objects.create(**validated_data)

        if dept_ids:
            job.eligible_departments.set(dept_ids)

        if req_skills:
            job.required_skills.set(req_skills)

        if skill_names:
            skills = list(job.required_skills.all())
            for name in skill_names:
                clean = name.strip()
                if clean:
                    s, _ = Skill.objects.get_or_create(name__iexact=clean, defaults={'name': clean})
                    if s not in skills:
                        skills.append(s)
            job.required_skills.set(skills)

        return job

    def update(self, instance, validated_data):
        dept_ids = validated_data.pop('eligible_departments', None)
        req_skills = validated_data.pop('required_skills', None)
        skill_names = validated_data.pop('required_skill_names', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if dept_ids is not None:
            instance.eligible_departments.set(dept_ids)

        if req_skills is not None:
            instance.required_skills.set(req_skills)

        if skill_names is not None:
            skills = list(instance.required_skills.all())
            for name in skill_names:
                clean = name.strip()
                if clean:
                    s, _ = Skill.objects.get_or_create(name__iexact=clean, defaults={'name': clean})
                    if s not in skills:
                        skills.append(s)
            instance.required_skills.set(skills)

        return instance
