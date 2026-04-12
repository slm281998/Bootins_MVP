import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  BookOpen, 
  Award, 
  User, 
  LogOut, 
  ShieldCheck, 
  Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Récupération sécurisée des infos utilisateur
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = userData.is_staff || false;

  const handleLogout = () => {
    localStorage.clear(); // On vide le storage
    navigate("/");        // On redirige proprement vers l'accueil sans recharger tout le navigateur
  };

  const navItems = [
    { label: "Tableau de bord", path: "/dashboard", icon: <LayoutDashboard size={20} />, adminOnly: false },
    { label: "Mes Formations", path: "/courses", icon: <BookOpen size={20} />, adminOnly: false },
    { label: "Mes Certificats", path: "/certificates", icon: <Award size={20} />, adminOnly: false },
    { label: "Administration", path: "/admin", icon: <ShieldCheck size={20} />, adminOnly: true },
    { label: "Mon Profil", path: "/profile", icon: <User size={20} />, adminOnly: false },
  ];
  

  return (
    <aside className="w-72 bg-[#1f273b] border-r border-slate-800 flex flex-col h-full shadow-sm text-white">
      <div className="p-8 flex flex-col">
        
        {/* 🚀 LOGO CENTRÉ ICI */}
        <div className="flex justify-center w-full mb-10">
          <img 
            src="http://127.0.0.1:8000/media/logo_bootins/logo_bootins.png" 
            alt="BOOTINS" 
            className="h-10 w-auto" 
          />
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-white text-[#0F172A] shadow-lg shadow-blue-500/20 font-bold" 
                    : "text-white hover:bg-slate-600 hover:text-white font-medium"
                }`}
              >
                <span className={`${isActive ? "text-[#0F172A]" : "text-slate-500 group-hover:text-blue-400"}`}>
                  {item.icon}
                </span>
                <span className="text-sm tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Le bas de la sidebar reste identique mais avec les couleurs sombres */}
      <div className="mt-auto p-8 space-y-4">
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session active</p>
          <p className="text-xs font-bold text-white truncate">{userData.first_name || "Utilisateur"}</p>
          <p className="text-[10px] text-blue-400 font-bold truncate uppercase">{isAdmin ? "Administrateur" : "Apprenant"}</p>
        </div>

        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-slate-400 hover:text-red-200 hover:bg-red-900 rounded-2xl transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">Déconnexion</span>
        </Button>
      </div>
    </aside>
  );
}