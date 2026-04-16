import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, ArrowLeft, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner'; // Ajout de l'import

export default function AdminEditLesson() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [lesson, setLesson] = useState({ title: "", module: "", video_url: "", content: "" });

  useEffect(() => {
    Promise.all([
      api.get(`api/lessons/${id}/`),
      api.get("api/modules/")
    ]).then(([lessonRes, modulesRes]) => {
      setLesson(lessonRes.data);
      setModules(modulesRes.data.results || modulesRes.data);
    }).catch(() => {
      toast.error("Erreur lors de la récupération des données.");
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/lessons/${id}/`, lesson);
      
      // Notification de succès
      toast.success("La leçon a été mise à jour !");
      
      navigate("/admin/lessons");
    } catch { 
      // Notification d'erreur
      toast.error("Erreur lors de la mise à jour."); 
    }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/lessons")} className="rounded-full h-12 w-12"><ArrowLeft/></Button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Modifier Leçon</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Titre</Label>
            <Input value={lesson.title} required className="rounded-xl py-6 bg-slate-50 border-none font-bold" onChange={(e) => setLesson({...lesson, title: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Module</Label>
            <select value={lesson.module} className="w-full p-4 border-none rounded-xl bg-slate-50 h-[52px] font-bold outline-none focus:ring-2 focus:ring-primary/20" onChange={(e) => setLesson({...lesson, module: e.target.value})}>
              {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Vidéo (URL)</Label>
          <Input value={lesson.video_url} className="rounded-xl py-6 bg-slate-50 border-none font-bold" onChange={(e) => setLesson({...lesson, video_url: e.target.value})} />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Contenu</Label>
          <textarea value={lesson.content} rows="6" className="w-full p-4 border-none rounded-xl bg-slate-50 font-medium focus:ring-2 focus:ring-primary/20 outline-none" onChange={(e) => setLesson({...lesson, content: e.target.value})} />
        </div>

        <Button type="submit" disabled={loading} className="w-full py-8 rounded-2xl bg-slate-900 hover:bg-primary font-black uppercase shadow-xl transition-all">
          {loading ? "Sauvegarde..." : "Sauvegarder les changements"}
        </Button>
      </form>
    </AdminLayout>
  );
}