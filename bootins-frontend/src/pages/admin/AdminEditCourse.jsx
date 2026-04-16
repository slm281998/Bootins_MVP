import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner'; // Ajout de l'import

export default function AdminEditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState({ title: "", description: "", image: null, currentImage: "" });

  useEffect(() => {
    api.get(`/formations/${id}/`)
      .then(res => {
        setCourse({
          title: res.data.title,
          description: res.data.description,
          currentImage: res.data.image,
          image: null
        });
      })
      .catch(() => {
        toast.error("Erreur lors du chargement des données.");
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
      // Correction du double slash pour éviter les erreurs 404
      await api.patch(`api/formations/${id}/`, formData); 
      
      // Notification de succès
      toast.success("Formation mise à jour avec succès !");
      
      navigate("/admin/courses");
    } catch { 
      // Notification d'erreur
      toast.error("Erreur lors de la mise à jour."); 
    }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/courses")} className="rounded-full h-12 w-12"><ArrowLeft/></Button>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Modifier Formation</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 bg-white p-6 md:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Titre</Label>
          <Input 
            value={course.title} 
            required 
            className="rounded-xl py-6 bg-slate-50 border-none font-bold" 
            onChange={(e) => setCourse({...course, title: e.target.value})} 
          />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Description</Label>
          <textarea 
            value={course.description} 
            rows="4" 
            className="w-full p-4 border-none rounded-xl bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none" 
            onChange={(e) => setCourse({...course, description: e.target.value})} 
          />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-black text-slate-400 tracking-widest">Image actuelle</Label>
          {course.currentImage && (
            <div className="mb-2">
              <img src={course.currentImage} className="h-24 rounded-2xl object-cover border border-slate-100 shadow-sm" alt="Current" />
            </div>
          )}
          <div className="relative">
            <Input 
              type="file" 
              className="rounded-xl bg-slate-50 border-none file:bg-slate-900 file:text-white file:rounded-lg file:text-[10px] file:font-black file:uppercase file:px-4 file:mr-4 file:border-none h-auto py-2" 
              onChange={(e) => setCourse({...course, image: e.target.files[0]})} 
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full py-8 rounded-2xl bg-slate-900 hover:bg-primary font-black uppercase shadow-xl transition-all"
        >
          {loading ? "Enregistrement..." : "Mettre à jour la formation"}
        </Button>
      </form>
    </AdminLayout>
  );
}