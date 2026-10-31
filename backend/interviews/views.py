from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Interview
from .serializers import InterviewSerializer
from accounts.permissions import IsRecruiterOrAdmin
from notifications.models import Notification

class InterviewViewSet(viewsets.ModelViewSet):
    serializer_class = InterviewSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsRecruiterOrAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        queryset = Interview.objects.select_related(
            'application__student__user', 'application__job__company', 'application__student__department'
        ).all()

        if user.role == 'STUDENT' and hasattr(user, 'student_profile'):
            return queryset.filter(application__student=user.student_profile)

        if user.role == 'RECRUITER' and hasattr(user, 'recruiter_profile') and user.recruiter_profile.company:
            return queryset.filter(application__job__company=user.recruiter_profile.company)

        return queryset

    def perform_create(self, serializer):
        interview = serializer.save()
        app = interview.application

        # Auto-update application status to INTERVIEW_SCHEDULED
        app.status = 'INTERVIEW_SCHEDULED'
        app.save()

        # Notify student
        Notification.objects.create(
            user=app.student.user,
            title="Interview Scheduled",
            message=f"Interview scheduled for '{app.job.title}' at {app.job.company.name} on {interview.interview_date} at {interview.interview_time}. Venue/Link: {interview.location_or_link}",
            notification_type='SUCCESS',
            link="/student/interviews"
        )
