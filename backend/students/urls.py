from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, SkillViewSet, StudentProfileView, StudentAdminViewSet

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'admin/all', StudentAdminViewSet, basename='student-admin')

urlpatterns = [
    path('profile/', StudentProfileView.as_view(), name='student-profile'),
    path('', include(router.urls)),
]
