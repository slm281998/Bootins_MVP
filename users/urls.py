from django.urls import path, include  # ✅ Ajout de 'include' ici
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UserAdminViewSet, RegisterView, CustomLoginView, user_formations
from . import views

router = DefaultRouter()
router.register(r'users', UserAdminViewSet, basename='admin-users')

urlpatterns = [
    # --- AUTHENTICATION ---
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomLoginView.as_view(), name='auth_login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='auth_refresh'),
    
    # --- STUDENT / USER DATA ---
    path('user/dashboard/', user_formations, name='user-dashboard'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),

    # --- ADMIN STATS (Custom endpoints) ---
    path('admin/stats/', views.admin_stats, name='admin-stats'),
    path('admin/recent-courses/', views.admin_recent_courses, name='admin-recent-courses'),
    
    # --- ADMIN CRUD (Users, etc.) ---
    # Le router gère : GET (list), POST (create), PUT (update), DELETE (delete)
    path('', include(router.urls)), 
]