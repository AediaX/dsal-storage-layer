// user/UserProfile.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Stack,
  Divider,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  alpha,
  InputAdornment,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Badge,
  Person,
  VerifiedUser,
  LockReset,
  History,
  Visibility,
  VisibilityOff,
  ArrowBack,
} from "@mui/icons-material";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { uploadImageToGitHub } from "../lib/githubUpload";
import AnimatedBackground from "../components/AnimatedBackground";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    dob: "",
    bio: "",
  });
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  
  // Image upload
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          setProfileForm({
            fullName: userData.fullName || "",
            email: currentUser.email || "",
            mobile: userData.mobile || "",
            dob: userData.dob || "",
            bio: userData.bio || "",
          });
          setPreview(userData.profileImage || null);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      showNotification("Failed to load profile data", "error");
    }
    setLoading(false);
  };

  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg")) {
      if (file.size <= 5 * 1024 * 1024) {
        setProfileImage(file);
        setPreview(URL.createObjectURL(file));
      } else {
        showNotification("Image must be less than 5MB", "error");
      }
    } else {
      showNotification("Only JPEG, PNG images are allowed", "error");
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const currentUser = auth.currentUser;
      let profileImageUrl = user?.profileImage || "";
      
      if (profileImage) {
        profileImageUrl = await uploadImageToGitHub(
          profileImage,
          `user-profile-${currentUser.uid}-${Date.now()}`
        );
      }
      
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        fullName: profileForm.fullName,
        mobile: profileForm.mobile,
        dob: profileForm.dob,
        bio: profileForm.bio,
        profileImage: profileImageUrl,
        updatedAt: new Date().toISOString(),
      });
      
      setUser(prev => ({ ...prev, ...profileForm, profileImage: profileImageUrl }));
      showNotification("Profile updated successfully!");
      setEditMode(false);
      setProfileImage(null);
    } catch (error) {
      console.error("Error updating profile:", error);
      showNotification("Failed to update profile", "error");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    
    setPasswordLoading(true);
    setPasswordError("");
    
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.newPassword);
      
      showNotification("Password changed successfully!");
      setPasswordDialogOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error("Error changing password:", error);
      if (error.code === "auth/wrong-password") {
        setPasswordError("Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        setPasswordError("New password is too weak");
      } else {
        setPasswordError("Failed to change password. Please try again.");
      }
    }
    setPasswordLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthColor = () => {
    const strength = getPasswordStrength(passwordForm.newPassword);
    if (strength <= 1) return "#f44336";
    if (strength <= 2) return "#ff9800";
    if (strength <= 3) return "#2196f3";
    return "#4caf50";
  };

  const getPasswordStrengthLabel = () => {
    const strength = getPasswordStrength(passwordForm.newPassword);
    if (strength <= 1) return "Weak";
    if (strength <= 2) return "Fair";
    if (strength <= 3) return "Good";
    return "Strong";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", bgcolor: "background.default" }}>
      <AnimatedBackground opacity={0.3} blurAmount={55} zIndex={0} pointerEvents="none" />
      
      {/* Fixed App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          background: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: "blur(12px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          zIndex: 1100
        }}
      >
        <Toolbar>
          <IconButton onClick={() => navigate("/user/home")} edge="start" sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
            User Profile
          </Typography>
          {editMode && (
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveProfile}
              disabled={saving}
              size="small"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ pt: { xs: 8, sm: 9 }, pb: 4, px: { xs: 2, sm: 3 }, position: "relative", zIndex: 10 }}>
        <Container maxWidth="md" disableGutters>
          {/* Profile Header Card */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 4, background: alpha(theme.palette.background.paper, 0.9), backdropFilter: "blur(10px)" }}>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" spacing={3}>
              {/* Avatar Section */}
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={preview || user?.profileImage}
                  sx={{
                    width: { xs: 100, sm: 120 },
                    height: { xs: 100, sm: 120 },
                    border: `4px solid ${theme.palette.primary.main}`,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  {!preview && !user?.profileImage && profileForm.fullName?.charAt(0)}
                </Avatar>
                {editMode && (
                  <IconButton
                    component="label"
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: theme.palette.primary.main,
                      color: "white",
                      "&:hover": { backgroundColor: theme.palette.primary.dark },
                    }}
                  >
                    <PhotoCamera sx={{ fontSize: 20 }} />
                    <input type="file" hidden onChange={handleImageUpload} accept="image/jpeg,image/png,image/jpg" />
                  </IconButton>
                )}
              </Box>
              
              {/* User Info */}
              <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {profileForm.fullName || "User"}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {profileForm.email}
                </Typography>
                <Stack direction="row" spacing={1} justifyContent={{ xs: "center", sm: "flex-start" }}>
                  <Chip icon={<VerifiedUser />} label={user?.emailVerified ? "Verified" : "Unverified"} size="small" color={user?.emailVerified ? "success" : "warning"} />
                  <Chip icon={<Person />} label="User" size="small" color="primary" />
                </Stack>
              </Box>
              
              {/* Edit Button */}
              {!editMode && (
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setEditMode(true)}
                  sx={{ alignSelf: { xs: "center", sm: "flex-start" } }}
                >
                  Edit Profile
                </Button>
              )}
            </Stack>
          </Paper>

          {/* Profile Details Card */}
          <Card sx={{ borderRadius: 4, mb: 3, background: alpha(theme.palette.background.paper, 0.9), backdropFilter: "blur(10px)" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Badge /> Profile Information
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {!editMode ? (
                // View Mode
                <Stack spacing={2}>
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="textSecondary">Full Name</Typography>
                      <Typography variant="body1" fontWeight={500}>{profileForm.fullName || "Not provided"}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="textSecondary">Email Address</Typography>
                      <Typography variant="body1">{profileForm.email}</Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="textSecondary">Mobile Number</Typography>
                      <Typography variant="body1">{profileForm.mobile || "Not provided"}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="textSecondary">Date of Birth</Typography>
                      <Typography variant="body1">{profileForm.dob || "Not provided"}</Typography>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" color="textSecondary">Bio</Typography>
                    <Typography variant="body1">{profileForm.bio || "No bio added"}</Typography>
                  </Box>
                </Stack>
              ) : (
                // Edit Mode
                <Stack spacing={2.5}>
                  <TextField
                    label="Full Name"
                    fullWidth
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    size="medium"
                  />
                  <TextField
                    label="Mobile Number"
                    fullWidth
                    value={profileForm.mobile}
                    onChange={(e) => setProfileForm({ ...profileForm, mobile: e.target.value })}
                    placeholder="+91 9876543210"
                    size="medium"
                  />
                  <TextField
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    value={profileForm.dob}
                    onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                    size="medium"
                  />
                  <TextField
                    label="Bio"
                    fullWidth
                    multiline
                    rows={4}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                  />
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => {
                        setEditMode(false);
                        setProfileImage(null);
                        setPreview(user?.profileImage || null);
                        fetchUserData();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </Stack>
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Security Card */}
          <Card sx={{ borderRadius: 4, mb: 3, background: alpha(theme.palette.background.paper, 0.9), backdropFilter: "blur(10px)" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LockReset /> Security
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>Password</Typography>
                    <Typography variant="caption" color="textSecondary">Last changed: {formatDate(user?.updatedAt)}</Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<LockReset />}
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Change Password
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Activity Card */}
          <Card sx={{ borderRadius: 4, background: alpha(theme.palette.background.paper, 0.9), backdropFilter: "blur(10px)" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <History /> Account Activity
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="textSecondary">Account Created</Typography>
                  <Typography variant="body1">{formatDate(user?.createdAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Last Updated</Typography>
                  <Typography variant="body1">{formatDate(user?.updatedAt)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="textSecondary">Authentication Provider</Typography>
                  <Typography variant="body1">{user?.authProvider || "Email"}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
      
      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Change Password
          <IconButton
            onClick={() => setPasswordDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Cancel />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {passwordError && (
              <Alert severity="error" onClose={() => setPasswordError("")}>
                {passwordError}
              </Alert>
            )}
            <TextField
              label="Current Password"
              type={showCurrentPassword ? "text" : "password"}
              fullWidth
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                      {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New Password"
              type={showNewPassword ? "text" : "password"}
              fullWidth
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            {passwordForm.newPassword && (
              <Box>
                <LinearProgress
                  variant="determinate"
                  value={(getPasswordStrength(passwordForm.newPassword) / 4) * 100}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(getPasswordStrengthColor(), 0.2),
                    "& .MuiLinearProgress-bar": {
                      backgroundColor: getPasswordStrengthColor(),
                      borderRadius: 3,
                    },
                  }}
                />
                <Typography variant="caption" sx={{ color: getPasswordStrengthColor(), mt: 0.5, display: "block" }}>
                  Password strength: {getPasswordStrengthLabel()}
                </Typography>
              </Box>
            )}
            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              error={passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword}
              helperText={
                passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                  ? "Passwords do not match"
                  : ""
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={passwordLoading || !passwordForm.currentPassword || !passwordForm.newPassword}
          >
            {passwordLoading ? <CircularProgress size={24} /> : "Update Password"}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile;