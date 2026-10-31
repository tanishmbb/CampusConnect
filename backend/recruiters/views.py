from rest_framework import views, status, permissions
from rest_framework.response import Response
from .models import RecruiterProfile
from .serializers import RecruiterProfileSerializer
from companies.models import Company
from companies.serializers import CompanySerializer
from accounts.permissions import IsRecruiter

class RecruiterProfileView(views.APIView):
    permission_classes = [IsRecruiter]

    def get(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        serializer = RecruiterProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RecruiterCompanySetupView(views.APIView):
    permission_classes = [IsRecruiter]

    def post(self, request):
        profile, _ = RecruiterProfile.objects.get_or_create(user=request.user)
        # Check if creating new company or updating existing
        if profile.company:
            serializer = CompanySerializer(profile.company, data=request.data, partial=True)
        else:
            serializer = CompanySerializer(data=request.data)

        if serializer.is_valid():
            company = serializer.save()
            profile.company = company
            profile.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED if not profile.company else status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
