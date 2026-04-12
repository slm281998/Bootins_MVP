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
    api.get("dashboard/student/") 
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
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-4xl font-black text-slate-900 italic tracking-tighter">
            Bonjour, {dashboardData.first_name || "Mze Mbaba"} !
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Ton espace de formation personnel
          </p>
        </header>

        {/* --- SECTION 1 : TES FORMATIONS (EN COURS OU FINIES) --- */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 text-primary rounded-xl"><BookOpen size={20} /></div>
            <h2 className="font-black uppercase text-xs tracking-widest text-slate-700">Mes Formations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData.enrolled_courses?.length > 0 ? (
              dashboardData.enrolled_courses.map((enrollment) => (
                <Card 
                  key={enrollment.id} 
                  className={`border-none shadow-sm hover:shadow-xl transition-all rounded-[2.5rem] bg-white group overflow-hidden ${enrollment.is_completed ? 'ring-2 ring-emerald-500/20' : 'ring-1 ring-slate-100'}`}
                > 
                  <CardContent className="p-8 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-xl text-slate-800 leading-tight group-hover:text-primary transition-colors">
                        {enrollment.course_title}
                      </h3>
                      {enrollment.is_completed ? (
                        <div className="flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                          <CheckCircle2 size={12} /> Terminé
                        </div>
                      ) : (
                        <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full">
                          {enrollment.progress || 0}%
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <Progress 
                        value={enrollment.is_completed ? 100 : (enrollment.progress || 0)} 
                        className={enrollment.is_completed ? "h-3 bg-emerald-100" : "h-3 bg-slate-100"} 
                      />
                      
                      <div className="flex flex-col gap-2">
                        {enrollment.is_completed ? (
                          /* ✅ ROUTE FIXÉE : On utilise enrollment.course_id */
                          <Button 
                            onClick={() => navigate(`/courses/${enrollment.course_id}/certificate`)}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black uppercase text-[10px] py-6 rounded-2xl gap-2 shadow-lg shadow-yellow-200 transition-transform active:scale-95"
                          >
                            <Award size={18} /> Voir le certificat
                          </Button>
                        ) : (
                          /* ✅ ROUTE FIXÉE : Continuer la formation */
                          <Button 
                            onClick={() => navigate(`/courses/${enrollment.course_id}`)}
                            className="w-full bg-slate-900 hover:bg-primary text-white font-black uppercase text-[10px] py-6 rounded-2xl gap-2 transition-all active:scale-95"
                          >
                            Continuer la formation <ExternalLink size={16} />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 py-20 bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 text-center text-slate-400 italic">
                Aucune formation active.
              </div>
            )}
          </div>
        </section>

        {/* --- SECTION 2 : HISTORIQUE DES DIPLÔMES --- */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl"><Award size={20} /></div>
            <h2 className="font-black uppercase text-xs tracking-widest text-slate-700">Historique des diplômes</h2>
          </div>

          <div className="max-w-2xl space-y-4">
            {dashboardData.certificates?.length > 0 ? (
              dashboardData.certificates.map((cert) => (
                <div 
                  key={cert.id} 
                  /* 🚀 CORRECTION MAJEURE : On utilise cert.course_id ici (pas enrollment) */
                  onClick={() => navigate(`/courses/${cert.course_id}/certificate`)}
                  className="flex items-center justify-between p-6 bg-white border border-slate-50 rounded-[2rem] shadow-sm hover:shadow-md hover:translate-x-1 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-yellow-50 text-yellow-600 rounded-2xl group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                      <Award size={28} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 tracking-tight">{cert.course_title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        Délivré le {new Date(cert.issued_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <Download className="text-slate-300 group-hover:text-primary transition-colors" size={20} />
                </div>
              ))
            ) : (
              <div className="p-8 bg-slate-100/50 rounded-[2rem] text-center border border-dashed border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-widest italic">
                Aucun certificat obtenu pour le moment
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}