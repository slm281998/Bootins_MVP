import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  
  if (!token) {
    // Si pas de token, on renvoie vers le login
    return <Navigate to="/login" replace />;
  }
  
  return children;
};