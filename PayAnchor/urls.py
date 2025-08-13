from django.contrib import admin
from django.urls import path, include
from . import views

urlpatterns = [
    path('PayAnchor/', views.Login, name='Login'),
    path('Homepage/', views.Homepage, name='Homepage'),
    path('admin/', views.admin_home, name='admin_home'),
    path('clients/', views.client_list, name='client_list'),    # Paginated client list
    path('client/', views.client_home, name='client_home'),
    path('subclient/', views.subclient_home, name='subclient_home'),
    path('employee/', views.employee_home, name='employee_home'),
    path('ClientOnboarding/', views.ClientOnboarding, name='ClientOnboarding'),
    path('Logout/', views.Logout, name='Logout'),

    # ✅ AJAX Validation Endpoints
    path('check-email/', views.check_email, name='check_email'),
    path('check-fullname/', views.check_fullname, name='check_fullname'),
    path('check-password/', views.check_password, name='check_password'),
    
]
