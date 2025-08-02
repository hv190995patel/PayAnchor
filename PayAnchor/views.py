from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth import logout
from django.template import loader
from django.contrib.auth.models import User
from django.contrib import messages
from django.shortcuts import redirect
from .models import ClientUser
from django.views.decorators.csrf import csrf_protect
from django.http import JsonResponse
import re


def Home(request):
    return render(request, 'Home.html', {'full_name': request.user.full_name})

@csrf_protect
def Login(request):
    
    if request.method == "POST":
        email = request.POST['email']
        password = request.POST['password']

        # Try to get username from email
        try:
            user_obj = ClientUser.objects.get(email=email)
            username = user_obj.username
        except ClientUser.DoesNotExist:
            username = None

        if username:
            user = authenticate(request, username=username, password=password)
            if user:
                auth_login(request, user)
                return redirect('Home')

        user = authenticate(request, email=email, password=password)
        if user:
            auth_login(request, user)
            return redirect('Home')
        else:
            return render(request, 'Login.html', {'Error': 'Invalid Login Creddentials'})
    return render(request, 'Login.html')

@csrf_protect
def ClientOnboarding(request):
    if request.method == "POST":
        full_name = request.POST['full_name']
        password = request.POST['password']
        confirm_password = request.POST.get('confirm_password')
        email = request.POST['email']
        company_name = request.POST['company_name']
        company_email = request.POST['company_email']
        bussiness_number = request.POST['bussiness_number']
        payrol_year = request.POST['payrol_year']
        industry_type = request.POST['industry_type']
        address_line1 = request.POST['address_line1']
        address_line2 = request.POST['address_line2']
        city = request.POST['city']
        postal_code = request.POST['postal_code']
        province = request.POST['province']
        country = request.POST['country']

        if ClientUser.objects.filter(email=email).exists():
            messages.error(request,"Email already exists")
            return render(request,'ClientOnboarding.html')

        # Check password match
        if password != confirm_password:
            messages.error(request, "Passwords do not match.")
            return render(request, 'ClientOnboarding.html')
        
        user=ClientUser.objects.create_user(
            username = email,
            full_name=full_name, 
            password=password,
            email=email,
            company_name=company_name,
            company_email=company_email,
            bussiness_number=bussiness_number,
            payrol_year=payrol_year,
            industry_type=industry_type,
            address_line1=address_line1,
            address_line2=address_line2,
            city=city,
            postal_code=postal_code,
            province=province,
            country=country
        )
        user.save()
        messages.success(request, "User registered successfully. You can now log in.")
        return redirect('Login')
        
    return render(request, 'ClientOnboarding.html')

def check_fullname(request):
    name = request.GET.get('name', '')
    if len(name) > 100:
        return JsonResponse({'valid': False, 'error': 'You have exceed maximum Limit of 100 characters'})
    pattern = r'^[A-Za-z\s]+$'
    is_valid = bool(re.fullmatch(pattern, name))
    return JsonResponse({'valid': is_valid})
    
def check_email(request):
    email = request.GET.get('email', '')
    exists = ClientUser.objects.filter(email=email).exists()
    return JsonResponse({'exists': exists})

def Logout(request):
    logout(request)
    return redirect('Login')
