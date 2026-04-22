import React, { useEffect, useState } from "react";
import { Box, Button, Typography, CircularProgress } from "@mui/material";
import { auth } from "../lib/firebase";

export default function VerifyEmail() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
      setLoading(false);
    } else {
      setMsg("No logged-in user found. Please sign in.");
      setLoading(false);
    }
  }, []);

  const handleSendVerification = async () => {
    if (!user) return;
    try {
      await user.sendEmailVerification();
      setMsg("Verification email sent! Check your inbox.");
      setSent(true);
    } catch (error) {
      setMsg(error.message);
    }
  };

  const handleRefresh = async () => {
    if (!user) return;
    await user.reload();
    if (user.emailVerified) {
      setMsg("Email verified! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } else {
      setMsg("Email not verified yet. Refresh to check again.");
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        position: "relative",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* floating shapes */}
      <Box
        sx={{
          position: "absolute",
          width: 330,
          height: 330,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #FF9A8B, #FF6A88, #FF99AC)",
          top: "-80px",
          right: "-60px",
          filter: "blur(44px)",
          animation: "float 9s infinite alternate",
          opacity: 0.55,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #8EC5FC, #E0C3FC)",
          bottom: "-90px",
          left: "-70px",
          filter: "blur(55px)",
          animation: "float 12s infinite alternate",
          opacity: 0.55,
        }}
      />

      {/* keyframes */}
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            100% { transform: translateY(45px); }
          }
        `}
      </style>

      {/* glass card */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 440,
          p: 4,
          borderRadius: 4,
          backdropFilter: "blur(18px)",
          bgcolor: "rgba(255,255,255,0.65)",
          border: "1px solid rgba(220,220,220,0.6)",
          boxShadow: "0 8px 35px rgba(0,0,0,0.08)",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          fontWeight={700}
          mb={2}
          sx={{ color: "#333" }}
        >
          Email Verification
        </Typography>

        <Typography sx={{ color: "#555", mb: 3, fontSize: "1rem" }}>
          {user?.email} <br /> Please verify your email to continue.
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSendVerification}
          sx={{
            py: 1.5,
            mb: 2,
            borderRadius: 2,
            fontSize: "1rem",
            background: "linear-gradient(135deg,#6A5ACD,#836FFF)",
            fontWeight: 600,
            transition: "0.25s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            },
          }}
          disabled={sent}
        >
          {sent ? "Verification Sent" : "Send Verification Email"}
        </Button>

        <Button
          variant="outlined"
          fullWidth
          onClick={handleRefresh}
          sx={{
            py: 1.5,
            borderRadius: 2,
            fontSize: "1rem",
            borderColor: "#6A5ACD",
            color: "#6A5ACD",
            fontWeight: 600,
            "&:hover": {
              borderColor: "#836FFF",
              background: "rgba(106,90,205,0.1)",
            },
          }}
        >
          Refresh / Check Verification
        </Button>

        {msg && (
          <Typography
            mt={2}
            sx={{
              color: msg.includes("verified") ? "green" : "red",
              fontWeight: 600,
            }}
          >
            {msg}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
