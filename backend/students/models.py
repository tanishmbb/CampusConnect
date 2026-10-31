from django.db import models
from django.conf import settings

class Department(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class StudentProfile(models.Model):
    GENDER_CHOICES = (
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other'),
    )

    PLACEMENT_CHOICES = (
        ('NOT_PLACED', 'Not Placed'),
        ('PLACED', 'Placed'),
    )

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='student_profile')
    roll_number = models.CharField(max_length=50, blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, default='MALE')
    address = models.TextField(blank=True, default='')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    graduation_year = models.IntegerField(default=2026)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.0)
    tenth_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    twelfth_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.0)
    diploma_percentage = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    backlogs = models.IntegerField(default=0)
    resume = models.FileField(upload_to='resumes/', null=True, blank=True)
    resume_url = models.CharField(max_length=500, blank=True, default='')
    profile_photo = models.ImageField(upload_to='profiles/', null=True, blank=True)
    github_url = models.URLField(blank=True, default='')
    linkedin_url = models.URLField(blank=True, default='')
    projects_info = models.TextField(blank=True, default='', help_text='Key academic & personal projects')
    internships_info = models.TextField(blank=True, default='', help_text='Prior internship experiences')
    certifications_info = models.TextField(blank=True, default='', help_text='Professional certifications')
    profile_completion = models.IntegerField(default=20)
    placement_status = models.CharField(max_length=20, choices=PLACEMENT_CHOICES, default='NOT_PLACED')

    def calculate_profile_completion(self):
        score = 0
        # Personal info (20%)
        personal_fields = [self.roll_number, self.phone, self.gender, self.address]
        personal_score = sum(5 for f in personal_fields if f)
        score += personal_score

        # Academic info (30%)
        if self.department:
            score += 10
        if self.cgpa and self.cgpa > 0:
            score += 10
        if (self.tenth_percentage and self.tenth_percentage > 0) or (self.twelfth_percentage and self.twelfth_percentage > 0):
            score += 10

        # Skills (20%)
        if self.id and self.student_skills.exists():
            count = self.student_skills.count()
            score += min(20, count * 5)

        # Resume & Links (20%)
        if self.resume or self.resume_url:
            score += 10
        if self.github_url or self.linkedin_url:
            score += 10

        # Projects & Experience (10%)
        if self.projects_info or self.internships_info or self.certifications_info:
            score += 10

        return min(100, max(15, score))

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        new_completion = self.calculate_profile_completion()
        if self.profile_completion != new_completion:
            self.profile_completion = new_completion
            super().save(update_fields=['profile_completion'])

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.roll_number or 'No Roll'})"

class StudentSkill(models.Model):
    PROFICIENCY_CHOICES = (
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    )
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='student_skills')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='student_skills')
    proficiency = models.CharField(max_length=20, choices=PROFICIENCY_CHOICES, default='INTERMEDIATE')

    class Meta:
        unique_together = ('student', 'skill')

    def __str__(self):
        return f"{self.skill.name} ({self.proficiency})"
