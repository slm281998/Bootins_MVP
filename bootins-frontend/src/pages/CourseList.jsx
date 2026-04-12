import { useEffect, useState } from "react";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Award, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // URL de ton backend Render
  const BACKEND_URL = "https://bootins-mvp.onrender.com";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get("api/formations/");
        setCourses(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  // Fonction pour corriger l'URL de l'image
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path; // Si c'est déjà un lien complet (Unsplash)
    return `${BACKEND_URL}${path}`; // Si c'est un chemin Django (/media/...)
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar />
      
      <main className="flex-1 w-full p-4 md:p-8 overflow-y-auto">
        <header className="mb-8 md:mb-10">
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 italic tracking-tighter">
            Catalogue des formations
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Explorez nos cours et montez en compétences
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
          {courses.map((course) => (
            <Card key={course.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all rounded-[1.5rem] md:rounded-[2.5rem] bg-white">
              <div className="h-40 md:h-48 overflow-hidden bg-slate-200">
                {course.image ? (
                  <img 
                    
                    src={getImageUrl(course.image)} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs font-bold uppercase">
                    Pas d'image
                  </div>
                )}
              </div>

              <CardHeader className="p-5 md:p-6">
                <CardTitle className="text-lg md:text-xl font-black text-slate-800 leading-tight h-14 line-clamp-2">
                  {course.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="px-5 md:px-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Progression</span>
                    <span className="text-primary">{course.progress || 0}%</span>
                  </div>
                  <Progress value={course.progress || 0} className="h-2 bg-slate-100" />
                </div>
              </CardContent>

              <CardFooter className="p-5 md:p-6 flex flex-col gap-2">
                <Button 
                    onClick={() => navigate(`/courses/${course.id}`)} 
                    className="w-full py-6 rounded-xl md:rounded-2xl bg-slate-900 hover:bg-primary text-white font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
                    >
                    Continuer la formation
                </Button>

                {course.progress === 100 && (
                <Button 
                    variant="outline"
                    onClick={() => navigate(`/courses/${course.id}/certificate`)}
                    className="w-full py-6 rounded-xl md:rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-slate-900 border-none font-black uppercase text-[10px] tracking-widest shadow-lg shadow-yellow-100 transition-all active:scale-95"
                  >
                    <Award size={18} className="mr-2" /> Voir le certificat
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