import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import logo from '../assets/logo-bootins.png';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 💡 L'ASTUCE : On envoie la variable 'email' sous le nom 'username'
      const response = await api.post("auth/login/", { 
        username: email,  // <--- Django attend "username"
        password: password 
      });
      
      // Le reste du code ne change pas
      localStorage.setItem("access_token", response.data.access);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      if (response.data.user.is_staff) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Erreur détaillée :", err.response?.data);
      alert("Identifiants incorrects ou erreur serveur.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-[400px] shadow-2xl border-none rounded-[2rem] p-4">
        <CardHeader className="space-y-4">
          <CardTitle className="flex justify-center">
            <img src={logo} alt="Logo Bootins"  
              className="h-12 w-auto block mx-auto" 
            />
          </CardTitle>
          <div className="text-center">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Connexion</h2>
            <p className="text-xs text-slate-400 font-medium italic">Accédez à votre espace Bootins Academy</p>
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
                className="rounded-xl border-slate-100 bg-slate-50/50"
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
                className="rounded-xl border-slate-100 bg-slate-50/50"
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <Button type="submit" className="w-full py-6 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20">
              Se connecter
            </Button>
          </form>

          <div className="mt-8 text-center text-xs">
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