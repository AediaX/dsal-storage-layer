// auth/SignIn.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  InputAdornment,
  CircularProgress,
  Paper,
  Link,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Alert
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import LoginIcon from "@mui/icons-material/Login";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AnimatedBackground from "../components/AnimatedBackground";

// Google Icon Component with real colors
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogTitle, setDialogTitle] = useState("");

  const navigate = useNavigate();

  const userFriendlyErrors = (code) => {
    switch (code) {
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const showDialog = (title, message) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        await auth.signOut();
        showDialog("Verify Your Email", "A verification link has been sent to your email address. Please verify your email before signing in.");
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        showDialog("User Data Missing", "User data could not be found. Please contact support.");
        setLoading(false);
        return;
      }

      const userData = userDoc.data();
      const role = userData.isAdmin ? "admin" : "user";

      // Update last login
      await setDoc(doc(db, "users", user.uid), {
        ...userData,
        lastLogin: new Date().toISOString()
      }, { merge: true });

      localStorage.setItem(
        "aediax_user",
        JSON.stringify({ uid: user.uid, email: user.email, role, ...userData })
      );

      navigate(role === "admin" ? "/admin/home" : "/user/home");
    } catch (error) {
      setErrorMsg(userFriendlyErrors(error.code));
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg("");
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // For Google sign-in without existing account, create user document with Google data
        const userData = {
          uid: user.uid,
          fullName: user.displayName || "",
          email: user.email,
          profileImage: user.photoURL || "",
          dob: "",
          mobile: "",
          isAdmin: false,
          isUser: true,
          emailVerified: user.emailVerified || false,
          authProvider: "google",
          googleId: user.uid,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          newsletterOptIn: false,
        };

        // Split display name if needed
        if (user.displayName) {
          const nameParts = user.displayName.split(' ');
          userData.firstName = nameParts[0];
          userData.lastName = nameParts.slice(1).join(' ');
        }

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), userData);
        
        const role = userData.isAdmin ? "admin" : "user";
        
        localStorage.setItem(
          "aediax_user",
          JSON.stringify({ uid: user.uid, email: user.email, role, ...userData })
        );
        
        // Redirect to home page instead of complete profile since we have all data
        navigate(role === "admin" ? "/admin/home" : "/user/home");
      } else {
        // User exists, update last login and redirect
        const existingUserData = userDoc.data();
        const updatedUserData = {
          ...existingUserData,
          lastLogin: new Date().toISOString(),
        };
        
        await setDoc(doc(db, "users", user.uid), updatedUserData);
        
        const role = existingUserData.isAdmin ? "admin" : "user";
        
        localStorage.setItem(
          "aediax_user",
          JSON.stringify({ uid: user.uid, email: user.email, role, ...existingUserData })
        );
        
        navigate(role === "admin" ? "/admin/home" : "/user/home");
      }
    } catch (error) {
      console.error("Google Sign In Error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setErrorMsg("Sign in cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        setErrorMsg("Pop-up was blocked. Please allow pop-ups for this site and try again.");
      } else if (error.code === "auth/account-exists-with-different-credential") {
        setErrorMsg("An account already exists with this email. Please sign in with your password.");
      } else if (error.code === "auth/network-request-failed") {
        setErrorMsg("Network error. Please check your internet connection.");
      } else {
        setErrorMsg("Google sign in failed. Please try again.");
      }
    }
    setGoogleLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && email && password && !loading) {
      handleSignIn(e);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Component - Fixed to background */}
      <AnimatedBackground 
        opacity={0.65}
        blurAmount={55}
        zIndex={0}
        pointerEvents="none"
      />

      {/* NAV BAR */}
      <AppBar
        elevation={0}
        sx={{
          backdropFilter: "blur(12px)",
          background: "rgba(255,255,255,0.8)",
          color: "black",
          boxShadow: "0px 1px 10px rgba(0, 0, 0, 0.08)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          position: "fixed",
          zIndex: 1100
        }}
      >
        <Toolbar>
          <IconButton onClick={() => navigate(-1)} sx={{ color: "#1a1a2e" }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 700, color: "#1a1a2e" }}>
            Sign In
          </Typography>
        </Toolbar>
      </AppBar>

      {/* SIGN IN CARD */}
      <Paper
        elevation={12}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 3, sm: 4, md: 5 },
          borderRadius: 4,
          backdropFilter: "blur(20px)",
          background: "rgba(255, 255, 255, 0.95)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          mt: 10,
          animation: "fadeIn 0.5s ease-out",
          position: "relative",
          zIndex: 10
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <Typography 
          variant="h4" 
          fontWeight={800} 
          textAlign="center" 
          sx={{ 
            mb: 1,
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          Welcome Back
        </Typography>
        <Typography textAlign="center" color="#666" mb={4}>
          Sign in to continue to <strong>AediaX Edge</strong>
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErrorMsg("")}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleSignIn}>
          <Stack spacing={2.5}>
            <TextField
              label="Email Address"
              fullWidth
              variant="outlined"
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              value={email}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: "#6c63ff",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: "#6c63ff" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Password"
              fullWidth
              variant="outlined"
              type={showPassword ? "text" : "password"}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              value={password}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover fieldset': {
                    borderColor: "#6c63ff",
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "#6c63ff" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              endIcon={!loading && <LoginIcon />}
              disabled={loading}
              sx={{
                py: 1.4,
                borderRadius: 2.5,
                fontSize: "1rem",
                fontWeight: 700,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                textTransform: "none",
                transition: "all 0.3s ease",
                '&:hover': {
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
                },
                '&:disabled': {
                  background: "#ccc",
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
            </Button>
          </Stack>
        </form>

        {/* Forgot password link */}
        <Link
          underline="hover"
          sx={{ 
            cursor: "pointer", 
            textAlign: "center", 
            mt: 2, 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            gap: 0.5,
            color: "#666",
            '&:hover': { color: "#6c63ff" }
          }}
          onClick={() => navigate("/auth/forgot-password")}
        >
          <HelpOutlineIcon sx={{ fontSize: 18 }} />
          Forgot password?
        </Link>

        {/* Divider */}
        <Divider sx={{ my: 3 }}>
          <Typography variant="caption" sx={{ color: "#999", fontWeight: 500 }}>
            OR CONTINUE WITH
          </Typography>
        </Divider>

        {/* Google Sign In Button */}
        <Button
          fullWidth
          variant="outlined"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          startIcon={googleLoading ? <CircularProgress size={22} /> : <GoogleIcon />}
          sx={{
            py: 1.3,
            borderRadius: 2.5,
            borderColor: "#e0e0e0",
            color: "#3c4043",
            fontWeight: 600,
            fontSize: "0.95rem",
            textTransform: "none",
            backgroundColor: "#ffffff",
            transition: "all 0.2s ease",
            '&:hover': {
              borderColor: "#d0d0d0",
              backgroundColor: "#fafafa",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              transform: "translateY(-1px)"
            },
            '&:disabled': {
              borderColor: "#e0e0e0",
            }
          }}
        >
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </Button>

        {/* Sign Up Link */}
        <Typography textAlign="center" mt={3} color="#555">
          New to AediaX?{" "}
          <Link
            underline="hover"
            sx={{ 
              cursor: "pointer", 
              fontWeight: 700,
              color: "#667eea",
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              '&:hover': { color: "#764ba2" }
            }}
            onClick={() => navigate("/auth/sign-up")}
          >
            <PersonAddAltIcon sx={{ fontSize: 18 }} />
            Create an account
          </Link>
        </Typography>
      </Paper>

      {/* DIALOG */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>{dialogTitle}</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} variant="contained" sx={{ borderRadius: 2 }}>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}