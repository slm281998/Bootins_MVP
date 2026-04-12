import { useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("api/auth/password-reset/", { email });
      setMessage("Si cet email existe, un lien de réinitialisation vous a été envoyé.");
    } catch {
      setMessage("Une erreur est survenue. Réessayez plus tard.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-[400px] shadow-xl border-none rounded-[2rem]">
        <CardHeader className="space-y-1 pt-8">
          <CardTitle className="text-2xl font-black text-slate-900 tracking-tighter italic">
            Mot de passe oublié ?
          </CardTitle>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Entrez votre email pour recevoir un lien.
          </p>
        </CardHeader>
        <CardContent className="pb-8">
          {message ? (
            <div className="text-sm font-bold text-emerald-600 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 animate-in fade-in zoom-in duration-300">
              {message}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Email professionnel
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nom@exemple.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  className="rounded-xl border-slate-200 py-6"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full py-6 bg-slate-900 hover:bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                Envoyer le lien
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}