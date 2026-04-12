from django.urls import path
from .views import CourseListView, CourseCreateView, CourseDetailView, LessonDetailView, ValidateLessonView, ChatbotView, GenerateCertificateView, VerifyCertificateView, EnrollCourseView, RequestPasswordResetView, ResetPasswordConfirmView, CourseModulesView, my_certificates
from . import views


urlpatterns = [
    path('formations/', CourseListView.as_view(), name='course-list'),
    path('formations/<int:id>/', CourseDetailView.as_view(), name='course-detail'),
    path('lecons/<int:id>/', LessonDetailView.as_view(), name='lesson-detail'),
    path('progress/validate/', ValidateLessonView.as_view(), name='progress-validate'),
    path('dashboard/student/', views.StudentDashboardView.as_view(), name='student-dashboard'),
    path('chatbot/message/', ChatbotView.as_view(), name='chatbot-message'),
    path('formations/enroll/', EnrollCourseView.as_view(), name='enroll-course'),
    path('courses/', CourseCreateView.as_view(), name='course-list-create'),
    path('courses/<int:id>/', views.CourseDetailView.as_view(), name='course-detail'),
    path('courses/<int:course_id>/modules/', CourseModulesView.as_view(), name='course-modules'),
    path('modules/', views.ModuleCreateView.as_view(), name='module-create'),
    path('lessons/', views.LessonCreateView.as_view(), name='lesson-create'),
    path('certificates/me/', my_certificates, name='my-certificates'),
    path('certificate/generate/', GenerateCertificateView.as_view(), name='generate-cert'),
    path('certificate/verify/<uuid:token>/', VerifyCertificateView.as_view(), name='verify-cert'),
    path('auth/password-reset/', RequestPasswordResetView.as_view(), name='password_reset_request'),
    path('auth/password-reset-confirm/<uidb64>/<token>/', ResetPasswordConfirmView.as_view(), name='password_reset_confirm'),
]