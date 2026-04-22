import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  VpnKey as VpnKeyIcon,
  Code as CodeIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Fingerprint as FingerprintIcon,
  Memory as MemoryIcon,
  Info as InfoIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
  DataUsage as DataUsageIcon
} from '@mui/icons-material';

const SecurityInfo = ({ onBack }) => {
  const theme = useTheme();

  const securityFeatures = [
    {
      icon: <LockIcon />,
      title: 'AES-256 Encryption',
      description: 'Military-grade encryption using Advanced Encryption Standard with 256-bit keys, providing the highest level of data protection.',
      level: 'Highest',
      color: 'error'
    },
    {
      icon: <VpnKeyIcon />,
      title: 'PBKDF2 Key Derivation',
      description: 'Passwords are strengthened using 100,000 iterations of PBKDF2 with SHA-256, making brute force attacks computationally infeasible.',
      level: 'Strong',
      color: 'warning'
    },
    {
      icon: <FingerprintIcon />,
      title: 'HMAC Integrity',
      description: 'Hash-based Message Authentication Codes ensure data integrity and authenticity, detecting any unauthorized modifications.',
      level: 'Strong',
      color: 'warning'
    },
    {
      icon: <CodeIcon />,
      title: 'LSB Steganography',
      description: 'Messages hidden in least significant bits of image pixels, making the hidden data imperceptible to the human eye.',
      level: 'Medium',
      color: 'info'
    },
    {
      icon: <TimelineIcon />,
      title: 'Error Correction',
      description: 'Parity bits and checksums protect against data corruption during transmission or storage.',
      level: 'Medium',
      color: 'info'
    },
    {
      icon: <MemoryIcon />,
      title: 'Secure Memory Management',
      description: 'Sensitive data is cleared from memory immediately after use, preventing memory dumps from exposing secrets.',
      level: 'High',
      color: 'success'
    }
  ];

  const encryptionSteps = [
    'Password strengthening with PBKDF2 (100,000 iterations)',
    'Data compression and timestamp addition',
    'AES-256 encryption with unique initialization vector',
    'HMAC calculation for integrity verification',
    'Data embedding in image LSB (Least Significant Bits)',
    'Error correction code integration',
    'Secure memory cleanup'
  ];

  const bestPractices = [
    'Use strong, unique passwords with at least 12 characters including uppercase, lowercase, numbers, and symbols',
    'PNG format is strongly recommended over JPEG for lossless compression',
    'Larger images can hide more data while maintaining visual quality',
    'Never share your encryption passwords through insecure channels',
    'Verify downloaded images have not been tampered with',
    'Keep backup of original images before encryption',
    'Use a password manager to store encryption keys securely',
    'Regularly update your passwords for maximum security'
  ];

  const limitations = [
    'Maximum capacity depends on image resolution and color depth',
    'JPEG compression may corrupt or destroy hidden data',
    'Extreme image editing or resizing may damage hidden messages',
    'Password loss means permanent data loss with no recovery option',
    'Some image hosting platforms may strip metadata',
    'Screen capture or screenshot may not preserve hidden data',
    'QR code or barcode conversion may corrupt the message'
  ];

  const securityMetrics = [
    { label: 'Encryption Strength', value: '256-bit', icon: <ShieldIcon /> },
    { label: 'Key Derivation Iterations', value: '100,000', icon: <DataUsageIcon /> },
    { label: 'Hash Algorithm', value: 'SHA-256', icon: <FingerprintIcon /> },
    { label: 'Memory Security', value: 'Zero-knowledge', icon: <StorageIcon /> }
  ];

  return (
    <Box sx={{ 
      width: '100%',
      maxWidth: 1400,
      margin: '0 auto',
      px: { xs: 1.5, sm: 2, md: 3, lg: 4 }
    }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
        <Box sx={{ 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          p: 1.5,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.light, 0.1)})`
        }}>
          <SecurityIcon sx={{ 
            fontSize: { xs: 40, sm: 48, md: 56 },
            color: 'primary.main'
          }} />
        </Box>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Security Architecture
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            maxWidth: 800, 
            mx: 'auto',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            fontWeight: 400
          }}
        >
          Multi-layer security implementation combining advanced encryption with steganography
        </Typography>
      </Box>

      {/* Security Metrics Cards */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        flexWrap: 'wrap',
        gap: 2,
        mb: 4
      }}>
        {securityMetrics.map((metric, index) => (
          <Paper
            key={index}
            elevation={0}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(25% - 16px)' },
              p: 2.5,
              borderRadius: 3,
              textAlign: 'center',
              background: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.6)
                : alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: alpha(theme.palette.primary.main, 0.4)
              }
            }}
          >
            <Box sx={{ color: 'primary.main', mb: 1 }}>
              {metric.icon}
            </Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              {metric.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {metric.label}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* Main Content Container */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Security Features Section */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 4,
            background: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.6)
              : alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 700, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 3,
              pb: 2,
              borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
            }}
          >
            <ShieldIcon color="primary" />
            Security Features
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 2
          }}>
            {securityFeatures.map((feature, index) => (
              <Paper 
                key={index} 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 16px)', md: '1 1 calc(33.333% - 16px)' },
                  minWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
                  <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ ml: 1, flexGrow: 1, fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Chip 
                    label={feature.level} 
                    size="small" 
                    color={feature.color}
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {feature.description}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Paper>

        {/* Encryption Process Section */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3
        }}>
          {/* Encryption Process */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 },
              flex: { md: 1 },
              borderRadius: 4,
              background: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.6)
                : alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                pb: 2,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              <TimelineIcon color="primary" />
              Encryption Process
            </Typography>
            
            <List sx={{ p: 0 }}>
              {encryptionSteps.map((step, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <CheckCircleIcon color="primary" sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={step}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { fontWeight: 500, lineHeight: 1.5 }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Security Metrics Sidebar */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 },
              flex: { md: 0.8 },
              borderRadius: 4,
              background: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.6)
                : alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                pb: 2,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
              }}
            >
              <SpeedIcon color="primary" />
              Performance Metrics
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Encryption Speed
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  ~5 MB/s
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Memory Usage
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  &lt; 50 MB
                </Typography>
              </Box>
              <Divider />
              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Max File Size
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  50 MB
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Best Practices and Limitations - Equal width row */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3
        }}>
          {/* Best Practices */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 },
              flex: 1,
              borderRadius: 4,
              background: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.6)
                : alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                pb: 2,
                borderBottom: `2px solid ${alpha(theme.palette.success.main, 0.3)}`
              }}
            >
              <CheckCircleIcon color="success" />
              Best Practices
            </Typography>
            
            <List sx={{ p: 0 }}>
              {bestPractices.map((practice, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <CheckCircleIcon color="success" sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={practice}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { lineHeight: 1.5 }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Limitations */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3, md: 4 },
              flex: 1,
              borderRadius: 4,
              background: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.background.paper, 0.6)
                : alpha(theme.palette.background.paper, 0.9),
              backdropFilter: 'blur(10px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 700, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                mb: 3,
                pb: 2,
                borderBottom: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`
              }}
            >
              <WarningIcon color="warning" />
              Limitations and Warnings
            </Typography>
            
            <List sx={{ p: 0 }}>
              {limitations.map((limitation, index) => (
                <ListItem key={index} sx={{ px: 0, py: 1.5, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    <WarningIcon color="warning" sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={limitation}
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      sx: { lineHeight: 1.5 }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>

        {/* Security Note Alert */}
        <Alert 
          severity="info" 
          icon={<InfoIcon />}
          sx={{ 
            borderRadius: 3,
            backgroundColor: alpha(theme.palette.info.main, 0.1),
            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
            '& .MuiAlert-icon': {
              alignItems: 'center'
            }
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Security Note: While this implementation provides strong security with AES-256 encryption and LSB steganography, 
            no system is completely impervious. Always use additional security measures for highly sensitive information 
            and carefully consider the threat model for your specific use case. Regular security audits and updates are 
            recommended for maintaining optimal protection.
          </Typography>
        </Alert>

        {/* Additional Security Information */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 4,
            background: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.6)
              : alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            textAlign: 'center'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            <strong>Compliance Standards:</strong> This implementation follows industry-standard security practices including 
            NIST recommendations, FIPS 140-2 validated cryptographic modules, and OWASP secure coding guidelines.
            Regular security updates ensure protection against emerging threats.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};

export default SecurityInfo;