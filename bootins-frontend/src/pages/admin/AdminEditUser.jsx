import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, ArrowLeft, User, Mail, Lock, ShieldCheck, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner'; // Ajout de l'import

export default function AdminEditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userData, setUserData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    is_staff: false,
    password: "" 
  });

  // Charger les données de l'utilisateur au montage
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`api/users/${id}/`);
        // On initialise le password à vide pour ne pas afficher le hash crypté
        setUserData({ ...res.data, password: "" });
      } catch (err) {
        console.error("Erreur chargement:", err);
        // Toast d'erreur pour le chargement
        toast.error("Impossible de charger les données de l'utilisateur.");
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = { ...userData };
      // Si le champ password est vide, on ne l'envoie pas pour ne pas l'écraser
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      await api.put(`api/users/${id}/`, dataToSend);
      
      // Toast de succès
      toast.success("Profil mis à jour avec succès !");
      
      navigate("/admin/users");
    } catch (err) {
      console.error("Erreur modification:", err.response?.data);
      // Toast d'erreur pour la mise à jour
      toast.error("Erreur lors de la mise à jour de l'utilisateur.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <AdminLayout><p className="font-black uppercase text-slate-400">Chargement...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/users")} className="rounded-full h-12 w-12 text-slate-400">
          <ArrowLeft />
        </Button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Modifier le Membre</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        
        {/* --- LIGNE : PRÉNOM & NOM --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Prénom</Label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input 
                value={userData.first_name}
                placeholder="Prénom"
                className="pl-12 rounded-xl py-6 bg-slate-50 border-none font-bold"
                onChange={(e) => setUserData({...userData, first_name: e.target.value})} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Nom</Label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input 
                value={userData.last_name}
                placeholder="Nom"
                className="pl-12 rounded-xl py-6 bg-slate-50 border-none font-bold"
                onChange={(e) => setUserData({...userData, last_name: e.target.value})} 
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pseudo (Username) */}
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Nom d'utlisateur (Non modifiable)</Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400/30" size={18} />
              <Input 
                disabled
                value={userData.username}
                className="pl-12 rounded-xl py-6 bg-slate-100 border-none font-bold text-slate-400 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <Input 
                required
                type="email"
                value={userData.email}
                className="pl-12 rounded-xl py-6 bg-slate-50 border-none font-bold"
                onChange={(e) => setUserData({...userData, email: e.target.value})} 
              />
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest italic">Nouveau mot de passe (Laisser vide pour ne pas changer)</Label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <Input 
              type="password"
              placeholder="••••••••"
              className="pl-12 rounded-xl py-6 bg-slate-50 border-none font-bold"
              onChange={(e) => setUserData({...userData, password: e.target.value})} 
            />
          </div>
        </div>

        {/* Rôle */}
        <div className="space-y-3">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Rôle de l'utilisateur</Label>
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => setUserData({...userData, is_staff: false})}
              className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                !userData.is_staff ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-100 opacity-60"
              }`}
            >
              <User size={24} />
              <span className="font-black text-[10px] uppercase">Étudiant</span>
            </div>

            <div 
              onClick={() => setUserData({...userData, is_staff: true})}
              className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                userData.is_staff ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-100 opacity-60"
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
          className="w-full py-8 rounded-2xl bg-slate-900 hover:bg-primary font-black uppercase shadow-xl transition-all gap-3"
        >
          {loading ? "Enregistrement..." : <><Save size={20}/> Mettre à jour le profil</>}
        </Button>
      </form>
    </AdminLayout>
  );
}