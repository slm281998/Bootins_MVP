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
      await api.post("auth/password-reset/", { email });
      setMessage("Si cet email existe, un lien de réinitialisation vous a été envoyé.");
    } catch {
      setMessage("Une erreur est survenue. Réessayez plus tard.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Mot de passe oublié ?</CardTitle>
          <p className="text-sm text-muted-foreground">Entrez votre email pour recevoir un lien.</p>
        </CardHeader>
        <CardContent>
          {message ? (
            <p className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded">{message}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email professionnel</Label>
                <Input id="email" type="email" placeholder="nom@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full">Envoyer le lien</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}