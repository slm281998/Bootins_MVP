import React, { useEffect, useState } from "react";
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

  // 1. Définition de la logique (une seule fois en haut du composant)
  const getImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800"; 
    return path.startsWith('http') 
      ? path 
      : `https://bootins-mvp.onrender.com${path}`;
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get("api/formations/");
        setCourses(res.data);
      } catch (err) {
        console.error("Erreur fetch courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Sidebar fixe */}
      <div className="flex-shrink-0">
        <Sidebar />
      </div>
      
      {/* Zone principale avec scroll interne */}
      <main className="flex-1 w-full p-4 md:p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter">
            Catalogue des formations
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
            Ton parcours d'apprentissage personnel
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 pb-10">
          {courses.map((course) => (
            <Card key={course.id} className="group overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all rounded-[1.5rem] md:rounded-[2.5rem] bg-white flex flex-col">
              
              {/* 2. Utilisation dans ton catalogue (balise img modifiée) */}
              <div className="h-44 md:h-52 overflow-hidden bg-slate-100">
                <img 
                  src={getImageUrl(course.image)} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800";
                  }}
                />
              </div>

              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-lg md:text-xl font-black text-slate-800 leading-tight line-clamp-2 h-14">
                  {course.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="px-6 space-y-4 flex-1">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Progression</span>
                    <span className="text-primary">{course.progress || 0}%</span>
                  </div>
                  <Progress value={course.progress || 0} className="h-2 bg-slate-100" />
                </div>
              </CardContent>

              <CardFooter className="p-6 flex flex-col gap-3">
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
                    className="w-full py-6 rounded-xl md:rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-slate-900 border-none font-black uppercase text-[10px] tracking-widest shadow-lg shadow-yellow-100 transition-all"
                  >
                    <Award size={16} className="mr-2" /> Voir le certificat
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