from django.contrib import admin
from .models import Department, Skill, StudentProfile, StudentSkill

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('code', 'name')
    search_fields = ('code', 'name')

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('roll_number', 'user', 'department', 'cgpa', 'backlogs', 'placement_status', 'profile_completion')
    list_filter = ('department', 'placement_status', 'graduation_year')
    search_fields = ('roll_number', 'user__username', 'user__email', 'user__first_name', 'user__last_name')

@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ('student', 'skill', 'proficiency')
