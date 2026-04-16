from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CourseAdminSerializer, UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer, UserProfileSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from courses.models import Enrollment, Certificate
from .models import CustomUser
from courses.models import Course, Enrollment, Certificate
from rest_framework import generics, permissions

User = get_user_model()

from rest_framework import viewsets, permissions
from django.contrib.auth import get_user_model

User = get_user_model()

class UserAdminViewSet(viewsets.ModelViewSet):
    """
    Gestion complète des utilisateurs pour l'administration.
    Accessible uniquement par les administrateurs (is_staff).
    """
    queryset = User.objects.all().order_by('-id') # Les plus récents en premier
    serializer_class = UserSerializer
    
    # 🛡️ SÉCURITÉ : Seuls les admins peuvent accéder à ces routes
    permission_classes = [permissions.IsAdminUser]

    # Optionnel : Si tu veux pouvoir chercher par email ou pseudo
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(email__icontains=search) | queryset.filter(username__icontains=search)
        return queryset

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_formations(request):
    user = request.user
    
    try:
        # 1. Récupération des formations
        user_enrollments = Enrollment.objects.filter(user=user).select_related('course')
        formations_data = []
        for enr in user_enrollments:
            formations_data.append({
                "id": enr.id,
                "title": enr.course.title,
                # APPEL DYNAMIQUE : Pas de parenthèses car c'est une @property
                "progress": enr.get_progress, 
            })

        # 2. Récupération des certificats
        user_certificates = Certificate.objects.filter(user=user)
        certs_data = []
        for cert in user_certificates:
            # On récupère la date sans planter si le champ 'issued_at' n'existe pas
            date_obtenue = getattr(cert, 'issued_at', None)
            
            certs_data.append({
                "id": cert.id,
                "course_title": cert.course.title if cert.course else "Formation terminée",
                "date": date_obtenue.strftime("%d/%m/%Y") if date_obtenue else "Date inconnue",
                "file": cert.file.url if getattr(cert, 'file', None) else None
            })

        return Response({
            "username": user.username,
            "first_name": user.first_name or user.username,
            "enrolled_courses": formations_data,  # <-- Change "formations" par "enrolled_courses"
            "certificates": certs_data
        })

    except Exception as e:
        # Si ça plante encore, on renvoie l'erreur au lieu d'une erreur 500 vide
        return Response({"error": str(e)}, status=500)
    
    
User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAdminUser]) # Seul l'admin peut voir les stats
def admin_stats(request):
    data = {
        "users": CustomUser.objects.count(),
        "courses": Course.objects.count(),
        "certificates": Certificate.objects.count() if 'Certificate' in globals() else 0,
    }
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_recent_courses(request):
    courses = Course.objects.all().order_by('-id')[:5] # Les 5 derniers
    serializer = CourseAdminSerializer(courses, many=True)
    return Response(serializer.data)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Cette méthode permet de renvoyer l'utilisateur actuellement connecté
        return self.request.user
    
# views.py
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    user.first_name = request.data.get('first_name', user.first_name)
    user.last_name = request.data.get('last_name', user.last_name)
    user.save()
    return Response({"message": "Profil mis à jour !"})


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    """
    Vue pour le Dashboard Admin : 
    Regroupe les données des deux applications (users et courses).
    """
    try:
        data = {
            # Stats globales
            'users': User.objects.count(),
            'courses': Course.objects.count(),
            'certificates': Certificate.objects.count(),
            
            # Liste pour la sidebar "Nouveaux Membres" du dashboard React
            'recentUsers': User.objects.all().order_by('-id')[:5].values(
                'id', 'username', 'email', 'first_name', 'last_name'
            )
        }
        return Response(data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)