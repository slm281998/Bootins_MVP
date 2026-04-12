from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, CustomLoginView, user_formations
from . import views

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomLoginView.as_view(), name='auth_login'), # Utilise notre vue modifiée
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    path('user/dashboard/', user_formations, name='user-dashboard'),
    path('admin/stats/', views.admin_stats, name='admin-stats'),
    path('admin/recent-courses/', views.admin_recent_courses, name='admin-recent-courses'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
]