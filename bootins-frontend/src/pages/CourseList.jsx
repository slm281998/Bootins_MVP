import { useEffect, useState } from "react";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Award, Loader2, UserPlus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get("formations/");
      setCourses(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de charger les cours");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      await api.post("enroll/", { course_id: courseId });
      toast.success("Inscription réussie !");
      fetchCourses();
    } catch {
      toast.error("Erreur lors de l'inscription");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    // Correction Layout : flex-col par défaut, flex-row sur desktop (md:)
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Note : Si ta Sidebar n'est pas prévue pour mobile, 
         elle risque de bloquer l'affichage. 
         Assure-toi qu'elle a un comportement 'responsive' à l'intérieur.
      */}
      <Sidebar />
      
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <header className="mb-6 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">
            Catalogue
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">
            Explorez nos formations Bootins Academy
          </p>
        </header>

        {/* Grille Intelligente :
           1 col : Mobile
           2 cols : Tablettes / Petits laptops
           3 cols : Grands écrans
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 pb-10">
          {courses.map((course) => (
            <Card key={course.id} className="group overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-300 rounded-[2.5rem] bg-white flex flex-col">
              
              {/* Image Adaptative */}
              <div className="aspect-video sm:h-48 overflow-hidden bg-slate-200 relative">
                {course.image ? (
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                    <Play size={32} className="opacity-20" />
                  </div>
                )}
              </div>

              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-base md:text-lg font-black uppercase italic leading-tight line-clamp-2 min-h-[3rem] text-slate-800">
                  {course.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="px-5 pb-4 space-y-4 flex-grow">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Progression</span>
                    <span className="text-primary">{course.progress || 0}%</span>
                  </div>
                  <Progress value={course.progress || 0} className="h-1.5" />
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0 flex flex-col gap-2">
                <div className="flex flex-col w-full gap-2">
                  
                  {/* S'inscrire (visible si 0%) */}
                  {(course.progress === 0 || !course.progress) && (
                    <Button 
                      variant="outline"
                      onClick={() => handleEnroll(course.id)}
                      className="w-full rounded-2xl font-bold uppercase text-[10px] py-6 border-slate-100 hover:bg-slate-50 text-slate-500"
                    >
                      <UserPlus size={14} className="mr-2" /> S'inscrire
                    </Button>
                  )}

                  {/* Commencer / Continuer */}
                  <Button 
                    onClick={() => navigate(`/courses/${course.id}`)} 
                    className={cn(
                      "w-full rounded-2xl font-black uppercase text-[10px] py-6 shadow-lg",
                      course.progress > 0 ? "bg-slate-900" : "bg-primary shadow-primary/10"
                    )}
                  >
                    {course.progress > 0 ? (
                       <><Play size={14} className="mr-2 fill-current" /> Continuer</>
                    ) : (
                       <><ArrowRight size={14} className="mr-2" /> Commencer</>
                    )}
                  </Button>
                </div>

                {/* Certificat */}
                {course.progress === 100 && (
                  <Button 
                    variant="ghost"
                    onClick={() => navigate(`/courses/${course.id}/certificate`)}
                    className="w-full rounded-2xl text-emerald-600 font-black uppercase text-[10px] py-6 hover:bg-emerald-50"
                  >
                    <Award size={16} className="mr-2" /> Certificat prêt
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}