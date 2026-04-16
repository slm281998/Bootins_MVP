import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Trash2, 
  Mail, 
  Plus, 
  UserPlus, 
  Edit, 
  User, 
  ShieldCheck,
  Search 
} from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("api/users/");
      setUsers(res.data.results || res.data);
    } catch (err) {
      console.error("Erreur chargement utilisateurs:", err);
      // Notification d'erreur au chargement
      toast.error("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cet utilisateur ?")) {
      try {
        await api.delete(`api/users/${id}/`);
        setUsers(users.filter(u => u.id !== id));
        // Notification de succès
        toast.success("Utilisateur supprimé avec succès !");
      } catch {
        // Notification d'erreur à la suppression
        toast.error("Erreur lors de la suppression de l'utilisateur.");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Utilisateurs</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Gestion des comptes membres</p>
        </div>
        <Button 
          onClick={() => navigate("/admin/users/add")} 
          className="rounded-xl bg-primary font-black uppercase text-[10px] py-6 w-full sm:w-auto shadow-lg shadow-primary/20 gap-2"
        >
          <Plus size={18} /> Ajouter un utilisateur
        </Button>
      </div>

      <Card className="border-none shadow-sm rounded-[2rem] bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Utilisateur</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400">Rôle</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{u.username}</span>
                        <span className="text-[10px] text-slate-400 italic flex items-center gap-1">
                          <Mail size={10} /> {u.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {u.is_staff ? (
                        <span className="text-[10px] font-black uppercase px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-1 w-fit">
                          <ShieldCheck size={12} /> Admin
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-3 py-1 bg-blue-50 text-blue-600 rounded-full flex items-center gap-1 w-fit">
                          <User size={12} /> Apprenant
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-right space-x-1">
                      <Button variant="ghost" onClick={() => navigate(`/admin/users/edit/${u.id}`)} className="text-slate-300 hover:text-primary transition-colors">
                        <Edit size={16}/>
                      </Button>
                      <Button variant="ghost" onClick={() => handleDelete(u.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16}/>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}