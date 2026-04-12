from django.contrib import admin
from .models import Course, Module, Lesson, Enrollment, LessonProgress, Certificate

# Enregistrement simple pour le MVP
admin.site.register(Course)
admin.site.register(Module)
admin.site.register(Lesson)
admin.site.register(Enrollment)
admin.site.register(LessonProgress)

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'issued_at', 'token')
    readonly_fields = ('token', 'issued_at')