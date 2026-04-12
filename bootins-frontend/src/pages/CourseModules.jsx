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
      'certificate/generate/', 
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
    // On récupère les détails du cours et ses modules
    api.get(`courses/${courseId}/modules/`)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur chargement modules", err);
        setLoading(false);
      });
  }, [courseId]);

  if (loading) return <div className="flex justify-center p-20">Chargement du programme...</div>;
  if (!data) return <div className="p-20 text-center">Cours introuvable.</div>;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* 1. On affiche la Sidebar à gauche */}
      <Sidebar />

      {/* 2. Le reste du contenu va dans un conteneur "flex-1" pour prendre toute la place restante */}
      <div className="flex-1 h-full overflow-y-auto pb-20">
        {/* BANNIÈRE DE SUCCÈS - S'affiche uniquement à 100% */}
        {data.overall_progress === 100 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <Award size={32} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Félicitations ! Formation terminée.</h2>
                  <p className="text-green-50">Votre certificat de réussite est désormais disponible.</p>
                </div>
              </div>
              
              {/* Ce bouton appelle ton API de génération (Écran 7) */}
              <Button 
                onClick={() => handleDownload(courseId)} 
                className="bg-white text-green-600 hover:bg-green-50 font-bold px-8"
              >
                <Download size={18} className="mr-2" /> Télécharger mon certificat
              </Button>
            </div>
          </div>
        )}
        
        {/* Barre de navigation haute (Header) */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
              <h2 className="text-3xl font-black text-slate-900 drop-shadow-sm">
              Parcours d'apprentissage
              </h2>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500">Progression globale</span>
              <div className="w-32">
                <Progress value={data.overall_progress} className="h-2" />
              </div>
              <span className="text-sm font-bold">{data.overall_progress}%</span>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <main className="max-w-4xl mx-auto px-6 mt-10">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{data.course_title}</h1>
            <div className="flex gap-6 text-slate-500 text-sm">
              <span className="flex items-center gap-2"><BookOpen size={16}/> {data.modules?.length} Modules</span>
              <span className="flex items-center gap-2"><Clock size={16}/> Accès illimité</span>
            </div>
          </header>

          <div className="space-y-8">
            {data.modules?.map((module, index) => (
              <section key={module.id} className="relative">
                {/* Ligne verticale entre les modules */}
                {index !== data.modules.length - 1 && (
                  <div className="absolute left-6 top-12 bottom-[-32px] w-0.5 bg-slate-200" />
                )}

                <Card className={`overflow-hidden border-none shadow-sm ${module.is_locked ? 'opacity-75 bg-slate-100/50' : 'bg-white'}`}>
                  <CardContent className="p-0">
                    <div className="p-6 flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${
                          module.is_locked ? 'bg-slate-200 text-slate-400' : 'bg-primary text-white'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div>
                          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            {module.title}
                            {module.is_locked && <Lock size={18} className="text-slate-400" />}
                            {module.progress === 100 && <CheckCircle2 size={18} className="text-green-500" />}
                          </h2>
                          <p className="text-slate-500 text-sm mt-1">
                            {module.is_locked 
                              ? "Terminez le module précédent pour débloquer" 
                              : `${module.lessons?.length || 0} leçons à découvrir`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                         <span className="text-sm font-bold text-slate-400">{module.progress}%</span>
                      </div>
                    </div>

                    {!module.is_locked && (
                      <div className="border-t bg-slate-50/50 p-2">
                        {module.lessons?.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
                            className="w-full flex items-center justify-between p-3 hover:bg-white rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.is_completed ? (
                                <CheckCircle2 size={18} className="text-green-500" />
                              ) : (
                                <Play size={18} className="text-slate-400 group-hover:text-primary" />
                              )}
                              <span className={`text-sm ${lesson.is_completed ? 'text-slate-500' : 'font-medium text-slate-700'}`}>
                                {lesson.title}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400">
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