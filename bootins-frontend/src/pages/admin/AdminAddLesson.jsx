import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, ArrowLeft, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

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
      navigate("/admin/lessons");
    } catch { alert("Erreur lors de la création"); }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/lessons")} className="rounded-full h-12 w-12"><ArrowLeft/></Button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Nouvelle Leçon</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white p-8 rounded-[2.5rem] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Titre de la leçon</Label>
            <Input required className="rounded-xl py-6" onChange={(e) => setNewLesson({...newLesson, title: e.target.value})} />
          </div>
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Module parent</Label>
            <select required className="w-full p-4 border rounded-xl bg-slate-50 text-sm font-bold h-[52px]" onChange={(e) => setNewLesson({...newLesson, module: e.target.value})}>
              <option value="">Choisir un module</option>
              {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Lien Vidéo (YouTube)</Label>
          <div className="relative">
            <Video className="absolute left-4 top-4 text-slate-300" size={20}/>
            <Input className="pl-12 rounded-xl py-6" placeholder="https://youtube.com/..." onChange={(e) => setNewLesson({...newLesson, video_url: e.target.value})} />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Contenu texte</Label>
          <textarea rows="6" className="w-full p-4 border rounded-2xl bg-slate-50 text-sm" placeholder="Rédigez le contenu de la leçon ici..." onChange={(e) => setNewLesson({...newLesson, content: e.target.value})} />
        </div>

        <Button type="submit" disabled={loading} className="w-full py-8 rounded-2xl bg-primary font-black uppercase shadow-xl shadow-primary/20">
          {loading ? "Enregistrement..." : "Publier la leçon"}
        </Button>
      </form>
    </AdminLayout>
  );
}