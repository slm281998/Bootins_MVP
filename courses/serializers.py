from rest_framework import serializers
from .models import Course, Enrollment, Module, Lesson, LessonProgress, Certificate

# --- 1. LESSON ---
class LessonSerializer(serializers.ModelSerializer):
    # On ajoute le titre du module pour que ce soit plus joli dans ton tableau React
    module_title = serializers.ReadOnlyField(source='module.title', default="Sans module")

    class Meta:
        model = Lesson
        # On liste les champs UN PAR UN pour éviter les surprises
        # Retire 'order' ou 'video_url' de cette liste si tu ne les as pas dans ton models.py
        fields = ['id', 'module', 'module_title', 'title', 'content_text', 'video_url', 'order']

# --- 2. MODULE ---
class ModuleSerializer(serializers.ModelSerializer):
    # On utilise 'serializers.ReadOnlyField' pour plus de stabilité
    # Remplace 'course.title' par 'formation.title' si ton champ s'appelle formation
    course_title = serializers.ReadOnlyField(source='course.title', default="Sans formation")

    class Meta:
        model = Module
        # Vérifie bien que 'order' existe dans ton modèle, sinon retire-le de cette liste
        fields = ['id', 'course', 'course_title', 'title', 'order']

# --- 3. COURSE ---
class CourseSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField() # On passe par une méthode pour être sûr

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'image', 'progress', 'enrolled_count']

    def get_enrolled_count(self, obj):
        try:
            # On essaie de compter les inscrits
            return obj.enrollment_set.count() 
        except:
            return 0

    def get_progress(self, obj):
        try:
            request = self.context.get('request')
            if request and request.user.is_authenticated:
                from .models import Lesson, LessonProgress
                total = Lesson.objects.filter(module__course=obj).count()
                if total == 0: return 0
                completed = LessonProgress.objects.filter(user=request.user, lesson__module__course=obj, is_completed=True).count()
                return int((completed / total) * 100)
        except Exception as e:
            print(f"Erreur calcul progrès: {e}")
        return 0

class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'image', 'created_at', 'modules']

# --- 4. ENROLLMENT (Le Serializer qui manquait !) ---
class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = '__all__'

class DashboardCourseSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['course', 'enrolled_at', 'progress_percentage']

    def get_progress_percentage(self, obj):
        total = Lesson.objects.filter(module__course=obj.course).count()
        if total == 0: return 0
        completed = LessonProgress.objects.filter(user=obj.user, lesson__module__course=obj.course, is_completed=True).count()
        return int((completed / total) * 100)

# --- 5. CERTIFICATE ---
class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.ReadOnlyField(source='course.title')
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = ['id', 'course', 'course_title', 'user_full_name', 'issued_at', 'token']

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"