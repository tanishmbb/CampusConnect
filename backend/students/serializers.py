from rest_framework import serializers
from .models import Department, Skill, StudentProfile, StudentSkill
from accounts.serializers import UserSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    students_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'students_count']

    def get_students_count(self, obj):
        return obj.students.count()

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class StudentSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(source='skill.name', read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(), source='skill', write_only=True
    )

    class Meta:
        model = StudentSkill
        fields = ['id', 'skill', 'skill_id', 'skill_name', 'proficiency']
        read_only_fields = ['id', 'skill']

class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    department_details = DepartmentSerializer(source='department', read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), source='department', write_only=True, required=False, allow_null=True
    )
    skills = StudentSkillSerializer(source='student_skills', many=True, read_only=True)
    skills_list = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'roll_number', 'phone', 'date_of_birth', 'gender', 'address',
            'department', 'department_id', 'department_details', 'graduation_year',
            'cgpa', 'tenth_percentage', 'twelfth_percentage', 'diploma_percentage',
            'backlogs', 'resume', 'resume_url', 'profile_photo', 'github_url', 'linkedin_url',
            'projects_info', 'internships_info', 'certifications_info',
            'profile_completion', 'placement_status', 'skills', 'skills_list'
        ]
        read_only_fields = ['id', 'user', 'department', 'profile_completion']

    def update(self, instance, validated_data):
        skills_data = validated_data.pop('skills_list', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update skills if provided
        if skills_data is not None:
            instance.student_skills.all().delete()
            for skill_name in skills_data:
                name_clean = skill_name.strip()
                if name_clean:
                    skill, _ = Skill.objects.get_or_create(name__iexact=name_clean, defaults={'name': name_clean})
                    StudentSkill.objects.create(student=instance, skill=skill, proficiency='INTERMEDIATE')
            instance.save()

        return instance
