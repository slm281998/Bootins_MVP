import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({ 
    enrolled_courses: [], 
    certificates: [], 
    first_name: "" 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("dashboard/student/") 
      .then(res => {
        console.log("Données reçues du Backend :", res.data); // Pour le débug
        setDashboardData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API :", err);
        toast.error("Erreur de chargement des données");
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  // 🔍 FILTRE CORRIGÉ : On utilise la clé "progress" calculée par le backend
  // On affiche tout ce qui n'est pas fini (is_completed false OU progrès < 100)
  const inProgress = dashboardData.enrolled_courses?.filter(e => 
    e.is_completed === false || e.progress < 100
  ) || [];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 italic tracking-tighter uppercase">
            Bonjour, {dashboardData.first_name || "Apprenant"}
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">
            Vue globale de ton apprentissage
          </p>
        </header>

        {/* --- SECTION 1 : FORMATIONS EN COURS --- */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={18} className="text-slate-400" />
            <h2 className="font-black uppercase text-xs tracking-widest text-slate-700">Formations en cours</h2>
          </div>

          <div className="space-y-4">
            {inProgress.length > 0 ? (
              inProgress.map((enrollment) => (
                <Card key={enrollment.id} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden hover:shadow-md transition-all">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <h3 className="font-black text-slate-800 uppercase italic tracking-tight">
                          {enrollment.course_title || "Formation sans titre"}
                        </h3>
                        
                        <div className="flex items-center gap-4">
                          {/* On utilise enrollment.progress synchronisé avec le backend */}
                          <Progress value={enrollment.progress || 0} className="h-2 flex-1 bg-slate-100" />
                          <span className="text-[11px] font-black text-slate-900 w-10">
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                      </div>

                      <Button 
                        onClick={() => navigate(`/courses/${enrollment.course_id}`)}
                        className="bg-slate-900 hover:bg-primary text-white font-black uppercase text-[10px] px-8 py-6 rounded-2xl group"
                      >
                        Continuer <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="p-10 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center">
                <p className="text-slate-400 font-black uppercase text-[10px]">Aucune formation en cours</p>
              </div>
            )}
          </div>
        </section>

        {/* --- SECTION 2 : CERTIFICATS --- */}
        <section className="pb-10">
          <div className="flex items-center gap-3 mb-6">
            <Award size={18} className="text-slate-400" />
            <h2 className="font-black uppercase text-xs tracking-widest text-slate-700">Mes Certificats</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-8">
              <CardContent className="p-0 space-y-6">
                <div className="space-y-2">
                  <p className="text-4xl font-black italic tracking-tighter">
                    {dashboardData.certificates?.length || 0}
                  </p>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                    Diplômes obtenus
                  </p>
                </div>
                <Button 
                  onClick={() => navigate("/certificates")}
                  variant="outline"
                  className="w-full border-slate-700 hover:bg-white hover:text-slate-900 text-slate-800 font-black uppercase text-[10px] py-6 rounded-2xl"
                >
                  Voir les certificats
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}