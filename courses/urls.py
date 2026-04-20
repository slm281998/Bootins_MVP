from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import (
    CourseListView, CourseCreateView, CourseDetailView, LessonDetailView, 
    ValidateLessonView, ChatbotView, GenerateCertificateView, 
    VerifyCertificateView, EnrollCourseView, RequestPasswordResetView, 
    ResetPasswordConfirmView, CourseModulesView, my_certificates,
    CourseViewSet, ModuleViewSet, LessonViewSet, StudentDashboardView
)

# 1. Configuration du Router (Pour l'espace Admin / CRUD)
# On change un peu les noms pour éviter les conflits avec tes routes "Apprenant"
router = DefaultRouter()
router.register(r'manage/formations', CourseViewSet, basename='admin-courses')
router.register(r'manage/modules', ModuleViewSet, basename='admin-modules')
router.register(r'manage/lessons', LessonViewSet, basename='admin-lessons')

urlpatterns = [
    # --- ROUTES DU ROUTER ---
    path('', include(router.urls)),

    # --- ROUTES POUR L'APPRENANT (FRONTEND) ---
    path('formations/', CourseListView.as_view(), name='course-list'),
    path('formations/<int:id>/', CourseDetailView.as_view(), name='course-detail'),
    path('lecons/<int:id>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('progress/validate/', ValidateLessonView.as_view(), name='progress-validate'),
    path('dashboard/student/', StudentDashboardView.as_view(), name='student-dashboard'),
    path('chatbot/message/', ChatbotView.as_view(), name='chatbot-message'),
    
    # ✅ L'URL exacte pour l'inscription
    path('enroll/', EnrollCourseView.as_view(), name='enroll-course'),

    # --- GESTION & ÉTUDES ---
    path('courses/', CourseCreateView.as_view(), name='course-list-create'),
    path('courses/<int:course_id>/modules/', CourseModulesView.as_view(), name='course-modules'),
    path('modules/', views.ModuleCreateView.as_view(), name='module-create'),
    path('lessons/', views.LessonCreateView.as_view(), name='lesson-create'),

    # --- CERTIFICATS ---
    path('certificates/me/', my_certificates, name='my-certificates'),
    path('certificate/generate/', GenerateCertificateView.as_view(), name='generate-cert'),
    path('certificate/verify/<uuid:token>/', VerifyCertificateView.as_view(), name='verify-cert'),

    # --- AUTHENTIFICATION ---
    path('auth/password-reset/', RequestPasswordResetView.as_view(), name='password_reset_request'),
    path('auth/password-reset-confirm/<uidb64>/<token>/', ResetPasswordConfirmView.as_view(), name='password_reset_confirm'),
]