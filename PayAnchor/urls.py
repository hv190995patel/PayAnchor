from django.urls import path
from django.contrib.auth.views import LogoutView
from .import views

urlpatterns = [
    path('PayAnchor/', views.Login, name='Login'), 
    path('Home/', views.Home, name='Home'),
    path('ClientOnboarding/', views.ClientOnboarding, name='ClientOnboarding'),
    path('Login/', views.Login, name='Login'),
    path('check-email/', views.check_email, name='check_email'),
    path('check-fullname/', views.check_fullname, name='check_fullname'),
    path('Logout/', views.Logout, name='Logout'),
]