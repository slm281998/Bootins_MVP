import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ResetPasswordConfirm() {
  const { uid, token } = useParams(); // Récupère les codes de l'URL
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return alert("Les mots de passe ne correspondent pas.");

    try {
      await api.post(`api/auth/password-reset-confirm/${uid}/${token}/`, { new_password: password });
      alert("Mot de passe changé ! Vous allez être redirigé.");
      navigate("/login");
    } catch {
      alert("Le lien est invalide ou a expiré.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <Card className="w-[400px]">
        <CardHeader><CardTitle>Nouveau mot de passe</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4">
            <Input type="password" placeholder="Nouveau mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input type="password" placeholder="Confirmez le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <Button type="submit" className="w-full">Mettre à jour</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}