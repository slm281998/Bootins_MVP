import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminEditModule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formations, setFormations] = useState([]);
  const [moduleData, setModuleData] = useState({ title: "", formation: "" });

  useEffect(() => {
    // Charger le module ET les formations pour le select
    Promise.all([
      api.get(`api//modules/${id}/`),
      api.get("api//formations/")
    ]).then(([moduleRes, formationsRes]) => {
      setModuleData({ title: moduleRes.data.title, formation: moduleRes.data.formation });
      setFormations(formationsRes.data.results || formationsRes.data);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`api/modules/${id}/`, moduleData);
      navigate("/admin/modules");
    } catch { alert("Erreur"); }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/modules")} className="rounded-full h-12 w-12"><ArrowLeft/></Button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Modifier Module</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl space-y-6 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Titre du module</Label>
          <Input value={moduleData.title} required className="rounded-xl py-6" onChange={(e) => setModuleData({...moduleData, title: e.target.value})} />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Changer la formation :</Label>
          <select 
            value={moduleData.formation}
            required
            className="w-full p-4 border rounded-xl bg-slate-50 text-sm font-bold"
            onChange={(e) => setModuleData({...moduleData, formation: e.target.value})}
          >
            {formations.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
          </select>
        </div>

        <Button type="submit" disabled={loading} className="w-full py-8 rounded-2xl bg-slate-900 hover:bg-primary font-black uppercase transition-all">
          Enregistrer les modifications
        </Button>
      </form>
    </AdminLayout>
  );
}