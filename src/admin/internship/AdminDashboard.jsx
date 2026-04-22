import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  useTheme
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PaymentIcon from "@mui/icons-material/Payment";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useNavigate } from "react-router-dom";
import { useThemeContext } from "../../contexts/ThemeContext";

const AdminInternshipPortal = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode } = useThemeContext();

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: theme.palette.background.default,
      transition: "background-color 0.3s ease"
    }}>
      
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: mode === "light" 
            ? "0px 1px 20px rgba(0,0,0,0.08)"
            : "0px 1px 20px rgba(0,0,0,0.3)",
          transition: "all 0.3s ease"
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)}>
            <ArrowBackIcon sx={{ color: theme.palette.text.primary }} />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 600, ml: 1, color: theme.palette.text.primary }}>
            Internship Admin Panel
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Body */}
      <Box
        sx={{
          pt: "90px",
          px: { xs: 2, sm: 3, md: 4 },
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {/* Title */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            textAlign: "center",
            color: theme.palette.text.primary,
            mb: 2,
            transition: "color 0.3s ease"
          }}
        >
          Manage Internship Applications
        </Typography>

        {/* Cards Container */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "center",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          {/* Payment Card */}
          <Card
            onClick={() => navigate("/admin/internship/payment")}
            sx={{
              width: { xs: "100%", sm: 320 },
              maxWidth: 320,
              cursor: "pointer",
              p: 2,
              borderRadius: 4,
              bgcolor: theme.palette.background.paper,
              boxShadow: mode === "light"
                ? "0px 1px 20px rgba(0,0,0,0.08)"
                : "0px 1px 20px rgba(0,0,0,0.3)",
              border: mode === "dark" ? `1px solid ${theme.palette.divider}` : "none",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: mode === "light"
                  ? "0px 4px 25px rgba(0,0,0,0.15)"
                  : "0px 4px 25px rgba(0,0,0,0.5)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <PaymentIcon
                sx={{ 
                  fontSize: 55, 
                  mb: 2, 
                  color: theme.palette.primary.main,
                  transition: "color 0.3s ease"
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Payment Requests
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, color: theme.palette.text.secondary }}
              >
                View and manage student internship payments.
              </Typography>

              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  bgcolor: theme.palette.text.primary,
                  color: theme.palette.background.paper,
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: theme.palette.text.secondary,
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Open
              </Button>
            </CardContent>
          </Card>

          {/* Registered Students Card */}
          <Card
            onClick={() => navigate("/admin/internship/registered")}
            sx={{
              width: { xs: "100%", sm: 320 },
              maxWidth: 320,
              cursor: "pointer",
              p: 2,
              borderRadius: 4,
              bgcolor: theme.palette.background.paper,
              boxShadow: mode === "light"
                ? "0px 1px 20px rgba(0,0,0,0.08)"
                : "0px 1px 20px rgba(0,0,0,0.3)",
              border: mode === "dark" ? `1px solid ${theme.palette.divider}` : "none",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: mode === "light"
                  ? "0px 4px 25px rgba(0,0,0,0.15)"
                  : "0px 4px 25px rgba(0,0,0,0.5)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <PeopleAltIcon
                sx={{ 
                  fontSize: 55, 
                  mb: 2, 
                  color: theme.palette.info.main,
                  transition: "color 0.3s ease"
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Registered Students
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, color: theme.palette.text.secondary }}
              >
                View all students who applied for internships.
              </Typography>

              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  bgcolor: theme.palette.text.primary,
                  color: theme.palette.background.paper,
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: theme.palette.text.secondary,
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Open
              </Button>
            </CardContent>
          </Card>

          {/* Generate ID Card */}
          <Card
            onClick={() => navigate("/admin/internship/generate-id")}
            sx={{
              width: { xs: "100%", sm: 320 },
              maxWidth: 320,
              cursor: "pointer",
              p: 2,
              borderRadius: 4,
              bgcolor: theme.palette.background.paper,
              boxShadow: mode === "light"
                ? "0px 1px 20px rgba(0,0,0,0.08)"
                : "0px 1px 20px rgba(0,0,0,0.3)",
              border: mode === "dark" ? `1px solid ${theme.palette.divider}` : "none",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: mode === "light"
                  ? "0px 4px 25px rgba(0,0,0,0.15)"
                  : "0px 4px 25px rgba(0,0,0,0.5)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <CreditCardIcon
                sx={{ 
                  fontSize: 55, 
                  mb: 2, 
                  color: theme.palette.warning.main,
                  transition: "color 0.3s ease"
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Generate ID Card
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, color: theme.palette.text.secondary }}
              >
                Create and manage student internship ID cards.
              </Typography>

              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  bgcolor: theme.palette.text.primary,
                  color: theme.palette.background.paper,
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: theme.palette.text.secondary,
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Open
              </Button>
            </CardContent>
          </Card>

          {/* Upload Certificates Card */}
          <Card
            onClick={() => navigate("/admin/internship/certificates")}
            sx={{
              width: { xs: "100%", sm: 320 },
              maxWidth: 320,
              cursor: "pointer",
              p: 2,
              borderRadius: 4,
              bgcolor: theme.palette.background.paper,
              boxShadow: mode === "light"
                ? "0px 1px 20px rgba(0,0,0,0.08)"
                : "0px 1px 20px rgba(0,0,0,0.3)",
              border: mode === "dark" ? `1px solid ${theme.palette.divider}` : "none",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-5px)",
                boxShadow: mode === "light"
                  ? "0px 4px 25px rgba(0,0,0,0.15)"
                  : "0px 4px 25px rgba(0,0,0,0.5)",
              },
            }}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <AssignmentIcon
                sx={{ 
                  fontSize: 55, 
                  mb: 2, 
                  color: theme.palette.success.main,
                  transition: "color 0.3s ease"
                }}
              />
              <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                Upload Certificates
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, color: theme.palette.text.secondary }}
              >
                Upload and manage internship completion certificates.
              </Typography>

              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  bgcolor: theme.palette.text.primary,
                  color: theme.palette.background.paper,
                  px: 4,
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: theme.palette.text.secondary,
                  },
                  transition: "all 0.3s ease"
                }}
              >
                Open
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminInternshipPortal;