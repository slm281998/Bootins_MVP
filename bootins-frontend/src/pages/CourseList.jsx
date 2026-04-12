import { useEffect, useState } from "react";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Play, Award, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Catalogue des formations</h1>
          <p className="text-muted-foreground mt-2">Explorez nos cours et montez en compétences.</p>
        </header>

        {/* Grille des formations - Respectant le cahier des charges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card key={course.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all">
              {/* Image de la formation (Champ 'image' de ton modèle Course) */}
              <div className="h-48 overflow-hidden bg-slate-200">
                {course.image ? (
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    Pas d'image disponible
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-xl line-clamp-2 h-14">{course.title}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Indicateur de progression (Dynamique) */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Progression</span>
                    <span>{course.progress || 0}%</span>
                  </div>
                  <Progress value={course.progress || 0} className="h-2" />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-2">
                {/* Bouton Continuer */}
                <Button 
                    onClick={() => navigate(`/courses/${course.id}`)} 
                    className="w-full"
                    >
                    Continuer la formation
                </Button>

                {/* Bouton Certificat conditionnel (si progress === 100) */}
                {course.progress === 100 && (
                <Button 
                    variant="outline"
                    // 🚀 ON UTILISE course.id ET LA BONNE ROUTE (courses avec un S)
                    onClick={() => navigate(`/courses/${course.id}/certificate`)}
                    className="w-full bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
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