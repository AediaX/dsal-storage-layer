// contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, } from "react";
import { createTheme, ThemeProvider as MuiThemeProvider } from "@mui/material";

// Theme Context
const ThemeContext = createContext(null);



export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem("theme_mode");
    return savedMode || "light";
  });

  const [primaryColor, setPrimaryColor] = useState(() => {
    const savedColor = localStorage.getItem("theme_primary_color");
    return savedColor || "#1976D2";
  });

  const [secondaryColor, setSecondaryColor] = useState(() => {
    const savedColor = localStorage.getItem("theme_secondary_color");
    return savedColor || "#9c27b0";
  });

  const toggleTheme = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    localStorage.setItem("theme_mode", newMode);
  };

  const updatePrimaryColor = (color) => {
    setPrimaryColor(color);
    localStorage.setItem("theme_primary_color", color);
  };

  const updateSecondaryColor = (color) => {
    setSecondaryColor(color);
    localStorage.setItem("theme_secondary_color", color);
  };

  // Create dynamic theme based on current settings
  const theme = createTheme({
    palette: {
      mode,
      primary: { main: primaryColor },
      secondary: { main: secondaryColor },
      background: {
        default: mode === "light" ? "#ffffff" : "#121212",
        paper: mode === "light" ? "#ffffff" : "#1e1e1e",
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 600 },
    },
   shape:{borderRadius: 16},
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: "none", borderRadius: 12 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 16 },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider
      value={{
        mode,
        primaryColor,
        secondaryColor,
        toggleTheme,
        updatePrimaryColor,
        updateSecondaryColor,
      }}
    >
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext must be used within ThemeProvider");
  }
  return context;
};