import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Award, Calendar, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("api/certificates/me/")
      .then((res) => {
        setCertificates(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors de la récupération des certificats:", err);
        setLoading(false);
      });
  }, []);

  return (
    /* RESPONSIVE: flex-col sur mobile pour la Sidebar mobile, flex-row sur desktop */
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      
      /* RESPONSIVE: p-4 sur mobile, p-8 sur desktop */
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          
          {/* Header : Centré sur mobile, aligné à gauche sur desktop */}
          <div className="mb-8 md:mb-10 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 italic uppercase tracking-tighter">
              Mes Certifications
            </h1>
            <p className="text-slate-400 md:text-slate-500 text-xs md:text-sm font-medium mt-1">
              Retrouvez ici tous vos titres de réussite Bootins Academy.
            </p>
          </div>

          {loading ? (
            /* Skeleton responsive */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[1, 2].map((n) => (
                <div key={n} className="h-40 md:h-48 bg-white rounded-3xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : certificates.length > 0 ? (
            /* Grille responsive : 1 colonne mobile, 2 colonnes desktop */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pb-10">
              {certificates.map((cert) => (
                <div 
                  key={cert.id} 
                  className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 md:p-3 bg-primary/10 rounded-xl md:rounded-2xl text-primary shrink-0">
                      <Award className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest shrink-0">
                      Valide ✓
                    </span>
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-slate-800 mb-1 group-hover:text-primary transition-colors leading-tight">
                    {cert.course_title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] md:text-sm mb-6 font-bold uppercase tracking-wide">
                    <Calendar size={14} />
                    Obtenu le {cert.date}
                  </div>

                  <Button 
                    onClick={() => navigate(`/courses/${cert.course_id}/certificate`)}
                    className="w-full justify-between bg-slate-50 hover:bg-primary hover:text-white text-slate-600 border-none rounded-xl md:rounded-2xl py-5 md:py-6 font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
                  >
                    Détails du certificat
                    <ChevronRight size={16} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            /* État vide responsive : padding et tailles ajustés */
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-10 md:p-20 text-center border-4 border-dashed border-slate-100 flex flex-col items-center">
              <div className="bg-slate-50 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-6 text-slate-300">
                <FileText className="w-8 h-8 md:w-10 md:h-10" />
              </div>
              <h2 className="text-lg md:text-xl font-black text-slate-700 mb-2 tracking-tight">Aucun certificat pour le moment</h2>
              <p className="text-slate-400 max-w-xs text-xs md:text-sm font-medium mb-8">
                Terminez vos formations à 100% pour débloquer vos certifications officielles.
              </p>
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="w-full sm:w-auto rounded-full px-8 py-6 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-slate-100"
              >
                Continuer mes cours
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}