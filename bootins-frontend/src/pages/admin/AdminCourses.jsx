import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminCourses() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await api.get("api/formations/");
      setData(res.data);
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette formation ?")) {
      try {
        await api.delete(`courses/${id}/`);
        setData(data.filter(item => item.id !== id));
      } catch { alert("Erreur suppression"); }
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Formations</h1>
        <Button onClick={() => navigate("/admin/courses/add")} className="rounded-xl bg-primary gap-2 font-black uppercase text-[10px] py-6 w-full sm:w-auto">
          <Plus size={18} /> Ajouter
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 italic">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Titre</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-700 flex items-center gap-3">
                    <BookOpen size={16} className="text-primary/50" /> {item.title}
                  </td>
                  <td className="px-8 py-5 text-right space-x-2 whitespace-nowrap">
                    <Button variant="ghost" onClick={() => navigate(`/admin/courses/edit/${item.id}`)} className="text-slate-300 hover:text-primary"><Edit size={16}/></Button>
                    <Button variant="ghost" onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></Button>
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