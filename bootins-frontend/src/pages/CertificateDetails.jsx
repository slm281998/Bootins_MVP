import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";

// Imports Lucide (on garde ta méthode spécifique)
import * as Lucide from "lucide-react";
const Award = Lucide.Award;
const Download = Lucide.Download;
const ChevronLeft = Lucide.ChevronLeft;
const Calendar = Lucide.Calendar;
const User = Lucide.User;
const Book = Lucide.Book;
const Loader2 = Lucide.Loader2;

// QRCODE
import QRCodeModule from "react-qr-code";
const QRCode = QRCodeModule.default || QRCodeModule;

export default function CertificateDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // ✅ Correction URL : on enlève 'api/' car ton axios le gère déjà
    api.post("certificate/generate/", { course_id: courseId })
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
      setDownloading(true);
      // ✅ Correction URL : on enlève 'api/' pour éviter le 404
      const response = await api.post('api/certificate/generate/?download=true', 
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
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-slate-500 font-black text-xs tracking-widest uppercase">Génération du certificat...</p>
        </div>
      </div>
    );
  }

  const verificationUrl = `${window.location.origin}/api/verify/${certData?.token}`;

  return (
    // 📱 Responsive : flex-col sur mobile, flex-row sur desktop
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar cachée sur mobile si nécessaire ou adaptée */}
      <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* Bouton retour adapté au mobile */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 md:mb-6 gap-2 hover:bg-white rounded-xl text-slate-800 font-bold">
          <ChevronLeft size={18} /> <span className="text-xs uppercase tracking-widest">Retour</span>
        </Button>

        {/* Carte du Certificat - Largeur responsive */}
        <div className="max-w-2xl mx-auto bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border-4 border-white overflow-hidden mb-10">
          
          {/* Header du certificat */}
          <div className="bg-slate-900 p-8 md:p-12 text-white text-center relative">
            <Award size={48} className="mx-auto mb-4 text-yellow-400 md:w-16 md:h-16" />
            <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter leading-none uppercase">
              Certificat de réussite
            </h1>
            <p className="opacity-50 uppercase tracking-[0.3em] text-[10px] mt-4 font-bold">Bootins Academy</p>
          </div>

          <div className="p-6 md:p-12 space-y-6 md:space-y-10">
            {/* Infos Apprenant */}
            <div className="grid grid-cols-1 gap-6 md:gap-8">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl"><User className="text-slate-300" size={24} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Apprenant</p>
                  <p className="text-lg md:text-2xl font-black text-slate-800 italic uppercase">{certData?.user_full_name || "Étudiant"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl"><Book className="text-slate-300" size={24} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Formation complétée</p>
                  <p className="text-lg md:text-2xl font-black text-slate-800 italic uppercase leading-tight line-clamp-2">
                    {certData?.course_title || "Chargement..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 rounded-2xl"><Calendar className="text-slate-300" size={24} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Date d'obtention</p>
                  <p className="text-lg md:text-2xl font-black text-slate-800 italic uppercase">
                    {certData?.issued_at ? new Date(certData.issued_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : "..."}
                  </p>
                </div>
              </div>
            </div>

            {/* Section QR Code Responsive */}
            <div className="flex flex-col items-center justify-center p-6 md:p-8 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
              {certData?.token && (
                <div className="bg-white p-4 rounded-3xl shadow-sm">
                  <QRCode value={verificationUrl} size={120} />
                </div>
              )}
              <p className="text-[9px] mt-4 text-slate-400 font-black tracking-[0.2em] uppercase text-center px-4">
                Scannez pour vérifier l'authenticité
              </p>
            </div>

            {/* Bouton de téléchargement final */}
            <Button 
              onClick={handleDownloadPDF} 
              disabled={downloading}
              className="w-full py-8 text-lg gap-4 rounded-[1.5rem] shadow-xl font-black uppercase tracking-tighter bg-primary hover:scale-[1.02] transition-transform"
            >
              {downloading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <><Download size={24} /> Télécharger le PDF</>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}