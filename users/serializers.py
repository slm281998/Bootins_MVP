from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from courses.models import Course

# On récupère le modèle utilisateur configuré (ton CustomUser)
User = get_user_model()

# --- 1. Serializer pour l'Administration (Gestion complète) ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Ajout de is_student pour correspondre à ton modèle CustomUser
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'is_staff', 'is_student']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
            'username': {'required': False} # On le gérera dans create si besoin
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        # Si le username n'est pas fourni, on utilise l'email
        if not validated_data.get('username'):
            validated_data['username'] = validated_data.get('email')
            
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

# --- 2. Serializer pour l'Inscription (Public) ---
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'password')

    def create(self, validated_data):
        # Utilisation de create_user pour gérer automatiquement le hash
        user = User.objects.create_user(
            username=validated_data['email'], 
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            is_student=True # Par défaut, un inscrit est un étudiant
        )
        return user

# --- 3. Serializer pour le Profil (Mon Compte) ---
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_student']
        read_only_fields = ['id', 'is_student', 'username']

# --- 4. Serializers pour JWT & Stats ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'is_staff': self.user.is_staff,
            'first_name': self.user.first_name
        }
        return data

class CourseAdminSerializer(serializers.ModelSerializer):
    # Utilisation de related_name='enrollments' dans ton modèle Course ?
    enrolled_count = serializers.IntegerField(source='enrollments.count', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'enrolled_count']