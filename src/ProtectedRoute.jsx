import React from "react";
import { Navigate, useOutletContext } from "react-router-dom";
import { AUTH_DISABLED } from "./config";
import { hasModuleAccess } from "./moduleAccess";

const ProtectedRoute = ({ children, app }) => {
  const context = useOutletContext();

  if (AUTH_DISABLED) return children;

  const token = localStorage.getItem("access_token") || localStorage.getItem("token");

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (context) {
    const { user: contextUser, loadingAuth } = context;

    // Grab user from context or fallback to localStorage
    let user = contextUser;
    if (!user) {
      try {
        const saved = localStorage.getItem("user");
        if (saved) user = JSON.parse(saved);
      } catch {
        // ignore malformed cached user
      }
    }

    // Wait for authentication checks to finish before deciding to kick the user out
    if (loadingAuth && !user) {
      return (
        <div className="flex justify-center items-center h-full min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      );
    }

    if (!user && !loadingAuth) return <Navigate to="/" replace />;
    if (!user) return children;

    if (app && !hasModuleAccess(user, app) && !loadingAuth) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Otherwise, render the protected page
  return children;
};

export default ProtectedRoute;
