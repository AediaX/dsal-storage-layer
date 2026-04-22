import React from "react";
import {
  AppBar,
  Toolbar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Button,
  Typography,
  Stack,
  Container,
  useTheme,
  useMediaQuery,
  Paper,
  IconButton,
  Chip,
} from "@mui/material";

import {
  Home as HomeIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
  Chat as ChatIcon,
  AutoAwesomeMotion as AutoMotionIcon,
  Api as ApiIcon,
  School as SchoolIcon,
  BusinessCenter as BusinessIcon,
  Groups as GroupsIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Bolt as BoltIcon,
  Shield as ShieldIcon,
  Rocket as RocketIcon,
  Translate as TranslateIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  Psychology as PsychologyIcon2,
  Hub as NeuralHubIcon,
} from "@mui/icons-material";
import { PlayArrow as PlayArrowIcon } from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png"; // Import your logo

export default function Home() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ 
      position: "relative", 
      minHeight: "100vh",
      background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAFF 50%, #F0F4FF 100%)",
      overflow: "hidden",
    }}>
      
      {/* ANIMATED BACKGROUND ELEMENTS */}
      <Box sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          radial-gradient(circle at 10% 20%, rgba(120, 119, 198, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 90% 80%, rgba(255, 119, 198, 0.05) 0%, transparent 40%),
          radial-gradient(circle at 40% 90%, rgba(100, 210, 255, 0.06) 0%, transparent 40%),
          radial-gradient(circle at 70% 10%, rgba(255, 200, 100, 0.04) 0%, transparent 40%)
        `,
        zIndex: 0,
      }} />

      {/* FLOATING GEOMETRIC SHAPES */}
      {[...Array(15)].map((_, i) => (
        <Box
          key={i}
          sx={{
            position: "fixed",
            width: Math.random() * 80 + 20,
            height: Math.random() * 80 + 20,
            background: `rgba(${Math.random() > 0.5 ? '120, 119, 198' : '100, 210, 255'}, ${0.05 + Math.random() * 0.1})`,
            borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "20%" : "5px",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            transform: `rotate(${Math.random() * 360}deg)`,
            animation: `floatShape ${Math.random() * 20 + 20}s infinite ease-in-out ${Math.random() * 5}s`,
            zIndex: 0,
          }}
        />
      ))}

      {/* ---------------------------------------------------------------- HEADER ---------------------------------------------------------------- */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backdropFilter: "blur(20px)",
          background: "rgba(255, 255, 255, 0.73)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
          zIndex: 1000,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ 
            display: "flex", 
            justifyContent: "space-between",
          }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                component="img"
                src={logo}
                alt="AediaX Edge"
                sx={{
                  height: 40,
                  width: "auto",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                }}
              />
              <Typography variant="h6" sx={{ 
                fontWeight: 800,
                color: "#2D3748",
                display: { xs: 'none', md: 'block' },
              }}>
                AediaX Edge
              </Typography>
            </Stack>

            {!isMobile && (
              <Stack direction="row" spacing={3} alignItems="center">
                <Button
                  onClick={() => navigate("/auth/sign-in")}
                  sx={{
                    color: "#4A5568",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    position: "relative",
                    "&:hover": {
                      color: "#007BFF",
                      background: "none",
                      "&::after": {
                        width: "100%",
                      },
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: -4,
                      left: 0,
                      width: "0%",
                      height: "2px",
                      background: "linear-gradient(90deg, #007BFF, #00C6FF)",
                      transition: "width 0.3s ease",
                    },
                  }}
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/auth/sign-up")}
                  sx={{
                    background: "linear-gradient(135deg, #007BFF, #00C6FF)",
                    color: "white",
                    fontWeight: 700,
                    borderRadius: "50px",
                    px: 4,
                    py: 1,
                    fontSize: "0.95rem",
                    boxShadow: "0 6px 20px rgba(0, 123, 255, 0.25)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0056CC, #0099CC)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 10px 25px rgba(0, 123, 255, 0.35)",
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Get Started Free
                </Button>
              </Stack>
            )}

            {isMobile && (
              <IconButton
                onClick={() => navigate("/auth/sign-in")}
                sx={{
                  background: "linear-gradient(135deg, #007BFF, #00C6FF)",
                  color: "white",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0056CC, #0099CC)",
                  },
                }}
              >
                <LoginIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* ---------------------------------------------------------------- HERO SECTION ---------------------------------------------------------------- */}
      <Box sx={{ 
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        pt: { xs: 8, md: 0 },
        overflow: "hidden",
        mt:3
      }}>
        {/* ANIMATED CONNECTION LINES */}
        <Box sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "90vw",
          height: "90vh",
          zIndex: 1,
          opacity: 0.3,
        }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#007BFF" stopOpacity="0" />
                <stop offset="50%" stopColor="#00C6FF" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#007BFF" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[...Array(8)].map((_, i) => (
              <line
                key={i}
                x1={Math.random() * 100}
                y1={Math.random() * 100}
                x2={Math.random() * 100}
                y2={Math.random() * 100}
                stroke="url(#lineGradient)"
                strokeWidth="0.5"
              >
                <animate
                  attributeName="opacity"
                  values="0;0.3;0"
                  dur={`${3 + Math.random() * 2}s`}
                  repeatCount="indefinite"
                  begin={`${i * 0.5}s`}
                />
              </line>
            ))}
          </svg>
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ 
            maxWidth: { xs: "100%", md: "1000px" },
            mx: "auto",
            textAlign: { xs: "center", md: "left" },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            gap: { xs: 6, md: 8 },
          }}>
            {/* LEFT CONTENT */}
            <Box sx={{ flex: 1 }}>
              <Chip
                label="✨ AI-Powered Platform"
                sx={{
                  mb: 3,
                  background: "linear-gradient(135deg, #E6F7FF, #CCEEFF)",
                  color: "#007BFF",
                  fontWeight: 600,
                  fontSize: { xs: "0.8rem", md: "0.9rem" },
                  padding: { xs: "4px 12px", md: "6px 16px" },
                }}
              />
              
              <Typography variant={isMobile ? "h3" : "h1"} sx={{
                fontWeight: 900,
                mb: 3,
                color: "#1A202C",
                lineHeight: 1.1,
                fontSize: { xs: "1.5rem" },
                background: "linear-gradient(135deg, #1A202C 0%, #007BFF 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                
              }}>
                Intelligent AI Ecosystem for Tomorrow's Innovators
              </Typography>

              <Typography variant="h6" sx={{
                color: "#4A5568",
                mb: 5,
                fontWeight: 400,
                lineHeight: 1.6,
                fontSize: { xs: "1rem", md: "1.25rem" },
              }}>
                Advanced neural networks, comprehensive automation, and intelligent APIs 
                combined with world-class education—all in one unified platform designed 
                to accelerate innovation and empower creators.
              </Typography>

              {/* CTA BUTTONS */}
              <Box sx={{ display: "flex", gap: 2, mb: 6, flexWrap: "wrap" }}>
  <Button
    onClick={() => navigate("/auth/sign-up")}
    variant="contained"
    startIcon={<RocketIcon />}
    sx={{
      py: 1.25,
      px: 3,
      borderRadius: "9px",
      fontSize: "0.95rem",
      fontWeight: 600,
      background: "linear-gradient(135deg, #007BFF, #00C6FF)",
      color: "white",
      minWidth: "180px",
      boxShadow: "0 3px 15px rgba(0, 123, 255, 0.3)",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0 6px 25px rgba(0, 123, 255, 0.4)",
        background: "linear-gradient(135deg, #0056CC, #0099CC)",
      },
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      
    }}
  >
    Start Free
  </Button>
  <Button
    onClick={() => navigate("/auth/sign-in")}
    variant="outlined"
    startIcon={<PlayArrowIcon />}
    sx={{
      py: 1.25,
      px: 3,
      borderRadius: "8px",
      fontSize: "0.95rem",
      fontWeight: 600,
      border: "2px solid #007BFF",
      color: "#007BFF",
      minWidth: "180px",
      "&:hover": {
        background: "rgba(0, 123, 255, 0.04)",
        border: "2px solid #0056CC",
        transform: "translateY(-2px)",
      },
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    }}
  >
    Watch Demo
  </Button>
</Box>

              {/* STATS */}
              <Box sx={{
                display: "flex",
                gap: { xs: 4, md: 6 },
                flexWrap: "wrap",
                justifyContent: { xs: "center", md: "flex-start" },
              }}>
                {[
                  { value: "99.9%", label: "Platform Uptime", icon: <ShieldIcon /> },
                  { value: "50K+", label: "Active Developers", icon: <GroupsIcon /> },
                  { value: "1M+", label: "API Calls/Day", icon: <BoltIcon /> },
                ].map((stat, i) => (
                  <Box key={i} sx={{ textAlign: "center" }}>
                    <Box sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                      justifyContent: { xs: "center", md: "flex-start" },
                    }}>
                      <Box sx={{
                        color: "#007BFF",
                        fontSize: { xs: "1.2rem", md: "1.5rem" },
                      }}>
                        {stat.icon}
                      </Box>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 800,
                        color: "#1A202C",
                        fontSize: { xs: "1.5rem", md: "2rem" },
                      }}>
                        {stat.value}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ 
                      color: "#718096",
                      fontSize: { xs: "0.8rem", md: "0.9rem" },
                    }}>
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* RIGHT SIDE - HERO VISUAL */}
            <Box sx={{
              flex: 1,
              position: "relative",
              
            }}>
              {/* MAIN CIRCLE */}
              <Box sx={{
                width: isMobile? "600px":"400px",
                height: isMobile? "600px":"400px",
                background: "radial-gradient(circle, rgba(0, 198, 255, 0.1) 0%, transparent 70%)",
                borderRadius: "50%",
                position: "relative",
                mx: "auto",
              }}>
                {/* ROTATING ORBIT */}
                <Box sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "500px",
                  height: "500px",
                  border: "1px dashed rgba(0, 123, 255, 0.3)",
                  borderRadius: "50%",
                  animation: "rotate 20s linear infinite",
                }}>
                  {/* ORBITING ELEMENTS */}
                  {[
                    { icon: <ChatIcon />, color: "#007BFF", label: "Chat AI" },
                    { icon: <AutoMotionIcon />, color: "#00C6FF", label: "Automation" },
                    { icon: <ApiIcon />, color: "#7B61FF", label: "APIs" },
                    { icon: <SchoolIcon />, color: "#FF6B6B", label: "Education" },
                    { icon: <BusinessIcon />, color: "#4ECDC4", label: "Business" },
                    { icon: <PsychologyIcon2 />, color: "#FFD166", label: "Intelligence" },
                  ].map((item, i) => {
                    const angle = (i * 60) * Math.PI / 180;
                    const radius = 220;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    
                    return (
                      <Box
                        key={i}
                        sx={{
                          position: "absolute",
                          top: `calc(50% + ${y}px)`,
                          left: `calc(50% + ${x}px)`,
                          transform: "translate(-50%, -50%)",
                          width: 80,
                          height: 80,
                          background: "white",
                          borderRadius: "20px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                          border: `2px solid ${item.color}20`,
                          animation: `orbitFloat ${3 + i * 0.5}s infinite ease-in-out`,
                        }}
                      >
                        <Box sx={{
                          color: item.color,
                          fontSize: "2rem",
                          mb: 0.5,
                        }}>
                          {item.icon}
                        </Box>
                        <Typography variant="caption" sx={{ 
                          fontWeight: 600,
                          color: "#2D3748",
                          fontSize: "0.7rem",
                        }}>
                          {item.label}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>

                {/* CENTER LOGO */}
                <Box sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: 200,
                  height: 200,
                  background: "white",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 20px 60px rgba(0, 123, 255, 0.15)",
                  border: "1px solid rgba(0, 123, 255, 0.1)",
                }}>
                  <Box
                    component="img"
                    src={logo}
                    alt="AediaX Edge"
                    sx={{
                      width: 120,
                      height: "auto",
                      filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ---------------------------------------------------------------- SERVICES SECTION ---------------------------------------------------------------- */}
      <Box sx={{ 
        position: "relative",
        py: { xs: 8, md: 12 },
        background: "white",
      }}>
        <Container maxWidth="lg">
          {/* SECTION HEADER */}
          <Box sx={{ 
            textAlign: "center", 
            mb: { xs: 6, md: 10 },
            maxWidth: "800px",
            mx: "auto",
          }}>
            <Chip
              label="🛠️ Our Services"
              sx={{
                mb: 3,
                background: "linear-gradient(135deg, #F0F9FF, #E0F2FE)",
                color: "#0369A1",
                fontWeight: 600,
                fontSize: { xs: "0.8rem", md: "0.9rem" },
                padding: { xs: "4px 12px", md: "6px 16px" },
              }}
            />
            
            <Typography variant="h2" sx={{
              fontWeight: 800,
              mb: 3,
              color: "#1A202C",
              fontSize: { xs: "2rem", md: "3rem" },
              lineHeight: 1.2,
            }}>
              Comprehensive AI Solutions
            </Typography>
            
            <Typography variant="h6" sx={{ 
              color: "#4A5568",
              fontWeight: 400,
              lineHeight: 1.6,
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}>
              From intelligent chatbots to advanced educational platforms, 
              we provide end-to-end AI solutions for every need.
            </Typography>
          </Box>

          {/* SERVICES GRID (WITHOUT USING GRID COMPONENT) */}
          <Box sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            flexWrap: "wrap",
            gap: { xs: 4, md: 6 },
            justifyContent: "center",
          }}>
            {/* SERVICE CARD 1 */}
            <Paper sx={{
              flex: "1 1 300px",
              maxWidth: { xs: "100%", md: "350px" },
              background: "white",
              borderRadius: "24px",
              p: 4,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-10px)",
                boxShadow: "0 30px 60px rgba(0, 123, 255, 0.15)",
                border: "1px solid rgba(0, 123, 255, 0.2)",
              },
            }}>
              <Box sx={{
                width: 70,
                height: 70,
                background: "linear-gradient(135deg, #E6F7FF, #CCEEFF)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}>
                <ChatIcon sx={{ fontSize: 36, color: "#007BFF" }} />
              </Box>
              
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: "#1A202C",
              }}>
                AI Chatbot Services
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: "#4A5568",
                mb: 3,
                lineHeight: 1.7,
              }}>
                Intelligent conversational AI with natural language understanding, 
                multi-language support, and context-aware responses for seamless 
                customer interactions and support automation.
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
                {["Natural Language", "24/7 Support", "Multi-language", "Sentiment Analysis"].map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      background: "rgba(0, 123, 255, 0.08)",
                      color: "#007BFF",
                      fontWeight: 500,
                      mb: 1,
                    }}
                  />
                ))}
              </Stack>
              
              <Button
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: "#007BFF",
                  fontWeight: 600,
                  padding: 0,
                  "&:hover": {
                    background: "none",
                    color: "#0056CC",
                  },
                }}
              >
                Learn More
              </Button>
            </Paper>

            {/* SERVICE CARD 2 */}
            <Paper sx={{
              flex: "1 1 300px",
              maxWidth: { xs: "100%", md: "350px" },
              background: "white",
              borderRadius: "24px",
              p: 4,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-10px)",
                boxShadow: "0 30px 60px rgba(255, 107, 107, 0.15)",
                border: "1px solid rgba(255, 107, 107, 0.2)",
              },
            }}>
              <Box sx={{
                width: 70,
                height: 70,
                background: "linear-gradient(135deg, #FFF0F0, #FFE6E6)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}>
                <AutoMotionIcon sx={{ fontSize: 36, color: "#FF6B6B" }} />
              </Box>
              
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: "#1A202C",
              }}>
                AI Automation
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: "#4A5568",
                mb: 3,
                lineHeight: 1.7,
              }}>
                Complete workflow automation powered by machine learning algorithms 
                that optimize processes, predict maintenance needs, and automate 
                complex decision-making tasks.
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
                {["Workflow Automation", "Predictive Analytics", "Process Mining", "Decision AI"].map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      background: "rgba(255, 107, 107, 0.08)",
                      color: "#FF6B6B",
                      fontWeight: 500,
                      mb: 1,
                    }}
                  />
                ))}
              </Stack>
              
              <Button
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: "#FF6B6B",
                  fontWeight: 600,
                  padding: 0,
                  "&:hover": {
                    background: "none",
                    color: "#FF5252",
                  },
                }}
              >
                Learn More
              </Button>
            </Paper>

            {/* SERVICE CARD 3 */}
            <Paper sx={{
              flex: "1 1 300px",
              maxWidth: { xs: "100%", md: "350px" },
              background: "white",
              borderRadius: "24px",
              p: 4,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                transform: "translateY(-10px)",
                boxShadow: "0 30px 60px rgba(123, 97, 255, 0.15)",
                border: "1px solid rgba(123, 97, 255, 0.2)",
              },
            }}>
              <Box sx={{
                width: 70,
                height: 70,
                background: "linear-gradient(135deg, #F3F0FF, #E8E4FF)",
                borderRadius: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
              }}>
                <ApiIcon sx={{ fontSize: 36, color: "#7B61FF" }} />
              </Box>
              
              <Typography variant="h5" sx={{ 
                fontWeight: 700, 
                mb: 2,
                color: "#1A202C",
              }}>
                API Ecosystem
              </Typography>
              
              <Typography variant="body1" sx={{ 
                color: "#4A5568",
                mb: 3,
                lineHeight: 1.7,
              }}>
                Comprehensive API suite with REST, GraphQL, WebSocket, and gRPC 
                endpoints. Built for scalability with automatic load balancing 
                and comprehensive monitoring tools.
              </Typography>
              
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
                {["REST APIs", "GraphQL", "WebSocket", "gRPC"].map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      background: "rgba(123, 97, 255, 0.08)",
                      color: "#7B61FF",
                      fontWeight: 500,
                      mb: 1,
                    }}
                  />
                ))}
              </Stack>
              
              <Button
                endIcon={<ArrowForwardIcon />}
                sx={{
                  color: "#7B61FF",
                  fontWeight: 600,
                  padding: 0,
                  "&:hover": {
                    background: "none",
                    color: "#6554C0",
                  },
                }}
              >
                Explore APIs
              </Button>
            </Paper>
          </Box>

          {/* MORE SERVICES */}
          <Box sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 6 },
            mt: { xs: 6, md: 8 },
          }}>
            {/* EDUCATION SERVICE */}
            <Paper sx={{
              flex: 1,
              background: "linear-gradient(135deg, #F0FFF4, #E6FFEE)",
              borderRadius: "24px",
              p: 4,
              border: "1px solid rgba(72, 187, 120, 0.2)",
            }}>
              <Stack direction="row" alignItems="center" spacing={3}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  background: "white",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(72, 187, 120, 0.15)",
                }}>
                  <SchoolIcon sx={{ fontSize: 40, color: "#48BB78" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "#1A202C" }}>
                    AI Education Platform
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#4A5568", lineHeight: 1.6 }}>
                    Adaptive learning algorithms, AI tutoring, competitive exam preparation, 
                    internship programs, and career coaching powered by intelligent analytics.
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* BUSINESS SERVICE */}
            <Paper sx={{
              flex: 1,
              background: "linear-gradient(135deg, #FFF7ED, #FFE8CC)",
              borderRadius: "24px",
              p: 4,
              border: "1px solid rgba(237, 137, 54, 0.2)",
            }}>
              <Stack direction="row" alignItems="center" spacing={3}>
                <Box sx={{
                  width: 80,
                  height: 80,
                  background: "white",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(237, 137, 54, 0.15)",
                }}>
                  <BusinessIcon sx={{ fontSize: 40, color: "#ED8936" }} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: "#1A202C" }}>
                    Business Intelligence
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#4A5568", lineHeight: 1.6 }}>
                    Advanced analytics, predictive insights, and automated reporting 
                    systems designed to drive business growth and informed decision-making.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* ---------------------------------------------------------------- FEATURES SHOWCASE ---------------------------------------------------------------- */}
      <Box sx={{ 
        position: "relative",
        py: { xs: 8, md: 12 },
        background: "#F8FAFF",
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            textAlign: "center", 
            mb: { xs: 6, md: 10 },
            maxWidth: "800px",
            mx: "auto",
          }}>
            <Chip
              label="🚀 Advanced Features"
              sx={{
                mb: 3,
                background: "linear-gradient(135deg, #F0F4FF, #E0E7FF)",
                color: "#4F46E5",
                fontWeight: 600,
                fontSize: { xs: "0.8rem", md: "0.9rem" },
                padding: { xs: "4px 12px", md: "6px 16px" },
              }}
            />
            
            <Typography variant="h2" sx={{
              fontWeight: 800,
              mb: 3,
              color: "#1A202C",
              fontSize: { xs: "2rem", md: "3rem" },
              lineHeight: 1.2,
            }}>
              Cutting-Edge Technology Stack
            </Typography>
          </Box>

          {/* FEATURE CARDS */}
          <Box sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: { xs: 4, md: 6 },
            mb: { xs: 6, md: 8 },
          }}>
            {/* FEATURE 1 */}
            <Paper sx={{
              flex: 1,
              background: "white",
              borderRadius: "24px",
              p: 4,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.05)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}>
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}>
                <Box sx={{
                  width: 60,
                  height: 60,
                  background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <NeuralHubIcon sx={{ fontSize: 30, color: "#4F46E5" }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1A202C" }}>
                  Neural Networks
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ 
                color: "#4A5568",
                mb: 3,
                lineHeight: 1.7,
              }}>
                Advanced deep learning models with transformer architecture, 
                capable of processing complex patterns across multiple data types 
                including text, images, and sequential data.
              </Typography>
              
              <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <Typography variant="body2" sx={{ color: "#718096", fontWeight: 500 }}>
                  Processing Speed
                </Typography>
                <Typography variant="body2" sx={{ color: "#4F46E5", fontWeight: 700 }}>
                  ~100ms latency
                </Typography>
              </Box>
            </Paper>

            {/* FEATURE 2 */}
            <Paper sx={{
              flex: 1,
              background: "white",
              borderRadius: "24px",
              p: 4,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.05)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}>
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}>
                <Box sx={{
                  width: 60,
                  height: 60,
                  background: "linear-gradient(135deg, #F0FDF4, #DCFCE7)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <PrecisionManufacturingIcon sx={{ fontSize: 30, color: "#16A34A" }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1A202C" }}>
                  Machine Learning
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ 
                color: "#4A5568",
                mb: 3,
                lineHeight: 1.7,
              }}>
                Comprehensive ML algorithms for classification, regression, 
                clustering, and reinforcement learning with automated feature 
                engineering and hyperparameter optimization.
              </Typography>
              
              <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <Typography variant="body2" sx={{ color: "#718096", fontWeight: 500 }}>
                  Model Accuracy
                </Typography>
                <Typography variant="body2" sx={{ color: "#16A34A", fontWeight: 700 }}>
                  98.5% avg
                </Typography>
              </Box>
            </Paper>

            {/* FEATURE 3 */}
            <Paper sx={{
              flex: 1,
              background: "white",
              borderRadius: "24px",
              p: 4,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.05)",
              border: "1px solid rgba(0, 0, 0, 0.05)",
            }}>
              <Box sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                mb: 3,
              }}>
                <Box sx={{
                  width: 60,
                  height: 60,
                  background: "linear-gradient(135deg, #FEF3C7, #FDE68A)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <TranslateIcon sx={{ fontSize: 30, color: "#D97706" }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#1A202C" }}>
                  NLP Engine
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ 
                color: "#4A5568",
                mb: 3,
                lineHeight: 1.7,
              }}>
                State-of-the-art natural language processing with support for 
                50+ languages, sentiment analysis, entity recognition, and 
                semantic understanding for human-like interactions.
              </Typography>
              
              <Box sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <Typography variant="body2" sx={{ color: "#718096", fontWeight: 500 }}>
                  Languages Supported
                </Typography>
                <Typography variant="body2" sx={{ color: "#D97706", fontWeight: 700 }}>
                  50+
                </Typography>
              </Box>
            </Paper>
          </Box>

          {/* FEATURE LIST */}
          <Paper sx={{
            background: "white",
            borderRadius: "24px",
            p: { xs: 4, md: 6 },
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0, 0, 0, 0.05)",
          }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 4, color: "#1A202C" }}>
              Core Capabilities
            </Typography>
            
            <Box sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}>
              <Box sx={{ flex: 1 }}>
                {[
                  "Real-time neural network inference",
                  "Multi-modal AI processing",
                  "Federated learning for privacy",
                  "Automated model deployment",
                  "Explainable AI features",
                  "Edge computing capabilities",
                ].map((feature, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "#007BFF", flexShrink: 0 }} />
                    <Typography sx={{ color: "#4A5568" }}>
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ flex: 1 }}>
                {[
                  "Cross-platform SDKs",
                  "Advanced monitoring systems",
                  "Auto-scaling infrastructure",
                  "99.99% SLA guarantee",
                  "GDPR & SOC2 compliance",
                  "Enterprise security",
                ].map((feature, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 3,
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "#007BFF", flexShrink: 0 }} />
                    <Typography sx={{ color: "#4A5568" }}>
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>

      {/* ---------------------------------------------------------------- FINAL CTA ---------------------------------------------------------------- */}
      <Box sx={{ 
        position: "relative",
        py: { xs: 8, md: 12 },
        background: "linear-gradient(135deg, #007BFF 0%, #00C6FF 100%)",
        overflow: "hidden",
      }}>
        {/* BACKGROUND PATTERN */}
        <Box sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)
          `,
        }} />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          <Box sx={{ 
            textAlign: "center",
            maxWidth: "800px",
            mx: "auto",
          }}>
            <Typography variant="h2" sx={{
              fontWeight: 900,
              mb: 3,
              color: "white",
              fontSize: { xs: "2rem", md: "3rem" },
              lineHeight: 1.2,
            }}>
              Start Building with AI Today
            </Typography>
            
            <Typography variant="h6" sx={{ 
              color: "rgba(255, 255, 255, 0.9)",
              mb: 6,
              lineHeight: 1.6,
              fontSize: { xs: "1rem", md: "1.25rem" },
            }}>
              Join thousands of developers, businesses, and students 
              who are already creating the future with AediaX Edge.
            </Typography>

            <Stack 
              direction={isMobile ? "column" : "row"} 
              spacing={3} 
              justifyContent="center"
              sx={{ mb: 4 }}
            >
              <Button
                onClick={() => navigate("/auth/sign-up")}
                variant="contained"
                size="large"
                startIcon={<StarIcon />}
                sx={{
                  py: 2,
                  px: 6,
                  borderRadius: "50px",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  background: "white",
                  color: "#007BFF",
                  boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.95)",
                    transform: "translateY(-3px)",
                    boxShadow: "0 15px 50px rgba(0, 0, 0, 0.3)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  minWidth: { xs: "100%", md: "auto" },
                }}
              >
                Get Started Free
              </Button>
              
              <Button
                onClick={() => navigate("/auth/sign-in")}
                variant="outlined"
                size="large"
                startIcon={<LoginIcon />}
                sx={{
                  py: 2,
                  px: 6,
                  borderRadius: "50px",
                  fontSize: "1.1rem",
                  fontWeight: 800,
                  border: "2px solid white",
                  color: "white",
                  backdropFilter: "blur(10px)",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "2px solid white",
                    transform: "translateY(-3px)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  minWidth: { xs: "100%", md: "auto" },
                }}
              >
                Sign In to Platform
              </Button>
            </Stack>

            <Typography variant="body2" sx={{ 
              color: "rgba(255, 255, 255, 0.7)",
              mt: 4,
            }}>
              No credit card required • 14-day free trial • Cancel anytime
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ---------------------------------------------------------------- MOBILE BOTTOM NAV ---------------------------------------------------------------- */}
      {isMobile && (
        <BottomNavigation
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "white",
            borderTop: "1px solid rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          <BottomNavigationAction
            icon={<HomeIcon sx={{ color: "#007BFF" }} />}
            sx={{ 
              color: "#007BFF",
              minWidth: "auto",
              padding: "6px 12px",
            }}
            onClick={() => navigate("/")}
          />
          <BottomNavigationAction
            icon={<LoginIcon sx={{ color: "#4A5568" }} />}
            sx={{ 
              color: "#4A5568",
              minWidth: "auto",
              padding: "6px 12px",
            }}
            onClick={() => navigate("/auth/sign-in")}
          />
          <BottomNavigationAction
            icon={<PersonAddIcon sx={{ color: "#4A5568" }} />}
            sx={{ 
              color: "#4A5568",
              minWidth: "auto",
              padding: "6px 12px",
            }}
            onClick={() => navigate("/auth/sign-up")}
          />
        </BottomNavigation>
      )}

      {/* ANIMATIONS */}
      <style>
        {`
          @keyframes floatShape {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            33% { transform: translateY(-20px) rotate(120deg); }
            66% { transform: translateY(10px) rotate(240deg); }
          }
          @keyframes rotate {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
          @keyframes orbitFloat {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -55%) scale(1.05); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
        `}
      </style>
    </Box>
  );
}

