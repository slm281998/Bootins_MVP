import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, ArrowLeft, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
// Import de toast
import { toast } from 'sonner'; 

export default function AdminAddLesson() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [newLesson, setNewLesson] = useState({ title: "", module: "", video_url: "", content: "" });

  useEffect(() => {
    api.get("api/modules/").then(res => setModules(res.data.results || res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("api/lessons/", newLesson);
      
      // Notification de succès
      toast.success("La leçon a été créée avec succès !");
      
      navigate("/admin/lessons");
    } catch { 
      // Notification d'erreur
      toast.error("Erreur lors de la création de la leçon."); 
    }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/lessons")} className="rounded-full h-12 w-12"><ArrowLeft/></Button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Nouvelle Leçon</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Titre de la leçon</Label>
            <Input required className="rounded-xl py-6 bg-slate-50 border-none font-bold" onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Module parent</Label>
            <select required className="w-full p-4 border-none rounded-xl bg-slate-50 text-sm font-bold h-[52px] outline-none focus:ring-2 focus:ring-primary/20" onChange={(e) => setNewLesson({...newLesson, module: e.target.value})}>
              <option value="">Choisir un module</option>
              {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Lien Vidéo (YouTube)</Label>
          <div className="relative">
            <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20}/>
            <Input className="pl-12 rounded-xl py-6 bg-slate-50 border-none font-bold" placeholder="https://youtube.com/..." onChange={(e) => setNewLesson({...newLesson, video_url: e.target.value})} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Contenu texte</Label>
          <textarea rows="6" className="w-full p-4 border-none rounded-2xl bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Rédigez le contenu de la leçon ici..." onChange={(e) => setNewLesson({...newLesson, content: e.target.value})} />
        </div>

        <Button type="submit" disabled={loading} className="w-full py-8 rounded-2xl bg-slate-900 hover:bg-primary font-black uppercase shadow-xl transition-all">
          {loading ? "Enregistrement..." : "Publier la leçon"}
        </Button>
      </form>
    </AdminLayout>
  );
}