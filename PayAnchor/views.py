from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponseForbidden
from django.contrib.auth import authenticate, login as auth_login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from .models import ClientUser, Profile
from django.contrib import admin
from django.urls import path, include
from django.core.paginator import Paginator
from django.core.exceptions import ValidationError
from django.db import transaction


urlpatterns = [
    path('admin/', admin.site.urls),
    path('PayAnchor/', include('PayAnchor.urls')),
    # or path('PayAnchor/', views.Login, name='Login'),
]

from .utils.validators import (
    validate_full_name, validate_email_format, validate_password_strength,
    validate_company_name, validate_company_email,
    validate_business_number, validate_payroll_year,
    validate_required, validate_postal_code,
    validate_alpha_space, validate_address_line
)
import datetime

@csrf_protect
def Login(request):
    if request.method == "POST":
        email = request.POST.get('email', '').strip().lower()
        password = request.POST.get('password', '').strip()

        try:
            user_obj = ClientUser.objects.get(email=email)
            user = authenticate(request, username=user_obj.username, password=password)
        except ClientUser.DoesNotExist:
            user = authenticate(request, email=email, password=password)

        if user:
            auth_login(request, user)
            return redirect('Homepage')
        else:
            return render(request, 'Login.html', {'Error': 'Invalid login credentials'})

    return render(request, 'Login.html')

@login_required
def Homepage(request):
    role = getattr(request.user.profile, 'role', None)  # safer access
    if role == 'admin':
        return redirect('admin_home')
    elif role == 'client':
        return redirect('client_home')
    elif role =='subclient':
        return redirect('subclient_home')
    elif role == 'employee':
        return redirect('employee_home')
    else:

        # return HttpResponseForbidden("Unauthorized")
        return HttpResponseForbidden(f"Unauthorized: Your role is '{user.profile.role}'")

@login_required
def admin_home(request):
    role = getattr(request.user.profile, 'role', None)
    if role != 'admin':
        return HttpResponseForbidden("Unauthorized Access, Please Contact Administrator")

    total_clients = ClientUser.objects.count()
    clients = ClientUser.objects.all().order_by('id')[:5]

    context = {
        'total_clients': total_clients,
        'clients': clients,
        'current_year': datetime.datetime.now().year,
    }

    return render(request, 'admin_home.html', context)

@login_required
def client_home(request):
    role = getattr(request.user.profile, 'role', None)
    if role != 'client':
        return HttpResponseForbidden(f"Unauthorized Access, Please Contact Administraor")
    return render(request, 'client_home.html', {'current_year': datetime.datetime.now().year})


@login_required
def subclient_home(request):
    role = getattr(request.user.profile, 'role', None)
    if role != 'subclient':
        return HttpResponseForbidden(f"Unauthorized Access, Please Contact Administraor")
    return render(request, 'subclient_home.html', {'current_year': datetime.datetime.now().year}) 

@login_required
def employee_home(request):
    role = getattr(request.user.profile, 'role', None)
    if role != 'employee':
        return HttpResponseForbidden(f"Unauthorized Access, Please Contact Administraor")
    return render(request, 'employee_home.html', {'current_year': datetime.datetime.now().year}) 

@csrf_protect
@login_required
def ClientOnboarding(request):

    if request.method == "POST":
        full_name = request.POST.get('full_name', '').strip()
        password = request.POST.get('password', '').strip()
        confirm_password = request.POST.get('confirm_password', '').strip()
        email = request.POST.get('email', '').strip().lower()
        company_name = request.POST.get('company_name', '').strip()
        company_email = request.POST.get('company_email', '').strip().lower()
        bussiness_number = request.POST.get('bussiness_number', '').strip()  # fixed typo here, previously "bussiness"
        pi_number = request.POST.get('pi_number', '').strip().upper()
        reference_number = request.POST.get('reference_number', '').strip()
        payroll_year = request.POST.get('payrol_year', '').strip()  # typo in form field - consider fixing too
        industry_type = request.POST.get('industry_type', '').strip()
        address_line1 = request.POST.get('address_line1', '').strip()
        address_line2 = request.POST.get('address_line2', '').strip()
        city = request.POST.get('city', '').strip()
        postal_code = request.POST.get('postal_code', '').strip().upper()
        province = request.POST.get('province', '').strip()
        country = request.POST.get('country', '').strip()

        try:
            validate_full_name(full_name)
            validate_password_strength(password)
            validate_email_format(email)
            validate_company_name(company_name)
            validate_company_email(company_email)
            validate_business_number(bussiness_number, pi_number, reference_number)
            validate_payroll_year(payroll_year)
            validate_required(industry_type, "Industry type")
            validate_address_line(address_line1, "Address Line 1")
            # Address line 2 can be optional, so validate only if present:
            if address_line2:
                validate_address_line(address_line2, "Address Line 2")
            validate_alpha_space(city, "City")
            validate_postal_code(postal_code)
            validate_alpha_space(province, "Province")
            validate_alpha_space(country, "Country")

            if password != confirm_password:
                raise ValueError("Passwords do not match.")

            if ClientUser.objects.filter(email=email).exists():
                raise ValueError("Email already exists.")

            with transaction.atomic():    
                user = ClientUser.objects.create_user(
                    username=email,
                    full_name=full_name,
                    password=password,
                    email=email,
                    company_name=company_name,
                    company_email=company_email,
                    bussiness_number=bussiness_number,
                    pi_number=pi_number,
                    reference_number=reference_number,
                    payrol_year=payroll_year,
                    industry_type=industry_type,
                    address_line1=address_line1,
                    address_line2=address_line2,
                    city=city,
                    postal_code=postal_code,
                    province=province,
                    country=country
                )
                Profile.objects.create(user=user, role='client')
            messages.success(request, "User registered successfully. You can now log in.")
            return redirect('Login')

        except (ValueError, ValidationError) as e:
            messages.error(request, str(e))
            return render(request, 'ClientOnboarding.html')

    return render(request, 'ClientOnboarding.html')

def check_email(request):
    email = request.GET.get('email', '').strip().lower()
    exists = ClientUser.objects.filter(email=email).exists()
    return JsonResponse({'exists': exists})

def check_password(request):
    password = request.GET.get('password', '')
    try:
        validate_password_strength(password)
        return JsonResponse({'valid': True})
    except ValidationError as e:
        return JsonResponse({'valid': False, 'error': e.message})

def check_fullname(request):
    name = request.GET.get('name', '').strip()
    try:
        validate_full_name(name)
        return JsonResponse({'valid': True})
    except Exception as e:
        return JsonResponse({'valid': False, 'error': str(e)})

def client_list(request):
    clients = ClientUser.objects.all().order_by('id')  # or order as you prefer
    paginator = Paginator(clients, 20)  

    page_number = request.GET.get('page',1)
    page_obj = paginator.get_page(page_number)

    return render(request, 'client_list.html', {'page_obj': page_obj})

def Logout(request):
        logout(request)
        return redirect('Login')
