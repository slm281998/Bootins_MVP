import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { 
  Lock, 
  Play, 
  CheckCircle2, 
  ChevronLeft, 
  BookOpen,
  Clock,
  Award,
  Download
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CourseModules() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleDownload = async (id) => {
    try {
      const response = await api.post(
        'api/certificate/generate/', 
        { course_id: id },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificat_${data.course_title}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Erreur lors de la génération. Vérifiez que toutes les leçons sont bien validées.");
    }
  };

  useEffect(() => {
    api.get(`api/courses/${courseId}/modules/`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur chargement modules", err);
        setLoading(false);
      });
  }, [courseId]);

  if (loading) return <div className="flex justify-center p-20 italic text-slate-500">Chargement du programme...</div>;
  if (!data) return <div className="p-20 text-center">Cours introuvable.</div>;

  return (
    /* RESPONSIVE: Changement de direction flex sur mobile */
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto pb-20">
        
        {/* BANNIÈRE DE SUCCÈS - Ajustement du padding sur mobile */}
        {data.overall_progress === 100 && (
          <div className="m-4 md:m-6 p-4 md:p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Award size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-bold">Félicitations ! Formation terminée.</h2>
                  <p className="text-green-50 text-sm">Votre certificat est désormais disponible.</p>
                </div>
              </div>
              
              <Button 
                onClick={() => handleDownload(courseId)} 
                className="w-full lg:w-auto bg-white text-green-600 hover:bg-green-50 font-black uppercase text-[10px] tracking-widest py-6 px-8 rounded-xl shadow-md"
              >
                <Download size={18} className="mr-2" /> Télécharger mon diplôme
              </Button>
            </div>
          </div>
        )}
        
        {/* HEADER COLLANT - Réduction des textes sur mobile */}
        <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-4">
            <h2 className="text-lg md:text-2xl lg:text-3xl font-black text-slate-900 drop-shadow-sm truncate">
              Parcours
            </h2>
            <div className="flex items-center gap-2 md:gap-4 shrink-0">
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-slate-400">Progression</span>
              <div className="w-20 md:w-32">
                <Progress value={data.overall_progress} className="h-2" />
              </div>
              <span className="text-xs md:text-sm font-black text-primary">{data.overall_progress}%</span>
            </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <main className="max-w-4xl mx-auto px-4 md:px-6 mt-6 md:mt-10">
          <header className="mb-8 md:mb-12">
            {/* Titre adaptatif */}
            <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">
              {data.course_title}
            </h1>
            <div className="flex flex-wrap gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100">
                <BookOpen size={14}/> {data.modules?.length} Modules
              </span>
              <span className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-100">
                <Clock size={14}/> Accès illimité
              </span>
            </div>
          </header>

          <div className="space-y-6 md:space-y-8">
            {data.modules?.map((module, index) => (
              <section key={module.id} className="relative">
                {/* Ligne verticale : cachée sur les très petits écrans si nécessaire, ici conservée */}
                {index !== data.modules.length - 1 && (
                  <div className="absolute left-6 md:left-7 top-12 bottom-[-24px] md:bottom-[-32px] w-0.5 bg-slate-200" />
                )}

                <Card className={`overflow-hidden border-none shadow-sm rounded-3xl ${module.is_locked ? 'opacity-75 bg-slate-100/50' : 'bg-white'}`}>
                  <CardContent className="p-0">
                    <div className="p-5 md:p-6 flex items-start justify-between gap-3">
                      <div className="flex gap-3 md:gap-4">
                        {/* Numéro du module adaptatif */}
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                          module.is_locked ? 'bg-slate-200 text-slate-400' : 'bg-primary text-white shadow-lg shadow-primary/20'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div>
                          <h2 className="text-base md:text-xl font-black text-slate-800 flex items-center flex-wrap gap-2 leading-tight">
                            {module.title}
                            {module.is_locked && <Lock size={16} className="text-slate-400" />}
                            {module.progress === 100 && <CheckCircle2 size={16} className="text-green-500" />}
                          </h2>
                          <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wide mt-1">
                            {module.is_locked 
                              ? "Verrouillé" 
                              : `${module.lessons?.length || 0} leçons au programme`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                         <span className="text-[10px] md:text-sm font-black text-slate-300">{module.progress}%</span>
                      </div>
                    </div>

                    {!module.is_locked && (
                      <div className="border-t border-slate-50 bg-slate-50/30 p-2 space-y-1">
                        {module.lessons?.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
                            className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-white rounded-2xl transition-all group active:scale-[0.98]"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.is_completed ? (
                                <div className="bg-green-100 p-1 rounded-full">
                                    <CheckCircle2 size={16} className="text-green-600" />
                                </div>
                              ) : (
                                <div className="bg-slate-100 p-1 rounded-full group-hover:bg-primary/10 transition-colors">
                                    <Play size={16} className="text-slate-400 group-hover:text-primary" />
                                </div>
                              )}
                              <span className={`text-xs md:text-sm text-left ${lesson.is_completed ? 'text-slate-400 font-medium' : 'font-bold text-slate-700'}`}>
                                {lesson.title}
                              </span>
                            </div>
                            <div className="text-[9px] md:text-xs font-black text-slate-300 uppercase shrink-0 ml-2">
                               {lesson.duration || "5 min"}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}