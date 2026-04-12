import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import logo from '../assets/logo-bootins.png';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const toastId = toast.loading("Connexion à Bootins Academy...");

    try {
      const response = await api.post("api/auth/login/", { 
          username: email, 
          password: password 
      });
      
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      toast.success(`Bienvenue, ${response.data.user.first_name || 'étudiant'} !`, { id: toastId });

      if (response.data.user.is_staff) {
          navigate("/admin");
      } else {
          navigate("/dashboard");
      }

      } catch (err) {
          console.error("Erreur détaillée :", err.response?.data);
          
          const status = err.response?.status;
          if (status === 401) {
              toast.error("Email ou mot de passe incorrect.", { id: toastId });
          } else if (status === 404) {
              toast.error("Le serveur est introuvable. Vérifie ton URL Render.", { id: toastId });
          } else {
              toast.error("Une erreur serveur est survenue. Réessaie plus tard.", { id: toastId });
          }
      }
  };

  return (
    /* RESPONSIVE: px-4 et min-h-screen pour s'adapter à tous les téléphones */
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      {/* RESPONSIVE: w-full max-w-[400px] remplace la largeur fixe */}
      <Card className="w-full max-w-[400px] shadow-2xl border-none rounded-[2rem] p-2 md:p-4">
        <CardHeader className="space-y-4">
          <CardTitle className="flex justify-center">
            <img src={logo} alt="Logo Bootins"  
              className="h-10 md:h-12 w-auto block mx-auto" 
            />
          </CardTitle>
          <div className="text-center">
            <h2 className="text-lg md:text-xl font-black text-slate-800 uppercase tracking-tighter">Connexion</h2>
            <p className="text-[10px] md:text-xs text-slate-400 font-medium italic">Accédez à votre espace Bootins Academy</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 ml-1">Email professionnel</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="nom@exemple.com" 
                className="rounded-xl border-slate-100 bg-slate-50/50 py-6"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <Label htmlFor="password" title="Mot de passe" className="text-[10px] font-black uppercase text-slate-400">Mot de passe</Label>
                <Link to="/forgot-password" size="180°C" className="text-[10px] text-primary hover:underline font-bold uppercase">
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input 
                id="password" 
                type="password" 
                className="rounded-xl border-slate-100 bg-slate-50/50 py-6"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <Button type="submit" className="w-full py-6 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
              Se connecter
            </Button>
          </form>

          <div className="mt-8 text-center text-[11px] md:text-xs">
            <span className="text-slate-400 font-medium">Nouveau sur la plateforme ? </span>
            <Link to="/register" className="text-primary hover:underline font-black uppercase tracking-tighter">
              Créer un compte
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}