import { useState, useEffect } from "react";
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

  const [stats, setStats] = useState({ users: 0, courses: 0, certificates: 0 });
  const [recentCourses, setRecentCourses] = useState([]);
  const [loading, setLoading] = useState(true); 
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "", image: null });

  const fetchData = async () => {
    if (typeof setLoading !== "function") {
      console.error("setLoading n'est pas défini correctement");
      return;
    }

    setLoading(true); 
    try {
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

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", newCourse.title);
    formData.append("description", newCourse.description);
    if (newCourse.image) {
      formData.append("image", newCourse.image);
    }

    try {
      const response = await api.post("courses/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      const newCourseId = response.data.id;
      setIsModalOpen(false);
      navigate(`/admin/courses/${newCourseId}`);
    } catch (err) {
      console.error("Erreur détaillée:", err.response?.data);
      alert("Erreur serveur (404 ou 400).");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    /* RESPONSIVE: flex-col sur mobile pour laisser la sidebar mobile en haut */
    <div className="flex flex-col md:flex-row h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      
      /* RESPONSIVE: p-4 sur mobile, p-8 sur desktop */
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* HEADER : Empilement sur mobile, ligne sur desktop */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-xl md:text-3xl font-black italic text-slate-900 uppercase tracking-tighter flex items-center gap-2 md:gap-3">
              <LayoutDashboard size={24} className="text-primary md:w-8 md:h-8" /> Administration
            </h1>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto gap-2 rounded-xl shadow-lg bg-primary font-bold uppercase text-[10px] py-6">
            <Plus size={18} /> Créer une formation
          </Button>
        </div>

        {/* CARTES STATS : 1 colonne mobile, 3 colonnes desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
          <StatCard title="Apprenants" value={stats.users} icon={<Users size={24} />} color="bg-blue-50 text-blue-600" />
          <StatCard title="Cours" value={stats.courses} icon={<BookOpen size={24} />} color="bg-purple-50 text-purple-600" />
          <StatCard title="Certificats" value={stats.certificates} icon={<Award size={24} />} color="bg-yellow-50 text-yellow-600" />
        </div>

        {/* TABLEAU RESPONSIVE */}
        <Card className="border-none shadow-2xl rounded-[1.5rem] md:rounded-[2.5rem] bg-white overflow-hidden">
          <CardContent className="p-0">
            {/* Conteneur pour le défilement horizontal sur mobile */}
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[500px]">
                <thead className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400">
                  <tr>
                    <th className="px-6 md:px-8 py-4">Titre</th>
                    <th className="px-6 md:px-8 py-4 text-center">Inscriptions</th>
                    <th className="px-6 md:px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentCourses.length > 0 ? (
                    recentCourses.map((course) => (
                      <tr key={course.id} onClick={() => navigate(`/admin/courses/${course.id}`)} className="hover:bg-slate-50 cursor-pointer transition-colors">
                        <td className="px-6 md:px-8 py-4 md:py-5 font-bold text-sm md:text-base">{course.title}</td>
                        <td className="px-6 md:px-8 py-4 md:py-5 text-center text-sm">{course.enrolled_count || 0}</td>
                        <td className="px-6 md:px-8 py-4 md:py-5 text-right"><Trash2 size={16} className="ml-auto text-slate-300" /></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="p-10 text-center italic text-slate-400">Aucune donnée.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* MODAL RESPONSIVE */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <Card className="w-full max-w-lg rounded-[1.5rem] md:rounded-[2.5rem] bg-white p-6 md:p-8 my-auto">
                <form onSubmit={handleCreateSubmit} className="space-y-4 md:space-y-6">
                   <div className="flex justify-between items-center">
                     <h2 className="text-lg md:text-xl font-black uppercase italic text-slate-900">Nouvelle formation</h2>
                     <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                   </div>
                   
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-400">Titre de la formation :</Label>
                     <Input required className="rounded-xl border-slate-200" onChange={(e) => setNewCourse({...newCourse, title: e.target.value})} />
                   </div>
                   
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-400">Description détaillée :</Label>
                     <textarea rows="4" className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} />
                   </div>
                   
                   <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-slate-400">Image de couverture :</Label>
                     <Input type="file" className="rounded-xl border-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-primary/10 file:text-primary" onChange={(e) => setNewCourse({...newCourse, image: e.target.files[0]})} />
                   </div>
                   
                   <div className="flex gap-3 pt-2">
                     <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl font-bold text-slate-400">Annuler</Button>
                     <Button type="submit" className="flex-1 rounded-xl bg-primary font-black uppercase text-xs shadow-lg shadow-primary/20">Créer le cours</Button>
                   </div>
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
    <Card className="border-none shadow-sm rounded-[1.5rem] md:rounded-[2rem] bg-white p-4 md:p-6 flex items-center gap-4 md:gap-5">
      <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl shrink-0 ${color}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{title}</p>
        <p className="text-2xl md:text-3xl font-black text-slate-900 leading-none">{value}</p>
      </div>
    </Card>
  );
}