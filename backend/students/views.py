from rest_framework import viewsets, views, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Department, Skill, StudentProfile, StudentSkill
from .serializers import DepartmentSerializer, SkillSerializer, StudentProfileSerializer, StudentSkillSerializer
from accounts.permissions import IsStudent, IsAdminUserRole

class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.AllowAny]
    pagination_class = None

class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all().order_by('name')
    serializer_class = SkillSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    pagination_class = None

class StudentProfileView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        # Students cannot self-assign placement_status directly
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        data.pop('placement_status', None)
        serializer = StudentProfileSerializer(profile, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request):
        return self.put(request)

class StudentAdminViewSet(viewsets.ModelViewSet):
    queryset = StudentProfile.objects.select_related('user', 'department').prefetch_related('student_skills__skill').all()
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAdminUserRole]

    def get_queryset(self):
        queryset = super().get_queryset()
        dept = self.request.query_params.get('department')
        min_cgpa = self.request.query_params.get('min_cgpa')
        status_param = self.request.query_params.get('placement_status')
        search = self.request.query_params.get('search')

        if dept:
            queryset = queryset.filter(department__code__iexact=dept)
        if min_cgpa:
            try:
                queryset = queryset.filter(cgpa__gte=float(min_cgpa))
            except ValueError:
                pass
        if status_param:
            queryset = queryset.filter(placement_status=status_param)
        if search:
            queryset = queryset.filter(
                Q(roll_number__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(user__email__icontains=search)
            )
        return queryset
