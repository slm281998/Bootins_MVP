from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser
from courses.models import Course

User = get_user_model()

# --- 1. Serializer pour l'inscription ---
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'password')

    def create(self, validated_data):
        # On copie l'email dans le champ username caché de Django
        user = User.objects.create_user(
            username=validated_data['email'], 
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_student=True
        )
        return user

# --- 2. Serializer pour la connexion ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Ajoute les infos que tu veux dans le token
        token['is_staff'] = user.is_staff
        return token

    # Si tu veux utiliser l'email comme identifiant principal
    def validate(self, attrs):
        # attrs['username'] contient en fait l'email envoyé par React 
        # si ton backend est configuré ainsi.
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'is_staff': self.user.is_staff,
            'first_name': self.user.first_name
        }
        return data
    
class UserStatSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'first_name', 'last_name', 'email', 'is_student']

class CourseAdminSerializer(serializers.ModelSerializer):
    enrolled_count = serializers.IntegerField(source='enrollments.count', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'enrolled_count'] 
        
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        # On affiche les champs de ton modèle CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_student']
        read_only_fields = ['id', 'is_student'] # On n