import React, { useState } from "react";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export default function AdminAddCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", image: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("title", newCourse.title);
    formData.append("description", newCourse.description);
    if (newCourse.image) formData.append("image", newCourse.image);

    try {
      await api.post("api/courses/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      navigate("/admin/courses");
    } catch {
      alert("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/courses")} className="rounded-full h-12 w-12"><ArrowLeft/></Button>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Nouvelle Formation</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Titre</Label>
          <Input required className="rounded-xl py-6" onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Description</Label>
          <textarea rows="5" className="w-full p-4 border rounded-xl bg-white text-sm" onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Image de couverture</Label>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 rounded-2xl bg-white cursor-pointer hover:bg-slate-50 transition-all">
             <ImageIcon className="text-slate-300 mb-2"/>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
               {newCourse.image ? newCourse.image.name : "Sélectionner une image"}
             </span>
             <input type="file" className="hidden" onChange={(e) => setNewCourse({...newCourse, image: e.target.files[0]})} />
          </label>
        </div>

        <Button type="submit" disabled={loading} className="w-full py-8 rounded-2xl bg-primary font-black uppercase text-xs shadow-xl shadow-primary/20 gap-3">
          {loading ? "Création..." : <><Save size={20}/> Enregistrer la formation</>}
        </Button>
      </form>
    </AdminLayout>
  );
}