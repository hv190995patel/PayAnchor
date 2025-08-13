from django.db import models
from django.contrib.auth.models import AbstractUser

#user role 
ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('client', 'Client'),
        ('subclient', 'Sub-client'),
        ('employee', 'Employee',)
    ]


# Create your models here.
class ClientUser(AbstractUser):
    full_name = models.CharField(max_length=100, default="N/A")
    email = models.EmailField(unique=True)
    company_name = models.CharField(max_length=100, default="N/A")
    company_email = models.EmailField(max_length=100, default="noreply@example.com")
    bussiness_number = models.CharField(max_length=9, default='000000000')
    pi_number = models.CharField(max_length=2, default='RP')
    reference_number = models.CharField(max_length=4, default='0000')
    payrol_year = models.CharField(max_length=4, default='2025')
    industry_type = models.CharField(max_length=100, default="N/A")
    address_line1 = models.CharField(max_length=255, default="N/A")
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, default="N/A")
    postal_code = models.CharField(max_length=7, default='111111')
    province = models.CharField(max_length=100, default="N/A")
    country = models.CharField(max_length=100, default="N/A")

    def __str__(self):
        return f"{self.email} (User)"
        
class Profile(models.Model):
    user = models.OneToOneField(ClientUser, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

    def __str__(self):
        return f"{self.user.email} ({self.role})"

