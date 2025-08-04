from django.urls import path
from . import views

urlpatterns = [
    path('PayAnchor/', views.Login, name='Login'),
    path('Home/', views.Home, name='Home'),
    path('ClientOnboarding/', views.ClientOnboarding, name='ClientOnboarding'),
    path('Login/', views.Login, name='Login'),
    path('Logout/', views.Logout, name='Logout'),

    # ✅ AJAX Validation Endpoints
    path('check-email/', views.check_email, name='check_email'),
    path('check-fullname/', views.check_fullname, name='check_fullname'),
    path('check-password/', views.check_password, name='check_password'),
    # path('check-company-name/', views.check_company_name, name='check_company_name'),
    # path('check-company-email/', views.check_company_email, name='check_company_email'),
    # path('check-business-number/', views.check_business_number, name='check_business_number'),
    # path('check-payroll-year/', views.check_payroll_year, name='check_payroll_year'),
    # path('check-postal-code/', views.check_postal_code, name='check_postal_code'),
]
