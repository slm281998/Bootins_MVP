from rest_framework import serializers
from .models import Course, Enrollment, Module, Lesson, LessonProgress, Certificate


# courses/serializers.py

class LessonSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'module', 'title', 'content_text', 'video_url', 'order', 'is_completed']

    def get_is_completed(self, obj):
        user = self.context.get('request').user
        # Importation locale pour éviter les imports circulaires
        from .models import LessonProgress
        return LessonProgress.objects.filter(user=user, lesson=obj).exists()

class ModuleSerializer(serializers.ModelSerializer):
    # C'est cette ligne qui permet d'avoir module.lessons dans React !
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'order', 'lessons']
        
class CourseSerializer(serializers.ModelSerializer):
    # On dit à Django : "Ne lis pas la colonne 'progress', appelle la fonction get_progress à la place"
    progress = serializers.SerializerMethodField()
    modules = ModuleSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'image', 'progress', 'modules']

    def get_progress(self, obj):
        # 1. Récupérer l'utilisateur qui fait la requête
        user = self.context.get('request').user
        
        if user.is_authenticated:
            # 2. Compter le nombre total de leçons pour CE cours
            from .models import Lesson
            total_lessons = Lesson.objects.filter(module__course=obj).count()
            
            if total_lessons == 0:
                return 0
            
            # 3. Compter combien de ces leçons l'utilisateur a terminé
            completed_lessons = LessonProgress.objects.filter(
                user=user, 
                lesson__module__course=obj
            ).count()
            
            # 4. Calculer le pourcentage
            return int((completed_lessons / total_lessons) * 100)
        
        return 0
        
class DashboardCourseSerializer(serializers.ModelSerializer):
    course = CourseSerializer(read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = ['course', 'enrolled_at', 'progress_percentage']

    def get_progress_percentage(self, obj):
        # Logique pour calculer la progression demandée dans le MVP
        course = obj.course
        user = obj.user
        
        # 1. Compter le nombre total de leçons dans cette formation
        total_lessons = Lesson.objects.filter(module__course=course).count()
        if total_lessons == 0:
            return 0
            
        # 2. Compter combien de ces leçons l'utilisateur a terminées
        completed_lessons = LessonProgress.objects.filter(
            user=user, 
            lesson__module__course=course, 
            is_completed=True
        ).count()
        
        # 3. Calculer le pourcentage
        return int((completed_lessons / total_lessons) * 100)
        
class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True) # Récupère les modules de la formation
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'image', 'created_at', 'modules']
        
class EnrollmentSerializer(serializers.ModelSerializer):
    # 'course' ici permet de récupérer les infos du modèle Course lié
    course_title = serializers.CharField(source='course.title', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'course_id', 'course_title', 'progress', 'is_completed']
        
class CertificateSerializer(serializers.ModelSerializer):
    # On peut ajouter des champs calculés pour faciliter l'affichage React
    course_title = serializers.CharField(source='course.title', read_only=True)
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = ['id', 'course', 'course_title', 'user_full_name', 'issued_at', 'token']

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"