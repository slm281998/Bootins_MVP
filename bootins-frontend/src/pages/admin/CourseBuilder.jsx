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

  // États pour les Modales
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(null);

  // --- ÉTATS DES FORMULAIRES (Comme sur ton image) ---
  const [moduleData, setModuleData] = useState({ title: "", order: 1 });
  const [lessonData, setLessonData] = useState({ title: "", video_url: "", content_text: "", order: 1 });

  const fetchCourseDetails = async () => {
    try {
      const res = await api.get(`courses/${id}/`); 
      setCourse(res.data);
      // On pré-remplit l'ordre du prochain module
      setModuleData(prev => ({ ...prev, order: (res.data.modules?.length || 0) + 1 }));
    } catch {
      setError("Erreur de connexion avec le serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourseDetails(); }, [id]);

  // --- LOGIQUE D'AJOUT ---
  const handleAddModule = async (e) => {
  e.preventDefault();
  
  // 1. On vérifie dans la console du navigateur que l'id existe bien
  console.log("Tentative d'ajout de module pour le cours ID :", id);

  try {
    await api.post("modules/", { 
      course: id, // ⚠️ Cette clé 'course' doit correspondre au champ de ton Serializer
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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center justify-between animate-in slide-in-from-top duration-300 shadow-sm">
            <div className="flex items-center gap-3 font-bold text-sm"><AlertCircle size={18} /> {error}</div>
            <button onClick={() => setError(null)}><X size={18} /></button>
          </div>
        )}

        {/* HEADER */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => navigate("/admin")} className="rounded-full bg-white shadow-sm hover:bg-slate-50 border border-slate-100"><ArrowLeft size={20} /></Button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800">{course.title}</h1>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Architecture du programme</p>
          </div>
        </div>

        <div className="max-w-4xl space-y-4 pb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-black text-slate-400 uppercase text-[10px] tracking-widest flex items-center gap-2">
              <Layout size={14} /> Sommaire des modules
            </h2>
            <Button onClick={() => setIsModuleModalOpen(true)} size="sm" className="rounded-xl gap-2 font-black text-[10px] uppercase shadow-lg shadow-primary/20 h-10 px-5">
              <Plus size={16} /> Nouveau Module
            </Button>
          </div>

          {course.modules?.map((module) => (
            <div key={module.id} className="bg-white border border-slate-100 rounded-[2rem] shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div className="p-6 flex items-center justify-between cursor-pointer" onClick={() => toggleModule(module.id)}>
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-2xl transition-all ${expandedModules[module.id] ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-slate-100 text-slate-400'}`}>
                    {expandedModules[module.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-primary uppercase bg-primary/5 px-2 py-0.5 rounded">Ordre: {module.order}</span>
                    </div>
                    <h3 className="font-bold text-slate-700 mt-1">{module.title}</h3>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={(e) => { 
                  e.stopPropagation(); 
                  setActiveModuleId(module.id); 
                  setIsLessonModalOpen(true); 
                }} className="rounded-xl font-black text-[10px] uppercase border-slate-200 hover:bg-slate-50">
                  + Ajouter une leçon
                </Button>
              </div>

              {expandedModules[module.id] && (
                <div className="px-6 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-300">
                  {module.lessons?.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-50 rounded-2xl group hover:bg-white hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                        <span className="text-[10px] text-slate-300 font-black">#{lesson.order}</span>
                        {lesson.video_url ? <Video size={16} className="text-blue-500" /> : <FileText size={16} className="text-slate-400" />}
                        {lesson.title}
                      </div>
                      <Trash2 size={14} className="text-slate-300 hover:text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* --- MODALE MODULE (Inspiré de ton image Admin) --- */}
        {isModuleModalOpen && (
          <CustomModal title="Configuration du Module" onClose={() => setIsModuleModalOpen(false)}>
            <form onSubmit={handleAddModule} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titre du module :</Label>
                <Input required value={moduleData.title} onChange={(e) => setModuleData({...moduleData, title: e.target.value})} placeholder="Ex: Fondamentaux du projet" className="rounded-2xl bg-slate-50 border-none h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ordre d'affichage :</Label>
                <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-1 border border-slate-100">
                   <div className="p-3 bg-white rounded-xl shadow-sm text-primary"><ListOrdered size={18}/></div>
                   <input type="number" required value={moduleData.order} onChange={(e) => setModuleData({...moduleData, order: e.target.value})} className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full" />
                </div>
              </div>
              <Button type="submit" className="w-full rounded-2xl bg-primary font-black uppercase text-xs h-12 shadow-lg shadow-primary/20">Enregistrer le module</Button>
            </form>
          </CustomModal>
        )}

        {/* --- MODALE LEÇON --- */}
        {isLessonModalOpen && (
          <CustomModal title="Nouvelle Leçon" onClose={() => setIsLessonModalOpen(false)}>
            <form onSubmit={handleAddLesson} className="space-y-5">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3 space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Titre de la leçon</Label>
                  <Input required value={lessonData.title} onChange={(e) => setLessonData({...lessonData, title: e.target.value})} className="rounded-2xl bg-slate-50 border-none h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Ordre</Label>
                  <Input type="number" value={lessonData.order} onChange={(e) => setLessonData({...lessonData, order: e.target.value})} className="rounded-2xl bg-slate-50 border-none h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Lien Vidéo (Optionnel)</Label>
                <Input value={lessonData.video_url} onChange={(e) => setLessonData({...lessonData, video_url: e.target.value})} placeholder="URL YouTube/Vimeo" className="rounded-2xl bg-slate-50 border-none h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Contenu texte</Label>
                <textarea className="w-full min-h-[100px] p-4 rounded-2xl border-none bg-slate-50 text-sm focus:ring-2 focus:ring-primary focus:outline-none" value={lessonData.content_text} onChange={(e) => setLessonData({...lessonData, content_text: e.target.value})} />
              </div>
              <Button type="submit" className="w-full rounded-2xl bg-primary font-black uppercase text-xs h-12">Ajouter la leçon</Button>
            </form>
          </CustomModal>
        )}
      </main>
    </div>
  );
}

function CustomModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl border-none rounded-[2.5rem] bg-white overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center px-8 pt-8">
          <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
        </div>
        <CardContent className="p-8">{children}</CardContent>
      </Card>
    </div>
  );
}