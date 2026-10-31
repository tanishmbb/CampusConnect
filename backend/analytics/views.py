from rest_framework import views, permissions, status
from rest_framework.response import Response
from django.db.models import Count, Avg, Max, Min, Q
from students.models import StudentProfile, Department
from companies.models import Company
from jobs.models import Job
from applications.models import Application
from interviews.models import Interview
from accounts.permissions import IsAdminUserRole, IsRecruiter, IsStudent

class AdminAnalyticsView(views.APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        total_students = StudentProfile.objects.count()
        placed_students = StudentProfile.objects.filter(placement_status='PLACED').count()
        not_placed_students = total_students - placed_students
        placement_percentage = round((placed_students / total_students * 100), 1) if total_students > 0 else 0.0

        eligible_students = StudentProfile.objects.filter(cgpa__gte=6.0, backlogs=0).count()

        total_companies = Company.objects.count()
        approved_companies = Company.objects.filter(approval_status='APPROVED').count()
        pending_companies = Company.objects.filter(approval_status='PENDING').count()

        total_jobs = Job.objects.count()
        active_jobs = Job.objects.filter(status='ACTIVE').count()
        pending_jobs = Job.objects.filter(status='PENDING_APPROVAL').count()

        total_applications = Application.objects.count()

        # Packages calculated from SELECTED applications
        selected_apps = Application.objects.filter(status='SELECTED').select_related('job')
        if selected_apps.exists():
            salaries = [float(app.job.salary_max) for app in selected_apps]
            highest_package = round(max(salaries), 2)
            lowest_package = round(min(salaries), 2)
            average_package = round(sum(salaries) / len(salaries), 2)
        else:
            highest_package = 0.0
            lowest_package = 0.0
            average_package = 0.0

        # Department-wise placement
        dept_data = []
        for dept in Department.objects.all():
            d_total = dept.students.count()
            d_placed = dept.students.filter(placement_status='PLACED').count()
            d_pct = round((d_placed / d_total * 100), 1) if d_total > 0 else 0.0
            dept_data.append({
                'id': dept.id,
                'name': dept.name,
                'code': dept.code,
                'total_students': d_total,
                'placed_students': d_placed,
                'placement_percentage': d_pct,
            })

        # Company-wise selections
        company_data = []
        for comp in Company.objects.filter(approval_status='APPROVED'):
            comp_selected = Application.objects.filter(job__company=comp, status='SELECTED').count()
            comp_jobs = comp.jobs.count()
            if comp_selected > 0 or comp_jobs > 0:
                company_data.append({
                    'id': comp.id,
                    'name': comp.name,
                    'selected_count': comp_selected,
                    'jobs_count': comp_jobs,
                })
        company_data = sorted(company_data, key=lambda x: x['selected_count'], reverse=True)[:8]

        # Application status distribution
        status_counts = (
            Application.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )
        status_map = {item['status']: item['count'] for item in status_counts}
        status_distribution = [
            {'status': label, 'count': status_map.get(key, 0)}
            for key, label in Application.STATUS_CHOICES
        ]

        # Salary distribution among active jobs
        salary_bins = [
            {'range': '< 6 LPA', 'count': Job.objects.filter(status='ACTIVE', salary_max__lt=6).count()},
            {'range': '6 - 10 LPA', 'count': Job.objects.filter(status='ACTIVE', salary_max__gte=6, salary_max__lt=10).count()},
            {'range': '10 - 15 LPA', 'count': Job.objects.filter(status='ACTIVE', salary_max__gte=10, salary_max__lt=15).count()},
            {'range': '15 - 20 LPA', 'count': Job.objects.filter(status='ACTIVE', salary_max__gte=15, salary_max__lt=20).count()},
            {'range': '20+ LPA', 'count': Job.objects.filter(status='ACTIVE', salary_max__gte=20).count()},
        ]

        # Year-wise placement
        years = StudentProfile.objects.values('graduation_year').distinct().order_by('graduation_year')
        year_trends = []
        for y in years:
            year_val = y['graduation_year']
            y_total = StudentProfile.objects.filter(graduation_year=year_val).count()
            y_placed = StudentProfile.objects.filter(graduation_year=year_val, placement_status='PLACED').count()
            y_pct = round((y_placed / y_total * 100), 1) if y_total > 0 else 0.0
            year_trends.append({
                'year': str(year_val),
                'total': y_total,
                'placed': y_placed,
                'percentage': y_pct,
            })

        return Response({
            'overview': {
                'total_students': total_students,
                'eligible_students': eligible_students,
                'placed_students': placed_students,
                'not_placed_students': not_placed_students,
                'placement_percentage': placement_percentage,
                'total_companies': total_companies,
                'approved_companies': approved_companies,
                'pending_companies': pending_companies,
                'total_jobs': total_jobs,
                'active_jobs': active_jobs,
                'pending_jobs': pending_jobs,
                'total_applications': total_applications,
                'highest_package': highest_package,
                'average_package': average_package,
                'lowest_package': lowest_package,
            },
            'department_placements': dept_data,
            'company_selections': company_data,
            'status_distribution': status_distribution,
            'salary_distribution': salary_bins,
            'year_trends': year_trends,
        })

class StudentDashboardSummaryView(views.APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        user = request.user
        profile, _ = StudentProfile.objects.get_or_create(user=user)

        total_applications = Application.objects.filter(student=profile).count()
        shortlisted = Application.objects.filter(student=profile, status='SHORTLISTED').count()
        interviews_count = Interview.objects.filter(application__student=profile).count()
        offers = Application.objects.filter(student=profile, status='SELECTED').count()
        available_jobs = Job.objects.filter(status='ACTIVE', company__approval_status='APPROVED').count()

        recent_applications = Application.objects.filter(student=profile).select_related('job__company').order_by('-applied_at')[:5]
        from applications.serializers import ApplicationSerializer

        return Response({
            'welcome_name': user.get_full_name() or user.username,
            'profile_completion': profile.profile_completion,
            'placement_status': profile.placement_status,
            'available_jobs': available_jobs,
            'applications_count': total_applications,
            'shortlisted_count': shortlisted,
            'interviews_count': interviews_count,
            'offers_count': offers,
            'recent_applications': ApplicationSerializer(recent_applications, many=True).data,
        })

class RecruiterDashboardSummaryView(views.APIView):
    permission_classes = [IsRecruiter]

    def get(self, request):
        user = request.user
        if not hasattr(user, 'recruiter_profile') or not user.recruiter_profile.company:
            return Response({
                'company_configured': False,
                'active_jobs': 0,
                'total_applicants': 0,
                'shortlisted': 0,
                'selected': 0,
            })

        company = user.recruiter_profile.company
        active_jobs = Job.objects.filter(company=company, status='ACTIVE').count()
        all_company_jobs = Job.objects.filter(company=company)
        total_applicants = Application.objects.filter(job__in=all_company_jobs).count()
        shortlisted = Application.objects.filter(job__in=all_company_jobs, status='SHORTLISTED').count()
        selected = Application.objects.filter(job__in=all_company_jobs, status='SELECTED').count()

        recent_applications = Application.objects.filter(job__in=all_company_jobs).select_related(
            'student__user', 'student__department', 'job'
        ).order_by('-applied_at')[:5]
        from applications.serializers import ApplicationSerializer

        return Response({
            'company_configured': True,
            'company_name': company.name,
            'approval_status': company.approval_status,
            'active_jobs': active_jobs,
            'total_applicants': total_applicants,
            'shortlisted': shortlisted,
            'selected': selected,
            'recent_applications': ApplicationSerializer(recent_applications, many=True).data,
        })
