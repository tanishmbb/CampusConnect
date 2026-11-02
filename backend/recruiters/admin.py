from django.contrib import admin
from .models import RecruiterProfile

@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company', 'designation', 'phone')
    search_fields = ('user__username', 'user__email', 'company__name')
