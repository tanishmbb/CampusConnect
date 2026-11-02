from django.contrib import admin
from .models import Company

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('name', 'industry', 'location', 'approval_status', 'is_active', 'created_at')
    list_filter = ('approval_status', 'is_active', 'industry')
    search_fields = ('name', 'contact_email', 'contact_person')
