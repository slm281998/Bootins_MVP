import { useState } from "react";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner'; // Ajout de l'import

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Vérification de votre compte...");

    try {
      await api.post("api/auth/password-reset/", { email });
      
      // Succès : Toast + Message dans l'interface
      toast.success("Lien de réinitialisation envoyé !", { id: toastId });
      setMessage("Si cet email existe, un lien de réinitialisation vous a été envoyé.");
      
    } catch {
      // Erreur
      toast.error("Une erreur est survenue. Vérifiez votre connexion.", { id: toastId });
      setMessage(""); // On vide le message de succès au cas où
    } finally {
      setLoading(false);
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
            <div className="space-y-6">
              <div className="text-sm font-bold text-emerald-600 bg-emerald-50 p-6 rounded-2xl border border-emerald-100 animate-in fade-in zoom-in duration-300">
                {message}
              </div>
              <Button 
                onClick={() => setMessage("")} 
                variant="ghost" 
                className="w-full text-[10px] font-black uppercase text-slate-400 hover:text-primary"
              >
                Réessayer avec un autre email
              </Button>
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
                  className="rounded-xl border-slate-200 py-6 font-bold bg-slate-50/50"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full py-6 bg-slate-900 hover:bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                {loading ? "Envoi..." : "Envoyer le lien"}
              </Button>
            </form>
          )}
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-[10px] font-black uppercase text-slate-400 hover:text-primary transition-colors">
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}