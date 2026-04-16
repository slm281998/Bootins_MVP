import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Layers, 
  PlayCircle, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from '.../assets/logo_bootins.png';

export const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // État pour le menu mobile
  const location = useLocation();
  const navigate = useNavigate();
  
  const userData = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const adminNavItems = [
    { label: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { label: "Utilisateurs", path: "/admin/users", icon: <Users size={20} /> },
    { label: "Formations", path: "/admin/courses", icon: <BookOpen size={20} /> },
    { label: "Modules", path: "/admin/modules", icon: <Layers size={20} /> },
    { label: "Leçons", path: "/admin/lessons", icon: <PlayCircle size={20} /> },
  ];

  return (
    <>
      {/* 📱 BOUTON MENU MOBILE (Visible uniquement sur mobile) */}
      <div className="md:hidden flex items-center justify-between bg-[#1f273b] p-4 w-full border-b border-slate-800">
        <img 
          src={logo} 
          alt="Bootins Logo" 
          className="h-8 w-auto"
        />
        <Button 
          variant="ghost" 
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:bg-slate-700 p-2"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </Button>
      </div>

      {/* 🏠 SIDEBAR PRINCIPALE */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#1f273b] border-r border-slate-800 flex flex-col shadow-sm text-white transition-transform duration-300 transform
        md:relative md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-8 flex flex-col h-full">
          
          {/* LOGO CENTRÉ */}
          <div className="hidden md:flex justify-center w-full mb-10">
            <img 
              src="http://127.0.0.1:8000/media/logo_bootins/logo_bootins.png" 
              alt="BOOTINS" 
              className="h-10 w-auto" 
            />
          </div>
          
          <nav className="space-y-2">
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)} // Ferme le menu au clic sur mobile
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                    isActive 
                      ? "bg-white text-[#0F172A] shadow-lg shadow-blue-500/20 font-bold" 
                      : "text-white hover:bg-slate-700 hover:text-white font-medium"
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

          {/* BAS DE LA SIDEBAR */}
          <div className="mt-auto pt-8 space-y-4">
            <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Session Admin</p>
              <p className="text-xs font-bold text-white truncate">{userData.username || "Admin"}</p>
              <p className="text-[10px] text-blue-400 font-bold uppercase">Mode Administration</p>
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
        </div>
      </aside>

      {/* OVERLAY (Fond sombre quand le menu est ouvert sur mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};