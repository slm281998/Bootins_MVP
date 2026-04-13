import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, PlayCircle, FileText, ChevronLeft, Loader2, List } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLessons, setShowLessons] = useState(false); // Pour basculer la liste sur mobile

  useEffect(() => {
    api.get(`api/formations/${courseId}/`)
      .then(res => {
        setCourse(res.data);
        if (res.data.modules?.[0]?.lessons?.[0]) {
          setActiveLesson(res.data.modules[0].lessons[0]);
        }
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [courseId]);

  const handleCompleteLesson = async (lessonId) => {
    try {
        const res = await api.post("api/progress/validate/", { lesson_id: lessonId });
        const serverProgress = res.data.progress; 
        
        setActiveLesson(prev => ({ ...prev, is_completed: true }));

        setCourse(prevCourse => {
            const updatedModules = prevCourse.modules.map(module => ({
                ...module,
                lessons: module.lessons.map(lesson => 
                    lesson.id === lessonId ? { ...lesson, is_completed: true } : lesson
                )
            }));

            return { 
                ...prevCourse, 
                modules: updatedModules,
                progress: serverProgress 
            };
        });

        if (serverProgress === 100) {
            alert("Félicitations ! Vous avez terminé la formation.");
            navigate("api/dashboard"); 
        }

    } catch (err) {
        console.error("Erreur de validation", err);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\\&v=)([^#\\&\\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
        ? `https://www.youtube.com/embed/${match[2]}`
        : url;
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    /* RESPONSIVE: flex-col sur mobile, flex-row sur desktop */
    <div className="flex flex-col md:flex-row h-screen bg-white overflow-hidden">
      <Sidebar />
      
      {/* BOUTON MOBILE pour voir la liste des leçons */}
      <div className="md:hidden bg-slate-100 p-2 flex justify-between items-center border-b">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
          <ChevronLeft size={16} />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setShowLessons(!showLessons)} className="gap-2">
          <List size={16} /> {showLessons ? "Fermer le programme" : "Voir le programme"}
        </Button>
      </div>

      {/* ASIDE : Liste des leçons (Adaptative) */}
      <aside className={cn(
        "bg-slate-50 border-r flex flex-col transition-all duration-300",
        "fixed md:static inset-y-0 left-0 z-30 w-full md:w-80", // Mobile: plein écran ou caché | Desktop: 80px
        showLessons ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        !showLessons && "hidden md:flex" // Cache complètement sur mobile si pas activé
      )}>
        <div className="p-6 border-b bg-white md:bg-transparent">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="hidden md:flex mb-4">
            <ChevronLeft size={16} /> Retour
          </Button>
          <h2 className="font-black text-lg leading-tight mb-4 tracking-tighter">{course?.title}</h2>
          
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Progression</span>
              <span className="text-primary">{course?.progress || 0}%</span>
            </div>
            <Progress value={course?.progress || 0} className="h-1.5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {course?.modules?.map((module) => (
            <div key={module.id}>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                {module.title}
                </h3>
                <div className="space-y-1">
                {module.lessons?.map((lesson) => (
                    <button
                    key={lesson.id}
                    onClick={() => {
                      setActiveLesson(lesson);
                      setShowLessons(false); // Ferme le menu sur mobile après clic
                    }}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-all text-left",
                        activeLesson?.id === lesson.id ? "bg-white shadow-sm text-primary font-bold ring-1 ring-slate-200" : "hover:bg-slate-200 text-slate-600"
                    )}
                    >
                    {lesson.is_completed ? (
                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                    ) : (
                        <PlayCircle size={16} className="text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{lesson.title}</span>
                    </button>
                ))}
                </div>
            </div>
            ))}
        </div>
      </aside>

      {/* MAIN CONTENT : Vidéo et Texte */}
      <main className="flex-1 flex flex-col overflow-y-auto bg-white">
        {activeLesson ? (
          <div className="w-full max-w-4xl mx-auto p-4 md:p-8">
            {/* Vidéo Responsable */}
            <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6 md:mb-8 shadow-2xl">
              {activeLesson.video_url ? (
                <iframe 
                  className="w-full h-full border-none"
                  src={getEmbedUrl(activeLesson.video_url)}
                  title="Lesson Video"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 italic text-sm">
                  Aucune vidéo pour cette leçon
                </div>
              )}
            </div>

            {/* Titre et Bouton de validation */}
            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
              <div className="flex-1">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
                  {activeLesson.title}
                </h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14}/> Support de cours inclus
                </p>
              </div>
              <Button 
                onClick={() => handleCompleteLesson(activeLesson.id)}
                disabled={activeLesson.is_completed}
                className={cn(
                  "w-full md:w-auto py-6 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all",
                  activeLesson.is_completed ? "bg-emerald-500 hover:bg-emerald-500 text-white" : "bg-slate-900 shadow-xl shadow-slate-200"
                )}
              >
                {activeLesson.is_completed ? "Leçon validée ✓" : "Terminer la leçon"}
              </Button>
            </div>

            {/* Contenu Texte */}
            <article className="prose prose-slate max-w-none border-t border-slate-100 pt-8 pb-20">
              <div 
                className="text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: activeLesson.content_text }} 
              />
            </article>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 italic p-10 text-center">
            <PlayCircle size={48} className="mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-[10px]">Sélectionnez une leçon pour commencer</p>
          </div>
        )}
      </main>
    </div>
  );
}