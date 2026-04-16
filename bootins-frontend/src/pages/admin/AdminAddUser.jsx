import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, ArrowLeft, User, Mail, Lock, ShieldCheck, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner'; // Import de toast

export default function AdminAddUser() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    first_name: "", 
    last_name: "",  
    email: "",
    password: "",
    is_staff: false
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("api/users/", newUser);
      
      // Notification de succès
      toast.success("Utilisateur créé avec succès !");
      
      navigate("/admin/users");
    } catch (err) {
      console.error("Erreur création:", err.response?.data);
      
      // Notification d'erreur précise
      toast.error("Erreur : l'email ou le pseudo existe déjà.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="rounded-full h-12 w-12">
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Nouvel Utilisateur</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Prénom</Label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input 
                required
                placeholder="Votre prenom"
                className="pl-12 rounded-xl py-6 bg-slate-50 border-none font-bold"
                onChange={(e) => setNewUser({...newUser, first_name: e.target.value})} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Nom</Label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input 
                required
                placeholder="Votre nom"
                className="pl-12 rounded-xl py-6 bg-slate-50 border-none font-bold"
                onChange={(e) => setNewUser({...newUser, last_name: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Nom d'utlisateur</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input 
                required
                placeholder="Votre nom d'utilisateur"
                className="pl-12 rounded-xl py-6 bg-slate-50 border-none font-bold"
                onChange={(e) => setNewUser({...newUser, username: e.target.value})} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input 
                required
                type="email"
                placeholder="utilisateur@mail.com"
                className="pl-12 rounded-xl py-6 bg-slate-50 border-none font-bold"
                onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Mot de passe temporaire</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <Input 
              required
              type="password"
              className="pl-12 rounded-xl py-6 bg-slate-50 border-none font-bold"
              onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Attribuer un rôle</Label>
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => setNewUser({...newUser, is_staff: false})}
              className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                !newUser.is_staff ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-100 opacity-60"
              }`}
            >
              <User size={24} />
              <span className="font-black text-[10px] uppercase">Apprenant</span>
            </div>

            <div 
              onClick={() => setNewUser({...newUser, is_staff: true})}
              className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                newUser.is_staff ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-100 opacity-60"
              }`}
            >
              <ShieldCheck size={24} />
              <span className="font-black text-[10px] uppercase">Admin</span>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full py-8 rounded-2xl bg-slate-900 hover:bg-primary font-black uppercase shadow-xl transition-all gap-3 text-[11px]"
        >
          {loading ? "Création..." : <><Save size={20}/> Créer le compte</>}
        </Button>
      </form>
    </AdminLayout>
  );
}