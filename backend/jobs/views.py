from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import Job
from .serializers import JobSerializer
from accounts.permissions import IsAdminUserRole, IsRecruiter, IsStudent
from applications.models import Application
from notifications.models import Notification

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer

    def get_permissions(self):
        if self.action in ['approve', 'reject', 'admin_list']:
            return [IsAdminUserRole()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy', 'close', 'my_jobs']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        user = self.request.user
        queryset = Job.objects.select_related('company').prefetch_related('eligible_departments', 'required_skills').all()

        # Admin can view all jobs
        if user.is_authenticated and (user.role == 'ADMIN' or user.is_staff):
            pass
        elif user.is_authenticated and user.role == 'RECRUITER':
            if hasattr(user, 'recruiter_profile') and user.recruiter_profile.company:
                recruiter_company = user.recruiter_profile.company
                queryset = queryset.filter(Q(company=recruiter_company) | Q(status='ACTIVE', company__approval_status='APPROVED'))
            else:
                queryset = queryset.filter(status='ACTIVE', company__approval_status='APPROVED')
        else:
            # Student and public only see active jobs from approved companies
            queryset = queryset.filter(status='ACTIVE', company__approval_status='APPROVED')

        # Filters
        dept = self.request.query_params.get('department')
        job_type = self.request.query_params.get('job_type')
        location = self.request.query_params.get('location')
        min_salary = self.request.query_params.get('min_salary')
        skill = self.request.query_params.get('skill')
        search = self.request.query_params.get('search')
        status_filter = self.request.query_params.get('status')

        if dept:
            queryset = queryset.filter(eligible_departments__code__iexact=dept)
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        if location:
            queryset = queryset.filter(location__icontains=location)
        if min_salary:
            try:
                queryset = queryset.filter(salary_max__gte=float(min_salary))
            except ValueError:
                pass
        if skill:
            queryset = queryset.filter(required_skills__name__icontains=skill)
        if status_filter and user.is_authenticated and (user.role in ['ADMIN', 'RECRUITER']):
            queryset = queryset.filter(status=status_filter)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(company__name__icontains=search) |
                Q(description__icontains=search) |
                Q(location__icontains=search)
            )

        return queryset.distinct()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_jobs(self, request):
        user = request.user
        if user.role == 'RECRUITER' and hasattr(user, 'recruiter_profile') and user.recruiter_profile.company:
            jobs = Job.objects.filter(company=user.recruiter_profile.company).order_by('-created_at')
            page = self.paginate_queryset(jobs)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(jobs, many=True)
            return Response(serializer.data)
        return Response({'detail': 'No company associated with this recruiter.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def approve(self, request, pk=None):
        job = self.get_object()
        job.status = 'ACTIVE'
        job.save()

        # Notify recruiter
        if job.created_by:
            Notification.objects.create(
                user=job.created_by,
                title="Job Approved",
                message=f"Your job posting '{job.title}' has been approved by the Placement Cell and is now live.",
                notification_type='SUCCESS',
                link=f"/recruiter/jobs"
            )

        return Response({'message': f"Job '{job.title}' is now ACTIVE.", 'status': job.status})

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUserRole])
    def reject(self, request, pk=None):
        job = self.get_object()
        job.status = 'REJECTED'
        job.save()

        if job.created_by:
            Notification.objects.create(
                user=job.created_by,
                title="Job Rejected",
                message=f"Your job posting '{job.title}' was rejected by the Placement Cell.",
                notification_type='ALERT',
                link=f"/recruiter/jobs"
            )

        return Response({'message': f"Job '{job.title}' has been REJECTED.", 'status': job.status})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def close(self, request, pk=None):
        job = self.get_object()
        user = request.user
        # Recruiter or Admin can close
        if user.role == 'ADMIN' or (user.role == 'RECRUITER' and hasattr(user, 'recruiter_profile') and job.company == user.recruiter_profile.company):
            job.status = 'CLOSED'
            job.save()
            return Response({'message': f"Job '{job.title}' has been CLOSED.", 'status': job.status})
        return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def eligibility(self, request, pk=None):
        job = self.get_object()
        user = request.user

        if user.role != 'STUDENT' or not hasattr(user, 'student_profile'):
            return Response({
                'is_eligible': False,
                'already_applied': False,
                'reasons': ['Only students can check application eligibility.'],
                'checks': {}
            })

        profile = user.student_profile
        reasons = []
        checks = {}

        # 1. CGPA Check
        cgpa_ok = float(profile.cgpa) >= float(job.minimum_cgpa)
        checks['cgpa'] = {
            'required': float(job.minimum_cgpa),
            'actual': float(profile.cgpa),
            'passed': cgpa_ok
        }
        if not cgpa_ok:
            reasons.append(f"Required CGPA is {job.minimum_cgpa}, your CGPA is {profile.cgpa}.")

        # 2. Department Check
        eligible_depts = list(job.eligible_departments.all())
        if eligible_depts:
            dept_ok = profile.department in eligible_depts if profile.department else False
            checks['department'] = {
                'required': [d.code for d in eligible_depts],
                'actual': profile.department.code if profile.department else 'None',
                'passed': dept_ok
            }
            if not dept_ok:
                allowed = ', '.join([d.code for d in eligible_depts])
                actual_code = profile.department.code if profile.department else 'Not set'
                reasons.append(f"Eligible departments are: {allowed}. Your department is {actual_code}.")
        else:
            checks['department'] = {'required': 'All', 'actual': profile.department.code if profile.department else 'None', 'passed': True}

        # 3. Backlogs Check
        backlogs_ok = profile.backlogs <= job.maximum_backlogs
        checks['backlogs'] = {
            'max_allowed': job.maximum_backlogs,
            'actual': profile.backlogs,
            'passed': backlogs_ok
        }
        if not backlogs_ok:
            reasons.append(f"Maximum backlogs allowed is {job.maximum_backlogs}, you currently have {profile.backlogs}.")

        # 4. Graduation Year
        grad_ok = (profile.graduation_year == job.graduation_year) if job.graduation_year else True
        checks['graduation_year'] = {
            'required': job.graduation_year,
            'actual': profile.graduation_year,
            'passed': grad_ok
        }
        if not grad_ok:
            reasons.append(f"Required graduation batch is {job.graduation_year}, your batch is {profile.graduation_year}.")

        # 5. Deadline Check
        today = timezone.now().date()
        deadline_ok = job.application_deadline >= today
        checks['deadline'] = {
            'deadline': str(job.application_deadline),
            'today': str(today),
            'passed': deadline_ok
        }
        if not deadline_ok:
            reasons.append("The application deadline for this job has expired.")

        # 6. Already Applied Check
        already_applied = Application.objects.filter(student=profile, job=job).exists()
        checks['already_applied'] = already_applied
        if already_applied:
            reasons.append("You have already applied to this job.")

        is_eligible = len(reasons) == 0

        return Response({
            'is_eligible': is_eligible,
            'already_applied': already_applied,
            'reasons': reasons,
            'checks': checks
        })
