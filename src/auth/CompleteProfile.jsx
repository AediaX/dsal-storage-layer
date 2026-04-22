// auth/CompleteProfile.jsx
import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Stack, Typography, IconButton, InputAdornment,
  Avatar, CircularProgress, useTheme, useMediaQuery, Fade,
  MenuItem, AppBar, Toolbar, Alert, Paper, Container,
  Checkbox, FormControlLabel, Chip
} from "@mui/material";
import {
  ArrowForward, Event, Phone, Badge, ArrowBack, Upload,
  PersonAdd, Logout
} from "@mui/icons-material";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { uploadImageToGitHub } from "../lib/githubUpload";

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
];

export default function CompleteProfile() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [mobileCode, setMobileCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("error");
  const [touched, setTouched] = useState({});
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserEmail(user.email);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || "");
          setDob(data.dob || "");
          if (data.mobile) {
            const mobileParts = data.mobile.split(" ");
            if (mobileParts.length === 2) {
              setMobileCode(mobileParts[0]);
              setMobile(mobileParts[1]);
            }
          }
          setExistingImage(data.profileImage || "");
          if (data.profileImage) setPreview(data.profileImage);
          setNewsletterOptIn(data.newsletterOptIn || false);
        }
      }
    };
    fetchUserData();
  }, []);

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
  const validateMobile = (num) => num.length >= 7 && num.length <= 12;

  const getFieldError = (field) => {
    if (!touched[field]) return "";
    switch (field) {
      case "fullName": return !validateFullName(fullName) ? "Full name must be at least 2 characters" : "";
      case "dob": return !validateDob(dob) ? "You must be at least 13 years old" : "";
      case "mobile": return !validateMobile(mobile) ? "Enter a valid mobile number (7-12 digits)" : "";
      default: return "";
    }
  };

  const handleBlur = (field) => setTouched(prev => ({ ...prev, [field]: true }));

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

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await signOut(auth);
      localStorage.removeItem("aediax_user");
      localStorage.removeItem("google_signup_temp");
      window.location.href = "/auth/sign-in";
    } catch (error) {
      console.error("Logout error:", error);
      setMsg("Failed to logout. Please try again.");
      setMsgType("error");
      setLogoutLoading(false);
    }
  };

  const handleCompleteProfile = async () => {
    const allFields = ["fullName", "dob", "mobile"];
    const newTouched = {};
    allFields.forEach(f => newTouched[f] = true);
    setTouched(newTouched);

    if (!validateFullName(fullName) || !validateDob(dob) || !validateMobile(mobile)) {
      setMsg("Please fill all required fields correctly");
      setMsgType("error");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not found");

      let profileImageUrl = existingImage;
      if (profileImage) {
        profileImageUrl = await uploadImageToGitHub(
          profileImage,
          `profile-${user.uid}-${Date.now()}`
        );
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        fullName,
        dob,
        mobile: `${mobileCode} ${mobile}`,
        profileImage: profileImageUrl,
        newsletterOptIn,
        profileCompleted: true,
        completedAt: new Date().toISOString(),
      });

      const updatedDoc = await getDoc(userRef);
      localStorage.setItem("aediax_user", JSON.stringify(updatedDoc.data()));

      setMsg("Profile completed successfully! Redirecting...");
      setMsgType("success");

      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      console.error("Complete profile error:", error);
      setMsg("Failed to complete profile. Please try again.");
      setMsgType("error");
    }
    setLoading(false);
  };

  const handleBack = () => {
    window.history.back();
  };

  const isFormValid = () => {
    return validateFullName(fullName) && validateDob(dob) && validateMobile(mobile);
  };

  return (
    <Fade in timeout={650}>
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#ffffff" }}>
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
            <IconButton onClick={handleBack} sx={{ mr: 2, color: "#1a1a2e" }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ color: "#1a1a2e", fontWeight: 700, flex: 1 }}>
              Complete Profile
            </Typography>
            <Button
              onClick={handleLogout}
              disabled={logoutLoading}
              startIcon={logoutLoading ? <CircularProgress size={20} /> : <Logout />}
              sx={{
                color: "#d32f2f",
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.04)",
                },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {isMobile ? "" : "Logout"}
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ mt: { xs: 8, sm: 10 }, mb: 4 }}>
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              p: { xs: 3, sm: 4, md: 5 },
              borderRadius: 4,
              border: "1px solid rgba(0, 0, 0, 0.06)",
              boxShadow: "0 20px 35px -12px rgba(0,0,0,0.08)",
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800} color="#1a1a2e">
                Complete Your Profile
              </Typography>
              <Typography sx={{ color: "#5a6a7a", mt: 1 }}>
                Please provide the additional information below
              </Typography>
              {userEmail && (
                <Chip 
                  label={userEmail}
                  size="small"
                  sx={{ mt: 2, backgroundColor: "#e3f2fd", color: "#1976D2" }}
                />
              )}
            </Box>

            <Stack spacing={3}>
              <Box textAlign="center">
                <Box sx={{ position: "relative", display: "inline-block" }}>
                  <Avatar
                    src={preview}
                    sx={{
                      width: 100, height: 100,
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
                      "&:hover": { backgroundColor: "#1565C0" }
                    }}
                  >
                    <Upload sx={{ fontSize: 16 }} />
                    <input type="file" hidden onChange={handleImage} accept="image/jpeg,image/png,image/jpg" />
                  </IconButton>
                </Box>
              </Box>

              <TextField
                label="Full Name *"
                fullWidth
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={() => handleBlur("fullName")}
                error={!!getFieldError("fullName")}
                helperText={getFieldError("fullName")}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Badge sx={{ color: "#1976D2" }} />
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
                error={!!getFieldError("dob")}
                helperText={getFieldError("dob")}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Event sx={{ color: "#1976D2" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" spacing={1.5}>
                <TextField
                  select
                  value={mobileCode}
                  onChange={(e) => setMobileCode(e.target.value)}
                  sx={{ width: 110 }}
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
                  error={!!getFieldError("mobile")}
                  helperText={getFieldError("mobile")}
                  fullWidth
                  placeholder="9876543210"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: "#1976D2" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <FormControlLabel
                control={
                  <Checkbox 
                    checked={newsletterOptIn}
                    onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    sx={{ color: "#1976D2" }}
                  />
                }
                label="I'd like to receive updates, tips, and offers via email"
              />

              {msg && (
                <Alert severity={msgType} sx={{ borderRadius: 2 }} onClose={() => setMsg("")}>
                  {msg}
                </Alert>
              )}

              <Button
                variant="contained"
                onClick={handleCompleteProfile}
                disabled={loading || !isFormValid()}
                endIcon={!loading && <ArrowForward />}
                sx={{
                  py: 1.3,
                  fontSize: "1rem",
                  borderRadius: 2.5,
                  background: "linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)",
                  textTransform: "none",
                  fontWeight: 700,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Complete Profile"}
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </Fade>
  );
}