import React, { useState, useEffect } from "react";
import api from "@/api/axios";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { User, Mail, ShieldCheck, Edit3, Loader2, Search, Bell } from "lucide-react";

export default function Profile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On récupère les données depuis ton API Django
    api.get("profile/")
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
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* 1. La Sidebar (ton composant existant) */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 3. Zone de contenu */}
        <main className="flex-1 p-12 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            
            {/* Titre et Bouton Modifier */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <h1 className="text-5xl font-black text-[#1E293B] italic tracking-tighter">Mon Profil</h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2 ml-1">
                  Gérer mes informations personnelles
                </p>
              </div>
              <Button 
                className="bg-[#0F172A] hover:bg-slate-800 text-white rounded-full px-8 py-6 h-auto gap-3 transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                <Edit3 size={18} />
                <span className="font-bold text-sm">Modifier le profil</span>
              </Button>
            </div>

            {/* CARTE DE DÉTAILS DU COMPTE */}
            <div className="bg-white rounded-[3rem] p-16 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-50 relative overflow-hidden">
              
              <h2 className="text-center text-slate-400 font-bold text-lg mb-16">Détails du Compte</h2>

              <div className="space-y-0 max-w-2xl mx-auto">
                
                {/* NOM COMPLET */}
                <div className="flex items-center gap-8 py-8 border-b border-slate-50">
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-900">
                    <User size={28} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Nom Complet</p>
                    <p className="text-2xl font-black text-[#1E293B] tracking-tight">
                      {userData?.first_name} {userData?.last_name}
                    </p>
                  </div>
                </div>

                {/* ADRESSE EMAIL */}
                <div className="flex items-center gap-8 py-8 border-b border-slate-50">
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-900">
                    <Mail size={28} />
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Adresse Email</p>
                    <p className="text-2xl font-black text-[#1E293B] tracking-tight">
                      {userData?.email}
                    </p>
                  </div>
                </div>

                {/* TYPE DE COMPTE */}
                <div className="flex items-center gap-8 py-8">
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-900">
                    <ShieldCheck size={28} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Type de Compte</p>
                    <div className="inline-flex items-center bg-black text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit">
                      {userData?.user_type || "Étudiant"}
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* FOOTER DE LA PAGE */}
            <footer className="mt-12 text-center">
              <p className="text-slate-400 text-sm font-medium italic">
                Vos informations sont sécurisées et confidentielles.
              </p>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}