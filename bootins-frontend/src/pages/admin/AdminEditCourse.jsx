import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminEditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState({ title: "", description: "", image: null, currentImage: "" });

  useEffect(() => {
    api.get(`/formations/${id}/`).then(res => {
      setCourse({
        title: res.data.title,
        description: res.data.description,
        currentImage: res.data.image,
        image: null
      });
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("title", course.title);
    formData.append("description", course.description);
    if (course.image) formData.append("image", course.image);

    try {
      await api.patch(`api//formations/${id}/`, formData); // Patch pour ne modifier que ce qui change
      navigate("/admin/courses");
    } catch { alert("Erreur update"); }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/courses")} className="rounded-full h-12 w-12"><ArrowLeft/></Button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Modifier Formation</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Titre</Label>
          <Input value={course.title} required className="rounded-xl py-6" onChange={(e) => setCourse({...course, title: e.target.value})} />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Description</Label>
          <textarea value={course.description} rows="4" className="w-full p-4 border rounded-xl bg-slate-50 text-sm" onChange={(e) => setCourse({...course, description: e.target.value})} />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Image actuelle</Label>
          {course.currentImage && <img src={course.currentImage} className="h-20 rounded-lg mb-2 object-cover" alt="Current" />}
          <Input type="file" className="rounded-xl" onChange={(e) => setCourse({...course, image: e.target.files[0]})} />
        </div>

        <Button type="submit" disabled={loading} className="w-full py-8 rounded-2xl bg-slate-900 hover:bg-primary font-black uppercase shadow-xl transition-all">
          {loading ? "Enregistrement..." : "Mettre à jour la formation"}
        </Button>
      </form>
    </AdminLayout>
  );
}