// admin/AdminSettings.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Divider,
  Card,
  CardContent,
  useTheme,
  alpha,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  DarkMode,
  LightMode,
  Settings as SettingsIcon,
  Save,
  Refresh,
  Palette,
  ArrowBack,
  BrightnessAuto,
} from "@mui/icons-material";
import { useThemeContext } from "../contexts/ThemeContext";
import AnimatedBackground from "../components/AnimatedBackground";
import { useNavigate } from "react-router-dom";

const AdminSettings = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, primaryColor, secondaryColor, toggleTheme, updatePrimaryColor, updateSecondaryColor } = useThemeContext();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [systemTheme, setSystemTheme] = useState(false);
  
  // Local settings state
  const [settings, setSettings] = useState({
    autoSave: true,
    compactMode: false,
    animations: true,
  });

  useEffect(() => {
    loadSettings();
    checkSystemTheme();
  }, []);

  const loadSettings = () => {
    const savedSettings = localStorage.getItem("admin_app_settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const checkSystemTheme = () => {
    const systemThemePref = localStorage.getItem("use_system_theme");
    if (systemThemePref) {
      setSystemTheme(JSON.parse(systemThemePref));
    }
  };

  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSaveSettings = () => {
    localStorage.setItem("admin_app_settings", JSON.stringify(settings));
    showNotification("Settings saved successfully!");
  };

  const handleResetSettings = () => {
    setSettings({
      autoSave: true,
      compactMode: false,
      animations: true,
    });
    localStorage.removeItem("admin_app_settings");
    showNotification("Settings reset to default", "info");
  };

  const handleSystemThemeToggle = () => {
    const newValue = !systemTheme;
    setSystemTheme(newValue);
    localStorage.setItem("use_system_theme", JSON.stringify(newValue));
    
    if (newValue) {
      // Use system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark && mode !== "dark") {
        toggleTheme();
      } else if (!prefersDark && mode !== "light") {
        toggleTheme();
      }
      showNotification("System theme enabled. Theme will follow your device settings.", "info");
    } else {
      showNotification("System theme disabled. You can manually control the theme.", "info");
    }
  };

  const primaryColors = ["#1976D2", "#f44336", "#4caf50", "#ff9800", "#9c27b0", "#00bcd4"];
  const secondaryColors = ["#9c27b0", "#e91e63", "#2196f3", "#ff5722", "#3f51b5", "#009688"];

  return (
    <Box sx={{ minHeight: "100vh", position: "relative", bgcolor: "background.default" }}>
      <AnimatedBackground opacity={0.3} blurAmount={55} zIndex={0} pointerEvents="none" />
      
      {/* App Bar */}
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
          <IconButton onClick={() => navigate("/admin/home")} edge="start" sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
            Settings
          </Typography>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
            size="small"
          >
            Save
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ pt: { xs: 8, sm: 9 }, pb: 4, px: { xs: 2, sm: 3 }, position: "relative", zIndex: 10 }}>
        <Container maxWidth="md" disableGutters>
          {/* Header Section */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 4, background: alpha(theme.palette.background.paper, 0.9), backdropFilter: "blur(10px)" }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <SettingsIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              <Box>
                <Typography variant="h5" fontWeight={800}>
                  Appearance Settings
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Customize the look and feel of your dashboard
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Theme Mode Card */}
          <Card sx={{ borderRadius: 4, mb: 3, background: alpha(theme.palette.background.paper, 0.9), backdropFilter: "blur(10px)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BrightnessAuto /> Theme Mode
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Stack spacing={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemTheme}
                      onChange={handleSystemThemeToggle}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight={500}>Use System Theme</Typography>
                      <Typography variant="caption" color="textSecondary">
                        Automatically switch between light and dark based on your device settings
                      </Typography>
                    </Box>
                  }
                />
                
                {!systemTheme && (
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant={mode === "light" ? "contained" : "outlined"}
                      onClick={toggleTheme}
                      startIcon={<LightMode />}
                      sx={{ flex: 1, py: 1.5 }}
                    >
                      Light Mode
                    </Button>
                    <Button
                      variant={mode === "dark" ? "contained" : "outlined"}
                      onClick={toggleTheme}
                      startIcon={<DarkMode />}
                      sx={{ flex: 1, py: 1.5 }}
                    >
                      Dark Mode
                    </Button>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Primary Color Card */}
          <Card sx={{ borderRadius: 4, mb: 3, background: alpha(theme.palette.background.paper, 0.9), backdropFilter: "blur(10px)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Palette /> Primary Color
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Choose your primary brand color
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                  {primaryColors.map((color) => (
                    <Tooltip key={color} title={color.toUpperCase()}>
                      <IconButton
                        onClick={() => updatePrimaryColor(color)}
                        sx={{
                          bgcolor: color,
                          width: 48,
                          height: 48,
                          border: primaryColor === color ? `3px solid ${theme.palette.common.white}` : "none",
                          boxShadow: primaryColor === color ? `0 0 0 2px ${color}` : "none",
                          transition: "all 0.2s ease",
                          "&:hover": { 
                            bgcolor: color, 
                            opacity: 0.8,
                            transform: "scale(1.05)"
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Secondary Color Card */}
          <Card sx={{ borderRadius: 4, mb: 3, background: alpha(theme.palette.background.paper, 0.9), backdropFilter: "blur(10px)" }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Palette /> Secondary Color
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Choose your secondary brand color
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                  {secondaryColors.map((color) => (
                    <Tooltip key={color} title={color.toUpperCase()}>
                      <IconButton
                        onClick={() => updateSecondaryColor(color)}
                        sx={{
                          bgcolor: color,
                          width: 48,
                          height: 48,
                          border: secondaryColor === color ? `3px solid ${theme.palette.common.white}` : "none",
                          boxShadow: secondaryColor === color ? `0 0 0 2px ${color}` : "none",
                          transition: "all 0.2s ease",
                          "&:hover": { 
                            bgcolor: color, 
                            opacity: 0.8,
                            transform: "scale(1.05)"
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>

        
          {/* Reset Button Card */}
          <Card sx={{ borderRadius: 4, background: alpha(theme.palette.background.paper, 0.9), backdropFilter: "blur(10px)" }}>
            <CardContent>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={handleResetSettings}
                  size="large"
                  color="warning"
                  sx={{ px: 4 }}
                >
                  Reset to Default
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
      
      {/* Snackbar Notification */}
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

export default AdminSettings;