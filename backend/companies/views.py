from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Company
from .serializers import CompanySerializer
from accounts.permissions import IsAdminUserRole, IsRecruiter

class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer

    def get_permissions(self):
        if self.action in ['approve', 'reject', 'destroy']:
            return [IsAdminUserRole()]
        elif self.action in ['create', 'update', 'partial_update', 'my_company']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        queryset = Company.objects.all()

        if not user.is_authenticated or user.role == 'STUDENT':
            queryset = queryset.filter(approval_status='APPROVED', is_active=True)
        elif user.role == 'RECRUITER':
            if hasattr(user, 'recruiter_profile') and user.recruiter_profile.company:
                company_id = user.recruiter_profile.company.id
                queryset = queryset.filter(Q(approval_status='APPROVED') | Q(id=company_id))

        status_param = self.request.query_params.get('approval_status')
        if status_param:
            queryset = queryset.filter(approval_status=status_param)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(industry__icontains=search) |
                Q(location__icontains=search)
            )

        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def approve(self, request, pk=None):
        company = self.get_object()
        company.approval_status = 'APPROVED'
        company.save()
        return Response({'message': f'Company {company.name} has been approved.', 'approval_status': company.approval_status})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def reject(self, request, pk=None):
        company = self.get_object()
        company.approval_status = 'REJECTED'
        company.save()
        return Response({'message': f'Company {company.name} has been rejected.', 'approval_status': company.approval_status})

    @action(detail=False, methods=['get'], permission_classes=[IsRecruiter])
    def my_company(self, request):
        if hasattr(request.user, 'recruiter_profile') and request.user.recruiter_profile.company:
            serializer = self.get_serializer(request.user.recruiter_profile.company)
            return Response(serializer.data)
        return Response({'detail': 'No company profile linked yet.'}, status=status.HTTP_404_NOT_FOUND)
