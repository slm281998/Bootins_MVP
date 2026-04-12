import os
import django

# Configuration de l'environnement Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings') # Remplace 'core' par le nom de ton dossier settings
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_admin():
    username = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")
    email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@example.com")
    password = os.getenv("DJANGO_SUPERUSER_PASSWORD", "ton_mot_de_passe_secret")

    if not User.objects.filter(username=username).exists():
        print(f"Création du superutilisateur : {username}")
        User.objects.create_superuser(username=username, email=email, password=password)
    else:
        print("L'administrateur existe déjà.")

if __name__ == "__main__":
    create_admin()