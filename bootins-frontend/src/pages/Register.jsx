import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import logo from '../assets/logo-bootins.png';
import { toast } from 'sonner';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: "", // Prénom
    last_name: "",  // Nom
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // On crée une promesse pour afficher un message de chargement
    const promise = api.post("api/auth/register/", {
      first_name: formData.first_name,
      last_name: formData.last_name,
      username: formData.username,
      email: formData.email,
      password: formData.password
    });

    toast.promise(promise, {
      loading: 'Création de ton compte en cours...',
      success: () => {
        navigate("/login");
        return "Compte créé avec succès ! Bienvenue chez Bootins.";
      },
      error: (err) => {
        // On récupère le message d'erreur précis envoyé par Django
        const data = err.response?.data;
        if (data) {
          if (data.email) return `Email : ${data.email[0]}`;
          if (data.username) return `Pseudo : ${data.username[0]}`;
          if (data.password) return `Mot de passe : ${data.password[0]}`;
        }
        return "Erreur lors de l'inscription. Vérifie tes informations.";
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 py-12 px-4">
      <Card className="w-full max-w-md shadow-2xl border-none rounded-[2rem] p-2">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Logo Bootins" 
              className="h-10 w-auto block" 
            />
          </div>
          <CardTitle className="text-2xl font-black text-center text-slate-800 uppercase tracking-tighter">
            Rejoindre Bootins
          </CardTitle>
          <p className="text-xs text-slate-400 text-center font-medium italic">
            Créez votre profil d'apprenant en quelques secondes
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* --- Ligne Prénom et Nom --- */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="first_name" className="text-[10px] font-black uppercase text-slate-400 ml-1">Prénom</Label>
                <Input id="first_name" placeholder="Samir" onChange={handleChange} required className="rounded-xl border-slate-100 bg-slate-50/50" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="last_name" className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom</Label>
                <Input id="last_name" placeholder="Nom" onChange={handleChange} required className="rounded-xl border-slate-100 bg-slate-50/50" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom d'utilisateur</Label>
              <Input id="username" placeholder="Samir269" onChange={handleChange} required className="rounded-xl border-slate-100 bg-slate-50/50" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 ml-1">Email</Label>
              <Input id="email" type="email" placeholder="nom@exemple.com" onChange={handleChange} required className="rounded-xl border-slate-100 bg-slate-50/50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[10px] font-black uppercase text-slate-400 ml-1">Mot de passe</Label>
                <Input id="password" type="password" onChange={handleChange} required className="rounded-xl border-slate-100 bg-slate-50/50" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase text-slate-400 ml-1">Confirmation</Label>
                <Input id="confirmPassword" type="password" onChange={handleChange} required className="rounded-xl border-slate-100 bg-slate-50/50" />
              </div>
            </div>

            <Button type="submit" className="w-full py-6 mt-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              Créer mon compte
            </Button>
          </form>

          <div className="mt-8 text-center text-xs">
            <span className="text-slate-400 font-medium">Déjà inscrit ? </span>
            <Link to="/login" className="text-primary hover:underline font-black uppercase tracking-tighter">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}