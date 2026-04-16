import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import { Toaster } from "react-hot-toast";

// --- PAGES ÉTUDIANT & COMMUN ---
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CourseList from "./pages/CourseList";
import CoursePlayer from "./pages/CoursePlayer";
import Chatbot from "./components/Chatbot";
import CourseModules from "./pages/CourseModules";
import VerifyCertificate from "./pages/VerifyCertificate";
import CertificateDetails from "./pages/CertificateDetails";
import MyCertificates from "./pages/MyCertificates";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import Profile from "./pages/Profile";

// --- COMPOSANTS DE SÉCURITÉ ---
import AdminRoute from "./components/AdminRoute";

// --- IMPORTS DES PAGES ADMIN (LISTES) ---
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminModules from "./pages/admin/AdminModules";
import AdminLessons from "./pages/admin/AdminLessons";

// --- IMPORTS DES PAGES ADMIN (AJOUT) ---
import AdminAddCourse from "./pages/admin/AdminAddCourse";
import AdminAddModule from "./pages/admin/AdminAddModule";
import AdminAddLesson from "./pages/admin/AdminAddLesson";

// --- IMPORTS DES PAGES ADMIN (ÉDITION) ---
import AdminEditCourse from "./pages/admin/AdminEditCourse";
import AdminEditModule from "./pages/admin/AdminEditModule";
import AdminEditLesson from "./pages/admin/AdminEditLesson";
import AdminEditUser from "./pages/admin/AdminEditUser";
import AdminAddUser from "./pages/admin/AdminAddUser";

// --- COMPOSANT PROTECTED ROUTE (Utilisateurs connectés) ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0F172A', // Ton gris ardoise
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: '1rem',
          },
        }} 
      />
      <Routes>
        {/* ==========================================
            ROUTES PUBLIQUES 
        ========================================== */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPasswordConfirm />} />
        <Route path="/verify/:token" element={<VerifyCertificate />} />
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ==========================================
            ROUTES ÉTUDIANTS (PROTÉGÉES) 
        ========================================== */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/courses" element={<ProtectedRoute><CourseList /></ProtectedRoute>} />
        <Route path="/courses/:courseId" element={<ProtectedRoute><CourseModules /></ProtectedRoute>} />
        <Route path="/courses/:courseId/lessons/:lessonId" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />
        <Route path="/certificates" element={<ProtectedRoute><MyCertificates /></ProtectedRoute>} />
        <Route path="/courses/:courseId/certificate" element={<ProtectedRoute><CertificateDetails /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* ==========================================
            ROUTES ADMINISTRATION (ADMIN ONLY) 
        ========================================== */}
        {/* Accueil & Dashboard Admin */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        {/* --- Gestion des Formations --- */}
        <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />
        <Route path="/admin/courses/add" element={<AdminRoute><AdminAddCourse /></AdminRoute>} />
        <Route path="/admin/courses/edit/:id" element={<AdminRoute><AdminEditCourse /></AdminRoute>} />

        {/* --- Gestion des Utilisateurs --- */}
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/users/add" element={<AdminRoute><AdminAddUser /></AdminRoute>} />
        <Route path="/admin/users/edit/:id" element={<AdminRoute><AdminEditUser /></AdminRoute>} />

        {/* --- Gestion des Modules --- */}
        <Route path="/admin/modules" element={<AdminRoute><AdminModules /></AdminRoute>} />
        <Route path="/admin/modules/add" element={<AdminRoute><AdminAddModule /></AdminRoute>} />
        <Route path="/admin/modules/edit/:id" element={<AdminRoute><AdminEditModule /></AdminRoute>} />

        {/* --- Gestion des Leçons --- */}
        <Route path="/admin/lessons" element={<AdminRoute><AdminLessons /></AdminRoute>} />
        <Route path="/admin/lessons/add" element={<AdminRoute><AdminAddLesson /></AdminRoute>} />
        <Route path="/admin/lessons/edit/:id" element={<AdminRoute><AdminEditLesson /></AdminRoute>} />

      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;