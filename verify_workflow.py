import sys
import urllib.request
import urllib.parse
import json

BASE_URL = 'http://127.0.0.1:8000/api'

def request(endpoint, method='GET', data=None, token=None):
    # Properly quote spaces in URL
    if '?' in endpoint:
        path, query = endpoint.split('?', 1)
        kvs = urllib.parse.parse_qsl(query)
        encoded_query = urllib.parse.urlencode(kvs)
        url = f"{BASE_URL}{path}?{encoded_query}"
    else:
        url = f"{BASE_URL}{endpoint}"

    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f"Bearer {token}"
    
    encoded_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=encoded_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_body = response.read().decode('utf-8')
            return response.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        error_body = e.read().decode('utf-8')
        return e.code, json.loads(error_body) if error_body else {}

print("=== STARTING COMPLETE CAMPUSCONNECT DEMO WORKFLOW VERIFICATION ===")

# Step 1: Admin logs in
status, res = request('/auth/login/', method='POST', data={
    'username': 'admin@campusconnect.com',
    'password': 'Password@123'
})
assert status == 200, f"Admin login failed: {res}"
admin_token = res['access']
print("[SUCCESS] 1. Admin logged in successfully.")

# Ensure demo student is reset to NOT_PLACED for idempotent demo test runs
status, students_res = request('/students/admin/all/?search=student@campusconnect.com', token=admin_token)
if status == 200:
    s_list = students_res.get('results', students_res)
    if s_list:
        demo_prof = s_list[0]
        if demo_prof.get('placement_status') == 'PLACED':
            request(f"/students/admin/all/{demo_prof['id']}/", method='PATCH', data={'placement_status': 'NOT_PLACED'}, token=admin_token)

# Step 2: Admin views dashboard & analytics
status, res = request('/analytics/admin/', token=admin_token)
assert status == 200, f"Admin analytics failed: {res}"
initial_placed = res['overview']['placed_students']
print(f"[SUCCESS] 2. Admin dashboard viewed. Currently placed students: {initial_placed}.")

# Step 3: Admin approves pending company
status, res = request('/companies/?approval_status=PENDING', token=admin_token)
assert status == 200
pending_comps = res.get('results', res)
if pending_comps:
    comp_to_approve = pending_comps[0]
    status, res = request(f"/companies/{comp_to_approve['id']}/approve/", method='POST', token=admin_token)
    assert status == 200, f"Approve company failed: {res}"
    print(f"[SUCCESS] 3. Admin approved company: {comp_to_approve['name']}.")
else:
    print("[SUCCESS] 3. Companies already approved.")

# Step 4: Recruiter logs in
status, res = request('/auth/login/', method='POST', data={
    'username': 'recruiter@technova.com',
    'password': 'Password@123'
})
assert status == 200, f"Recruiter login failed: {res}"
recruiter_token = res['access']
print("[SUCCESS] 4. Recruiter logged in successfully.")

# Step 5: Recruiter creates a job
status, depts_res = request('/students/departments/')
assert status == 200
dept_ids = [d['id'] for d in depts_res]

job_payload = {
    'title': 'Senior Python Cloud Engineer',
    'description': 'Design distributed cloud microservices using Django and React.',
    'responsibilities': 'API design, high throughput message queues, cloud deployments.',
    'location': 'Bangalore, India',
    'salary_min': 12.0,
    'salary_max': 18.0,
    'job_type': 'FULL_TIME',
    'minimum_cgpa': 7.5,
    'eligible_department_ids': dept_ids,
    'graduation_year': 2026,
    'maximum_backlogs': 0,
    'application_deadline': '2026-12-31',
    'required_skill_names': ['Python', 'Django', 'Docker'],
    'status': 'PENDING_APPROVAL'
}
status, new_job = request('/jobs/', method='POST', data=job_payload, token=recruiter_token)
assert status == 201, f"Recruiter job creation failed: {new_job}"
job_id = new_job['id']
print(f"[SUCCESS] 5. Recruiter created job '{new_job['title']}' (ID: {job_id}, Status: PENDING_APPROVAL).")

# Step 6: Admin approves the job
status, res = request(f"/jobs/{job_id}/approve/", method='POST', token=admin_token)
assert status == 200, f"Admin job approval failed: {res}"
assert res['status'] == 'ACTIVE'
print(f"[SUCCESS] 6. Admin approved job (ID: {job_id}, Status is now ACTIVE).")

# Step 7: Student logs in
status, res = request('/auth/login/', method='POST', data={
    'username': 'student@campusconnect.com',
    'password': 'Password@123'
})
assert status == 200, f"Student login failed: {res}"
student_token = res['access']
print("[SUCCESS] 7. Student logged in successfully.")

# Step 8: Student updates/completes profile
profile_update = {
    'roll_number': '22CS1001',
    'phone': '+91 98765 00001',
    'cgpa': 8.75,
    'tenth_percentage': 92.5,
    'twelfth_percentage': 89.0,
    'backlogs': 0,
    'graduation_year': 2026,
    'skills_list': ['Python', 'Django', 'React', 'Docker', 'PostgreSQL'],
    'projects_info': 'Engineered CampusConnect with Django and React; Built real-time cache',
    'resume_url': 'https://drive.google.com/demo/student-resume.pdf',
    'github_url': 'https://github.com/campus-student',
    'linkedin_url': 'https://linkedin.com/in/campus-student'
}
status, prof = request('/students/profile/', method='PUT', data=profile_update, token=student_token)
assert status == 200, f"Profile update failed: {prof}"
print(f"[SUCCESS] 8. Student updated profile (Profile Completion: {prof['profile_completion']}%, CGPA: {prof['cgpa']}).")

# Step 9: Student searches for jobs
status, res = request('/jobs/?search=Senior Python Cloud Engineer', token=student_token)
assert status == 200
found_jobs = res.get('results', res)
assert any(j['id'] == job_id for j in found_jobs), "Search did not find newly approved job!"
print("[SUCCESS] 9. Student searched and found newly approved job in listings.")

# Step 10: Student opens job details
status, job_details = request(f"/jobs/{job_id}/", token=student_token)
assert status == 200, f"Failed to retrieve job details: {job_details}"
print(f"[SUCCESS] 10. Student opened job details for '{job_details['title']}'.")

# Step 11: System checks eligibility
status, elig = request(f"/jobs/{job_id}/eligibility/", token=student_token)
assert status == 200
assert elig['is_eligible'] is True, f"Expected student to be eligible, but got: {elig}"
print("[SUCCESS] 11. System evaluated eligibility: Passed (Eligible to Apply).")

# Step 12: Student applies
status, app = request('/applications/', method='POST', data={
    'job_id': job_id,
    'cover_letter': 'Excited to apply for Senior Python Cloud Engineer role!'
}, token=student_token)
assert status == 201, f"Application failed: {app}"
app_id = app['id']
print(f"[SUCCESS] 12. Student submitted application (ID: {app_id}, Status: APPLIED).")

# Step 13: Recruiter sees the application
status, recruiter_apps = request(f"/applications/?job_id={job_id}", token=recruiter_token)
assert status == 200
app_list = recruiter_apps.get('results', recruiter_apps)
assert any(a['id'] == app_id for a in app_list), "Application not found in recruiter queue!"
print("[SUCCESS] 13. Recruiter viewed new applicant in candidate list.")

# Step 14: Recruiter shortlists student
status, res = request(f"/applications/{app_id}/update_status/", method='POST', data={'status': 'SHORTLISTED'}, token=recruiter_token)
assert status == 200
print("[SUCCESS] 14. Recruiter shortlisted candidate.")

# Step 15: Recruiter schedules interview
interview_data = {
    'application_id': app_id,
    'interview_date': '2026-11-05',
    'interview_time': '11:00:00',
    'interview_type': 'ONLINE',
    'location_or_link': 'https://meet.google.com/technova-interview',
    'interviewer': 'Head of Engineering',
    'notes': 'Please be prepared to walk through your system architecture and solve a live coding challenge.'
}
status, interview = request('/interviews/', method='POST', data=interview_data, token=recruiter_token)
assert status == 201, f"Interview scheduling failed: {interview}"
print("[SUCCESS] 15. Recruiter scheduled interview (Application status auto-updated to INTERVIEW_SCHEDULED).")

# Step 16: Student sees interview
status, student_invs = request('/interviews/', token=student_token)
assert status == 200
inv_list = student_invs.get('results', student_invs)
assert any(i['application'] == app_id for i in inv_list), "Student cannot see scheduled interview!"
print("[SUCCESS] 16. Student verified interview appears in their interview schedule.")

# Step 17: Recruiter selects student
status, res = request(f"/applications/{app_id}/update_status/", method='POST', data={'status': 'SELECTED'}, token=recruiter_token)
assert status == 200
print("[SUCCESS] 17. Recruiter marked candidate as SELECTED.")

# Step 18: Student placement status becomes PLACED
status, me = request('/auth/me/', token=student_token)
assert status == 200
assert me['student_profile']['placement_status'] == 'PLACED', f"Expected PLACED, got {me}"
print("[SUCCESS] 18. Student placement status successfully updated to PLACED.")

# Step 19: Admin analytics automatically update
status, final_analytics = request('/analytics/admin/', token=admin_token)
assert status == 200
new_placed = final_analytics['overview']['placed_students']
assert new_placed == initial_placed + 1, f"Analytics did not increment! {initial_placed} -> {new_placed}"
print(f"[SUCCESS] 19. Admin placement analytics updated automatically: Placed count increased from {initial_placed} to {new_placed} ({final_analytics['overview']['placement_percentage']}%).")

print("\n============================================================")
print("ALL 19 STEPS OF THE DEMO WORKFLOW PASSED FLAWLESSLY!")
print("============================================================")
