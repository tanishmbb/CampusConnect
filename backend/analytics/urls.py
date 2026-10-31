from django.urls import path
from .views import AdminAnalyticsView, StudentDashboardSummaryView, RecruiterDashboardSummaryView

urlpatterns = [
    path('admin/', AdminAnalyticsView.as_view(), name='admin_analytics'),
    path('student-dashboard/', StudentDashboardSummaryView.as_view(), name='student_dashboard_summary'),
    path('recruiter-dashboard/', RecruiterDashboardSummaryView.as_view(), name='recruiter_dashboard_summary'),
]
