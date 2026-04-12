import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { 
  Users, 
  BookOpen, 
  Award, 
  Plus, 
  Edit, 
  Trash2, 
  LayoutDashboard,
  RefreshCw,
  X,
  Image as ImageIcon
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  const navigate = useNavigate();

  // --- 1. VÉRIFIE CETTE LIGNE (Crochets [ ] indispensables) ---
  const [stats, setStats] = useState({ users: 0, courses: 0, certificates: 0 });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true); // <--- Doit être écrit exactement comme ça
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", image: null });

  // --- 2. VÉRIFIE LES URLS DANS fetchData ---
  const fetchData = async () => {
    // Sécurité au cas où setLoading serait mal déclaré
    if (typeof setLoading !== "function") {
      console.error("setLoading n'est pas défini correctement en haut du fichier");
      return;
    }

    setLoading(true); 
    try {
      // Ajoute bien les / à la fin des URLs
      const [statsRes, coursesRes] = await Promise.all([
        api.get("admin/stats/"), 
        api.get("admin/recent-courses/")
      ]);
      
      setStats(statsRes.data);
      const coursesData = coursesRes.data.results || coursesRes.data;
      setRecentCourses(Array.isArray(coursesData) ? coursesData : []);
      
    } catch (err) {
      console.error("Erreur de récupération:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. VÉRIFIE L'URL DE CRÉATION ---
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("title", newCourse.title);
    formData.append("description", newCourse.description);
    if (newCourse.image) {
      formData.append("image", newCourse.image);
    }

    try {
      // 1. On crée la formation en base de données
      // IMPORTANT : Vérifie bien que l'URL dans Django finit par un /
      const response = await api.post("courses/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      // 2. On récupère l'ID que Django vient de créer
      const newCourseId = response.data.id;
      
      console.log("Formation créée avec succès, ID :", newCourseId);

      // 3. On ferme la modal
      setIsModalOpen(false);
      
      // 4. 🚀 REDIRECTION immédiate vers le builder
      // Assure-toi que ta route dans App.jsx est bien "/admin/courses/:id"
      navigate(`/admin/courses/${newCourseId}`);
      
    } catch (err) {
      console.error("Erreur détaillée lors de la création :", err.response?.data);
      alert("Erreur serveur (404 ou 400). Vérifie tes URLs Django ou les champs obligatoires.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter flex items-center gap-3">
              <LayoutDashboard size={32} className="text-primary" /> Administration
            </h1>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 rounded-xl shadow-lg bg-primary font-bold uppercase text-xs">
            <Plus size={18} /> Créer une formation
          </Button>
        </div>

        {/* CARTES STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Apprenants" value={stats.users} icon={<Users size={24} />} color="bg-blue-50 text-blue-600" />
          <StatCard title="Cours" value={stats.courses} icon={<BookOpen size={24} />} color="bg-purple-50 text-purple-600" />
          <StatCard title="Certificats" value={stats.certificates} icon={<Award size={24} />} color="bg-yellow-50 text-yellow-600" />
        </div>

        {/* TABLEAU */}
        <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400">
                <tr>
                  <th className="px-8 py-4">Titre</th>
                  <th className="px-8 py-4 text-center">Inscriptions</th>
                  <th className="px-8 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCourses.length > 0 ? (
                  recentCourses.map((course) => (
                    <tr key={course.id} onClick={() => navigate(`/admin/courses/${course.id}`)} className="hover:bg-slate-50 cursor-pointer">
                      <td className="px-8 py-5 font-bold">{course.title}</td>
                      <td className="px-8 py-5 text-center">{course.enrolled_count || 0}</td>
                      <td className="px-8 py-5 text-right"><Trash2 size={16} className="ml-auto text-slate-300" /></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="3" className="p-10 text-center italic text-slate-400">Aucune donnée.</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <Card className="w-full max-w-lg rounded-[2.5rem] bg-white p-8">
               <form onSubmit={handleCreateSubmit} className="space-y-6">
                  <h2 className="text-xl font-black uppercase italic">Ajouter une formation</h2>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Titre :</Label>
                    <Input required onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Description :</Label>
                    <textarea className="w-full p-4 border rounded-2xl bg-slate-50" onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-slate-400">Image :</Label>
                    <Input type="file" onChange={(e) => setNewCourse({...newCourse, image: e.target.files[0]})} />
                  </div>
                  <Button type="submit" className="w-full rounded-2xl bg-primary font-black uppercase">Créer</Button>
               </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <Card className="border-none shadow-sm rounded-[2rem] bg-white p-6 flex items-center gap-5">
      <div className={`p-4 rounded-2xl ${color}`}>{icon}</div>
      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p><p className="text-3xl font-black text-slate-900">{value}</p></div>
    </Card>
  );
}