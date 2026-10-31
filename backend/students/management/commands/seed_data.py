import random
from datetime import date, timedelta
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from accounts.models import User
from students.models import Department, Skill, StudentProfile, StudentSkill
from companies.models import Company
from recruiters.models import RecruiterProfile
from jobs.models import Job
from applications.models import Application
from interviews.models import Interview
from notifications.models import Notification

class Command(BaseCommand):
    help = 'Seeds realistic sample data for CampusConnect placement management system'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Starting CampusConnect database seeding...'))

        PASSWORD = 'Password@123'

        # 1. Create Departments
        departments_data = [
            ('Computer Science & Engineering', 'CSE'),
            ('Artificial Intelligence & Machine Learning', 'AIML'),
            ('Electronics & Communication Engineering', 'ECE'),
            ('Electrical & Electronics Engineering', 'EEE'),
            ('Information Technology', 'IT'),
            ('Mechanical Engineering', 'MECH'),
            ('Civil Engineering', 'CIVIL'),
        ]
        dept_objs = {}
        for name, code in departments_data:
            dept, _ = Department.objects.get_or_create(code=code, defaults={'name': name})
            dept_objs[code] = dept
        self.stdout.write(self.style.SUCCESS(f'Created {len(dept_objs)} Departments.'))

        # 2. Create Skills
        skills_list = [
            'Python', 'Django', 'React', 'JavaScript', 'TypeScript', 'Node.js',
            'Java', 'Spring Boot', 'SQL', 'MySQL', 'MongoDB', 'PostgreSQL',
            'Machine Learning', 'Data Analysis', 'Docker', 'AWS', 'Kubernetes',
            'Git', 'REST APIs', 'Tailwind CSS', 'C++', 'Data Structures'
        ]
        skill_objs = {}
        for name in skills_list:
            skill, _ = Skill.objects.get_or_create(name=name)
            skill_objs[name] = skill
        self.stdout.write(self.style.SUCCESS(f'Created {len(skill_objs)} Skills.'))

        # 3. Create Admin Demo Account
        admin_email = 'admin@campusconnect.com'
        admin_user, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': admin_email,
                'first_name': 'Prof. Rajesh',
                'last_name': 'Sharma',
                'role': 'ADMIN',
                'is_staff': True,
                'is_superuser': True,
                'phone': '+91 98765 43210'
            }
        )
        admin_user.set_password(PASSWORD)
        admin_user.save()
        self.stdout.write(self.style.SUCCESS(f'Admin account verified: {admin_email}'))

        # 4. Create 5 Companies
        companies_data = [
            {
                'name': 'TechNova Solutions',
                'description': 'Leading enterprise software consultancy specialized in cloud architectures and full-stack enterprise solutions.',
                'industry': 'Software & Cloud Services',
                'location': 'Bangalore, India',
                'website': 'https://technova.example.com',
                'contact_person': 'Ananya Verma',
                'contact_email': 'careers@technova.example.com',
                'approval_status': 'APPROVED',
            },
            {
                'name': 'DataBridge Systems',
                'description': 'Cutting-edge data analytics and AI infrastructure provider serving Fortune 500 fintech and healthcare partners.',
                'industry': 'Data & Artificial Intelligence',
                'location': 'Hyderabad, India',
                'website': 'https://databridge.example.com',
                'contact_person': 'Siddharth Roy',
                'contact_email': 'talent@databridge.example.com',
                'approval_status': 'APPROVED',
            },
            {
                'name': 'CloudCore Technologies',
                'description': 'Pioneering cloud computing, devops automation and edge orchestration for scalable internet products.',
                'industry': 'Cloud Infrastructure & DevOps',
                'location': 'Pune, India',
                'website': 'https://cloudcore.example.com',
                'contact_person': 'Neha Kulkarni',
                'contact_email': 'hr@cloudcore.example.com',
                'approval_status': 'APPROVED',
            },
            {
                'name': 'InnovateLabs',
                'description': 'High-growth product studio building modern generative AI and SaaS developer tools.',
                'industry': 'Product Development & SaaS',
                'location': 'Gurgaon, India',
                'website': 'https://innovatelabs.example.com',
                'contact_person': 'Vikram Malhotra',
                'contact_email': 'jobs@innovatelabs.example.com',
                'approval_status': 'APPROVED',
            },
            {
                'name': 'NextGen Software',
                'description': 'Global financial technology engineering firm building robust high-frequency transactional systems.',
                'industry': 'FinTech & Embedded Systems',
                'location': 'Chennai, India',
                'website': 'https://nextgen.example.com',
                'contact_person': 'Deepika Nair',
                'contact_email': 'campus@nextgen.example.com',
                'approval_status': 'PENDING',
            },
        ]

        company_objs = []
        for cdata in companies_data:
            comp, _ = Company.objects.get_or_create(
                name=cdata['name'],
                defaults=cdata
            )
            company_objs.append(comp)
        self.stdout.write(self.style.SUCCESS(f'Created {len(company_objs)} Companies.'))

        # 5. Create 5 Recruiters
        recruiter_profiles = []
        # Recruiter 1: Main Demo Recruiter
        r1_user, _ = User.objects.get_or_create(
            username='recruiter_technova',
            defaults={
                'email': 'recruiter@technova.com',
                'first_name': 'Ananya',
                'last_name': 'Verma',
                'role': 'RECRUITER',
                'phone': '+91 91234 56789'
            }
        )
        r1_user.set_password(PASSWORD)
        r1_user.save()
        r1_prof, _ = RecruiterProfile.objects.get_or_create(
            user=r1_user,
            defaults={
                'company': company_objs[0],
                'designation': 'Lead University Recruiter',
                'phone': '+91 91234 56789'
            }
        )
        recruiter_profiles.append(r1_prof)

        # Other 4 recruiters
        recruiter_specs = [
            ('recruiter_databridge', 'siddharth@databridge.com', 'Siddharth', 'Roy', company_objs[1], 'Head of Campus Hiring'),
            ('recruiter_cloudcore', 'neha@cloudcore.com', 'Neha', 'Kulkarni', company_objs[2], 'Senior Technical Recruiter'),
            ('recruiter_innovatelabs', 'vikram@innovatelabs.com', 'Vikram', 'Malhotra', company_objs[3], 'Talent Acquisition Partner'),
            ('recruiter_nextgen', 'deepika@nextgen.com', 'Deepika', 'Nair', company_objs[4], 'HR Manager'),
        ]
        for uname, uemail, ufname, ulname, comp, desig in recruiter_specs:
            ru, _ = User.objects.get_or_create(
                username=uname,
                defaults={
                    'email': uemail,
                    'first_name': ufname,
                    'last_name': ulname,
                    'role': 'RECRUITER',
                    'phone': '+91 98000 11223'
                }
            )
            ru.set_password(PASSWORD)
            ru.save()
            rp, _ = RecruiterProfile.objects.get_or_create(
                user=ru,
                defaults={'company': comp, 'designation': desig, 'phone': '+91 98000 11223'}
            )
            recruiter_profiles.append(rp)
        self.stdout.write(self.style.SUCCESS(f'Created {len(recruiter_profiles)} Recruiters.'))

        # 6. Create 30 Students
        student_names = [
            ('Aarav', 'Patel', 'CSE', 8.8, 0),
            ('Aditi', 'Rao', 'AIML', 9.2, 0),
            ('Rohan', 'Deshmukh', 'ECE', 7.8, 0),
            ('Sneha', 'Iyer', 'IT', 8.5, 0),
            ('Karan', 'Mehta', 'CSE', 7.2, 1),
            ('Pooja', 'Gupta', 'AIML', 8.9, 0),
            ('Rahul', 'Nair', 'EEE', 6.9, 0),
            ('Ananya', 'Sen', 'IT', 9.4, 0),
            ('Varun', 'Reddy', 'CSE', 8.1, 0),
            ('Priya', 'Chopra', 'ECE', 8.3, 0),
            ('Siddharth', 'Bhat', 'MECH', 7.5, 0),
            ('Kavya', 'Menon', 'CSE', 9.0, 0),
            ('Nikhil', 'Joshi', 'IT', 7.4, 0),
            ('Tanvi', 'Kulkarni', 'AIML', 8.7, 0),
            ('Arjun', 'Kapoor', 'CIVIL', 6.8, 1),
            ('Ishita', 'Bansal', 'CSE', 8.4, 0),
            ('Gaurav', 'Saxena', 'ECE', 7.1, 0),
            ('Divya', 'Pillai', 'EEE', 7.6, 0),
            ('Manish', 'Tiwari', 'IT', 8.0, 0),
            ('Rhea', 'Mukherjee', 'AIML', 9.1, 0),
            ('Akash', 'Verma', 'MECH', 7.0, 0),
            ('Shreya', 'Gowda', 'CSE', 8.6, 0),
            ('Harish', 'Krishnan', 'ECE', 7.7, 0),
            ('Anjali', 'Pandey', 'CIVIL', 6.5, 0),
            ('Kunal', 'Singhal', 'IT', 8.2, 0),
            ('Meera', 'Rangan', 'AIML', 9.5, 0),
            ('Vikrant', 'Chauhan', 'CSE', 7.9, 0),
            ('Swati', 'Mishra', 'EEE', 7.3, 0),
            ('Pranav', 'Sethi', 'MECH', 6.7, 0),
            ('Demo', 'Student', 'CSE', 8.5, 0), # Will be mapped to student@campusconnect.com
        ]

        student_profiles = []
        for i, (first, last, d_code, cgpa, backlogs) in enumerate(student_names, start=1):
            if first == 'Demo' and last == 'Student':
                username = 'student'
                email = 'student@campusconnect.com'
                roll = '22CS1001'
            else:
                username = f"student_{first.lower()}_{i}"
                email = f"{first.lower()}.{last.lower()}{i}@campus.edu"
                roll = f"22{d_code[:2]}{1000 + i}"

            stu_user, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': email,
                    'first_name': first,
                    'last_name': last,
                    'role': 'STUDENT',
                    'phone': f"+91 98{i:02d}0 12345"
                }
            )
            stu_user.set_password(PASSWORD)
            stu_user.save()

            dept = dept_objs.get(d_code, dept_objs['CSE'])
            prof, _ = StudentProfile.objects.get_or_create(
                user=stu_user,
                defaults={
                    'roll_number': roll,
                    'phone': f"+91 98{i:02d}0 12345",
                    'date_of_birth': date(2003, 1 + (i % 12), 1 + (i % 25)),
                    'gender': 'FEMALE' if i % 2 == 0 else 'MALE',
                    'address': f"Flat {100+i}, Campus Palms Residency, Tech Park Road",
                    'department': dept,
                    'graduation_year': 2026,
                    'cgpa': cgpa,
                    'tenth_percentage': round(80.0 + (i % 18), 1),
                    'twelfth_percentage': round(78.0 + (i % 19), 1),
                    'backlogs': backlogs,
                    'github_url': f"https://github.com/{username}",
                    'linkedin_url': f"https://linkedin.com/in/{username}",
                    'resume_url': f"https://example.com/resumes/{username}.pdf",
                    'projects_info': 'AI Placement Portal using Django & React; Distributed Cache in Go',
                    'internships_info': 'Summer Intern at WebCraft Labs (2 months)',
                    'certifications_info': 'AWS Certified Cloud Practitioner, Meta Front-End Developer',
                    'placement_status': 'NOT_PLACED'
                }
            )

            # Assign 3-4 skills
            skills_pool = ['Python', 'React', 'JavaScript', 'SQL', 'Git', 'Data Structures', 'REST APIs', 'Java']
            assigned_skills = random.sample(skills_pool, 4)
            for sname in assigned_skills:
                StudentSkill.objects.get_or_create(student=prof, skill=skill_objs[sname])

            prof.save()
            student_profiles.append(prof)

        self.stdout.write(self.style.SUCCESS(f'Created {len(student_profiles)} Students with profiles.'))

        # 7. Create 10 Jobs
        jobs_data = [
            {
                'company': company_objs[0],
                'title': 'Full Stack Developer',
                'description': 'Build high performance customer-facing applications using React, Python/Django and PostgreSQL. Work in agile sprints.',
                'responsibilities': 'Develop scalable REST APIs, implement responsive frontends with React and Tailwind, write unit tests and participate in code reviews.',
                'location': 'Bangalore, India',
                'salary_min': 10.0,
                'salary_max': 14.5,
                'job_type': 'FULL_TIME',
                'minimum_cgpa': 7.5,
                'eligible_depts': ['CSE', 'AIML', 'IT', 'ECE'],
                'graduation_year': 2026,
                'maximum_backlogs': 0,
                'deadline_days': 20,
                'skills': ['Python', 'Django', 'React', 'SQL', 'Git'],
                'status': 'ACTIVE',
                'created_by': r1_user,
            },
            {
                'company': company_objs[0],
                'title': 'Python Developer',
                'description': 'Develop backend services, automated data extraction pipelines, and microservices for cloud workloads.',
                'responsibilities': 'Architect REST APIs, design database schemas, tune query performance, implement caching strategies with Redis.',
                'location': 'Bangalore / Remote',
                'salary_min': 8.5,
                'salary_max': 12.0,
                'job_type': 'FULL_TIME',
                'minimum_cgpa': 7.0,
                'eligible_depts': ['CSE', 'AIML', 'IT'],
                'graduation_year': 2026,
                'maximum_backlogs': 0,
                'deadline_days': 25,
                'skills': ['Python', 'Django', 'REST APIs', 'PostgreSQL'],
                'status': 'ACTIVE',
                'created_by': r1_user,
            },
            {
                'company': company_objs[1],
                'title': 'Data Analyst',
                'description': 'Extract insights from large scale transactional datasets, build executive dashboards, and drive business decision-making.',
                'responsibilities': 'Write complex SQL queries, build predictive models, design visual reports, and collaborate with product managers.',
                'location': 'Hyderabad, India',
                'salary_min': 7.5,
                'salary_max': 11.0,
                'job_type': 'FULL_TIME',
                'minimum_cgpa': 6.5,
                'eligible_depts': ['CSE', 'AIML', 'IT', 'ECE', 'EEE'],
                'graduation_year': 2026,
                'maximum_backlogs': 0,
                'deadline_days': 18,
                'skills': ['Python', 'Data Analysis', 'SQL', 'Machine Learning'],
                'status': 'ACTIVE',
                'created_by': recruiter_profiles[1].user,
            },
            {
                'company': company_objs[1],
                'title': 'Machine Learning Engineer',
                'description': 'Train and deploy deep learning and NLP models on enterprise Kubernetes clusters for real-time inference.',
                'responsibilities': 'Fine-tune LLMs, build vector search systems, optimize model inference latency, and monitor drift in production.',
                'location': 'Hyderabad, India',
                'salary_min': 14.0,
                'salary_max': 22.0,
                'job_type': 'FULL_TIME',
                'minimum_cgpa': 8.0,
                'eligible_depts': ['CSE', 'AIML', 'IT'],
                'graduation_year': 2026,
                'maximum_backlogs': 0,
                'deadline_days': 15,
                'skills': ['Python', 'Machine Learning', 'Docker', 'AWS'],
                'status': 'ACTIVE',
                'created_by': recruiter_profiles[1].user,
            },
            {
                'company': company_objs[2],
                'title': 'Cloud DevOps Engineer',
                'description': 'Manage multi-region AWS cloud infrastructure, configure CI/CD pipelines, and ensure 99.99% system availability.',
                'responsibilities': 'Implement Terraform infrastructure-as-code, maintain Kubernetes clusters, configure Prometheus/Grafana alerting.',
                'location': 'Pune, India',
                'salary_min': 9.0,
                'salary_max': 15.0,
                'job_type': 'FULL_TIME',
                'minimum_cgpa': 7.0,
                'eligible_depts': ['CSE', 'IT', 'ECE', 'EEE'],
                'graduation_year': 2026,
                'maximum_backlogs': 0,
                'deadline_days': 30,
                'skills': ['Docker', 'AWS', 'Kubernetes', 'Git'],
                'status': 'ACTIVE',
                'created_by': recruiter_profiles[2].user,
            },
            {
                'company': company_objs[2],
                'title': 'Backend Developer',
                'description': 'Engineer high-throughput transactional backends handling millions of requests per day.',
                'responsibilities': 'Develop resilient microservices, integrate message queues, and maintain data consistency across distributed systems.',
                'location': 'Pune / Hybrid',
                'salary_min': 8.0,
                'salary_max': 13.0,
                'job_type': 'FULL_TIME',
                'minimum_cgpa': 7.0,
                'eligible_depts': ['CSE', 'AIML', 'IT'],
                'graduation_year': 2026,
                'maximum_backlogs': 0,
                'deadline_days': 21,
                'skills': ['Python', 'SQL', 'REST APIs', 'Git'],
                'status': 'ACTIVE',
                'created_by': recruiter_profiles[2].user,
            },
            {
                'company': company_objs[3],
                'title': 'Frontend React Engineer',
                'description': 'Craft pixel-perfect user interfaces, interactive component libraries, and blazing-fast web applications.',
                'responsibilities': 'Build modern web applications with React, TypeScript, and Tailwind CSS. Ensure cross-browser compatibility and accessibility.',
                'location': 'Gurgaon, India',
                'salary_min': 8.0,
                'salary_max': 12.5,
                'job_type': 'FULL_TIME',
                'minimum_cgpa': 6.5,
                'eligible_depts': ['CSE', 'AIML', 'IT', 'ECE'],
                'graduation_year': 2026,
                'maximum_backlogs': 0,
                'deadline_days': 28,
                'skills': ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS'],
                'status': 'ACTIVE',
                'created_by': recruiter_profiles[3].user,
            },
            {
                'company': company_objs[3],
                'title': 'Software Engineer Intern',
                'description': '6-month paid internship with fast-track conversion to full-time SDE. Mentored by senior engineering staff.',
                'responsibilities': 'Collaborate with full-stack teams to build features, fix bugs, write automated tests, and learn engineering best practices.',
                'location': 'Gurgaon / Remote',
                'salary_min': 4.5,
                'salary_max': 6.0,
                'job_type': 'INTERNSHIP',
                'minimum_cgpa': 6.0,
                'eligible_depts': ['CSE', 'AIML', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL'],
                'graduation_year': 2026,
                'maximum_backlogs': 1,
                'deadline_days': 14,
                'skills': ['Python', 'JavaScript', 'Git'],
                'status': 'ACTIVE',
                'created_by': recruiter_profiles[3].user,
            },
            {
                'company': company_objs[4],
                'title': 'Java Developer',
                'description': 'Enterprise banking solutions developer working with Spring Boot, Kafka, and Oracle databases.',
                'responsibilities': 'Develop mission-critical banking APIs, write unit and integration tests, optimize relational queries.',
                'location': 'Chennai, India',
                'salary_min': 9.5,
                'salary_max': 16.0,
                'job_type': 'FULL_TIME',
                'minimum_cgpa': 7.5,
                'eligible_depts': ['CSE', 'IT', 'ECE'],
                'graduation_year': 2026,
                'maximum_backlogs': 0,
                'deadline_days': 35,
                'skills': ['Java', 'Spring Boot', 'SQL'],
                'status': 'PENDING_APPROVAL', # Will be demonstrated in Admin approval flow!
                'created_by': recruiter_profiles[4].user,
            },
            {
                'company': company_objs[0],
                'title': 'QA Automation Engineer',
                'description': 'Build automated test suites covering UI, API, and load testing for enterprise client deployments.',
                'responsibilities': 'Develop test frameworks, execute regression cycles, log bugs in JIRA, and verify release stability.',
                'location': 'Bangalore, India',
                'salary_min': 6.5,
                'salary_max': 9.5,
                'job_type': 'FULL_TIME',
                'minimum_cgpa': 6.5,
                'eligible_depts': ['CSE', 'IT', 'ECE', 'EEE'],
                'graduation_year': 2026,
                'maximum_backlogs': 0,
                'deadline_days': 10,
                'skills': ['Python', 'JavaScript', 'Git'],
                'status': 'ACTIVE',
                'created_by': r1_user,
            },
        ]

        created_jobs = []
        for jdata in jobs_data:
            depts = [dept_objs[c] for c in jdata.pop('eligible_depts')]
            skills = [skill_objs[s] for s in jdata.pop('skills')]
            deadline_days = jdata.pop('deadline_days')
            deadline = date.today() + timedelta(days=deadline_days)

            job, _ = Job.objects.get_or_create(
                company=jdata['company'],
                title=jdata['title'],
                defaults={
                    **jdata,
                    'application_deadline': deadline,
                }
            )
            job.eligible_departments.set(depts)
            job.required_skills.set(skills)
            created_jobs.append(job)

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_jobs)} Jobs.'))

        # 8. Create 50 Applications across realistic statuses
        # Status distribution:
        # 10 SELECTED
        # 10 INTERVIEW_SCHEDULED
        # 12 SHORTLISTED
        # 8 UNDER_REVIEW
        # 6 APPLIED
        # 4 REJECTED
        statuses = (
            ['SELECTED'] * 10 +
            ['INTERVIEW_SCHEDULED'] * 10 +
            ['SHORTLISTED'] * 12 +
            ['UNDER_REVIEW'] * 8 +
            ['APPLIED'] * 6 +
            ['REJECTED'] * 4
        )
        random.shuffle(statuses)

        active_jobs = [j for j in created_jobs if j.status == 'ACTIVE']
        created_apps = []
        app_count = 0

        # Create applications ensuring student meets criteria
        for student in student_profiles:
            for job in active_jobs:
                if app_count >= 50:
                    break
                # Check department eligibility
                if job.eligible_departments.filter(id=student.department_id).exists():
                    if float(student.cgpa) >= float(job.minimum_cgpa) and student.backlogs <= job.maximum_backlogs:
                        if not Application.objects.filter(student=student, job=job).exists():
                            status_choice = statuses[app_count % len(statuses)]
                            app = Application.objects.create(
                                student=student,
                                job=job,
                                status=status_choice,
                                resume_url=student.resume_url,
                                cover_letter="I am excited to apply for this opportunity and contribute my full-stack skills."
                            )
                            created_apps.append(app)
                            app_count += 1

                            # If selected, update student placement status
                            if status_choice == 'SELECTED':
                                student.placement_status = 'PLACED'
                                student.save()
            if app_count >= 50:
                break

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_apps)} Applications.'))

        # 9. Create 10 Interviews for INTERVIEW_SCHEDULED or SHORTLISTED applications
        interview_apps = [a for a in created_apps if a.status in ['INTERVIEW_SCHEDULED', 'SHORTLISTED']][:10]
        created_interviews = []
        for i, app in enumerate(interview_apps, start=1):
            itype = 'ONLINE' if i % 2 == 0 else 'TECHNICAL'
            link = f"https://meet.google.com/ccc-{100+i}-xyz" if itype == 'ONLINE' else "Placement Cell Room 302, Campus Block B"
            inv, _ = Interview.objects.get_or_create(
                application=app,
                defaults={
                    'interview_date': date.today() + timedelta(days=2 + i),
                    'interview_time': f"1{i%5}:00:00",
                    'interview_type': itype,
                    'location_or_link': link,
                    'interviewer': 'Senior Engineering Lead',
                    'notes': 'Please be prepared to present your project architecture and solve a coding problem.',
                    'status': 'SCHEDULED'
                }
            )
            # Ensure app status is INTERVIEW_SCHEDULED
            if app.status != 'INTERVIEW_SCHEDULED':
                app.status = 'INTERVIEW_SCHEDULED'
                app.save()
            created_interviews.append(inv)

        self.stdout.write(self.style.SUCCESS(f'Created {len(created_interviews)} Interviews.'))

        # 10. Sample Notifications
        demo_student_user = User.objects.get(email='student@campusconnect.com')
        demo_recruiter_user = User.objects.get(email='recruiter@technova.com')

        notifications_data = [
            (demo_student_user, 'Welcome to CampusConnect!', 'Your placement profile is active. Complete your profile details to unlock 1-click job applications.', 'INFO', '/student/profile'),
            (demo_student_user, 'New Job Alert: Full Stack Developer', 'TechNova Solutions has posted a new Full Stack Developer position matching your skills.', 'SUCCESS', '/student/jobs'),
            (demo_student_user, 'Interview Scheduled', 'Interview scheduled for TechNova Solutions on upcoming Wednesday. Check your interview schedule for meeting link.', 'SUCCESS', '/student/interviews'),
            (demo_recruiter_user, 'Company Approved', 'TechNova Solutions has been approved by the Placement Cell. You can now post jobs and view applicants.', 'SUCCESS', '/recruiter/dashboard'),
            (demo_recruiter_user, 'New Applicant: Aarav Patel', 'Aarav Patel has applied for Full Stack Developer position.', 'INFO', '/recruiter/jobs'),
            (admin_user, 'Company Awaiting Approval', 'NextGen Software submitted registration and is awaiting placement cell verification.', 'WARNING', '/admin/companies'),
            (admin_user, 'Job Awaiting Approval', 'TechNova Solutions submitted a new job: Java Developer.', 'INFO', '/admin/jobs'),
        ]

        for u, title, msg, ntype, nlink in notifications_data:
            Notification.objects.get_or_create(
                user=u,
                title=title,
                defaults={
                    'message': msg,
                    'notification_type': ntype,
                    'link': nlink,
                    'is_read': False
                }
            )

        self.stdout.write(self.style.SUCCESS('Created Sample Notifications.'))
        self.stdout.write(self.style.SUCCESS('\n========================================='))
        self.stdout.write(self.style.SUCCESS('CampusConnect Data Seeding Complete!'))
        self.stdout.write(self.style.SUCCESS('Demo Credentials (Password: Password@123):'))
        self.stdout.write(self.style.SUCCESS(' - Admin: admin@campusconnect.com'))
        self.stdout.write(self.style.SUCCESS(' - Recruiter: recruiter@technova.com'))
        self.stdout.write(self.style.SUCCESS(' - Student: student@campusconnect.com'))
        self.stdout.write(self.style.SUCCESS('=========================================\n'))
