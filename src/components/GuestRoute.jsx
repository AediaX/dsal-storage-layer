// components/GuestRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuthContext } from "../contexts/AuthContext";

/**
 * Guest Route Component
 * Redirects authenticated users to their respective dashboards
 */
const GuestRoute = ({ children }) => {
  const auth = useAuthContext();

  if (auth.loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user is authenticated, redirect to appropriate dashboard
  if (auth.isAuthenticated) {
    if (auth.needsProfileCompletion) {
      return <Navigate to="/auth/complete-profile" replace />;
    }
    
    if (auth.isAdmin) {
      return <Navigate to="/admin/home" replace />;
    } else if (auth.isUser) {
      if (auth.needsEmailVerification) {
        return <Navigate to="/verify-email" replace />;
      }
      return <Navigate to="/user/home" replace />;
    }
  }

  // Allow access to guest routes
  return children;
};

export default GuestRoute;