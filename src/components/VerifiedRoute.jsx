// components/VerifiedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * Verified Route Component
 * Requires email verification (for email auth users)
 */
const VerifiedRoute = ({ children }) => {
  const { user, emailVerified, authProvider, profileComplete, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (!profileComplete) {
    return <Navigate to="/auth/complete-profile" replace />;
  }

  if (authProvider === "email" && !emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default VerifiedRoute;