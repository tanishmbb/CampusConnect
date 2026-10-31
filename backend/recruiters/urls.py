from django.urls import path
from .views import RecruiterProfileView, RecruiterCompanySetupView

urlpatterns = [
    path('profile/', RecruiterProfileView.as_view(), name='recruiter_profile'),
    path('company-setup/', RecruiterCompanySetupView.as_view(), name='recruiter_company_setup'),
]
