from rest_framework import serializers
from django.utils import timezone
from .models import Course, Enrollment, Module, Lesson, LessonProgress, Certificate

# --- 1. LESSON & MODULE ---
# serializers.py

class LessonSerializer(serializers.ModelSerializer):
    # ✅ On ajoute un champ calculé pour savoir si CET utilisateur a fini CETTE leçon
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content_text', 'video_url', 'order', 'is_completed']

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # On vérifie dans la table de progression
            return LessonProgress.objects.filter(
                user=request.user, 
                lesson=obj, 
                completed_at__isnull=False
            ).exists()
        return False

class ModuleSerializer(serializers.ModelSerializer):
    # Cette ligne permet d'imbriquer les leçons dans les modules
    lessons = LessonSerializer(many=True, read_only=True) 
    class Meta:
        model = Module
        fields = ['id', 'title', 'lessons', 'order']


# --- 2. COURSE ---
class CourseSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'image', 'progress', 'enrolled_count']

    def get_enrolled_count(self, obj):
        try:
            return obj.enrollment_set.count() 
        except:
            return 0

    def get_progress(self, obj):
        """Calcul de progression pour la liste des cours"""
        try:
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                total = Lesson.objects.filter(module__course=obj).count()
                if total == 0: return 0
                completed = LessonProgress.objects.filter(
                    user=request.user, 
                    lesson__module__course=obj, 
                    completed_at__isnull=False 
                ).count()
                return int((completed / total) * 100)
        except Exception as e:
            print(f"Erreur calcul progrès Course: {e}")
        return 0

# serializers.py

class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'modules', 'progress']

    def get_progress(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            total = Lesson.objects.filter(module__course=obj).count()
            if total == 0: return 0
            completed = LessonProgress.objects.filter(
                user=request.user, 
                lesson__module__course=obj, 
                completed_at__isnull=False 
            ).count()
            return int((completed / total) * 100)
        return 0


# --- 3. PROGRESSION & ENROLLMENT (CORRIGÉ) ---

class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ['id', 'lesson', 'completed_at']

class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer principal pour le Dashboard de l'apprenant.
    C'est lui qui envoie les données à la section 'Formations en cours'.
    """
    course_title = serializers.ReadOnlyField(source='course.title')
    course_id = serializers.ReadOnlyField(source='course.id')
    # ✅ Correction : On utilise "progress" pour correspondre au frontend React
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['id', 'course_id', 'course_title', 'progress', 'is_completed', 'enrolled_at']

    def get_progress(self, obj):
        """Calcul du pourcentage exact basé sur les leçons terminées"""
        try:
            # 1. Nombre total de leçons dans ce cours
            total_lessons = Lesson.objects.filter(module__course=obj.course).count()
            if total_lessons == 0:
                return 0
            
            # 2. Nombre de leçons avec une date de fin pour cet utilisateur
            completed_lessons = LessonProgress.objects.filter(
                user=obj.user, 
                lesson__module__course=obj.course, 
                completed_at__isnull=False
            ).count()
            
            return int((completed_lessons / total_lessons) * 100)
        except Exception as e:
            print(f"Erreur calcul progrès Enrollment: {e}")
            return 0


# --- 4. DASHBOARD & CERTIFICATE ---

class DashboardCourseSerializer(EnrollmentSerializer):
    """Utilise la même logique que EnrollmentSerializer pour éviter les bugs"""
    class Meta(EnrollmentSerializer.Meta):
        pass

class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = ['id', 'course', 'course_title', 'user_full_name', 'issued_at', 'token']

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"