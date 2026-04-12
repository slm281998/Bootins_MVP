import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, PlayCircle, FileText, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`formations/${courseId}/`)
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
        // 1. Appel API - On récupère la réponse (qui contient le nouveau progress)
        const res = await api.post("progress/validate/", { lesson_id: lessonId });
        const serverProgress = res.data.progress; 
        
        // 2. Mise à jour de la leçon active
        setActiveLesson(prev => ({ ...prev, is_completed: true }));

        // 3. MISE À JOUR DU COURS
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
                progress: serverProgress // On utilise la valeur exacte du serveur
            };
        });

        // 4. Redirection si le cours est fini (Utilisation de serverProgress ici)
        if (serverProgress === 100) {
            alert("Félicitations Mze Mbaba ! Vous avez terminé la formation.");
            navigate("/dashboard"); 
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
    <div className="flex h-screen bg-white">
      <Sidebar />
      
      <aside className="w-80 border-r flex flex-col bg-slate-50">
            <div className="p-6 border-b">
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="mb-4">
                <ChevronLeft size={16} /> Retour
                </Button>
                <h2 className="font-bold text-lg leading-tight mb-4">{course?.title}</h2>
                
                <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                    <span>Progression</span>
                    <span>{course?.progress || 0}%</span>
                </div>
                <Progress value={course?.progress || 0} className="h-1.5" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {course?.modules?.map((module) => (
                <div key={module.id}>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    {module.title}
                    </h3>
                    <div className="space-y-1">
                    {module.lessons?.map((lesson) => (
                        <button
                        key={lesson.id}
                        onClick={() => setActiveLesson(lesson)}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                            activeLesson?.id === lesson.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-slate-200"
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

      <main className="flex-1 flex flex-col overflow-y-auto">
        {activeLesson ? (
          <div className="max-w-4xl mx-auto w-full p-8">
            <div className="aspect-video bg-black rounded-xl overflow-hidden mb-8 shadow-lg">
              {activeLesson.video_url ? (
                <iframe 
                  className="w-full h-full border-none"
                  src={getEmbedUrl(activeLesson.video_url)}
                  title="Lesson Video"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white italic">
                  Aucune vidéo pour cette leçon
                </div>
              )}
            </div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{activeLesson.title}</h1>
                <p className="text-slate-500 flex items-center gap-2"><FileText size={16}/> Ressource texte incluse</p>
              </div>
              <Button 
                onClick={() => handleCompleteLesson(activeLesson.id)}
                disabled={activeLesson.is_completed}
                className={cn(activeLesson.is_completed ? "bg-green-600 hover:bg-green-600" : "")}
              >
                {activeLesson.is_completed ? "Leçon terminée ✓" : "Marquer comme terminé"}
              </Button>
            </div>

            <article className="prose prose-slate max-w-none border-t pt-8">
              <div dangerouslySetInnerHTML={{ __html: activeLesson.content_text }} />
            </article>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 italic">
            Sélectionnez une leçon pour commencer
          </div>
        )}
      </main>
    </div>
  );
}