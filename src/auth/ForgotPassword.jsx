import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Link,
  AppBar,
  Toolbar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  ArrowBack,
  Email,
  Login,
} from "@mui/icons-material";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setMsg("Please enter your email address.");
      return;
    }
    setLoading(true);
    setMsg("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("Password reset email sent! Check your inbox.");
    } catch (error) {
      setMsg(error.message);
    }

    setLoading(false);
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        background: "#ffffff",
      }}
    >
      {/* FIXED APP BAR */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 20px rgba(0, 0, 0, 0.05)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)"
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Back Button */}
          <IconButton
            onClick={handleBack}
            sx={{ 
              mr: 2,
              color: "#6A5ACD",
              "&:hover": { 
                backgroundColor: "rgba(106, 90, 205, 0.1)" 
              }
            }}
          >
            <ArrowBack />
          </IconButton>

          {/* Title with Email Icon */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Email sx={{ color: "#6A5ACD", fontSize: 24 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                color: "#333",
                fontWeight: 600,
                fontSize: { xs: "1rem", sm: "1.25rem" }
              }}
            >
              Reset Password
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Sign In Button */}
          <IconButton
            component={Link}
            href="/auth/sign-in"
            sx={{ 
              color: "#6A5ACD",
              "&:hover": { 
                backgroundColor: "rgba(106, 90, 205, 0.1)" 
              }
            }}
          >
            <Login />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* MAIN CONTENT */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          mt: { xs: 7, sm: 8 }, // Adjusted margin to account for app bar
        }}
      >
        {/* colorful shapes */}
        <Box
          sx={{
            position: "fixed",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #FF9A8B, #FF6A88, #FF99AC)",
            top: "-80px",
            right: "-60px",
            filter: "blur(45px)",
            animation: "float 9s infinite alternate",
            opacity: 0.55,
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "fixed",
            width: 340,
            height: 340,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, #8EC5FC, #E0C3FC)",
            bottom: "-90px",
            left: "-70px",
            filter: "blur(55px)",
            animation: "float 12s infinite alternate",
            opacity: 0.55,
            zIndex: 0,
          }}
        />

        {/* floating animation keyframes */}
        <style>
          {`
            @keyframes float {
              0% { transform: translateY(0px); }
              100% { transform: translateY(45px); }
            }
          `}
        </style>

        {/* main card */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 420,
            p: 4,
            borderRadius: 4,
            backdropFilter: "blur(18px)",
            bgcolor: "rgba(255,255,255,0.65)",
            border: "1px solid rgba(220,220,220,0.6)",
            boxShadow: "0 8px 35px rgba(0,0,0,0.08)",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            variant="h4"
            fontWeight={700}
            mb={3}
            sx={{ color: "#333", display: { xs: "none", sm: "block" } }}
          >
            Reset Password
          </Typography>

          <Typography
            variant="h5"
            fontWeight={700}
            mb={3}
            sx={{ color: "#333", display: { xs: "block", sm: "none" } }}
          >
            Reset Password
          </Typography>

          <Typography
            variant="body1"
            mb={3}
            sx={{ color: "#666", fontSize: "0.95rem" }}
          >
            Enter your email address and we'll send you a link to reset your password.
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#6A5ACD" }} />
                  </InputAdornment>
                ),
              }}
            />

            {loading ? (
              <CircularProgress sx={{ mx: "auto" }} />
            ) : (
              <Button
                variant="contained"
                fullWidth
                onClick={handleReset}
                sx={{
                  py: 1.4,
                  borderRadius: 2,
                  fontSize: "1rem",
                  background: "linear-gradient(135deg,#6A5ACD,#836FFF)",
                  fontWeight: 600,
                  transition: "0.25s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 5px 18px rgba(0,0,0,0.25)",
                  },
                }}
              >
                Send Reset Link
              </Button>
            )}

            {msg && (
              <Typography
                mt={1}
                sx={{
                  color: msg.includes("sent") ? "green" : "red",
                  fontWeight: 600,
                  fontSize: ".95rem",
                }}
              >
                {msg}
              </Typography>
            )}

            <Typography mt={2} sx={{ color: "#444" }}>
              Back to{" "}
              <Link
                href="/auth/sign-in"
                underline="hover"
                sx={{ fontWeight: 700, color: "#6A5ACD" }}
              >
                Sign In
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}