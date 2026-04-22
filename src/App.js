// App.js
import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Box, Skeleton, CssBaseline } from "@mui/material";
import { AuthProvider, useAuthContext } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import UserRoute from "./components/UserRoute";
import GuestRoute from "./components/GuestRoute";

// Lazy imports for code splitting
const Home = lazy(() => import("./open/Home"));
const SignIn = lazy(() => import("./auth/SignIn"));
const SignUp = lazy(() => import("./auth/SignUp"));
const VerifyEmail = lazy(() => import("./auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("./auth/ForgotPassword"));
const CompleteProfile = lazy(() => import("./auth/CompleteProfile"));


const AdminProfile = lazy(() => import("./admin/AdminProfile"));
const AdminSettings = lazy(() => import("./admin/AdminSettings"));
const AdminHome = lazy(() => import("./admin/home"));
const UserControl = lazy(() => import("./admin/UserControl"));
const ContactControl = lazy(() => import("./admin/contactControl"));
const Internship = lazy(() => import("./admin/internship/AdminDashboard"));
const InternshipPayment = lazy(() => import("./admin/internship/payment"));
const InternshipRegistered = lazy(() => import("./admin/internship/registered"));
const InternshipCertificate = lazy(() => import("./admin/internship/certificate"));
const UploadInternshipCertificate = lazy(() => import("./admin/internship/uploadCertificate"));
const GenerateId = lazy(() => import("./admin/internship/GenerateId")); 
const ServiceConsultancyControl = lazy(() => import("./admin/ServiceConsultancyControl"));


const Steganography = lazy(() => import("./user/steganography/home"));
const UserHome = lazy(() => import("./user/Home"));
const UserProfile = lazy(() => import("./user/Profile"));
const UserSettings = lazy(() => import("./user/Settings"));
const QRCodeGenerater = lazy(() => import("./user/QRCodeGenerater"));
const BarcodeGenerater = lazy(() => import("./user/BarcodeGenerater"));
const AudioSteganography = lazy(() => import("./user/AudioSteganography"));


// Loading skeleton component
const PageSkeleton = () => (
  <Box sx={{ p: 4 }}>
    <Skeleton variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 2 }} />
    <Skeleton variant="text" height={50} sx={{ mb: 1 }} />
    <Skeleton variant="text" height={50} sx={{ mb: 1, width: "60%" }} />
    <Skeleton variant="rectangular" height={300} sx={{ mt: 3, borderRadius: 2 }} />
  </Box>
);

// App Routes Component
const AppRoutes = () => {
  const auth = useAuthContext();

  if (auth.loading) {
    return <PageSkeleton />;
  }

  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<GuestRoute><Home /></GuestRoute>} />
        <Route path="/auth/sign-in" element={<GuestRoute><SignIn /></GuestRoute>} />
        <Route path="/auth/sign-up" element={<GuestRoute><SignUp /></GuestRoute>} />
        <Route path="/auth/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

        {/* Email Verification Route */}
        <Route path="/verify-email" element={<ProtectedRoute requireProfileComplete={false}><VerifyEmail /></ProtectedRoute>} />

        {/* Complete Profile Route */}
        <Route path="/auth/complete-profile" element={<ProtectedRoute requireProfileComplete={false}><CompleteProfile /></ProtectedRoute>} />

        {/* Admin Protected Routes */}
        <Route path="/admin/home" element={<AdminRoute><AdminHome /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UserControl /></AdminRoute>} />
        <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        <Route path="/admin/contact-control" element={<AdminRoute><ContactControl /></AdminRoute>} />
        <Route path="/admin/service-consultancy" element={<AdminRoute><ServiceConsultancyControl /></AdminRoute>} />  
        <Route path="/admin/internship" element={<AdminRoute><Internship /></AdminRoute>} />
        <Route path="/admin/internship/registered" element={<AdminRoute><InternshipRegistered /></AdminRoute>} />
        <Route path="/admin/internship/payment" element={<AdminRoute><InternshipPayment /></AdminRoute>} />
        <Route path="/admin/internship/certificates" element={<AdminRoute><InternshipCertificate /></AdminRoute>} />
        <Route path="/admin/internship/certificates/:id" element={<AdminRoute><UploadInternshipCertificate /></AdminRoute>} />
        <Route path="/admin/internship/generate-id" element={<AdminRoute><GenerateId /></AdminRoute>} />

        {/* User Protected Routes */}
        <Route path="/user/home" element={<UserRoute><UserHome /></UserRoute>} />
        <Route path="/user/steganography" element={<UserRoute><Steganography /></UserRoute>} />
        <Route path="/user/profile" element={<UserRoute><UserProfile /></UserRoute>} />
        <Route path="/user/settings" element={<UserRoute><UserSettings /></UserRoute>} />
        <Route path="/user/qr-code-generator" element={<UserRoute><QRCodeGenerater /></UserRoute>} />
        <Route path="/user/barcode-generator" element={<UserRoute><BarcodeGenerater /></UserRoute>} />
        <Route path="/user/audio-steganography" element={<UserRoute><AudioSteganography /></UserRoute>} />

        {/* 404 - Not Found Route */}
        <Route path="*" element={<Navigate to={auth.isAuthenticated ? (auth.isAdmin ? "/admin/home" : auth.isUser ? "/user/home" : "/") : "/"} replace />} />
      </Routes>
    </Suspense>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;