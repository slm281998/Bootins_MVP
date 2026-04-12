import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";

// 1. SIDEBAR (OK d'après tes logs)
import { Sidebar } from "@/components/Sidebar";

// 2. BOUTON (Était undefined)
// Si c'est un composant shadcn, vérifie bien le chemin. 
// On tente l'import par défaut ET nommé pour être sûr.
import { Button } from "@/components/ui/button";

// 3. LUCIDE ICONS (Étaient des objets)
import * as Lucide from "lucide-react";
const Award = Lucide.Award;
const Download = Lucide.Download;
const ChevronLeft = Lucide.ChevronLeft;
const Calendar = Lucide.Calendar;
const User = Lucide.User;
const Book = Lucide.Book;

// 4. QRCODE (Était un objet)
import QRCodeModule from "react-qr-code";
const QRCode = QRCodeModule.default || QRCodeModule;

export default function CertificateDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post("api/certificate/generate/", { course_id: courseId })
      .then((res) => {
        setCertData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur API:", err.response);
        setLoading(false);
      });
  }, [courseId]);

  const handleDownloadPDF = async () => {
    try {
      const response = await api.post('certificate/generate/?download=true', 
          { course_id: courseId }, 
          { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Certificat_${certData?.course_title || 'formation'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Erreur téléchargement:", error);
    }
  };

  // Tant que l'API n'a pas répondu, on affiche cet écran simple
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold">GÉNÉRATION DU CERTIFICAT...</p>
        </div>
      </div>
    );
  }

  const verificationUrl = `${window.location.origin}/verify/${certData?.token}`;
  

  return (
    <div className="flex h-screen bg-slate-50">
      {/* 3. VERIFICATION : Si Sidebar est tjs en erreur, commente la ligne suivante pour tester */}
      <Sidebar />
      
      <main className="flex-1 p-8 overflow-y-auto">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2 hover:bg-white">
          <ChevronLeft size={18} /> Retour aux modules
        </Button>

        <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl border-4 border-white overflow-hidden">
          <div className="bg-primary p-12 text-white text-center relative">
            <Award size={64} className="mx-auto mb-4 text-yellow-400" />
            <h1 className="text-3xl font-black italic tracking-tight">CERTIFICAT DE RÉUSSITE</h1>
            <p className="opacity-70 uppercase tracking-widest text-xs mt-2">Bootins Academy</p>
          </div>

          <div className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-2xl"><User className="text-slate-400" size={24} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase">Apprenant</p>
                  <p className="text-xl font-bold text-slate-800">{certData?.user_full_name || "Étudiant"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-2xl"><Book className="text-slate-400" size={24} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase">Formation</p>
                  <p className="text-xl font-bold text-slate-800">{certData?.course_title || "Chargement..."}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-2xl"><Calendar className="text-slate-400" size={24} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase">Obtenu le</p>
                  <p className="text-xl font-bold text-slate-800">
                    {certData?.issued_at ? new Date(certData.issued_at).toLocaleDateString('fr-FR') : "..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Section QR Code */}
            <div className="flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[2rem] border-4 border-dashed border-slate-200">
              {certData?.token && (
                <div className="bg-white p-3 rounded-2xl shadow-sm">
                  <QRCode value={verificationUrl} size={140} />
                </div>
              )}
              <p className="text-[10px] mt-4 text-slate-400 font-black tracking-widest uppercase">
                Vérification Officielle
              </p>
            </div>

            <Button 
              onClick={handleDownloadPDF} 
              className="w-full py-8 text-xl gap-4 rounded-2xl shadow-xl font-black uppercase tracking-tighter"
            >
              <Download size={24} /> Télécharger mon PDF
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}