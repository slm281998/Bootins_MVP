import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, PlayCircle, FileText, ChevronLeft, Loader2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function CoursePlayer() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 1. Chargement des données du cours
  useEffect(() => {
    api.get(`formations/${courseId}/`)
      .then(res => {
        const courseData = res.data;
        setCourse(courseData);
        
        const allLessons = courseData.modules.flatMap(m => m.lessons);
        
        if (lessonId) {
          const found = allLessons.find(l => l.id.toString() === lessonId);
          setActiveLesson(found || allLessons[0]);
        } else if (allLessons.length > 0) {
          const nextToStudy = allLessons.find(l => !l.is_completed);
          setActiveLesson(nextToStudy || allLessons[0]);
        }
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur chargement cours:", err);
        if (err.response?.status === 401) {
          toast.error("Session expirée, veuillez vous reconnecter");
          navigate("/login");
        } else {
          toast.error("Cours introuvable (Erreur 404)");
        }
        setLoading(false);
      });
  }, [courseId, lessonId, navigate]);

  // 2. Validation d'une leçon et mise à jour de la progression
  const handleCompleteLesson = async (currentLessonId) => {
    try {
      const res = await api.post("progress/validate/", { lesson_id: currentLessonId });
      const serverProgress = res.data.progress; 

      setActiveLesson(prev => ({ ...prev, is_completed: true }));

      setCourse(prevCourse => {
        const updatedModules = prevCourse.modules.map(module => ({
          ...module,
          lessons: module.lessons.map(lesson => 
            Number(lesson.id) === Number(currentLessonId) ? { ...lesson, is_completed: true } : lesson
          )
        }));

        return { 
          ...prevCourse, 
          modules: updatedModules,
          progress: serverProgress // Mise à jour de la progression
        };
      });

      toast.success("Leçon validée !");

      if (serverProgress === 100) {
        toast.success("Félicitations ! Formation terminée.");
        navigate("/dashboard"); 
      }
    } catch (err) {
      console.error("Erreur de validation", err);
      toast.error("Erreur lors de la validation");
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\\&v=)([^#\\&\\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) 
        ? `https://www.youtube-nocookie.com/embed/${match[2]}`
        : url;
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      
      {/* LISTE DES LEÇONS (SIDEBAR DROITE) */}
      <aside className={cn(
        "fixed inset-0 z-50 bg-slate-50 border-r flex flex-col transition-transform lg:relative lg:translate-x-0 lg:w-80",
        isMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b bg-white lg:bg-transparent">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/courses/${courseId}/`)} 
              className="p-0 hover:bg-transparent text-slate-500"
            >
              <ChevronLeft size={16} /> Retour aux modules
            </Button>
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMenuOpen(false)}>
              <X size={20} />
            </Button>
          </div>
          <h2 className="font-bold text-lg leading-tight mb-4 uppercase italic tracking-tighter">{course?.title}</h2>
          
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Progression</span>
              {/* ✅ CORRECTION : On utilise course.progress au lieu de data.overall_progress */}
              <span>{course?.progress || 0}%</span>
            </div>
            {/* ✅ CORRECTION : On utilise course.progress au lieu de data.overall_progress */}
            <Progress value={course?.progress || 0} className="h-1.5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {course?.modules?.map((module) => (
            <div key={module.id} className="space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
                {module.title}
              </h3>
              <div className="space-y-1">
                {module.lessons?.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setActiveLesson(lesson);
                      setIsMenuOpen(false);
                      navigate(`/courses/${courseId}/lessons/${lesson.id}`, { replace: true });
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 text-sm rounded-xl transition-all text-left",
                      Number(activeLesson?.id) === Number(lesson.id) 
                        ? "bg-slate-900 text-white shadow-lg font-bold" 
                        : "hover:bg-slate-200 text-slate-600"
                    )}
                  >
                    {lesson.is_completed || lesson.completed_at ? (
                      <CheckCircle size={16} className={cn("shrink-0", Number(activeLesson?.id) === Number(lesson.id) ? "text-white" : "text-emerald-500")} />
                    ) : (
                      <PlayCircle size={16} className={cn("shrink-0", Number(activeLesson?.id) === Number(lesson.id) ? "text-white" : "text-slate-400")} />
                    )}
                    <span className="truncate">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-y-auto relative bg-white">
        <div className="lg:hidden p-4 border-b flex items-center justify-between bg-white sticky top-0 z-30">
          <Button variant="ghost" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </Button>
          <span className="font-bold text-sm truncate max-w-[200px] uppercase italic">{course?.title}</span>
          <div className="w-10"></div>
        </div>

        {activeLesson ? (
          <div className="max-w-5xl mx-auto w-full p-4 md:p-10">
            <div className="aspect-video bg-black rounded-[2rem] overflow-hidden mb-8 shadow-2xl">
              {activeLesson.video_url ? (
                <iframe 
                  className="w-full h-full border-none"
                  src={getEmbedUrl(activeLesson.video_url)}
                  title="Lesson Video"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white italic text-sm bg-slate-900">
                  Aucune vidéo pour cette leçon
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
                  {activeLesson.title}
                </h1>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <FileText size={14}/> Support de cours numérique
                </p>
              </div>
              <Button 
                onClick={() => handleCompleteLesson(activeLesson.id)}
                disabled={activeLesson.is_completed}
                className={cn(
                  "w-full md:w-auto rounded-2xl font-black uppercase text-[10px] py-7 px-10 transition-all",
                  activeLesson.is_completed 
                    ? "bg-emerald-500 text-white opacity-100 cursor-default" 
                    : "bg-primary text-white shadow-xl shadow-primary/20"
                )}
              >
                {activeLesson.is_completed ? "Leçon validée ✓" : "Terminer la leçon"}
              </Button>
            </div>

            <div className="prose prose-slate max-w-none border-t border-slate-100 pt-10">
              <div 
                className="text-slate-600 leading-relaxed text-lg font-medium"
                dangerouslySetInnerHTML={{ __html: activeLesson.content_text }} 
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200 gap-4">
             <div className="p-10 bg-slate-50 rounded-full animate-bounce">
                <PlayCircle size={64} className="text-slate-200" />
             </div>
             <p className="font-black uppercase text-[10px] tracking-widest">Choisis ta leçon pour commencer</p>
          </div>
        )}
      </main>
    </div>
  );
}