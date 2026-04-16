import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, Loader2, ChevronRight, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({ 
    enrolled_courses: [], 
    certificates: [], 
    first_name: "" 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("api/dashboard/student/") 
      .then(res => {
        setDashboardData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur API Dashboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* 1. AFFICHAGE DU PRÉNOM (Checklist Item 1) */}
        <header className="mb-10">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 italic tracking-tighter uppercase">
            Bonjour, {dashboardData.first_name || "Apprenant"}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <LayoutDashboard size={14} className="text-primary" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">
              Vue globale de l'apprentissage
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. LISTE DES FORMATIONS SUIVIES (Checklist Item 2) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <BookOpen size={18} className="text-slate-400" />
              <h2 className="font-black uppercase text-xs tracking-widest text-slate-700">Mes Formations en cours</h2>
            </div>

            <div className="space-y-4">
              {dashboardData.enrolled_courses?.length > 0 ? (
                dashboardData.enrolled_courses.map((enrollment) => (
                  <Card key={enrollment.id} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <h3 className="font-black text-slate-800 uppercase italic tracking-tight">
                            {enrollment.course_title}
                          </h3>
                          
                          {/* 3. BARRE DE PROGRESSION % (Checklist Item 3) */}
                          <div className="flex items-center gap-4">
                            <Progress value={enrollment.progress || 0} className="h-2 flex-1 bg-slate-100" />
                            <span className="text-[11px] font-black text-slate-900 w-8">
                              {enrollment.progress || 0}%
                            </span>
                          </div>
                        </div>

                        {/* 4. BOUTON ACCÈS FORMATION (Checklist Item 4) */}
                        <Button 
                          onClick={() => navigate(`/courses/${enrollment.course_id}`)}
                          className="bg-slate-900 hover:bg-primary text-white font-black uppercase text-[10px] px-6 py-6 rounded-2xl group"
                        >
                          Accéder <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-slate-400 italic text-sm p-8 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center">
                  Aucune formation suivie pour le moment.
                </p>
              )}
            </div>
          </div>

          {/* 5. LIEN VERS CERTIFICATS (Checklist Item 5) */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Award size={18} className="text-slate-400" />
              <h2 className="font-black uppercase text-xs tracking-widest text-slate-700">Mes Certificats</h2>
            </div>

            <Card className="border-none shadow-sm rounded-[2.5rem] bg-slate-900 text-white p-8">
              <CardContent className="p-0 space-y-6">
                <div className="space-y-2">
                  <p className="text-3xl font-black italic tracking-tighter">
                    {dashboardData.certificates?.length || 0}
                  </p>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                    Certificats obtenus
                  </p>
                </div>
                
                <Button 
                  onClick={() => navigate("/certificates")}
                  variant="outline"
                  className="w-full border-slate-700 hover:bg-white hover:text-slate-900 text-white font-black uppercase text-[10px] py-6 rounded-2xl transition-all"
                >
                  Voir mes certificats
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}