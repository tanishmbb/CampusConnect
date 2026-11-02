import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import User
from students.models import Department, Skill, StudentProfile
from companies.models import Company
from jobs.models import Job
from applications.models import Application
from interviews.models import Interview
from notifications.models import Notification

print("=" * 60)
print("CAMPUSCONNECT ? LIVE BACKEND DATABASE SUMMARY")
print("=" * 60)

print(f"Total Users:            {User.objects.count()}")
print(f" - Students:           {User.objects.filter(role='STUDENT').count()}")
print(f" - Recruiters:         {User.objects.filter(role='RECRUITER').count()}")
print(f" - Admins:             {User.objects.filter(role='ADMIN').count()}")
print(f"Departments:           {Department.objects.count()}")
print(f"Skills:                {Skill.objects.count()}")
print(f"Student Profiles:      {StudentProfile.objects.count()}")
print(f" - Placed Students:    {StudentProfile.objects.filter(placement_status='PLACED').count()}")
print(f" - Not Placed:         {StudentProfile.objects.filter(placement_status='NOT_PLACED').count()}")
print(f"Companies:             {Company.objects.count()}")
print(f" - Approved:           {Company.objects.filter(approval_status='APPROVED').count()}")
print(f" - Pending:            {Company.objects.filter(approval_status='PENDING').count()}")
print(f"Jobs / Drives:         {Job.objects.count()}")
print(f" - Active:             {Job.objects.filter(status='ACTIVE').count()}")
print(f"Applications:          {Application.objects.count()}")
print(f"Interviews Scheduled:  {Interview.objects.count()}")
print(f"Notifications:         {Notification.objects.count()}")

print("\n--- LATEST 5 APPLICATIONS STORED IN DATABASE ---")
for app in Application.objects.select_related('student__user', 'job__company').order_by('-applied_at')[:5]:
    student_name = app.student.user.get_full_name() or app.student.user.username
    print(f"ID {app.id:2d} | Candidate: {student_name:<16} | Role: {app.job.title:<24} | Status: {app.status}")

print("=" * 60)
