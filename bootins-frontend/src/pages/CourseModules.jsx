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
  Clock
} from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CourseModules() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (loading) return <div className="flex justify-center p-10 md:p-20 font-bold text-slate-400">Chargement du programme...</div>;
  if (!data) return <div className="p-10 md:p-20 text-center font-bold text-slate-500">Cours introuvable.</div>;

  return (
    // Correction Layout : flex-col sur mobile, flex-row sur desktop
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      <div className="flex-1 h-full overflow-y-auto pb-20">
        
        {/* Barre de navigation haute (Header) - Sticky et Responsive */}
        <div className="bg-white border-b sticky top-0 z-10 px-4 md:px-0">
          <div className="max-w-5xl mx-auto h-auto md:h-20 py-4 md:py-0 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/courses")} 
                  className="rounded-xl hover:bg-slate-100 text-slate-500"
                >
                  <ChevronLeft size={20} />
                </Button>
                <h2 className="text-lg md:text-2xl font-black text-slate-900 uppercase italic tracking-tighter">
                  Parcours
                </h2>
              </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Progression</span>
              <div className="flex items-center gap-3">
                <div className="w-24 md:w-32">
                  <Progress value={data.overall_progress} className="h-2" />
                </div>
                <span className="text-sm font-black text-slate-900">{data.overall_progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <main className="max-w-4xl mx-auto px-4 md:px-6 mt-6 md:mt-12">
          <header className="mb-8 md:mb-12">
            <h1 className="text-2xl md:text-5xl font-black text-slate-900 mb-4 uppercase italic tracking-tighter leading-none">
              {data.course_title}
            </h1>
            <div className="flex gap-6 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><BookOpen size={14}/> {data.modules?.length} Modules</span>
              <span className="flex items-center gap-2"><Clock size={14}/> Accès illimité</span>
            </div>
          </header>

          <div className="space-y-6 md:space-y-10">
            {data.modules?.map((module, index) => (
              <section key={module.id} className="relative">
                {/* Ligne verticale entre les modules */}
                {index !== data.modules.length - 1 && (
                  <div className="hidden md:block absolute left-6 top-14 bottom-[-40px] w-0.5 bg-slate-100" />
                )}

                <Card className={`overflow-hidden border-none shadow-sm rounded-[2rem] transition-all ${module.is_locked ? 'opacity-60 grayscale bg-slate-100/50' : 'bg-white hover:shadow-md'}`}>
                  <CardContent className="p-0">
                    <div className="p-5 md:p-8 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                          module.is_locked ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white shadow-lg'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div>
                          <h2 className="text-base md:text-xl font-black text-slate-800 uppercase italic tracking-tight flex items-center gap-2">
                            {module.title}
                            {module.is_locked && <Lock size={16} className="text-slate-300" />}
                            {module.progress === 100 && <CheckCircle2 size={18} className="text-emerald-500" />}
                          </h2>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                            {module.is_locked 
                              ? "Verrouillé" 
                              : `${module.lessons?.length || 0} étapes`}
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:block">
                         <span className="text-xs font-black text-slate-300 italic">{module.progress}%</span>
                      </div>
                    </div>

                    {!module.is_locked && (
                      <div className="border-t border-slate-50 bg-slate-50/30 p-2 md:p-4">
                        {module.lessons?.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => navigate(`/courses/${courseId}/lessons/${lesson.id}`)}
                            className="w-full flex items-center justify-between p-3 md:p-4 hover:bg-white rounded-2xl transition-all group"
                          >
                            <div className="flex items-center gap-4">
                              {lesson.is_completed ? (
                                <div className="bg-emerald-100 p-1 rounded-full">
                                  <CheckCircle2 size={16} className="text-emerald-600" />
                                </div>
                              ) : (
                                <Play size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                              )}
                              <span className={`text-xs md:text-sm text-left ${lesson.is_completed ? 'text-slate-400 line-through' : 'font-bold text-slate-700 uppercase tracking-tight'}`}>
                                {lesson.title}
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-300 uppercase">
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