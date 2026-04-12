from django.db import models
from django.conf import settings
import uuid # Pour générer le token unique du certificat

class Course(models.Model):
    title = models.CharField(max_length=200, verbose_name="Titre de la formation")
    description = models.TextField(verbose_name="Description")
    image = models.ImageField(upload_to='courses_images/', null=True, blank=True, verbose_name="Image de couverture")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200, verbose_name="Titre du module")
    order = models.PositiveIntegerField(verbose_name="Ordre", default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - Module {self.order}: {self.title}"

class Lesson(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200, verbose_name="Titre de la leçon")
    content_text = models.TextField(blank=True, verbose_name="Contenu texte")
    image = models.ImageField(upload_to='lessons_images/', null=True, blank=True, verbose_name="Image illustrative")
    video_url = models.URLField(blank=True, verbose_name="Lien vidéo (YouTube/Vimeo)")
    order = models.PositiveIntegerField(verbose_name="Ordre", default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

class LessonProgress(models.Model):
    """Table UNIQUE pour suivre la validation de chaque leçon"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Empêche de valider deux fois la même leçon
        unique_together = ('user', 'lesson')

# courses/models.py

class Enrollment(models.Model):
    user = models.ForeignKey('users.CustomUser', on_delete=models.CASCADE)
    course = models.ForeignKey('Course', on_delete=models.CASCADE)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    # 🚀 AJOUTE CES DEUX LIGNES :
    is_completed = models.BooleanField(default=False)
    progress = models.IntegerField(default=0) 

    class Meta:
        unique_together = ('user', 'course', 'is_completed')
    
    def save(self, *args, **kwargs):
        # On regarde si l'objet existait déjà avant (pour détecter le changement)
        if self.pk:
            old_status = Enrollment.objects.get(pk=self.pk).is_completed
            # 🚀 Si on vient de cocher la case
            if not old_status and self.is_completed:
                # On crée le certificat automatiquement
                from .models import Certificate # Import local pour éviter les imports circulaires
                Certificate.objects.get_or_create(
                    user=self.user,
                    course=self.course,
                    defaults={'token': uuid.uuid4().hex} # On génère un token unique
                )
        
        super().save(*args, **kwargs)

    # CALCUL DYNAMIQUE (Plus besoin de champ progress !)
    @property
    def get_progress(self):
        # 1. Compter le total de leçons dans cette formation
        # On passe par les modules pour atteindre les leçons
        total_lessons = Lesson.objects.filter(module__course=self.course).count()
        
        if total_lessons == 0:
            return 0
            
        # 2. Compter les leçons validées par cet utilisateur pour ce cours
        completed_lessons = LessonProgress.objects.filter(
            user=self.user,
            lesson__module__course=self.course
        ).count()
        
        # 3. Calcul du pourcentage
        return int((completed_lessons / total_lessons) * 100)

    def __str__(self):
        return f"{self.user.username} - {self.course.title} ({self.get_progress}%)"

class Certificate(models.Model):
    """Table pour les certificats obtenus"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    issued_at = models.DateTimeField(auto_now_add=True)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True) # Token infalsifiable pour le QR Code

    class Meta:
        unique_together = ('user', 'course')

    def __str__(self):
        return f"Certificat {self.course.title} - {self.user.email}"