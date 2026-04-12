import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "@/api/axios";
import { CheckCircle2, XCircle, ShieldCheck, Loader2 } from "lucide-react";

export default function VerifyCertificate() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`api/certificate/verify/${token}/`)
      .then(res => setData(res.data))
      .catch(() => setError(true));
  }, [token]);

  return (
    /* RESPONSIVE: min-h-screen et px-4 pour que la carte respire sur mobile */
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 py-10">
      
      {/* RESPONSIVE: w-full max-w-[420px] et p-6 sur mobile vs p-10 sur desktop */}
      <div className="w-full max-w-[420px] bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border-none p-6 md:p-10 text-center relative overflow-hidden">
        
        {/* ICONE DE SÉCURITÉ */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="bg-primary/10 p-4 md:p-5 rounded-full ring-8 ring-primary/5 transition-transform hover:scale-105">
            <ShieldCheck size={40} className="text-primary" />
          </div>
        </div>

        <h1 className="text-lg md:text-xl font-black mb-6 md:mb-8 text-slate-900 uppercase tracking-tighter italic">
          Vérification du certificat
        </h1>

        {error ? (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 justify-center text-sm font-bold animate-in zoom-in-95 duration-300">
            <XCircle size={20} /> Certificat invalide ou expiré
          </div>
        ) : data ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            
            {/* BADGE DE VALIDITÉ */}
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 flex items-center gap-3 justify-center text-[10px] font-black uppercase tracking-widest shadow-sm">
              <CheckCircle2 size={18} /> Certificat authentique
            </div>

            {/* DÉTAILS DU CERTIFICAT */}
            <div className="text-left space-y-4 text-slate-600 border-t border-slate-50 pt-6 px-1">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Titulaire</span>
                <p className="text-base md:text-lg font-bold text-slate-800 tracking-tight leading-tight">{data.apprenant}</p>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Formation</span>
                <p className="text-sm md:text-base font-bold text-slate-800 tracking-tight leading-tight">{data.formation}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Délivré le</span>
                  <p className="text-xs md:text-sm font-bold text-slate-700">{data.date}</p>
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Émetteur</span>
                  <p className="text-xs md:text-sm font-black text-primary italic">Bootins Academy</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="animate-spin text-primary/30" size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Analyse de l'authenticité...</p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="mt-8 flex flex-col items-center gap-2">
        <p className="text-slate-300 text-[10px] font-black tracking-[0.4em] uppercase italic">
          Bootins Security System
        </p>
      </footer>
    </div>
  );
}