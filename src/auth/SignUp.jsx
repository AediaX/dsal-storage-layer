import React, { useState } from "react";
import {
  Box, TextField, Button, Stack, Typography, IconButton, InputAdornment,
  Avatar, Link, CircularProgress, useTheme, useMediaQuery, Fade,
  Divider, MenuItem, AppBar, Toolbar, Alert, Paper, Checkbox, FormControlLabel,
  Stepper, Step, StepLabel, Container, Chip, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions
} from "@mui/material";
import {
  Visibility, VisibilityOff, Upload, ArrowForward, Event, Phone,
  Badge, Mail, Lock, ArrowBack, Assignment,
  PersonAdd, VerifiedUser
} from "@mui/icons-material";
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { uploadImageToGitHub } from "../lib/githubUpload";

// Google Icon Component with proper colors
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

// Country codes with flags
const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+7", country: "RU", flag: "🇷🇺" },
];

// Step labels
const steps = ["Personal Information", "Security & Terms"];

export default function SignUp() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Step state
  const [activeStep, setActiveStep] = useState(0);
  
  // Form state - Step 1
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [mobileCode, setMobileCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  
  // Form state - Step 2
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  // Terms & Conditions
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [termsDialogOpen, setTermsDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("error");
  const [touched, setTouched] = useState({});

  // Validation functions
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (pass) => pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass);
  const validateMobile = (num) => num.length >= 7 && num.length <= 12;
  const validateFullName = (name) => name.trim().length >= 2;
  const validateDob = (date) => {
    if (!date) return false;
    const birthDate = new Date(date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age >= 13 && age <= 120;
  };

  const getStep1Error = (field) => {
    if (!touched[field]) return "";
    switch (field) {
      case "fullName": return !validateFullName(fullName) ? "Full name must be at least 2 characters" : "";
      case "email": return !validateEmail(email) ? "Enter a valid email address" : "";
      case "dob": return !validateDob(dob) ? "You must be at least 13 years old" : "";
      case "mobile": return !validateMobile(mobile) ? "Enter a valid mobile number (7-12 digits)" : "";
      default: return "";
    }
  };

  const getStep2Error = (field) => {
    if (!touched[field]) return "";
    switch (field) {
      case "password": return !validatePassword(password) ? "Password must be 8+ chars with uppercase & number" : "";
      case "confirmPassword": return password !== confirmPassword ? "Passwords do not match" : "";
      default: return "";
    }
  };

  const isStep1Valid = () => {
    return validateFullName(fullName) && validateEmail(email) && 
           validateDob(dob) && validateMobile(mobile);
  };

  const isStep2Valid = () => {
    return validatePassword(password) && password === confirmPassword && 
           acceptTerms && acceptPrivacy;
  };

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleNext = () => {
    if (activeStep === 0) {
      const allFields = ["fullName", "email", "dob", "mobile"];
      const newTouched = {};
      allFields.forEach(f => newTouched[f] = true);
      setTouched(prev => ({ ...prev, ...newTouched }));
      
      if (isStep1Valid()) {
        setActiveStep(1);
      } else {
        setMsg("Please fill all required fields correctly");
        setMsgType("error");
      }
    }
  };

  const handleBack = () => {
    setActiveStep(0);
    setMsg("");
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg")) {
      if (file.size <= 5 * 1024 * 1024) {
        setProfileImage(file);
        setPreview(URL.createObjectURL(file));
      } else {
        setMsg("Image must be less than 5MB");
        setMsgType("error");
      }
    } else {
      setMsg("Only JPEG, PNG images are allowed");
      setMsgType("error");
    }
  };

  const createUserDocument = async (user, additionalData = {}) => {
    let profileImageUrl = additionalData.profileImage || "";
    
    // Only upload image if there's a file and not already provided
    if (profileImage && !additionalData.profileImage) {
      try {
        profileImageUrl = await uploadImageToGitHub(
          profileImage,
          `profile-${user.uid}-${Date.now()}`
        );
      } catch (error) {
        console.error("Error uploading profile image:", error);
        // Continue without profile image if upload fails
      }
    }

    // Use Google photo if available and no custom image uploaded
    if (!profileImageUrl && additionalData.photoURL) {
      profileImageUrl = additionalData.photoURL;
    }

    const userData = {
      uid: user.uid,
      fullName: additionalData.fullName || fullName || user.displayName || "",
      dob: additionalData.dob || dob || "",
      mobile: additionalData.mobile || (mobile ? `${mobileCode} ${mobile}` : ""),
      email: user.email,
      isAdmin: false,
      isUser: true,
      emailVerified: user.emailVerified || false,
      profileImage: profileImageUrl,
      createdAt: new Date().toISOString(),
      authProvider: additionalData.provider || "email",
      newsletterOptIn: additionalData.newsletterOptIn || newsletterOptIn || false,
      lastLogin: new Date().toISOString(),
      // Additional Google-specific fields
      googleId: additionalData.googleId || null,
      phoneNumber: user.phoneNumber || null,
    };

    await setDoc(doc(db, "users", user.uid), userData);
    localStorage.setItem("aediax_user", JSON.stringify(userData));
    return userData;
  };

  const handleSignup = async () => {
    setMsg("");
    if (!isStep2Valid()) {
      setMsg("Please complete all fields and accept Terms & Privacy Policy");
      setMsgType("error");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      // Update profile with display name
      await updateProfile(user, { displayName: fullName });
      await sendEmailVerification(user);
      await createUserDocument(user);
      
      setMsg("Account created! Please verify your email.");
      setMsgType("success");
      
      setTimeout(() => {
        window.location.href = "/auth/verify-email";
      }, 2000);
    } catch (error) {
      let errorMsg = error.message;
      if (error.code === "auth/email-already-in-use") errorMsg = "Email already registered. Please sign in.";
      else if (error.code === "auth/weak-password") errorMsg = "Password is too weak.";
      setMsg(errorMsg);
      setMsgType("error");
    }
    setLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    setMsg("");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    
    try {
      const result = await signInWithPopup(auth, provider);
      const { user } = result;
      
      // Check if user already exists in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // Extract user data from Google
        const googleData = {
          fullName: user.displayName || "",
          email: user.email,
          profileImage: user.photoURL || "",
          dob: "",
          mobile: "",
          provider: "google",
          googleId: user.uid,
          newsletterOptIn: false,
          emailVerified: user.emailVerified || false,
          photoURL: user.photoURL,
        };

        // Split display name into first and last name if needed
        if (user.displayName) {
          const nameParts = user.displayName.split(' ');
          googleData.fullName = user.displayName;
          googleData.firstName = nameParts[0];
          googleData.lastName = nameParts.slice(1).join(' ');
        }

        // Create complete user document in Firestore
        await createUserDocument(user, googleData);
        
        setMsg("Google account connected successfully! Redirecting...");
        setMsgType("success");
        
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } else {
        // User already exists, just update last login
        const existingUserData = userDoc.data();
        const updatedUserData = {
          ...existingUserData,
          lastLogin: new Date().toISOString(),
        };
        
        await setDoc(doc(db, "users", user.uid), updatedUserData);
        localStorage.setItem("aediax_user", JSON.stringify(updatedUserData));
        
        setMsg("Welcome back! Redirecting...");
        setMsgType("success");
        
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    } catch (error) {
      console.error("Google Sign Up Error:", error);
      
      // Handle specific error cases
      if (error.code === "auth/popup-closed-by-user") {
        setMsg("Sign up cancelled. Please try again.");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        setMsg("An account already exists with this email. Please sign in with your password.");
      } else if (error.code === "auth/popup-blocked") {
        setMsg("Pop-up was blocked. Please allow pop-ups for this site and try again.");
      } else {
        setMsg("Google sign up failed. Please try again.");
      }
      setMsgType("error");
    }
    setGoogleLoading(false);
  };

  const handleBackNav = () => {
    window.history.back();
  };

  const passwordStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthLabel = () => {
    const strength = passwordStrength();
    if (strength === 0) return "";
    if (strength <= 2) return "Weak";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const getPasswordStrengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 2) return "#f44336";
    if (strength === 3) return "#ff9800";
    return "#4caf50";
  };

  return (
    <Fade in timeout={650}>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: "#ffffff",
          overflow: "auto",
        }}
      >
        {/* App Bar */}
        <AppBar 
          position="fixed" 
          sx={{ 
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)"
          }}
        >
          <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
            <IconButton
              onClick={handleBackNav}
              sx={{ 
                mr: 2,
                color: "#1a1a2e",
                transition: "all 0.2s",
                "&:hover": { 
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                  transform: "translateX(-2px)"
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                color: "#1a1a2e",
                fontWeight: 700,
                fontSize: { xs: "1rem", sm: "1.125rem" },
                letterSpacing: "-0.01em"
              }}
            >
              Create Account
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Chip 
              label={`Step ${activeStep + 1} of 2`}
              size="small"
              sx={{ 
                backgroundColor: "rgba(25, 118, 210, 0.1)",
                color: "#1976D2",
                fontWeight: 600,
                fontSize: "0.75rem"
              }}
            />
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth="md" sx={{ mt: { xs: 8, sm: 10 }, mb: 4, px: { xs: 2, sm: 3 } }}>
          {/* Background shapes */}
          <Box sx={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
          }}>
            <Box sx={{
              position: "absolute",
              width: { xs: 250, sm: 350 }, 
              height: { xs: 250, sm: 350 },
              top: "-40px", 
              left: "-40px",
              borderRadius: "180px",
              background: "rgba(0, 213, 255, 0.07)",
              animation: "pulse 9s ease-in-out infinite",
            }} />
            <Box sx={{
              position: "absolute",
              width: { xs: 180, sm: 240 }, 
              height: { xs: 180, sm: 240 },
              bottom: "-60px", 
              right: "-60px",
              borderRadius: "112px",
              background: "rgba(121, 4, 205, 0.09)",
              animation: "pulseReverse 11s ease-in-out infinite",
            }} />
            <style>
              {`
                @keyframes pulse {
                  0% { transform: translateY(0) rotate(0deg); }
                  50% { transform: translateY(45px) rotate(180deg); }
                  100% { transform: translateY(0) rotate(0deg); }
                }
                @keyframes pulseReverse {
                  0% { transform: translateY(0) rotate(0deg); }
                  50% { transform: translateY(-45px) rotate(-180deg); }
                  100% { transform: translateY(0) rotate(0deg); }
                }
              `}
            </style>
          </Box>

          {/* Sign Up Card */}
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              p: { xs: 2.5, sm: 4, md: 5 },
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.96)",
              backdropFilter: "blur(2px)",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              boxShadow: "0 20px 35px -12px rgba(0,0,0,0.08)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Header */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                fontWeight={800}
                color="#1a1a2e"
                sx={{ letterSpacing: "-0.02em", mb: 1 }}
              >
                {activeStep === 0 ? "Create Your Account" : "Secure Your Account"}
              </Typography>
              <Typography
                sx={{ 
                  color: "#5a6a7a", 
                  fontSize: "0.9rem",
                  maxWidth: 450,
                  mx: "auto"
                }}
              >
                {activeStep === 0 
                  ? "Enter your personal details to get started with AediaX Edge"
                  : "Set up your password and agree to our terms to continue"}
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4, px: { xs: 0, sm: 4 } }} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel 
                    StepIconProps={{
                      sx: {
                        "&.Mui-active": { color: "#1976D2" },
                        "&.Mui-completed": { color: "#4caf50" }
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 500, display: { xs: "none", sm: "block" } }}>
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step 1: Personal Information */}
            {activeStep === 0 && (
              <Stack spacing={3}>
                {/* Avatar Section */}
                <Box textAlign="center" mb={1}>
                  <Box sx={{ position: "relative", display: "inline-block" }}>
                    <Avatar
                      src={preview}
                      sx={{
                        width: 100, 
                        height: 100, 
                        mx: "auto",
                        border: "3px solid #fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        backgroundColor: "#f0f2f5"
                      }}
                    >
                      {!preview && <PersonAdd sx={{ fontSize: 48, color: "#aaa" }} />}
                    </Avatar>
                    <IconButton
                      component="label"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "#1976D2",
                        color: "white",
                        width: 32,
                        height: 32,
                        "&:hover": { backgroundColor: "#1565C0" },
                        boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                      }}
                    >
                      <Upload sx={{ fontSize: 16 }} />
                      <input type="file" hidden onChange={handleImage} accept="image/jpeg,image/png,image/jpg" />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#777" }}>
                    Profile picture (optional)
                  </Typography>
                </Box>

                <TextField
                  label="Full Name *"
                  fullWidth
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={() => handleBlur("fullName")}
                  error={!!getStep1Error("fullName")}
                  helperText={getStep1Error("fullName")}
                  placeholder="John Doe"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge sx={{ color: "#1976D2", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Date of Birth *"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  onBlur={() => handleBlur("dob")}
                  error={!!getStep1Error("dob")}
                  helperText={getStep1Error("dob") || "You must be at least 13 years old"}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Event sx={{ color: "#1976D2", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Stack direction="row" spacing={1.5}>
                  <TextField
                    select
                    value={mobileCode}
                    onChange={(e) => setMobileCode(e.target.value)}
                    sx={{ width: 120 }}
                    size="medium"
                  >
                    {countryCodes.map((item) => (
                      <MenuItem key={item.code} value={item.code}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <span>{item.flag}</span>
                          <span>{item.code}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Phone Number *"
                    value={mobile}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= 12) setMobile(val);
                    }}
                    onBlur={() => handleBlur("mobile")}
                    error={!!getStep1Error("mobile")}
                    helperText={getStep1Error("mobile")}
                    fullWidth
                    placeholder="9876543210"
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: "#1976D2", fontSize: 20 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>

                <TextField
                  label="Email Address *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  error={!!getStep1Error("email")}
                  helperText={getStep1Error("email")}
                  type="email"
                  placeholder="hello@aediax.com"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail sx={{ color: "#1976D2", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />

                {msg && activeStep === 0 && (
                  <Alert severity={msgType} sx={{ borderRadius: 2 }} onClose={() => setMsg("")}>
                    {msg}
                  </Alert>
                )}

                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowForward />}
                  sx={{
                    py: 1.3,
                    fontSize: "1rem",
                    borderRadius: 2.5,
                    background: "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
                    textTransform: "none",
                    fontWeight: 700,
                    boxShadow: "0 4px 12px rgba(25,118,210,0.25)",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 16px rgba(25,118,210,0.35)"
                    }
                  }}
                >
                  Continue
                </Button>
              </Stack>
            )}

            {/* Step 2: Security & Terms */}
            {activeStep === 1 && (
              <Stack spacing={3}>
                <TextField
                  label="Password *"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  error={!!getStep2Error("password")}
                  helperText={getStep2Error("password")}
                  placeholder="••••••••"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "#1976D2", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPass(!showPass)} edge="end">
                          {showPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                {password && (
                  <Box sx={{ mt: -1, mb: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ flex: 1, height: 4, backgroundColor: "#e0e0e0", borderRadius: 2 }}>
                        <Box sx={{ width: `${(passwordStrength() / 4) * 100}%`, height: 4, backgroundColor: getPasswordStrengthColor(), borderRadius: 2 }} />
                      </Box>
                      <Typography variant="caption" sx={{ color: getPasswordStrengthColor(), fontWeight: 500 }}>
                        {getPasswordStrengthLabel()}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: "#666", display: "block", mt: 0.5 }}>
                      Use 8+ chars with uppercase & number
                    </Typography>
                  </Box>
                )}

                <TextField
                  label="Confirm Password *"
                  type={showConfirmPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur("confirmPassword")}
                  error={!!getStep2Error("confirmPassword")}
                  helperText={getStep2Error("confirmPassword")}
                  placeholder="••••••••"
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "#1976D2", fontSize: 20 }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPass(!showConfirmPass)} edge="end">
                          {showConfirmPass ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Assignment fontSize="small" color="primary" />
                  Terms & Policies
                </Typography>

                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      sx={{ color: "#1976D2" }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{" "}
                      <Link 
                        component="button"
                        onClick={() => setTermsDialogOpen(true)}
                        sx={{ fontWeight: 600, color: "#1976D2" }}
                      >
                        Terms of Service
                      </Link>
                    </Typography>
                  }
                />

                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={acceptPrivacy}
                      onChange={(e) => setAcceptPrivacy(e.target.checked)}
                      sx={{ color: "#1976D2" }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I agree to the{" "}
                      <Link 
                        component="button"
                        onClick={() => setPrivacyDialogOpen(true)}
                        sx={{ fontWeight: 600, color: "#1976D2" }}
                      >
                        Privacy Policy
                      </Link>
                    </Typography>
                  }
                />

                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={newsletterOptIn}
                      onChange={(e) => setNewsletterOptIn(e.target.checked)}
                      sx={{ color: "#1976D2" }}
                    />
                  }
                  label={
                    <Typography variant="body2">
                      I'd like to receive updates, tips, and offers via email
                    </Typography>
                  }
                />

                {msg && activeStep === 1 && (
                  <Alert severity={msgType} sx={{ borderRadius: 2 }} onClose={() => setMsg("")}>
                    {msg}
                  </Alert>
                )}

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<ArrowBack />}
                    sx={{
                      py: 1.3,
                      px: 3,
                      borderRadius: 2.5,
                      borderColor: "#d0d0d0",
                      color: "#555",
                      textTransform: "none",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "#1976D2",
                        backgroundColor: "rgba(25,118,210,0.04)"
                      }
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSignup}
                    disabled={loading || !isStep2Valid()}
                    endIcon={!loading && <VerifiedUser />}
                    sx={{
                      flex: 1,
                      py: 1.3,
                      fontSize: "1rem",
                      borderRadius: 2.5,
                      background: "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
                      textTransform: "none",
                      fontWeight: 700,
                      boxShadow: "0 4px 12px rgba(25,118,210,0.25)",
                      "&:hover": {
                        transform: "translateY(-1px)",
                        boxShadow: "0 6px 16px rgba(25,118,210,0.35)"
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
                  </Button>
                </Stack>
              </Stack>
            )}

            {/* Google Sign Up - Bottom */}
            {activeStep === 0 && (
              <>
                <Divider sx={{ my: 3 }}>
                  <Typography variant="caption" sx={{ color: "#999", fontWeight: 500 }}>
                    OR CONTINUE WITH
                  </Typography>
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleGoogleSignUp}
                  disabled={googleLoading}
                  startIcon={googleLoading ? <CircularProgress size={22} /> : <GoogleIcon />}
                  sx={{
                    py: 1.2,
                    borderRadius: 2.5,
                    borderColor: "#e0e0e0",
                    color: "#3c4043",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textTransform: "none",
                    backgroundColor: "#ffffff",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "#d0d0d0",
                      backgroundColor: "#fafafa",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
                    }
                  }}
                >
                  {googleLoading ? "Connecting to Google..." : "Continue with Google"}
                </Button>
              </>
            )}

            {/* Sign In Link */}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="body2" color="#555">
                Already have an account?{" "}
                <Link 
                  href="/auth/sign-in" 
                  underline="hover"
                  sx={{ 
                    fontWeight: 600, 
                    color: "#1976D2",
                    cursor: "pointer"
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Container>

        {/* Terms Dialog */}
        <Dialog open={termsDialogOpen} onClose={() => setTermsDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Terms of Service</DialogTitle>
          <DialogContent>
            <DialogContentText component="div">
              <Typography variant="body2" paragraph>
                By using AediaX Edge, you agree to comply with these terms. You must be at least 13 years old to create an account.
              </Typography>
              <Typography variant="body2" paragraph>
                You are responsible for maintaining the security of your account and for any activities that occur under your account.
              </Typography>
              <Typography variant="body2" paragraph>
                We reserve the right to suspend or terminate accounts that violate these terms or applicable laws.
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                Last updated: {new Date().getFullYear()}
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTermsDialogOpen(false)} color="primary">
              I Understand
            </Button>
          </DialogActions>
        </Dialog>

        {/* Privacy Dialog */}
        <Dialog open={privacyDialogOpen} onClose={() => setPrivacyDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Privacy Policy</DialogTitle>
          <DialogContent>
            <DialogContentText component="div">
              <Typography variant="body2" paragraph>
                We collect information you provide when creating an account, including your name, email, and phone number.
              </Typography>
              <Typography variant="body2" paragraph>
                Your data is used to provide and improve our services, communicate with you, and ensure platform security.
              </Typography>
              <Typography variant="body2" paragraph>
                We do not sell your personal information. You can request deletion of your data at any time.
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                Last updated: {new Date().getFullYear()}
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPrivacyDialogOpen(false)} color="primary">
              I Understand
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}