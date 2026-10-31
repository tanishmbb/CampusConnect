from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create(**validated_data)
        user.set_password(password)
        if user.role == 'ADMIN':
            user.is_staff = True
        user.save()

        # Automatic profile initialization
        if user.role == 'STUDENT':
            from students.models import StudentProfile
            StudentProfile.objects.get_or_create(user=user)
        elif user.role == 'RECRUITER':
            from recruiters.models import RecruiterProfile
            RecruiterProfile.objects.get_or_create(user=user)

        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Allow login with either username or email
        username_or_email = attrs.get('username', '')
        if username_or_email:
            try:
                user_match = User.objects.filter(email__iexact=username_or_email).first()
                if user_match:
                    attrs['username'] = user_match.username
            except Exception:
                pass

        data = super().validate(attrs)
        user = self.user

        user_info = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'phone': user.phone,
            'is_active': user.is_active,
        }

        # Profile attachment
        if user.role == 'STUDENT' and hasattr(user, 'student_profile'):
            user_info['profile_id'] = user.student_profile.id
            user_info['placement_status'] = user.student_profile.placement_status
            user_info['profile_completion'] = user.student_profile.profile_completion
        elif user.role == 'RECRUITER' and hasattr(user, 'recruiter_profile'):
            user_info['recruiter_id'] = user.recruiter_profile.id
            if user.recruiter_profile.company:
                user_info['company_id'] = user.recruiter_profile.company.id
                user_info['company_name'] = user.recruiter_profile.company.name

        data['user'] = user_info
        return data
