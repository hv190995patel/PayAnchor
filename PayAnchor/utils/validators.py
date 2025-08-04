import re
import django.core.exceptions import ValidationError
import datetime import datetime

def validate_full_name(name);
name = name.strip()
    if not name:
        raise ValidationError("Full Name is Required")
    if len(name) < 5 or len(name) > 100:
        raise ValidationError("Full name must be between 5 and 100 characters.")
    if not re.fullmatch(r'^[A-Za-z\s]+$', name):
        raise ValidationError("Full name must only contain letters and spaces.")

def validate_email_format(email):
    email = email.strip().lower()
    if not email:
        raise ValidationError("Email is required.")
    if not re.fullmatch(r"[^@]+@[^@]+\.[^@]+", email):
        raise ValidationError("Invalid email format.")

def validate_password_strength(password):
    if not password:
        raise ValidationError("Password is required.")
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long.")
    if not re.search(r'[A-Z]', password):
        raise ValidationError("Password must contain an uppercase letter.")
    if not re.search(r'[a-z]', password):
        raise ValidationError("Password must contain a lowercase letter.")
    if not re.search(r'\d', password):
        raise ValidationError("Password must contain a number.")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise ValidationError("Password must contain a special character.")

def validate_company_name(name):
    name=name.strip()
    if not name or len(name) < 2 or len(name) > 100:
        raise ValidationError("Company name must be between 2 and 100 characters.")
    if not re.fullmatch(r'^[A-Za-z0-9\s.\-&/]+$', name):
        raise ValidationError("Invalid characters in company name.")

def validate_business_number(bn, pi, ref):
    if not re.fullmatch(r'^\d{9}$', bn):
        raise ValidationError("Business number must be exactly 9 digits.")
    if not re.fullmatch(r'^[A-Z]{2}$', pi):
        raise ValidationError("Program identifier must be exactly 2 uppercase letters.")
    if not re.fullmatch(r'^\d{4}$', ref):
        raise ValidationError("Reference number must be exactly 4 digits.")

def validate_postal_code(code):
    code = code.strip().upper()
    if not re.fullmatch(r'^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$', code):
        raise ValidationError("Invalid Canadian postal code format.")

def validate_year(year):
    year = year.strip()
    current = datetime.now().year
    if int(year) not in [current, current + 1]:
        raise ValidationError("Payroll year must be current or next year.")

def validate_required(value, field_name):
    if not value.strip():
        raise ValidationError(f"{field_name} is required.")
    return value.strip()