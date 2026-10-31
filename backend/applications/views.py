from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Application
from .serializers import ApplicationSerializer
from accounts.permissions import IsStudent, IsRecruiter, IsAdminUserRole, IsRecruiterOrAdmin
from notifications.models import Notification

class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [IsStudent()]
        elif self.action in ['update_status', 'shortlist', 'reject', 'select']:
            return [IsRecruiterOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Application.objects.select_related(
            'student__user', 'student__department', 'job__company'
        ).prefetch_related('student__student_skills__skill', 'interviews').all()

        if user.role == 'STUDENT' and hasattr(user, 'student_profile'):
            return queryset.filter(student=user.student_profile)

        if user.role == 'RECRUITER' and hasattr(user, 'recruiter_profile') and user.recruiter_profile.company:
            queryset = queryset.filter(job__company=user.recruiter_profile.company)
            job_id = self.request.query_params.get('job_id')
            if job_id:
                queryset = queryset.filter(job_id=job_id)
            return queryset

        # Admin: allow filtering by job_id, student_id, status
        job_id = self.request.query_params.get('job_id')
        status_param = self.request.query_params.get('status')
        if job_id:
            queryset = queryset.filter(job_id=job_id)
        if status_param:
            queryset = queryset.filter(status=status_param)

        return queryset

    def perform_create(self, serializer):
        application = serializer.save()

        # Notification for student
        Notification.objects.create(
            user=application.student.user,
            title="Application Submitted",
            message=f"You successfully applied for '{application.job.title}' at {application.job.company.name}.",
            notification_type='SUCCESS',
            link=f"/student/applications"
        )

        # Notification for recruiter/admin
        if application.job.created_by:
            Notification.objects.create(
                user=application.job.created_by,
                title="New Applicant",
                message=f"{application.student.user.get_full_name() or application.student.user.username} applied for '{application.job.title}'.",
                notification_type='INFO',
                link=f"/recruiter/jobs/{application.job.id}/applicants"
            )

    @action(detail=True, methods=['post'], permission_classes=[IsRecruiterOrAdmin])
    def update_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get('status')

        valid_statuses = [s[0] for s in Application.STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response({'error': f"Invalid status '{new_status}'."}, status=status.HTTP_400_BAD_REQUEST)

        application.status = new_status
        application.save()

        student_user = application.student.user
        job_title = application.job.title
        company_name = application.job.company.name

        # If selected, mark student as PLACED
        if new_status == 'SELECTED':
            student_profile = application.student
            student_profile.placement_status = 'PLACED'
            student_profile.save()

            Notification.objects.create(
                user=student_user,
                title="🎉 Congratulations! Job Offer",
                message=f"You have been SELECTED for '{job_title}' at {company_name}! Your placement status is now PLACED.",
                notification_type='SUCCESS',
                link="/student/applications"
            )
        elif new_status == 'SHORTLISTED':
            Notification.objects.create(
                user=student_user,
                title="Application Shortlisted",
                message=f"Your application for '{job_title}' at {company_name} has been shortlisted.",
                notification_type='SUCCESS',
                link="/student/applications"
            )
        elif new_status == 'REJECTED':
            Notification.objects.create(
                user=student_user,
                title="Application Update",
                message=f"Your application for '{job_title}' at {company_name} was not selected.",
                notification_type='ALERT',
                link="/student/applications"
            )

        return Response({
            'message': f"Application status updated to '{new_status}'.",
            'status': application.status,
            'student_placement_status': application.student.placement_status
        })
