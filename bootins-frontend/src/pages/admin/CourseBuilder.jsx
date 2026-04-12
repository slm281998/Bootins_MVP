import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { 
  Plus, Video, FileText, ChevronDown, ChevronRight, 
  ArrowLeft, Trash2, Layout, X, AlertCircle, ListOrdered 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CourseBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(null);

  const [moduleData, setModuleData] = useState({ title: "", order: 1 });
  const [lessonData, setLessonData] = useState({ title: "", video_url: "", content_text: "", order: 1 });

  const fetchCourseDetails = async () => {
    try {
      const res = await api.get(`courses/${id}/`); 
      setCourse(res.data);
      setModuleData(prev => ({ ...prev, order: (res.data.modules?.length || 0) + 1 }));
    } catch {
      setError("Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchCourseDetails(); 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddModule = async (e) => {
    e.preventDefault();
    try {
      await api.post("api/modules/", { 
        course: id, 
        title: moduleData.title, 
        order: moduleData.order 
      });
      setIsModuleModalOpen(false);
      setModuleData({ title: "", order: 1 });
      fetchCourseDetails();
    } catch (err) {
      console.error("Erreur complète :", err.response?.data);
      setError("Le serveur a refusé la création. Vérifiez l'ID du cours.");
    }
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    try {
      await api.post("lessons/", { 
        module: activeModuleId, 
        ...lessonData 
      });
      setIsLessonModalOpen(false);
      setLessonData({ title: "", video_url: "", content_text: "", order: 1 });
      fetchCourseDetails();
    } catch { setError("Erreur lors de l'ajout de la leçon."); }
  };

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  if (loading) return <div className="p-10 text-center font-black animate-pulse text-slate-400 uppercase">Chargement du Builder...</div>;

  return (
   
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

    
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center justify-between animate-in slide-in-from-top duration-300 shadow-sm">
            <div className="flex items-center gap-3 font-bold text-xs"><AlertCircle size={18} /> {error}</div>
            <button onClick={() => setError(null)}><X size={18} /></button>
          </div>
        )}

        {/* HEADER : Adaptatif */}
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <Button variant="ghost" onClick={() => navigate("/admin")} className="rounded-full bg-white shadow-sm hover:bg-slate-50 border border-slate-100 shrink-0">
            <ArrowLeft size={18} md:size={20} />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-black uppercase tracking-tighter text-slate-800 truncate">{course.title}</h1>
            <p className="text-[9px] md:text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Architecture du programme</p>
          </div>
        </div>

        <div className="max-w-4xl space-y-4 pb-20">
          {/* BARRE ACTIONS MODULE : flex-col sur mobile */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Layout size={14} /> Sommaire des modules
            </h2>
            <Button onClick={() => setIsModuleModalOpen(true)} size="sm" className="w-full sm:w-auto rounded-xl gap-2 font-black text-[10px] uppercase shadow-lg shadow-primary/20 h-10 px-5">
              <Plus size={16} /> Nouveau Module
            </Button>
          </div>

          {course.modules?.map((module) => (
            <div key={module.id} className="bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] shadow-sm overflow-hidden transition-all hover:shadow-md">
              {/* HEADER DU MODULE : Responsive */}
              <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer" onClick={() => toggleModule(module.id)}>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`p-2 md:p-2.5 rounded-xl md:rounded-2xl transition-all ${expandedModules[module.id] ? 'bg-primary text-white scale-105 md:scale-110 shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>
                    {expandedModules[module.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] md:text-[9px] font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded">Ordre: {module.order}</span>
                    </div>
                    <h3 className="font-bold text-slate-700 text-sm md:text-base mt-1">{module.title}</h3>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveModuleId(module.id); 
                  setIsLessonModalOpen(true); 
                }} className="w-full sm:w-auto rounded-xl font-black text-[10px] uppercase border-slate-200 hover:bg-slate-50 py-5 sm:py-2">
                  + Ajouter une leçon
                </Button>
              </div>

              {expandedModules[module.id] && (
                <div className="px-4 md:px-6 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-300">
                  {module.lessons?.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 md:p-4 bg-slate-50/50 border border-slate-50 rounded-xl md:rounded-2xl group hover:bg-white hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm font-bold text-slate-600 truncate">
                        <span className="text-[9px] md:text-[10px] text-slate-300 font-black shrink-0">#{lesson.order}</span>
                        {lesson.video_url ? <Video size={14} className="text-blue-500 shrink-0" /> : <FileText size={14} className="text-slate-400 shrink-0" />}
                        <span className="truncate">{lesson.title}</span>
                      </div>
                      <Trash2 size={14} className="text-slate-300 hover:text-red-500 cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- MODALE MODULE --- */}
        {isModuleModalOpen && (
          <CustomModal title="Module" onClose={() => setIsModuleModalOpen(false)}>
            <form onSubmit={handleAddModule} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titre du module :</Label>
                <Input required value={moduleData.title} onChange={(e) => setModuleData({...moduleData, title: e.target.value})} placeholder="Ex: Fondamentaux" className="rounded-xl bg-slate-50 border-none h-12 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ordre d'affichage :</Label>
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-1 border border-slate-100">
                   <div className="p-3 bg-white rounded-lg shadow-sm text-primary"><ListOrdered size={16}/></div>
                   <input type="number" required value={moduleData.order} onChange={(e) => setModuleData({...moduleData, order: e.target.value})} className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full" />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-xl bg-primary font-black uppercase text-[10px] h-12 shadow-lg shadow-primary/20">Enregistrer</Button>
            </form>
          </CustomModal>
        )}

        {/* --- MODALE LEÇON --- */}
        {isLessonModalOpen && (
          <CustomModal title="Leçon" onClose={() => setIsLessonModalOpen(false)}>
            <form onSubmit={handleAddLesson} className="space-y-4 md:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-3 space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titre</Label>
                  <Input required value={lessonData.title} onChange={(e) => setLessonData({...lessonData, title: e.target.value})} className="rounded-xl bg-slate-50 border-none h-12 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ordre</Label>
                  <Input type="number" value={lessonData.order} onChange={(e) => setLessonData({...lessonData, order: e.target.value})} className="rounded-xl bg-slate-50 border-none h-12 text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Lien Vidéo</Label>
                <Input value={lessonData.video_url} onChange={(e) => setLessonData({...lessonData, video_url: e.target.value})} placeholder="URL YouTube" className="rounded-xl bg-slate-50 border-none h-12 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Contenu texte</Label>
                <textarea rows="4" className="w-full p-4 rounded-xl border-none bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:outline-none" value={lessonData.content_text} onChange={(e) => setLessonData({...lessonData, content_text: e.target.value})} />
              </div>
              <Button type="submit" className="w-full rounded-xl bg-primary font-black uppercase text-[10px] h-12">Ajouter</Button>
            </form>
          </CustomModal>
        )}
      </main>
    </div>
  );
}

function CustomModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <Card className="w-full max-w-md shadow-2xl border-none rounded-2xl md:rounded-[2.5rem] bg-white overflow-hidden animate-in zoom-in-95 duration-300 my-auto">
        <div className="flex justify-between items-center px-6 md:px-8 pt-6 md:pt-8">
          <h2 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0"><X size={20} className="text-slate-400" /></button>
        </div>
        <CardContent className="p-6 md:p-8">{children}</CardContent>
      </Card>
    </div>
  );
}