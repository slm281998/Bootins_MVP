import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Edit, Trash2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner'; // Ajout de l'import

export default function AdminLessons() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await api.get("api/lessons/");
      setData(res.data);
    } catch (err) { 
      console.error(err);
      toast.error("Erreur lors du chargement des leçons.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette leçon ?")) {
      try {
        await api.delete(`api/lessons/${id}/`);
        setData(data.filter(item => item.id !== id));
        // Notification de succès
        toast.success("La leçon a été supprimée !");
      } catch { 
        // Notification d'erreur
        toast.error("Erreur lors de la suppression de la leçon."); 
      }
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Leçons</h1>
        <Button onClick={() => navigate("/admin/lessons/add")} className="rounded-xl bg-primary gap-2 font-black uppercase text-[10px] py-6 w-full sm:w-auto shadow-lg shadow-primary/20">
          <Plus size={18} /> Nouvelle Leçon
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Titre</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-700 flex items-center gap-3">
                    <PlayCircle size={16} className="text-primary/50" /> {item.title}
                  </td>
                  <td className="px-8 py-5 text-right space-x-2 whitespace-nowrap">
                    <Button variant="ghost" onClick={() => navigate(`/admin/lessons/edit/${item.id}`)} className="text-slate-300 hover:text-primary transition-colors">
                      <Edit size={16}/>
                    </Button>
                    <Button variant="ghost" onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={16}/>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminLayout>
  );
}