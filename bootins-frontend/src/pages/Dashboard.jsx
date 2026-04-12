import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, BookOpen, Loader2, Download, ExternalLink, CheckCircle2 } from "lucide-react";
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
        <header className="mb-8 md:mb-10">
          {/* RESPONSIVE: text-2xl sur mobile, text-4xl sur desktop */}
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 italic tracking-tighter">
            Bonjour, {dashboardData.first_name || JSON.parse(localStorage.getItem("user") || "{}").first_name || "Apprenant"} !
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] mt-1">
            Ton espace de formation personnel
          </p>
        </header>

        {/* --- SECTION 1 : TES FORMATIONS --- */}
        <section className="mb-10 md:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 text-primary rounded-xl"><BookOpen size={20} /></div>
            <h2 className="font-black uppercase text-[10px] md:text-xs tracking-widest text-slate-700">Mes Formations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {dashboardData.enrolled_courses?.length > 0 ? (
              dashboardData.enrolled_courses.map((enrollment) => (
                <Card 
                  key={enrollment.id} 
                  /* RESPONSIVE: Arrondi réduit sur mobile pour plus d'espace */
                  className={`border-none shadow-sm hover:shadow-xl transition-all rounded-[1.5rem] md:rounded-[2.5rem] bg-white group overflow-hidden ${enrollment.is_completed ? 'ring-2 ring-emerald-500/20' : 'ring-1 ring-slate-100'}`}
                > 
                  <CardContent className="p-6 md:p-8 flex flex-col gap-4 md:gap-6">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-black text-lg md:text-xl text-slate-800 leading-tight group-hover:text-primary transition-colors">
                        {enrollment.course_title}
                      </h3>
                      {enrollment.is_completed ? (
                        <div className="flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase shrink-0">
                          <CheckCircle2 size={10} /> Terminé
                        </div>
                      ) : (
                        <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-full shrink-0">
                          {enrollment.progress || 0}%
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <Progress 
                        value={enrollment.is_completed ? 100 : (enrollment.progress || 0)} 
                        className={enrollment.is_completed ? "h-2 md:h-3 bg-emerald-100" : "h-2 md:h-3 bg-slate-100"} 
                      />
                      
                      <div className="flex flex-col gap-2">
                        {enrollment.is_completed ? (
                          <Button 
                            onClick={() => navigate(`/courses/${enrollment.course_id}/certificate`)}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black uppercase text-[9px] md:text-[10px] py-5 md:py-6 rounded-xl md:rounded-2xl gap-2 shadow-lg shadow-yellow-200 transition-transform active:scale-95"
                          >
                            <Award size={16} /> Voir le certificat
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => navigate(`/courses/${enrollment.course_id}`)}
                            className="w-full bg-slate-900 hover:bg-primary text-white font-black uppercase text-[9px] md:text-[10px] py-5 md:py-6 rounded-xl md:rounded-2xl gap-2 transition-all active:scale-95"
                          >
                            Continuer <ExternalLink size={14} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-1 md:col-span-2 py-12 md:py-20 bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-4 border-dashed border-slate-100 text-center text-slate-400 italic text-sm">
                Aucune formation active.
              </div>
            )}
          </div>
        </section>

        {/* --- SECTION 2 : HISTORIQUE DES DIPLÔMES --- */}
        <section className="pb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl"><Award size={20} /></div>
            <h2 className="font-black uppercase text-[10px] md:text-xs tracking-widest text-slate-700">Historique des diplômes</h2>
          </div>

          <div className="w-full md:max-w-2xl space-y-3 md:space-y-4">
            {dashboardData.certificates?.length > 0 ? (
              dashboardData.certificates.map((cert) => (
                <div 
                  key={cert.id} 
                  onClick={() => navigate(`/courses/${cert.course_id}/certificate`)}
                  className="flex items-center justify-between p-4 md:p-6 bg-white border border-slate-50 rounded-2xl md:rounded-[2rem] shadow-sm hover:shadow-md hover:translate-x-1 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3 md:gap-5">
                    <div className="p-3 md:p-4 bg-yellow-50 text-yellow-600 rounded-xl md:rounded-2xl group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                      <Award size={24} className="md:w-7 md:h-7" />
                    </div>
                    <div>
                      <p className="font-black text-sm md:text-base text-slate-800 tracking-tight">{cert.course_title}</p>
                      <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase mt-1">
                        Délivré le {new Date(cert.issued_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Download className="text-slate-300 group-hover:text-primary transition-colors shrink-0" size={18} />
                </div>
              ))
            ) : (
              <div className="p-6 md:p-8 bg-slate-100/50 rounded-2xl md:rounded-[2rem] text-center border border-dashed border-slate-200 text-[10px] font-bold uppercase tracking-widest italic text-slate-400">
                Aucun certificat obtenu
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}