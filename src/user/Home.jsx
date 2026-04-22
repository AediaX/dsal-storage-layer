import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { useThemeContext } from "../contexts/ThemeContext";
import Layout from "./Layout";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import SecurityIcon from "@mui/icons-material/Security";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { QrCode,Barcode ,FileAudio as AudioIcon } from "lucide-react";

const UserHome = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeContext();


  const sections = [

    {
      title: "Steganography Tool",
      description: "Secure data hiding and extraction",
      path: "/user/steganography",
      icon: <SecurityIcon />,
      color: theme.palette.info.main,
    },
    {
      title: "Profile",
      description: "View and manage your profile information",
      path: "/user/profile",
      icon: <PersonIcon />,
      color: theme.palette.secondary.main,
    },
    {
      title: "Settings",
      description: "Configure your preferences and options",
      path: "/user/settings",
      icon: <SettingsIcon />,
      color: theme.palette.warning.main,
    },
    {
      title: "QR Code Generator",
      description: "Create QR codes for your website",
      path: "/user/qr-code-generator",
      icon: <QrCode/>,
      color: theme.palette.primary.main,
    },
    {
      title: "Barcode Generator",
      description: "Generate barcodes for products and inventory",
      path: "/user/barcode-generator",
      icon: <Barcode/>,
      color: theme.palette.success.main,
    },
    {
      title: "Audio Steganography",
      description: "Hide messages within audio files",
      path: "/user/audio-steganography",
      icon: <AudioIcon/>,
      color: theme.palette.error.main,
    }
  ];

  return (
    <>
      <Layout />

      {/* Background */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: -1,
          background: mode === "light" 
            ? `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.common.white} 45%, ${theme.palette.grey[100]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.grey[900]} 0%, ${theme.palette.background.default} 45%, ${theme.palette.grey[800]} 100%)`,
        }}
      />

      {/* Floating blobs - with dynamic opacity based on mode */}
      <Box className="blob b1" />
      <Box className="blob b2" />
      <Box className="blob b3" />

      <style>{`
        .blob {
          position: fixed;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(90px);
          opacity: ${mode === "light" ? 0.28 : 0.15};
          animation: float 16s ease-in-out infinite;
          z-index: -1;
          transition: opacity 0.3s ease;
        }
        .b1 { 
          background: ${theme.palette.primary.main}; 
          top: -90px; 
          left: -90px; 
        }
        .b2 { 
          background: ${theme.palette.secondary.main}; 
          bottom: -90px; 
          right: -90px; 
          animation-duration: 20s; 
        }
        .b3 { 
          background: ${theme.palette.success.main}; 
          top: 40%; 
          left: 60%; 
          animation-duration: 22s; 
        }

        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-45px); }
          100% { transform: translateY(0); }
        }
      `}</style>

      {/* Welcome Banner */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: 3, mt: 6, pb: 10 }}>
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            fontWeight={800}
            sx={{ 
              color: theme.palette.text.primary,
              transition: 'color 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <HomeIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            Welcome to Your Dashboard
          </Typography>
          <Typography 
            sx={{ 
              color: theme.palette.text.secondary, 
              mt: 1,
              transition: 'color 0.3s ease'
            }}
          >
            Access all your tools and features from one central location
          </Typography>
        </Box>

       

        {/* SYMMETRIC FLEX LAYOUT - 3 columns on large screens */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "flex-start",
          }}
        >
          {sections.map((item, index) => (
            <Card
              key={index}
              onClick={() => navigate(item.path)}
              sx={{
                width: {
                  xs: "100%",
                  sm: "calc(50% - 12px)",
                  md: "calc(33.33% - 16px)",
                },
                cursor: "pointer",
                borderRadius: 4,
                background: theme.palette.background.paper,
                backdropFilter: "blur(16px)",
                boxShadow: mode === "light" ? theme.shadows[4] : theme.shadows[2],
                transition: "all 0.4s ease",
                border: mode === "dark" ? `1px solid ${theme.palette.divider}` : "none",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: mode === "light" 
                    ? `0 22px 50px ${item.color}33`
                    : `0 22px 50px ${item.color}1a`,
                },
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={3} alignItems="center">
                  {/* Icon */}
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "20px",
                      background: mode === "light"
                        ? `${item.color}22`
                        : `${item.color}15`,
                      color: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 36,
                      transition: "0.4s",
                      "& svg": {
                        transition: "0.4s",
                      },
                      "&:hover svg": {
                        transform: "rotate(6deg) scale(1.1)",
                      },
                    }}
                  >
                    {item.icon}
                  </Box>

                  {/* Text */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight={700}
                      sx={{ 
                        color: theme.palette.text.primary,
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.text.secondary, 
                        mt: 0.6,
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>

                  {/* Arrow */}
                  <ArrowForwardIosIcon
                    sx={{ 
                      fontSize: 16, 
                      opacity: 0.5,
                      color: theme.palette.text.secondary,
                      transition: 'color 0.3s ease'
                    }}
                  />
                </Stack>

                <Divider 
                  sx={{ 
                    mt: 2, 
                    opacity: mode === "light" ? 0.4 : 0.6,
                    borderColor: theme.palette.divider
                  }} 
                />
              </CardContent>
            </Card>
          ))}
        </Box>

      </Box>
    </>
  );
};

export default UserHome;