# ?? CampusConnect ? College Placement Management System

CampusConnect is a production-style, full-stack College Placement Management System built for internship project reviews, viva presentations, and real-world campus recruitment operations. It connects **Students**, **Corporate Recruiters**, and **Placement Officers / Administrators** into a unified, role-governed platform.

---

## ?? Key Features

### ????? Student Portal
- **Dynamic Profile Engine**: Calculates profile completion score dynamically (personal info, academic details, verified CGPA, 10th/12th percentages, active backlogs, skills tags, projects, internships, certifications, resume link, and social profiles).
- **Rule-Based Eligibility Checker**: Automated eligibility verification evaluating Student CGPA $\ge$ Minimum CGPA, Department matches, Backlog limitations, and Application Deadlines with clear feedback reasons.
- **Placement Drive Discovery**: Multi-filter job search with live search, department filter, location filter, salary filter, and pagination.
- **1-Click Application Flow**: Apply directly with an optional cover note while preventing duplicate submissions.
- **Application & Interview Tracker**: Real-time status pipeline (`APPLIED` ? `UNDER_REVIEW` ? `SHORTLISTED` ? `INTERVIEW_SCHEDULED` ? `SELECTED` / `REJECTED`).
- **Interactive Interview Calendar**: Direct access to Google Meet / Zoom links or campus interview hall venues and recruiter notes.

### ?? Corporate Recruiter Portal
- **Company Verification Workflow**: Register and edit corporate details (overview, industry, headquarters, website, contact person, logo). Company must be approved by the Placement Officer before job drives go live.
- **Granular Job Drive Publishing**: Create campus job openings specifying salary range in LPA, job type, minimum CGPA, eligible branches/departments, graduation year, maximum allowed backlogs, and required technical skills.
- **Candidate Pipeline Review**: Screen applicants with detailed profile modals, preview resume links, shortlist candidates, or schedule interview rounds.
- **Integrated Interview Scheduler**: Schedule online or on-campus interviews with date, time, interview type, link, and preparation notes. Scheduling an interview automatically updates application status and sends student notifications.
- **One-Click Hiring & Offer Extension**: Selecting a candidate automatically marks the student profile as `PLACED`.

### ??? Placement Officer / Admin Control Center
- **Executive Operations Dashboard**: Real-time high-level KPIs covering Total Students, Companies, Active Drives, Applications, Placed Count, and Average / Highest CTC.
- **One-Click Approvals**: Review and approve/reject pending company registrations and pending job drives.
- **Comprehensive Student Directory**: Search students, filter by department and CGPA, view complete profiles, and toggle user active/inactive status.
- **Live Visual Analytics (Recharts)**:
  - Department-wise placement distribution (Enrolled vs Placed).
  - Placed vs Not Placed ratio donut chart.
  - Application funnel stages breakdown.
  - Compensation tier distribution (<6 LPA, 6?10 LPA, 10?15 LPA, 15?20 LPA, 20+ LPA).
  - Top hiring partners ranked by offers extended.

---

## ??? Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, JavaScript (ES6+), Tailwind CSS, Lucide React, Recharts, Axios, React Router v6 |
| **Backend** | Python 3, Django 6, Django REST Framework (DRF), SimpleJWT, Django CORS Headers |
| **Database** | Dual Architecture: **MySQL** (Production-ready via PyMySQL) with **SQLite** zero-config development fallback |
| **Authentication** | JWT (Access & Refresh tokens) with Role-Based Access Control (`STUDENT`, `RECRUITER`, `ADMIN`) |
| **Version Control** | Git, GitHub-ready architecture |

---

## ?? Project Structure

```
CampusConnect/
?
??? backend/
?   ??? manage.py
?   ??? requirements.txt
?   ??? .env.example
?   ??? .env
?   ??? config/              # Core Django settings, URLs, ASGI, WSGI
?   ??? accounts/            # Custom User model (roles), JWT serializers & views
?   ??? students/            # Department, Skill, StudentProfile, StudentSkill models
?   ??? recruiters/          # RecruiterProfile model and company binding
?   ??? companies/           # Company model, admin approvals
?   ??? jobs/                # Job model, automated eligibility verification engine
?   ??? applications/        # Application model, status transitions, duplicate checks
?   ??? interviews/          # Interview schedule, auto-status updates, notifications
?   ??? notifications/       # User notifications system
?   ??? analytics/           # Live database aggregation and analytics APIs
?   ??? tests/               # Automated unit & integration tests
?
??? frontend/
?   ??? package.json
?   ??? vite.config.js
?   ??? tailwind.config.js
?   ??? postcss.config.js
?   ??? index.html
?   ??? src/
?       ??? api/             # Axios client with JWT interceptor & auto token refresh
?       ??? context/         # AuthContext (user, role, tokens, login, logout)
?       ??? components/      # Navbar, Footer, Sidebar, Topbar, Modals, StatusBadge, Toast
?       ??? layouts/         # PublicLayout, DashboardLayout
?       ??? pages/
?           ??? public/      # LandingPage, LoginPage, RegisterPage, ExploreJobsPage
?           ??? student/     # StudentDashboard, StudentProfile, JobSearch, JobDetails, MyApplications, StudentInterviews
?           ??? recruiter/   # RecruiterDashboard, CompanyProfile, PostJob, MyJobs, JobApplicants, RecruiterInterviews
?           ??? admin/       # AdminDashboard, AdminStudents, AdminCompanies, AdminJobs, AdminApplications, AdminInterviews, AdminAnalytics
?
??? verify_workflow.py       # End-to-end 19-step automated integration test script
??? README.md
```

---

## ?? Demo Login Credentials

For testing and external viva demonstration, use the development credentials below (Password: `Password@123`):

| Role | Username / Email | Password | Dashboard Route |
|---|---|---|---|
| **Placement Officer / Admin** | `admin@campusconnect.com` (or `admin`) | `Password@123` | `/admin/dashboard` |
| **Corporate Recruiter** | `recruiter@technova.com` | `Password@123` | `/recruiter/dashboard` |
| **Student Candidate** | `student@campusconnect.com` | `Password@123` | `/student/dashboard` |

> [!TIP]
> The login page features **1-Click Quick Demo Login** buttons for Instant Admin, Recruiter, or Student authentication during project demonstrations.

---

## ? Quick Start Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

---

### Step 1: Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. (Optional) Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
5. Seed realistic sample data (30 students, 5 recruiters, 5 companies, 10 jobs, 50 applications, 10 interviews, sample notifications):
   ```bash
   python manage.py seed_data
   ```
6. Start the Django backend development server:
   ```bash
   python manage.py runserver 127.0.0.1:8000
   ```
   *The backend will be running at: `http://127.0.0.1:8000/`*

---

### Step 2: Database Configuration (SQLite vs MySQL)

The backend is built with dual database support.

#### Running with SQLite (Default, Zero-Setup)
In `backend/.env`, keep:
```env
USE_MYSQL=False
```
Django will automatically use `db.sqlite3`.

#### Switching to MySQL (Production)
1. Ensure MySQL server is running (e.g., via XAMPP, WampServer, or MySQL service).
2. Create the database:
   ```sql
   CREATE DATABASE campusconnect_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
3. Update `backend/.env`:
   ```env
   USE_MYSQL=True
   DATABASE_NAME=campusconnect_db
   DATABASE_USER=root
   DATABASE_PASSWORD=your_mysql_password
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   ```
4. Apply migrations and seed data into MySQL:
   ```bash
   python manage.py migrate
   python manage.py seed_data
   ```

---

### Step 3: Frontend Setup

1. Open another terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running at: `http://localhost:5173/`*

---

## ?? Testing and Verification

### 1. Automated Backend Unit & Integration Tests
Run Django's built-in test runner covering registration, JWT auth, job creation, admin approvals, eligibility engine, duplicate application prevention, and role-based permissions:
```bash
cd backend
python manage.py test tests
```

### 2. End-to-End 19-Step Demo Workflow Verification
Run the automated integration script verifying the entire end-to-end recruitment lifecycle against the live server:
```bash
python verify_workflow.py
```
This tests:
1. Admin login
2. Admin dashboard view
3. Admin company approval (NextGen Software)
4. Recruiter login
5. Recruiter job creation (status: `PENDING_APPROVAL`)
6. Admin job approval (status becomes `ACTIVE`)
7. Student login
8. Student profile update (completion score recalculation)
9. Student job search & discovery
10. Student job details inspection
11. Eligibility rule evaluation (CGPA, Branch, Backlogs, Deadline)
12. Student application submission
13. Recruiter applicant queue discovery
14. Recruiter candidate shortlisting
15. Recruiter interview scheduling (auto status update to `INTERVIEW_SCHEDULED` + student notification)
16. Student interview calendar display
17. Recruiter candidate selection (`SELECTED`)
18. Student placement status transition to `PLACED`
19. Admin analytics automatic metric increment

---

## ?? Important REST API Endpoints

| Method | Endpoint | Description | Role / Access |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register student or recruiter account | Public |
| `POST` | `/api/auth/login/` | Obtain JWT access and refresh tokens | Public |
| `POST` | `/api/auth/token/refresh/` | Refresh JWT access token | Authenticated |
| `GET` | `/api/auth/me/` | Fetch current user & profile details | Authenticated |
| `POST` | `/api/auth/users/<id>/toggle-status/` | Toggle user active/inactive status | Admin |
| `GET`, `PUT` | `/api/students/profile/` | View or update student profile | Student |
| `GET` | `/api/students/departments/` | List college engineering departments | Public |
| `GET` | `/api/students/admin/all/` | Student directory with CGPA & branch filters | Admin |
| `GET` | `/api/companies/` | List approved companies | Public / Authenticated |
| `POST` | `/api/companies/<id>/approve/` | Approve company registration | Admin |
| `POST` | `/api/companies/<id>/reject/` | Reject company registration | Admin |
| `GET` | `/api/companies/my_company/` | View recruiter's company profile | Recruiter |
| `GET` | `/api/jobs/` | List active jobs with search & filters | Public / Authenticated |
| `POST` | `/api/jobs/` | Post new job (Draft or Pending Approval) | Recruiter |
| `POST` | `/api/jobs/<id>/approve/` | Approve job posting | Admin |
| `POST` | `/api/jobs/<id>/close/` | Close job posting | Recruiter / Admin |
| `GET` | `/api/jobs/<id>/eligibility/` | Evaluate student eligibility for job | Student |
| `GET`, `POST` | `/api/applications/` | List or submit applications | Authenticated |
| `POST` | `/api/applications/<id>/update_status/` | Update status (`SHORTLISTED`, `SELECTED`, `REJECTED`) | Recruiter / Admin |
| `GET`, `POST` | `/api/interviews/` | View or schedule candidate interviews | Authenticated |
| `GET` | `/api/notifications/` | View user notifications | Authenticated |
| `POST` | `/api/notifications/mark_all_read/` | Mark all notifications read | Authenticated |
| `GET` | `/api/analytics/admin/` | Live placement aggregates & Recharts data | Admin |
| `GET` | `/api/analytics/student-dashboard/` | Student dashboard metrics | Student |
| `GET` | `/api/analytics/recruiter-dashboard/` | Recruiter funnel metrics | Recruiter |

---

## ?? Future Enhancements
- Resume AI parsing and automated skill extraction.
- In-app real-time chat between recruiters and candidates.
- WhatsApp & SMS notifications via Twilio gateway.
- Automated proctored online coding assessment integration.

---

## ????? Author & Project Credits
- **Project Name**: CampusConnect
- **Domain**: Python Full Stack Internship Project
- **Reviewed For**: College Placement Cell & Viva Examination
