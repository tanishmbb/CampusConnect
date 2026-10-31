import json
from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from students.models import Department, Skill, StudentProfile
from companies.models import Company
from recruiters.models import RecruiterProfile
from jobs.models import Job
from applications.models import Application
from interviews.models import Interview
from notifications.models import Notification

User = get_user_model()

class CampusConnectAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.password = 'TestPass@123'

        # Departments
        self.dept_cse = Department.objects.create(name='Computer Science & Engineering', code='CSE')
        self.dept_ece = Department.objects.create(name='Electronics & Communication', code='ECE')

        # Admin
        self.admin_user = User.objects.create_user(
            username='admin_test', email='admintest@campusconnect.com',
            password=self.password, role='ADMIN', is_staff=True
        )

        # Company
        self.company = Company.objects.create(
            name='Test Corp', industry='Software', location='Bangalore',
            contact_email='hr@testcorp.com', approval_status='APPROVED'
        )

        # Recruiter
        self.recruiter_user = User.objects.create_user(
            username='recruiter_test', email='recruiter@testcorp.com',
            password=self.password, role='RECRUITER'
        )
        self.recruiter_profile = RecruiterProfile.objects.create(
            user=self.recruiter_user, company=self.company, designation='Campus Recruiter'
        )

        # Student 1 (High CGPA, eligible)
        self.student_user = User.objects.create_user(
            username='student_test', email='student@campusconnect.com',
            password=self.password, role='STUDENT'
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user, roll_number='22CS101', department=self.dept_cse,
            cgpa=8.5, backlogs=0, graduation_year=2026
        )

        # Student 2 (Low CGPA)
        self.student2_user = User.objects.create_user(
            username='student2_test', email='student2@campusconnect.com',
            password=self.password, role='STUDENT'
        )
        self.student2_profile = StudentProfile.objects.create(
            user=self.student2_user, roll_number='22CS102', department=self.dept_cse,
            cgpa=6.0, backlogs=1, graduation_year=2026
        )

        # Job
        self.job = Job.objects.create(
            company=self.company, title='Backend Engineer', description='Build APIs',
            location='Bangalore', salary_min=10.0, salary_max=15.0, job_type='FULL_TIME',
            minimum_cgpa=7.5, maximum_backlogs=0, graduation_year=2026,
            application_deadline=date.today() + timedelta(days=30), status='ACTIVE',
            created_by=self.recruiter_user
        )
        self.job.eligible_departments.add(self.dept_cse)

    def test_registration_and_login(self):
        # 1. Register student
        reg_data = {
            'username': 'newstudent',
            'email': 'newstudent@campus.edu',
            'password': self.password,
            'first_name': 'New',
            'last_name': 'Student',
            'role': 'STUDENT',
            'phone': '9998887776'
        }
        res = self.client.post('/api/auth/register/', reg_data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', res.data)
        self.assertTrue(StudentProfile.objects.filter(user__username='newstudent').exists())

        # 2. Login
        login_res = self.client.post('/api/auth/login/', {
            'username': 'newstudent',
            'password': self.password
        })
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_res.data)
        self.assertIn('user', login_res.data)
        self.assertEqual(login_res.data['user']['role'], 'STUDENT')

    def test_current_user_me_endpoint(self):
        self.client.force_authenticate(user=self.student_user)
        res = self.client.get('/api/auth/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'student@campusconnect.com')
        self.assertIn('student_profile', res.data)

    def test_recruiter_job_creation_and_admin_approval(self):
        self.client.force_authenticate(user=self.recruiter_user)
        job_data = {
            'title': 'Frontend Developer',
            'description': 'React UI developer',
            'responsibilities': 'Component styling and state management',
            'location': 'Remote',
            'salary_min': 8.0,
            'salary_max': 12.0,
            'job_type': 'FULL_TIME',
            'minimum_cgpa': 7.0,
            'eligible_department_ids': [self.dept_cse.id],
            'graduation_year': 2026,
            'maximum_backlogs': 0,
            'application_deadline': str(date.today() + timedelta(days=20)),
            'status': 'PENDING_APPROVAL'
        }
        create_res = self.client.post('/api/jobs/', job_data)
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)
        new_job_id = create_res.data['id']
        self.assertEqual(create_res.data['status'], 'PENDING_APPROVAL')

        # Admin approves job
        self.client.force_authenticate(user=self.admin_user)
        approve_res = self.client.post(f'/api/jobs/{new_job_id}/approve/')
        self.assertEqual(approve_res.status_code, status.HTTP_200_OK)
        self.assertEqual(approve_res.data['status'], 'ACTIVE')

    def test_eligibility_check(self):
        # Eligible student
        self.client.force_authenticate(user=self.student_user)
        res1 = self.client.get(f'/api/jobs/{self.job.id}/eligibility/')
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertTrue(res1.data['is_eligible'])
        self.assertFalse(res1.data['already_applied'])

        # Ineligible student (low CGPA & backlogs)
        self.client.force_authenticate(user=self.student2_user)
        res2 = self.client.get(f'/api/jobs/{self.job.id}/eligibility/')
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        self.assertFalse(res2.data['is_eligible'])
        self.assertTrue(len(res2.data['reasons']) >= 1)

    def test_application_creation_and_duplicate_prevention(self):
        # Ineligible student trying to apply should be rejected
        self.client.force_authenticate(user=self.student2_user)
        fail_res = self.client.post('/api/applications/', {'job_id': self.job.id})
        self.assertEqual(fail_res.status_code, status.HTTP_400_BAD_REQUEST)

        # Eligible student applies successfully
        self.client.force_authenticate(user=self.student_user)
        success_res = self.client.post('/api/applications/', {
            'job_id': self.job.id,
            'cover_letter': 'Very excited to join!'
        })
        self.assertEqual(success_res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(success_res.data['status'], 'APPLIED')

        # Duplicate application attempt
        dup_res = self.client.post('/api/applications/', {'job_id': self.job.id})
        self.assertEqual(dup_res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_interview_scheduling_updates_status(self):
        # Student applies
        app = Application.objects.create(student=self.student_profile, job=self.job, status='SHORTLISTED')

        # Recruiter schedules interview
        self.client.force_authenticate(user=self.recruiter_user)
        interview_data = {
            'application_id': app.id,
            'interview_date': str(date.today() + timedelta(days=3)),
            'interview_time': '10:30:00',
            'interview_type': 'ONLINE',
            'location_or_link': 'https://meet.google.com/test-room',
            'notes': 'Bring technical design examples'
        }
        res = self.client.post('/api/interviews/', interview_data)
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Check app status automatically changed to INTERVIEW_SCHEDULED
        app.refresh_from_db()
        self.assertEqual(app.status, 'INTERVIEW_SCHEDULED')

        # Check notification created for student
        notif = Notification.objects.filter(user=self.student_user, title__icontains='Interview Scheduled')
        self.assertTrue(notif.exists())

    def test_selection_updates_student_placement_status(self):
        app = Application.objects.create(student=self.student_profile, job=self.job, status='INTERVIEW_SCHEDULED')
        self.assertEqual(self.student_profile.placement_status, 'NOT_PLACED')

        # Recruiter selects student
        self.client.force_authenticate(user=self.recruiter_user)
        res = self.client.post(f'/api/applications/{app.id}/update_status/', {'status': 'SELECTED'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        self.student_profile.refresh_from_db()
        self.assertEqual(self.student_profile.placement_status, 'PLACED')

    def test_role_based_permissions(self):
        # Student cannot access admin analytics
        self.client.force_authenticate(user=self.student_user)
        res = self.client.get('/api/analytics/admin/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Student cannot approve companies
        res2 = self.client.post(f'/api/companies/{self.company.id}/approve/')
        self.assertEqual(res2.status_code, status.HTTP_403_FORBIDDEN)

        # Recruiter cannot access admin analytics
        self.client.force_authenticate(user=self.recruiter_user)
        res3 = self.client.get('/api/analytics/admin/')
        self.assertEqual(res3.status_code, status.HTTP_403_FORBIDDEN)

        # Admin can access admin analytics
        self.client.force_authenticate(user=self.admin_user)
        res4 = self.client.get('/api/analytics/admin/')
        self.assertEqual(res4.status_code, status.HTTP_200_OK)
        self.assertIn('overview', res4.data)
