import React from "react";
import { AdminSidebar } from "./AdminSidebar";

export const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden font-sans">
      <AdminSidebar />
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
};