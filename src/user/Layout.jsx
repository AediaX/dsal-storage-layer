import { db, auth } from "../lib/firebase";
import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home as HomeIcon,
  Verified as VerifiedIcon,
  Phone as PhoneIcon,
  Logout as LogoutIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  Avatar,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { signOut, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const StyledDrawer = styled(SwipeableDrawer)(({ theme }) => ({
  "& .MuiDrawer-paper": {
    width: 280,
    backgroundColor: theme.palette.mode === "dark" ? "#000000" : alpha(theme.palette.background.paper, 0.95),
    backdropFilter: "blur(20px)",
    borderRadius: "0 24px 24px 0",
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    boxShadow: theme.palette.mode === "dark" 
      ? "0 8px 32px rgba(0, 0, 0, 0.5)" 
      : `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  marginBottom: theme.spacing(2),
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  border: `3px solid ${theme.palette.primary.main}`,
  transition: "all 0.3s ease",
  cursor: "pointer",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 12,
  margin: theme.spacing(0.5, 1),
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    transform: "translateX(4px)",
  },
  "&.danger": {
    "&:hover": {
      backgroundColor: alpha(theme.palette.error.main, 0.1),
      color: theme.palette.error.main,
    },
  },
}));

const DeleteDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: 16,
    backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : theme.palette.background.paper,
    boxShadow: theme.palette.mode === "dark" 
      ? "0 8px 32px rgba(0, 0, 0, 0.5)" 
      : `0 8px 32px ${alpha(theme.palette.common.black, 0.2)}`,
  },
}));

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isDarkMode = theme.palette.mode === "dark";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reAuthDialogOpen, setReAuthDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const snap = await getDoc(doc(db, "users", currentUser.uid));
        if (snap.exists()) {
          setUser({ ...snap.data(), emailVerified: currentUser.emailVerified });
        }
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      localStorage.clear();
      sessionStorage.clear();
      await signOut(auth);
      navigate("/auth/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      setError("Failed to logout. Please try again.");
    } finally {
      setLoading(false);
      setDrawerOpen(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError("");

      const user = auth.currentUser;
      if (!user) {
        setError("No user found");
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      localStorage.clear();
      sessionStorage.clear();
      setReAuthDialogOpen(false);
      setDeleteDialogOpen(false);
      navigate("/auth/sign-in", { 
        state: { message: "Account deleted successfully" }
      });
      
    } catch (error) {
      console.error("Delete account error:", error);
      if (error.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (error.code === 'auth/requires-recent-login') {
        setError("Please log in again before deleting your account.");
      } else {
        setError("Failed to delete account. Please try again.");
      }
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  const handleProfileClick = () => {
    setDrawerOpen(false);
    navigate("/user/profile");
  };

  const navItems = [
    { label: "Home", icon: <HomeIcon />, path: "/user/home" },
    { label: "Profile", icon: <PersonIcon />, path: "/user/profile" },
    { label: "Settings", icon: <SettingsIcon />, path: "/user/settings" },
  ];

  const actionItems = [
    { 
      label: "Logout", 
      icon: <LogoutIcon />, 
      action: handleLogout,
      color: "primary"
    },
    { 
      label: "Delete Account", 
      icon: <DeleteIcon />, 
      action: () => setDeleteDialogOpen(true),
      color: "error",
      className: "danger"
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Profile Drawer Trigger */}
      {user && (
        <StyledAvatar
          src={user.profileImage}
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 100,
            width: isMobile ? 44 : 52,
            height: isMobile ? 44 : 52,
            cursor: "pointer",
            boxShadow: 3,
            border: `2px solid ${theme.palette.primary.main}`,
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
              boxShadow: 6,
            },
          }}
        />
      )}

      {/* User Badge */}
      <Chip
        icon={<PersonIcon />}
        label="User"
        color="primary"
        variant="outlined"
        sx={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 1300,
          fontWeight: "bold",
          backdropFilter: "blur(10px)",
          backgroundColor: isDarkMode ? alpha(theme.palette.background.paper, 0.8) : alpha(theme.palette.common.white, 0.8),
        }}
      />

      {/* Drawer */}
      <StyledDrawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
        swipeAreaWidth={0}
        disableSwipeToOpen={true}
      >
        <Box sx={{ 
          p: 3, 
          height: "100%", 
          display: "flex", 
          flexDirection: "column",
          zIndex: 130,
          bgcolor: isDarkMode ? "#000000" : "transparent",
        }}>
          {/* User Info - Clickable to go to profile */}
          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              mb: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
              }
            }}
            onClick={handleProfileClick}
          >
            <StyledAvatar src={user?.profileImage} />
            <Chip
              icon={<PersonIcon />}
              label="User"
              color="primary"
              size="small"
              sx={{ mb: 1 }}
            />
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: theme.palette.text.primary }}>
              {user?.fullName}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {user?.email}
            </Typography>
            {user?.emailVerified && (
              <Chip
                icon={<VerifiedIcon />}
                label="Verified"
                color="primary"
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Contact Info */}
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            mb: 3
          }}>
            <PhoneIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
            <Typography variant="body2" color={theme.palette.text.secondary}>
              {user?.mobile || "Phone Not Added"}
            </Typography>
          </Box>

          {/* Navigation */}
          <List sx={{ flex: 1 }}>
            {navItems.map((item) => (
              <StyledListItem
                key={item.path}
                button
                component={Link}
                to={item.path}
                onClick={() => setDrawerOpen(false)}
                selected={location.pathname === item.path}
              >
                <ListItemIcon sx={{ color: theme.palette.primary.main }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ fontWeight: 600, color: theme.palette.text.primary }}
                />
              </StyledListItem>
            ))}
          </List>

          {/* Action Buttons */}
          <List>
            {actionItems.map((item) => (
              <StyledListItem
                key={item.label}
                button
                onClick={item.action}
                className={item.className}
                sx={{
                  color: item.color === "error" ? theme.palette.error.main : theme.palette.primary.main,
                }}
              >
                <ListItemIcon sx={{ 
                  color: item.color === "error" ? theme.palette.error.main : theme.palette.primary.main 
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label} 
                  primaryTypographyProps={{ 
                    fontWeight: 600,
                    color: item.color === "error" ? theme.palette.error.main : theme.palette.text.primary
                  }}
                />
              </StyledListItem>
            ))}
          </List>
        </Box>
      </StyledDrawer>

      {/* Delete Account Confirmation Dialog */}
      <DeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: "flex", 
          alignItems: "center",
          color: theme.palette.error.main
        }}>
          <WarningIcon sx={{ mr: 2 }} />
          Delete User Account?
          <IconButton
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ ml: "auto", color: theme.palette.text.secondary }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            <Typography variant="body1" fontWeight={600}>
              ⚠️ Critical Action - Account Deletion!
            </Typography>
          </Alert>
          
          <Typography variant="body2" color="textSecondary" paragraph>
            You are about to permanently delete your user account. This will remove:
          </Typography>
          
          <Box component="ul" sx={{ pl: 2, color: theme.palette.text.secondary }}>
            <li><Typography variant="body2">Personal profile information</Typography></li>
            <li><Typography variant="body2">All internship applications</Typography></li>
            <li><Typography variant="body2">Saved documents and data</Typography></li>
            <li><Typography variant="body2">Authentication credentials</Typography></li>
            <li><Typography variant="body2">Application history and progress</Typography></li>
          </Box>
          
          <Typography variant="body2" sx={{ mt: 2, fontWeight: 600, color: theme.palette.error.main }}>
            This action is immediate and irreversible. Please confirm your password to proceed.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setDeleteDialogOpen(false);
              setReAuthDialogOpen(true);
            }}
            variant="contained"
            color="error"
            fullWidth={isMobile}
            startIcon={<DeleteIcon />}
          >
            Delete Account
          </Button>
        </DialogActions>
      </DeleteDialog>

      {/* Re-authentication Dialog */}
      <DeleteDialog
        open={reAuthDialogOpen}
        onClose={() => setReAuthDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ color: theme.palette.text.primary }}>
          Security Verification
          <IconButton
            onClick={() => setReAuthDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8, color: theme.palette.text.secondary }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            For security purposes, please enter your password to confirm account deletion:
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "12px",
              border: `2px solid ${error ? theme.palette.error.main : alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: "8px",
              fontSize: "16px",
              outline: "none",
              transition: "border-color 0.3s ease",
              backgroundColor: isDarkMode ? "#1a1a1a" : theme.palette.background.paper,
              color: theme.palette.text.primary,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = theme.palette.primary.main;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = alpha(theme.palette.primary.main, 0.2);
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setReAuthDialogOpen(false)}
            variant="outlined"
            disabled={loading}
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteAccount}
            variant="contained"
            color="error"
            disabled={!password || loading}
            fullWidth={isMobile}
            startIcon={loading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogActions>
      </DeleteDialog>

      {/* Page Content */}
      <Box sx={{ 
        flex: 1, 
        overflowY: "auto", 
        pb: isMobile ? "56px" : 0,
        pt: isMobile ? 0 : 2
      }}>
        <Outlet />
      </Box>

      {/* Bottom Navigation */}
      {isMobile && (
        <Paper sx={{ 
          position: "fixed", 
          bottom: 0, 
          right: 0, 
          left: 0,
          backdropFilter: "blur(20px)",
          zIndex: 1200,
          backgroundColor: isDarkMode ? "#000000" : alpha(theme.palette.background.paper, 0.95),
          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }} elevation={4}>
          <BottomNavigation 
            value={location.pathname}
            showLabels
            sx={{
              background: "transparent",
              "& .MuiBottomNavigationAction-root": {
                minWidth: "auto",
                padding: "8px 12px",
                color: theme.palette.text.secondary,
                "&.Mui-selected": {
                  color: theme.palette.primary.main,
                  "& .MuiBottomNavigationAction-label": {
                    fontSize: "0.75rem",
                    fontWeight: 600,
                  },
                },
              },
            }}
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                icon={item.icon}
                component={Link}
                value={item.path}
                to={item.path}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

export default UserLayout;