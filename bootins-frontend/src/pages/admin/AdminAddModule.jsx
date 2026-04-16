import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner'; // Ajout de l'import

export default function AdminAddModule() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formations, setFormations] = useState([]);
  const [newModule, setNewModule] = useState({ title: "", formation: "" });

  useEffect(() => {
    // On charge les formations pour le menu déroulant
    api.get("api/formations/").then(res => setFormations(res.data.results || res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("modules/", {
        title: newModule.title,
        formation: newModule.formation // ID de la formation choisie
      });
      
      // Notification de succès
      toast.success("Le module a été créé avec succès !");
      
      navigate("/admin/modules");
    } catch { 
      // Notification d'erreur
      toast.error("Erreur lors de la création du module."); 
    }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/modules")} className="rounded-full h-12 w-12"><ArrowLeft/></Button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Nouveau Module</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Titre du module</Label>
          <Input required className="rounded-xl py-6 bg-slate-50 border-none font-bold" onChange={(e) => setNewModule({...newModule, title: e.target.value})} />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Appartient à la formation :</Label>
          <select 
            required
            className="w-full p-4 border-none rounded-xl bg-slate-50 text-sm font-bold h-[52px] outline-none focus:ring-2 focus:ring-primary/20"
            onChange={(e) => setNewModule({...newModule, formation: e.target.value})}
          >
            <option value="">Sélectionner une formation</option>
            {formations.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
          </select>
        </div>

        <Button type="submit" disabled={loading} className="w-full py-8 rounded-2xl bg-slate-900 hover:bg-primary font-black uppercase shadow-xl transition-all">
          {loading ? "Création..." : "Créer le module"}
        </Button>
      </form>
    </AdminLayout>
  );
}