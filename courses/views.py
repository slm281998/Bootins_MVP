from rest_framework import generics, status
import os
from dotenv import load_dotenv
from groq import Groq
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Course, Enrollment, Lesson, LessonProgress , Enrollment, Certificate, Module  # <-- Ajout de Lesson
from .serializers import CourseSerializer, CourseSerializer, ModuleSerializer, LessonSerializer, EnrollmentSerializer, CertificateSerializer, DashboardCourseSerializer, CourseDetailSerializer, LessonSerializer, ModuleSerializer# <-- Nouveaux serializers
from io import BytesIO
from django.http import HttpResponse
from reportlab.pdfgen import canvas 
import qrcode  # <-- C'est cette ligne qui manque !
from reportlab.lib.pagesizes import landscape, A4 
from reportlab.lib.utils import ImageReader 
from rest_framework import status
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

User = get_user_model()


load_dotenv()
class CourseListView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_serializer_context(self):
        # Indispensable pour que le serializer voit request.user !
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
    
class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        # 🚀 On récupère TOUTES les inscriptions (sans filtrer sur is_completed)
        all_enrollments = Enrollment.objects.filter(user=user)
        
        certs = Certificate.objects.filter(user=user)
        
        return Response({
            "first_name": user.first_name or user.username,
            "enrolled_courses": EnrollmentSerializer(all_enrollments, many=True).data,
            "certificates": CertificateSerializer(certs, many=True).data
        })
        
class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseDetailSerializer
    lookup_field = 'id'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class LessonDetailView(generics.RetrieveAPIView):
    """ Écran 5 : Lecture d'une leçon (Contenu) """
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'

class ValidateLessonView(APIView):
    """ Écran 5 : Validation manuelle d'une leçon terminée """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # On attend que le frontend envoie l'ID de la leçon : {"lesson_id": 1}
        lesson_id = request.data.get('lesson_id')
        
        try:
            lesson = Lesson.objects.get(id=lesson_id)
            # get_or_create permet de créer la progression si elle n'existe pas, ou de la récupérer
            progress, created = LessonProgress.objects.get_or_create(
                user=request.user,
                lesson=lesson
            )
            progress.is_completed = True # On valide la leçon
            progress.save()
            
            return Response({"message": "Leçon validée avec succès !"}, status=status.HTTP_200_OK)
            
        except Lesson.DoesNotExist:
            return Response({"error": "Leçon introuvable"}, status=status.HTTP_404_NOT_FOUND)

class EnrollCourseView(APIView):
    """ Permet à un apprenant de s'inscrire à une formation """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        course_id = request.data.get('course_id')
        try:
            course = Course.objects.get(id=course_id)
            enrollment, created = Enrollment.objects.get_or_create(user=request.user, course=course)
            if created:
                return Response({"message": "Inscription réussie !"}, status=status.HTTP_201_CREATED)
            return Response({"message": "Vous êtes déjà inscrit à ce cours."}, status=status.HTTP_200_OK)
        except Course.DoesNotExist:
            return Response({"error": "Formation introuvable"}, status=status.HTTP_404_NOT_FOUND)
        
class CourseModulesView(APIView):
    def get(self, request, course_id):
        try:
            course = get_object_or_404(Course, id=course_id)
            modules = course.modules.all().order_by('order')
            
            # --- CALCUL DE LA PROGRESSION GLOBALE DU COURS ---
            # 1. Nombre total de leçons dans toute la formation
            total_course_lessons = Lesson.objects.filter(module__course=course).count()
            
            # 2. Nombre de leçons terminées par l'utilisateur pour ce cours
            total_completed_course_lessons = LessonProgress.objects.filter(
                user=request.user, 
                lesson__module__course=course, 
                completed_at__isnull=False
            ).count()

            # 3. Calcul du pourcentage global
            overall_progress = 0
            if total_course_lessons > 0:
                overall_progress = int((total_completed_course_lessons / total_course_lessons) * 100)
            # ------------------------------------------------

            modules_data = []
            can_access_next = True

            for module in modules:
                lessons = module.lessons.all()
                total_module_lessons = lessons.count()
                
                if total_module_lessons > 0:
                    completed_module = LessonProgress.objects.filter(
                        user=request.user, 
                        lesson__in=lessons, 
                        completed_at__isnull=False
                    ).count()
                    module_progress = int((completed_module / total_module_lessons) * 100)
                else:
                    module_progress = 0
                
                modules_data.append({
                    "id": module.id,
                    "title": module.title,
                    "progress": module_progress,
                    "is_locked": not can_access_next,
                    "lessons": [
                        {
                            "id": l.id, 
                            "title": l.title, 
                            "is_completed": LessonProgress.objects.filter(
                                user=request.user, 
                                lesson=l, 
                                completed_at__isnull=False
                            ).exists()
                        } 
                        for l in lessons
                    ]
                })

                if module_progress < 100:
                    can_access_next = False

            # ✅ On renvoie maintenant la VRAIE valeur calculée
            return Response({
                "course_title": course.title,
                "overall_progress": overall_progress, 
                "modules": modules_data
            })
            
        except Exception as e:
            print(f"ERREUR SERVEUR: {str(e)}")
            return Response({"error": str(e)}, status=500)

class GenerateCertificateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        course_id = request.data.get('course_id')
        course = get_object_or_404(Course, id=course_id)

        # 1. Vérification de la progression
        total_lessons = Lesson.objects.filter(module__course=course).count()
        completed_lessons = LessonProgress.objects.filter(
            user=request.user, 
            lesson__module__course=course, 
            completed_at__isnull=False
        ).count()

        if total_lessons == 0 or completed_lessons < total_lessons:
            return Response({"error": "Formation non terminée."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Récupération ou création du certificat en base
        certificate, created = Certificate.objects.get_or_create(user=request.user, course=course)

        # --- 💡 NOUVEAU : TEST POUR SAVOIR QUOI RENVOYER ---
        # Si on ne demande pas explicitement le téléchargement, on renvoie du JSON
        if request.GET.get('download') != 'true':
            return Response({
                "token": str(certificate.token),
                "user_full_name": f"{request.user.first_name} {request.user.last_name}" or request.user.username,
                "course_title": course.title,
                "issued_at": certificate.issued_at
            })

        # --- 📄 SI ON VEUT LE PDF (Bouton Téléchargement) ---
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=landscape(A4))
        
        # QR Code pointant vers ton Écran 8
        qr_url = f"http://localhost:5173/verify/{certificate.token}" 
        qr_img = qrcode.make(qr_url)
        qr_io = BytesIO()
        qr_img.save(qr_io, format='PNG')
        qr_io.seek(0)
        
        # Design du PDF
        p.setFont("Helvetica-Bold", 30)
        p.drawCentredString(421, 400, "CERTIFICAT DE RÉUSSITE")
        p.setFont("Helvetica", 18)
        full_name = f"{request.user.first_name} {request.user.last_name}" or request.user.username
        p.drawCentredString(421, 300, f"Décerné à : {full_name}")
        p.drawCentredString(421, 250, f"Formation : {course.title}")
        p.drawImage(ImageReader(qr_io), 650, 50, width=120, height=120)
        p.showPage()
        p.save()

        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="certificat_{course.id}.pdf"'
        return response
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_certificates(request):
    """ Récupère la liste des certificats de l'utilisateur connecté """
    # On cherche tous les certificats liés à l'utilisateur qui fait la requête
    certs = Certificate.objects.filter(user=request.user)
    
    data = []
    for c in certs:
        data.append({
            "id": c.id,
            "course_id": c.course.id,
            "course_title": c.course.title,
            "date": c.issued_at.strftime("%d/%m/%Y"),
            "token": str(c.token)
        })
    
    return Response(data)

class VerifyCertificateView(APIView):
    permission_classes = [AllowAny] # Accessible sans login !

    def get(self, request, token):
        try:
            # On cherche par le token UUID
            cert = Certificate.objects.get(token=token)
            return Response({
                "valide": True,
                "apprenant": f"{cert.user.first_name} {cert.user.last_name}" or cert.user.username,
                "formation": cert.course.title,
                "date": cert.issued_at.strftime("%d/%m/%Y") # ✅ Correspond à ton modèle
            })
        except (Certificate.DoesNotExist, ValueError):
            return Response({"valide": False, "error": "Certificat introuvable"}, status=404)
        
class RequestPasswordResetView(APIView):
    """ Étape 1 : L'utilisateur donne son email pour recevoir un lien """
    permission_classes = [] # Public

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            # Génération d'un token unique et d'un ID utilisateur encodé
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # URL que l'utilisateur devra cliquer sur votre Frontend (React/Vue)
            reset_url = f"http://localhost:3000/reset-password/{uid}/{token}/"
            
            # "Envoi" de l'email (apparaîtra dans votre terminal)
            send_mail(
                subject="Réinitialisation de votre mot de passe",
                message=f"Cliquez ici : {reset_url}",
                from_email=None,  # <--- METTRE "None" ICI pour utiliser le .env
                recipient_list=[email],
                fail_silently=False,
            )
            return Response({"message": "Si l'email existe, un lien a été envoyé."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Pour la sécurité, on ne dit pas si l'email existe ou pas
            return Response({"message": "Si l'email existe, un lien a été envoyé."}, status=status.HTTP_200_OK)

class ResetPasswordConfirmView(APIView):
    """ Étape 2 : L'utilisateur soumet son nouveau mot de passe avec le token """
    permission_classes = []

    def post(self, request, uidb64, token):
        try:
            # Décodage de l'ID utilisateur
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            new_password = request.data.get('new_password')

            # Vérification de la validité du token
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({"message": "Mot de passe modifié avec succès !"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Le lien est invalide ou a expiré."}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Lien invalide."}, status=status.HTTP_400_BAD_REQUEST)

class ChatbotView(APIView):
    """ Écran 6 : Chatbot MVP propulsé par Groq (Llama 3) """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        
        if not user_message:
            return Response({"error": "Le message ne peut pas être vide."}, status=status.HTTP_400_BAD_REQUEST)

        # On force la clé en dur juste pour le test !
        api_key = os.environ.get("GROQ_API_KEY")

        try:
            # Initialisation du client Groq
            client = Groq(api_key=api_key)
            
            # Définition du rôle de l'IA (Respect du MVP)
            system_prompt = (
                "Tu es l'assistant virtuel d'une plateforme d'e-learning. "
                "Ton rôle exclusif est d'aider les apprenants à naviguer sur la plateforme, "
                "répondre aux questions générales sur les formations et expliquer des notions de base de manière simple. "
                "Tu dois être concis, encourageant et parler en français. "
                "Si on te pose une question hors sujet, ramène poliment la conversation sur l'apprentissage."
            )

            # Appel à l'API de Groq
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                model="llama-3.1-8b-instant", # Modèle très rapide, performant et gratuit
                max_tokens=200, # On limite la taille de la réponse pour coller au côté "Chat simple"
                temperature=0.7 # Un peu de créativité, mais pas trop
            )

            # Récupération de la réponse
            bot_reply = chat_completion.choices[0].message.content

            return Response({
                "reply": bot_reply
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # En cas de problème réseau ou d'API
            return Response({"error": f"Erreur de connexion à l'IA : {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        
@api_view(['GET']) # type: ignore
@permission_classes([IsAuthenticated]) # type: ignore
def my_certificates(request):
    """ Récupère la liste des certificats de l'utilisateur connecté """
    certs = Certificate.objects.filter(user=request.user)
    
    data = []
    for c in certs:
        data.append({
            "id": c.id,
            "course_id": c.course.id,
            "course_title": c.course.title,
            "token": str(c.token),
            "issued_at": c.issued_at
        })
    
    return Response(data)


class CourseCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
class ModuleCreateView(generics.CreateAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    
class LessonCreateView(generics.CreateAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Lesson, Enrollment, LessonProgress, Certificate
import uuid

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_lesson(request):
    user = request.user
    lesson_id = request.data.get('lesson_id')
    lesson = get_object_or_404(Lesson, id=lesson_id)
    
    # 1. Enregistrer que l'élève a fini CETTE leçon
    progress_record, created = LessonProgress.objects.get_or_create(
        user=user, 
        lesson=lesson,
        defaults={'is_completed': True}
    )
    if not created:
        progress_record.is_completed = True
        progress_record.save()

    # 2. Récupérer l'inscription globale au cours
    course = lesson.module.course
    enrollment = get_object_or_404(Enrollment, user=user, course=course)

    # 3. Calculer le nouveau pourcentage
    total_lessons = Lesson.objects.filter(module__course=course).count()
    completed_lessons = LessonProgress.objects.filter(
        user=user, 
        lesson__module__course=course, 
        is_completed=True
    ).count()

    # Formule : (Leçons terminées / Total) * 100
    new_progress = int((completed_lessons / total_lessons) * 100) if total_lessons > 0 else 0

    # 4. Mise à jour de la table Enrollment
    enrollment.progress = new_progress
    if new_progress >= 100:
        enrollment.is_completed = True
        # Optionnel : Créer le certificat automatiquement s'il n'existe pas
        Certificate.objects.get_or_create(
            user=user, 
            course=course, 
            defaults={'token': uuid.uuid4().hex[:10].upper()}
        )
    
    enrollment.save() # 🚀 SAUVEGARDE RÉELLE DANS POSTGRESQL

    return Response({
        "status": "success",
        "progress": enrollment.progress,
        "is_completed": enrollment.is_completed
    })
    

from rest_framework import viewsets, permissions

# ✅ ViewSet pour les Formations (Courses)
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    # Seuls les admins peuvent modifier, les autres peuvent juste voir (ou selon tes besoins)
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] 

# ✅ ViewSet pour les Modules
class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAdminUser]

# ✅ ViewSet pour les Leçons
class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAdminUser]