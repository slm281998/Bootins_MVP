import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { User, Mail, ShieldCheck, Edit3, Loader2 } from "lucide-react";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("api/profile/")
      .then((res) => {
        setUserData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur profil:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );

  return (
    /* RESPONSIVE: flex-col sur mobile pour la sidebar responsive */
    <div className="flex flex-col md:flex-row h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* RESPONSIVE: p-6 sur mobile, p-12 sur desktop */}
        <main className="flex-1 p-6 md:p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            
            {/* HEADER : Empilement sur mobile, ligne sur desktop */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 mb-8 md:mb-12 text-center md:text-left">
              <div>
                {/* RESPONSIVE: text-3xl sur mobile, text-5xl sur desktop */}
                <h1 className="text-3xl md:text-5xl font-black text-[#1E293B] italic tracking-tighter">Mon Profil</h1>
                <p className="text-slate-400 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] mt-2">
                  Gérer mes informations personnelles
                </p>
              </div>
              <Button 
                className="w-full md:w-auto bg-[#0F172A] hover:bg-slate-800 text-white rounded-full px-8 py-6 h-auto gap-3 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                <Edit3 size={18} />
                <span className="font-bold text-sm">Modifier le profil</span>
              </Button>
            </div>

            {/* CARTE DE DÉTAILS : p-6/8 sur mobile, p-16 sur desktop */}
            <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 relative overflow-hidden">
              
              <h2 className="text-center text-slate-400 font-bold text-base md:text-lg mb-8 md:mb-16">Détails du Compte</h2>

              <div className="space-y-0 max-w-2xl mx-auto">
                
                {/* NOM COMPLET : gap-4 sur mobile, gap-8 sur desktop */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-8 py-6 md:py-8 border-b border-slate-50 text-center sm:text-left">
                  <div className="p-3 md:p-4 bg-slate-50 rounded-2xl text-slate-900 shrink-0">
                    <User size={24} md:size={28} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Nom Complet</p>
                    <p className="text-xl md:text-2xl font-black text-[#1E293B] tracking-tight">
                      {userData?.first_name} {userData?.last_name}
                    </p>
                  </div>
                </div>

                {/* ADRESSE EMAIL */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-8 py-6 md:py-8 border-b border-slate-50 text-center sm:text-left">
                  <div className="p-3 md:p-4 bg-slate-50 rounded-2xl text-slate-900 shrink-0">
                    <Mail size={24} md:size={28} />
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Adresse Email</p>
                    <p className="text-lg md:text-2xl font-black text-[#1E293B] tracking-tight truncate">
                      {userData?.email}
                    </p>
                  </div>
                </div>

                {/* TYPE DE COMPTE */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-8 py-6 md:py-8 text-center sm:text-left">
                  <div className="p-3 md:p-4 bg-slate-50 rounded-2xl text-slate-900 shrink-0">
                    <ShieldCheck size={24} md:size={28} />
                  </div>
                  <div className="flex flex-col items-center sm:items-start gap-2">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Type de Compte</p>
                    <div className="inline-flex items-center bg-black text-white px-5 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest w-fit">
                      {userData?.user_type || "Étudiant"}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* FOOTER */}
            <footer className="mt-8 md:mt-12 text-center pb-10">
              <p className="text-slate-400 text-xs md:text-sm font-medium italic px-4">
                Vos informations sont sécurisées et confidentielles.
              </p>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}