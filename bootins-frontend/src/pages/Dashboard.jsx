import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  Users, BookOpen, Award, LayoutDashboard, 
  TrendingUp, Plus, ChevronRight, Bell, Calendar 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';

// Mock data pour le graphique (à remplacer par tes stats Django plus tard)
const data = [
  { name: 'Lun', users: 40 },
  { name: 'Mar', users: 30 },
  { name: 'Mer', users: 65 },
  { name: 'Jeu', users: 45 },
  { name: 'Ven', users: 90 },
  { name: 'Sam', users: 70 },
  { name: 'Dim', users: 110 },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    users: 0, 
    courses: 0, 
    certificates: 0,
    recentUsers: [] 
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats/");
        setStats(res.data);
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  return (
    <AdminLayout>
      {/* --- HEADER AVEC ACTIONS --- */}
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">
            <LayoutDashboard size={40} className="text-primary" /> 
            Panneau de Contrôle
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-2">
            Bienvenue, Samir • {new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/admin/courses/add")} className="rounded-2xl bg-slate-900 font-black uppercase text-[10px] py-6 px-6 shadow-xl hover:bg-primary transition-all gap-2">
            <Plus size={16} /> Nouvelle Formation
          </Button>
        </div>
      </header>

      {/* --- GRILLE DE STATS ÉVOLUÉE --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Apprenants" 
          value={stats.users} 
          trend="+12%" 
          icon={<Users />} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Formations" 
          value={stats.courses} 
          trend="+2 ce mois" 
          icon={<BookOpen />} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Certificats" 
          value={stats.certificates} 
          trend="85% réussite" 
          icon={<Award />} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- GRAPHIQUE DE CROISSANCE --- */}
        <Card className="lg:col-span-2 border-none shadow-sm rounded-[2.5rem] bg-white p-8">
          <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Activité des Inscriptions</CardTitle>
              <p className="text-slate-400 text-[10px] font-bold uppercase">7 derniers jours</p>
            </div>
            <TrendingUp className="text-emerald-500" />
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F172A" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0F172A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 12, fontWeight: 'bold'}} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#0F172A" strokeWidth={4} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* --- DERNIERS INSCRITS --- */}
        <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-xl font-black uppercase italic tracking-tighter">Nouveaux Membres</CardTitle>
          </CardHeader>
          <div className="space-y-6">
            {stats.recentUsers?.length > 0 ? (
              stats.recentUsers.map((user, i) => (
                <div key={i} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 text-xs">
                      {user.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tracking-tighter">{user.username}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{user.email}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-200 group-hover:text-primary transition-colors" />
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-[10px] font-black uppercase italic">Aucune activité récente</p>
            )}
            <Button variant="ghost" onClick={() => navigate("/admin/users")} className="w-full mt-4 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-primary">
              Voir tous les membres
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, icon, color, trend }) {
  return (
    <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-2 relative overflow-hidden group">
      <CardContent className="p-6 flex items-center gap-6">
        <div className={`h-16 w-16 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500`}>
          {React.cloneElement(icon, { size: 28 })}
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-900 tracking-tighter">{value}</span>
            <span className="text-[9px] font-black text-emerald-500 uppercase">{trend}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}