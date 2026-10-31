from rest_framework import serializers
from .models import RecruiterProfile
from companies.serializers import CompanySerializer
from companies.models import Company

class RecruiterProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    company_details = CompanySerializer(source='company', read_only=True)
    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(), source='company', write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = RecruiterProfile
        fields = [
            'id', 'user_email', 'user_first_name', 'user_last_name',
            'company', 'company_id', 'company_details', 'designation', 'phone'
        ]
        read_only_fields = ['id', 'company']
