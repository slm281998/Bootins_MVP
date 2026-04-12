import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import AdminDashboard from "./pages/admin/AdminDashboard";
import CourseBuilder from "./pages/admin/CourseBuilder";
import AdminRoute from "./components/AdminRoute";
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm";
import Profile from "./pages/Profile";
import { Toaster } from 'sonner';

// --- AJOUTE CE BLOC ICI ---
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  
  if (!token) {
    // Si pas de token, retour direct au login
    return <Navigate to="/login" replace />;
  }
  
  return children;
};
// --------------------------

function App() {
  return (
    
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* ÉCRAN 2 : Tableau de bord (Fiche 6) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        {/* ÉCRAN 3 : Liste des formations (Fiche 7) */}
        <Route path="/courses" element={<ProtectedRoute><CourseList /></ProtectedRoute>} />
        {/* ÉCRAN 4 : Modules & Cadenas (Fiche 8) */}
        <Route path="/courses/:courseId" element={<ProtectedRoute><CourseModules /></ProtectedRoute>} />
        {/* ÉCRAN 5 : Lecture de leçon (Fiche 9) */}
        <Route path="/certificates" element={<ProtectedRoute><MyCertificates /></ProtectedRoute>} />
        <Route path="/courses/:courseId/certificate" element={<CertificateDetails />} />
        <Route path="/courses/:courseId/lessons/:lessonId" element={<ProtectedRoute><CoursePlayer />
        </ProtectedRoute>} />
        <Route path="/admin"element={<AdminRoute><AdminDashboard /></AdminRoute>}/>
        <Route path="/admin/courses/:id" element={<AdminRoute><CourseBuilder /></AdminRoute>} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPasswordConfirm />} />
        <Route path="/verify/:token" element={<VerifyCertificate />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
      <Chatbot />
    </Router>
  );
}

export default App;