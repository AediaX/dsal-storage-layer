import React, { useState, useRef } from 'react';
import Steganography from '../utils/steganography';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
  Chip,
  Fade,
  Zoom,
  LinearProgress,
  Dialog,
  DialogContent,
  Tooltip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  LockOpen as UnlockIcon,
  Message as MessageIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Search as SearchIcon,
  Image as ImageIcon,
  Security as SecurityIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Info as InfoIcon,
  VpnKey as KeyIcon,
  DownloadDone as DoneIcon
} from '@mui/icons-material';

const Decrypt = () => {
  const theme = useTheme();
  
  const [image, setImage] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [decryptedMessage, setDecryptedMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [decryptionProgress, setDecryptionProgress] = useState(0);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [messageMetadata, setMessageMetadata] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImageName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setPreviewUrl(event.target.result);
          setError('');
          setDecryptedMessage('');
          setMessageMetadata(null);
          setSuccess('');
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    } else if (file) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, BMP)');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleImageUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const simulateProgress = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setDecryptionProgress(Math.min(progress, 100));
    }, 80);
    return interval;
  };

  const parseMessageMetadata = (message) => {
    try {
      const match = message.match(/^\[(.*?)\]::(.*)/s);
      if (match) {
        return {
          timestamp: match[1],
          content: match[2]
        };
      }
    } catch (e) {
      console.log('No metadata found in message');
    }
    return null;
  };

  const handleDecrypt = async () => {
    if (!image || !password) {
      setError('Please provide an image and the decryption password');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    setDecryptedMessage('');
    setMessageMetadata(null);
    const progressInterval = simulateProgress();

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      ctx.drawImage(image, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      const message = Steganography.extractTextFromImage(imageData, password);
      
      if (message) {
        const metadata = parseMessageMetadata(message);
        if (metadata) {
          setMessageMetadata(metadata);
          setDecryptedMessage(metadata.content);
        } else {
          setDecryptedMessage(message);
        }
        
        setSuccess('✓ Message successfully decrypted!');
      } else {
        setError('Failed to decrypt. Incorrect password or no hidden message found.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error decrypting message. Please ensure the image contains encrypted data and the password is correct.');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setProcessing(false);
        setDecryptionProgress(0);
      }, 500);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(decryptedMessage)
      .then(() => {
        setShowCopyDialog(true);
        setTimeout(() => setShowCopyDialog(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setError('Failed to copy message to clipboard');
      });
  };

  const clearAll = () => {
    setImage(null);
    setPreviewUrl('');
    setImageName('');
    setPassword('');
    setDecryptedMessage('');
    setMessageMetadata(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
          background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)}, ${alpha(theme.palette.success.light, 0.1)})`
        }}>
          <UnlockIcon sx={{ 
            fontSize: { xs: 40, sm: 48, md: 56 },
            color: 'success.main'
          }} />
        </Box>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Extract Hidden Messages
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            maxWidth: 700, 
            mx: 'auto',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
            fontWeight: 400
          }}
        >
          Decrypt and reveal messages hidden within images using your secure password
        </Typography>
      </Box>

      {/* Main Content - Flex Layout without Grid */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', lg: 'row' }, 
        gap: { xs: 3, md: 4 },
        alignItems: 'stretch'
      }}>
        {/* Left Panel - Image Upload & Preview */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            flex: 1,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.6)
              : alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: 'all 0.3s ease',
            width: '100%'
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              mb: 3
            }}
          >
            <ImageIcon color="success" />
            Upload Encrypted Image
          </Typography>
          
          {/* Drag & Drop Area */}
          <Paper
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              p: { xs: 4, sm: 5, md: 6 },
              border: '2px dashed',
              borderColor: dragActive ? 'success.main' : 'divider',
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: dragActive 
                ? alpha(theme.palette.success.main, 0.1)
                : alpha(theme.palette.background.default, 0.5),
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette.success.main, 0.08),
                borderColor: 'success.main',
                transform: 'translateY(-4px)'
              }
            }}
          >
            <UploadIcon sx={{ 
              fontSize: { xs: 48, sm: 56, md: 64 }, 
              color: 'success.main', 
              mb: 2,
              opacity: 0.8
            }} />
            <Typography variant="h6" gutterBottom color="success.main" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
              {dragActive ? 'Drop image here' : 'Drop encrypted image here or click to browse'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports PNG, JPG, JPEG, BMP formats (PNG recommended)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Maximum file size: 50MB
            </Typography>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
          </Paper>

          {/* Image Preview */}
          {previewUrl && (
            <Zoom in={!!previewUrl}>
              <Card sx={{ 
                mt: 4, 
                borderRadius: 2, 
                overflow: 'hidden',
                border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`,
                background: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : 'white'
              }}>
                <CardMedia
                  component="img"
                  image={previewUrl}
                  alt="Encrypted Image Preview"
                  sx={{ 
                    maxHeight: 300, 
                    objectFit: 'contain',
                    p: 2,
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.common.black, 0.5) 
                      : alpha(theme.palette.grey[100], 0.05) // Fixed: changed theme.palette.grey to theme.palette.grey[100]
                  }}
                />
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' }, 
                    gap: 1,
                    mb: 2 
                  }}>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {imageName}
                    </Typography>
                    <Chip 
                      label={`${image?.width || 0} × ${image?.height || 0}`} 
                      size="small" 
                      color="success" 
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      icon={<SecurityIcon />}
                      label="Encrypted Image"
                      color="success"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip 
                      icon={<InfoIcon />}
                      label="Ready for decryption"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          )}
        </Paper>

        {/* Right Panel - Decryption Form */}
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, sm: 3, md: 4 }, 
            flex: 1,
            borderRadius: 2,
            background: theme.palette.mode === 'dark' 
              ? alpha(theme.palette.background.paper, 0.6)
              : alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: 'all 0.3s ease',
            width: '100%'
          }}
        >
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              fontWeight: 600, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
              mb: 3
            }}
          >
            <KeyIcon color="success" />
            Decryption Details
          </Typography>

          {/* Password Input */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Decryption Password
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the encryption password"
              variant="outlined"
              disabled={processing}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.common.white, 0.05)
                    : 'white',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.success.main, 0.04)
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <UnlockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={processing}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <SecurityIcon fontSize="small" />
              Password must match the one used during encryption
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleDecrypt}
              disabled={processing || !image || !password}
              startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
              sx={{
                py: 1.5,
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: 600,
                background: processing 
                  ? theme.palette.grey[700]
                  : `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 16px ${alpha(theme.palette.success.main, 0.4)}`,
                  transform: 'translateY(-2px)'
                },
                '&:disabled': {
                  background: theme.palette.grey[500],
                }
              }}
            >
              {processing ? 'Decrypting...' : 'Decrypt Message'}
            </Button>
            
            {(image || password || decryptedMessage) && (
              <Button
                variant="outlined"
                size="large"
                onClick={clearAll}
                disabled={processing}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderColor: theme.palette.error.main,
                  color: theme.palette.error.main,
                  '&:hover': {
                    borderColor: theme.palette.error.dark,
                    backgroundColor: alpha(theme.palette.error.main, 0.1)
                  }
                }}
              >
                Clear
              </Button>
            )}
          </Box>

          {/* Progress Indicator */}
          {processing && (
            <Box sx={{ mt: 3, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon fontSize="small" />
                Analyzing image and decrypting message...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={decryptionProgress}
                sx={{ height: 8, borderRadius: 4, backgroundColor: alpha(theme.palette.success.main, 0.2) }}
              />
              <Typography variant="caption" color="success.main" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                {Math.round(decryptionProgress)}%
              </Typography>
            </Box>
          )}

          {/* Error & Success Messages */}
          <Fade in={!!error || !!success}>
            <Box sx={{ mt: 3 }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ borderRadius: 2 }}
                  icon={<WarningIcon />}
                >
                  {error}
                </Alert>
              )}
              {success && (
                <Alert 
                  severity="success" 
                  sx={{ borderRadius: 2 }}
                  icon={<DoneIcon />}
                >
                  {success}
                </Alert>
              )}
            </Box>
          </Fade>

          {/* Message Metadata */}
          {messageMetadata && (
            <Fade in={!!messageMetadata}>
              <Paper 
                elevation={0} 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                  borderLeft: `4px solid ${theme.palette.success.main}`
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ScheduleIcon fontSize="small" />
                  Message Information
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Encrypted on: {messageMetadata.timestamp}
                </Typography>
              </Paper>
            </Fade>
          )}

          {/* Decrypted Message Display */}
          {decryptedMessage && (
            <Fade in={!!decryptedMessage}>
              <Box sx={{ mt: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: 2,
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MessageIcon color="success" />
                    Decrypted Message
                  </Typography>
                  <Tooltip title="Copy to clipboard">
                    <IconButton 
                      onClick={handleCopyMessage}
                      color="success"
                      sx={{ 
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        '&:hover': { backgroundColor: alpha(theme.palette.success.main, 0.2) }
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                    borderColor: alpha(theme.palette.success.main, 0.3),
                    minHeight: 150,
                    maxHeight: 300,
                    overflow: 'auto'
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: 1.6,
                      color: theme.palette.text.primary
                    }}
                  >
                    {decryptedMessage}
                  </Typography>
                </Paper>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Message length: {decryptedMessage.length} characters
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Encrypted using AES-256
                  </Typography>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Security Info */}
          <Divider sx={{ my: { xs: 3, md: 4 } }} />
          <Box sx={{ 
            p: 2, 
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <SecurityIcon fontSize="small" sx={{ mt: 0.2, color: 'info.main' }} />
              <span>
                <strong>Decryption Process:</strong> Image analysis → Password verification → AES-256 decryption → Data extraction → Integrity check
              </span>
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Copy Success Dialog */}
      <Dialog
        open={showCopyDialog}
        onClose={() => setShowCopyDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
          }
        }}
      >
        <DialogContent>
          <Box sx={{ textAlign: 'center', color: 'white', p: { xs: 2, sm: 3 } }}>
            <CheckCircleIcon sx={{ fontSize: { xs: 40, sm: 48 }, mb: 2 }} />
            <Typography variant="h6" fontWeight={600}>
              Message Copied!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
              The decrypted message has been copied to your clipboard
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Decrypt;