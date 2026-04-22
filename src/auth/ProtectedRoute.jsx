// components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuthContext } from "../contexts/AuthContext";

/**
 * Protected Route Component
 * Handles authentication, profile completion, email verification, and role-based access
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  requireProfileComplete = true,
  requireEmailVerification = true,
  redirectTo = "/auth/sign-in" 
}) => {
  const auth = useAuthContext();

  // Show loading state
  if (auth.loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary">
          Verifying access...
        </Typography>
      </Box>
    );
  }

  // Check if user is authenticated
  if (!auth.isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if profile needs to be completed
  if (requireProfileComplete && auth.needsProfileCompletion) {
    return <Navigate to="/auth/complete-profile" replace />;
  }

  // Check if email is verified (only for email auth users)
  if (requireEmailVerification && auth.needsEmailVerification) {
    return <Navigate to="/verify-email" replace />;
  }

  // Check if user has required role
  if (requiredRole && auth.role !== requiredRole) {
    // Redirect to appropriate dashboard
    if (auth.isAdmin) {
      return <Navigate to="/admin/home" replace />;
    } else if (auth.isUser) {
      return <Navigate to="/user/home" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // All checks passed, render the protected component
  return children;
};

export default ProtectedRoute;