import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  CssBaseline,
  ThemeProvider,
  createTheme,
  alpha,
  Button,
  Fade,
  Slide,
  useMediaQuery,
  Zoom
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  ArrowBack as ArrowBackIcon,
  Help as HelpIcon,
  GitHub as GitHubIcon,
  Home as HomeIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
} from '@mui/icons-material';
import Encrypt from './components/Encrypt';
import Decrypt from './components/Decrypt';
import SecurityInfo from './components/SecurityInfo';
import { useThemeContext } from '../../contexts/ThemeContext';

// Modern theme with glassmorphism
const getTheme = (mode) => createTheme({
  palette: {
    mode: mode,
    primary: {
      main: '#6366f1',
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec489a',
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: mode === 'light' ? '#faf9fe' : '#0f0f1a',
      paper: mode === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(18, 18, 27, 0.9)',
    },
    success: {
      main: '#10b981',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
  },
  typography: {
    fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(135deg, #6366f1 0%, #ec489a 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: mode === 'light' ? [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  ] : [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.4)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s ease',
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6366f1',
              },
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backdropFilter: 'blur(10px)',
        },
      },
    },
  },
});

function Home() {
  const [activeTab, setActiveTab] = useState(0);
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);
  const { mode, toggleTheme } = useThemeContext();
  const theme = getTheme(mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBack = () => {
    if (showSecurityInfo) {
      setShowSecurityInfo(false);
    } else {
      window.history.back();
    }
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        background: mode === 'light' 
          ? 'radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.05) 100%)'
          : 'radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
        position: 'relative',
        overflowX: 'hidden'
      }}>
        {/* Animated background elements */}
        <Box sx={{
          position: 'fixed',
          top: '10%',
          left: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 70%)',
          animation: 'float 20s ease-in-out infinite',
          '@keyframes float': {
            '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
            '50%': { transform: 'translate(50px, 30px) scale(1.1)' },
          },
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'fixed',
          bottom: '10%',
          right: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, rgba(236, 72, 153, 0) 70%)',
          animation: 'float 15s ease-in-out infinite reverse',
          pointerEvents: 'none',
        }} />

        {/* App Bar */}
        <AppBar 
          position="fixed" 
          elevation={0}
          sx={{ 
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
            <Toolbar sx={{ flexWrap: 'wrap', gap: 1, py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                {/* Back Button */}
                <Tooltip title="Back">
                  <IconButton
                    onClick={handleBack}
                    sx={{ 
                      mr: 1,
                      color: theme.palette.primary.main,
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        transform: 'scale(1.1)'
                      },
                      transition: 'transform 0.2s'
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
                
               
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ 
                    mr: 1.5, 
                    color: theme.palette.primary.main,
                    fontSize: { xs: 24, sm: 28 }
                  }} />
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 800,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                      background: 'linear-gradient(135deg, #6366f1 0%, #ec489a 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Aediax
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Toggle Theme">
                  <IconButton
                    onClick={toggleTheme}
                    sx={{ 
                      '&:hover': { transform: 'scale(1.1)' },
                      transition: 'transform 0.2s',
                      color: theme.palette.primary.main
                    }}
                  >
                    {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Security Information">
                  <IconButton
                    onClick={() => setShowSecurityInfo(!showSecurityInfo)}
                    sx={{ 
                      bgcolor: showSecurityInfo ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                      '&:hover': { transform: 'scale(1.1)' },
                      color: theme.palette.primary.main
                    }}
                  >
                    <HelpIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="View on GitHub">
                  <IconButton
                    onClick={() => window.open('https://github.com', '_blank')}
                    sx={{ 
                      '&:hover': { transform: 'scale(1.1)' },
                      color: theme.palette.primary.main
                    }}
                  >
                    <GitHubIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
            
            {!showSecurityInfo && (
              <Slide direction="down" in={!showSecurityInfo} mountOnEnter unmountOnExit>
                <Box sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  mt: 1
                }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange}
                    variant={isMobile ? "fullWidth" : "standard"}
                    centered={!isMobile}
                    sx={{
                      '& .MuiTab-root': {
                        py: 1.5,
                        fontSize: isMobile ? '0.875rem' : '1rem',
                        fontWeight: 600,
                        minWidth: isMobile ? 'auto' : 180,
                        textTransform: 'none',
                      },
                      '& .Mui-selected': {
                        color: theme.palette.primary.main,
                      },
                      '& .MuiTabs-indicator': {
                        height: 3,
                        borderRadius: '3px',
                        backgroundColor: theme.palette.primary.main,
                      }
                    }}
                  >
                    <Tab 
                      icon={<LockIcon />} 
                      iconPosition={isMobile ? "top" : "start"}
                      label={isMobile ? "Encrypt" : "Encrypt & Hide"} 
                    />
                    <Tab 
                      icon={<LockOpenIcon />} 
                      iconPosition={isMobile ? "top" : "start"}
                      label={isMobile ? "Decrypt" : "Decrypt & Extract"} 
                    />
                  </Tabs>
                </Box>
              </Slide>
            )}
          </Container>
        </AppBar>

        {/* Main Content */}
        <Container 
          maxWidth="lg" 
          sx={{ 
            pt: showSecurityInfo ? 12 : { xs: 20, sm: 20, md: 18 },
            pb: 6,
            px: { xs: 2, sm: 3, md: 4 },
            position: 'relative',
            zIndex: 1
          }}
        >
          <Fade in timeout={500}>
            <Box>
              {showSecurityInfo ? (
                <Zoom in>
                  <Box>
                    <SecurityInfo />
                  </Box>
                </Zoom>
              ) : (
                <>
                  {/* Main Component */}
                  <Slide direction="up" in timeout={400}>
                    <Box>
                      {activeTab === 0 ? <Encrypt /> : <Decrypt />}
                    </Box>
                  </Slide>

                  {/* Security Notice */}
                  <Fade in timeout={600}>
                    <Alert 
                      severity="info" 
                      icon={<SecurityIcon />}
                      sx={{ 
                        mt: 4,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                        '& .MuiAlert-icon': {
                          alignItems: 'center'
                        }
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        <strong>Security First:</strong> Your data is encrypted with AES-256 before being hidden in images. 
                        All processing happens locally - nothing is uploaded to any server.
                      </Typography>
                    </Alert>
                  </Fade>
                </>
              )}
            </Box>
          </Fade>
        </Container>

        {/* Footer */}
        <Box sx={{ 
          py: 4, 
          px: 2, 
          textAlign: 'center',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          bgcolor: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(10px)',
          mt: 'auto',
          position: 'relative',
          zIndex: 1
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            © {new Date().getFullYear()} Aediax • Advanced Steganography Solution
          </Typography>
          <Box sx={{ 
            mt: 1.5, 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Button
              size="small"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              sx={{
                color: theme.palette.primary.main,
                fontSize: '0.75rem',
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
              }}
            >
              Aediax Platform
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
              •
            </Typography>
            <Button
              size="small"
              sx={{
                color: theme.palette.primary.main,
                fontSize: '0.75rem',
              }}
              onClick={() => setShowSecurityInfo(true)}
            >
              Security Info
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default Home;