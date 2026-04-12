// src/components/AdminRoute.jsx
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  // On récupère les infos utilisateur stockées lors du login
  const user = JSON.parse(localStorage.getItem("user")); 

  // Si pas d'user ou si l'user n'est pas "staff", on redirige vers le dashboard classique
  if (!user || !user.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;