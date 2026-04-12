import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Award, Calendar, ChevronRight, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MyCertificates() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Appel à l'endpoint qu'on vient de créer dans Django
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
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* Header de la page */}
          <div className="mb-10">
            <h1 className="text-3xl font-black text-slate-800 italic uppercase tracking-tighter">
              Mes Certifications
            </h1>
            <p className="text-slate-500 font-medium">
              Retrouvez ici tous vos titres de réussite Bootins Academy.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((n) => (
                <div key={n} className="h-48 bg-white rounded-3xl animate-pulse border-2 border-slate-100" />
              ))}
            </div>
          ) : certificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certificates.map((cert) => (
                <div 
                  key={cert.id} 
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-xl hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                      <Award size={32} />
                    </div>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full uppercase tracking-widest">
                      Valide ✓
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-primary transition-colors">
                    {cert.course_title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-6 font-medium">
                    <Calendar size={14} />
                    Obtenu le {cert.date}
                  </div>

                  <Button 
                    onClick={() => navigate(`/courses/${cert.course_id}/certificate`)}
                    className="w-full justify-between bg-slate-50 hover:bg-primary hover:text-white text-slate-600 border-none rounded-2xl py-6 font-bold"
                  >
                    Voir les détails du certificat
                    <ChevronRight size={18} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            /* État vide si aucun certificat */
            <div className="bg-white rounded-[3rem] p-20 text-center border-4 border-dashed border-slate-100">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <FileText size={40} />
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">Aucun certificat pour le moment</h2>
              <p className="text-slate-400 max-w-xs mx-auto mb-8 font-medium">
                Terminez vos formations à 100% pour débloquer vos certifications officielles.
              </p>
              <Button onClick={() => navigate("/dashboard")} variant="outline" className="rounded-full px-8">
                Continuer mes cours
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}