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
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
  FormControlLabel,
  Switch,
  Slider,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Lock as LockIcon,
  Message as MessageIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  Security as SecurityIcon,
  VpnKey as KeyIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  DoneAll as DoneAllIcon,
  DriveFolderUpload as SaveIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const Encrypt = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState(90);
  const [showTimestamp, setShowTimestamp] = useState(true);
  const [downloadComplete, setDownloadComplete] = useState(false);
  
  // New state for file naming dialog
  const [showFileNameDialog, setShowFileNameDialog] = useState(false);
  const [fileName, setFileName] = useState('');
  const [pendingCanvas, setPendingCanvas] = useState(null);
  
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        setError('File size exceeds 50MB. Please choose a smaller image.');
        return;
      }
      
      setImageName(file.name);
      // Set default file name based on original name
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      setFileName(`${baseName}_encrypted.png`);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setPreviewUrl(event.target.result);
          setError('');
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
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setEncryptionProgress(Math.min(progress, 100));
    }, 80);
    return interval;
  };

  const formatMessageWithTimestamp = (msg) => {
    if (!showTimestamp) return msg;
    const timestamp = new Date().toLocaleString();
    return `[${timestamp}]::${msg}`;
  };

  const handleEncrypt = async () => {
    if (!image || !message || !password) {
      setError('Please provide an image, message, and password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (message.length === 0) {
      setError('Please enter a secret message');
      return;
    }

    const maxCapacity = Math.floor((image.width * image.height * 3) / 8);
    if (message.length > maxCapacity) {
      setError(`Message is too long. Maximum capacity is ${maxCapacity} characters.`);
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    setDownloadComplete(false);
    const progressInterval = simulateProgress();

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = image.width;
      canvas.height = image.height;
      
      ctx.drawImage(image, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      const finalMessage = formatMessageWithTimestamp(message);
      
      const modifiedImageData = Steganography.hideTextInImage(
        imageData, 
        finalMessage, 
        password
      );
      
      ctx.putImageData(modifiedImageData, 0, 0);
      
      // Store the canvas reference for later download
      setPendingCanvas(canvas);
      
      // Show the file name dialog instead of downloading immediately
      setShowFileNameDialog(true);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Error encrypting message. Please try again with a different image.');
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setProcessing(false);
        setEncryptionProgress(0);
      }, 500);
    }
  };

  // New function to handle download with custom filename
  const handleDownloadWithFileName = async () => {
    if (!pendingCanvas) return;
    
    try {
      // Validate file name
      let finalFileName = fileName.trim();
      if (!finalFileName) {
        finalFileName = `encrypted-${Date.now()}.png`;
      }
      
      // Ensure .png extension
      if (!finalFileName.toLowerCase().endsWith('.png')) {
        finalFileName += '.png';
      }
      
      // Create downloadable image with custom filename
      await Steganography.createDownloadableImage(pendingCanvas, finalFileName);
      
      // Close dialog
      setShowFileNameDialog(false);
      setPendingCanvas(null);
      setDownloadComplete(true);
      setSuccess(`✓ Encryption successful! Image with hidden message has been downloaded as "${finalFileName}".`);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setMessage('');
        setPassword('');
        setImage(null);
        setPreviewUrl('');
        setImageName('');
        setEncryptionProgress(0);
        setDownloadComplete(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        // Reset file name
        setFileName('');
      }, 3000);
      
    } catch (error) {
      console.error('Error downloading:', error);
      setError('Error downloading the encrypted image. Please try again.');
    }
  };

  // Handle file name change in dialog
  const handleFileNameChange = (e) => {
    let value = e.target.value;
    // Remove .png if user types it to avoid duplication
    if (value.toLowerCase().endsWith('.png')) {
      value = value.slice(0, -4);
    }
    setFileName(value);
  };

  const clearForm = () => {
    setMessage('');
    setPassword('');
    setImage(null);
    setPreviewUrl('');
    setImageName('');
    setError('');
    setSuccess('');
    setDownloadComplete(false);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const maxMessageLength = image ? Math.floor((image.width * image.height * 3) / 8) : 0;
  const messagePercentage = image ? (message.length / maxMessageLength) * 100 : 0;
  const isOverCapacity = messagePercentage > 100;

  // Helper function to safely use alpha with theme colors
 
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
          <LockIcon sx={{ 
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
          Secure Image Encryption
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
          Hide sensitive messages inside images using military-grade AES-256 encryption
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                fontWeight: 600, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                mb: 0
              }}
            >
              <ImageIcon color="primary" />
              Image Selection
            </Typography>
            <Tooltip title="Encryption Settings">
              <IconButton onClick={() => setShowSettings(!showSettings)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
          
          {/* Settings Panel */}
          {showSettings && (
            <Fade in={showSettings}>
              <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Encryption Settings
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={showTimestamp}
                        onChange={(e) => setShowTimestamp(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Include timestamp in encrypted message"
                  />
                  <Box>
                    <Typography variant="caption" gutterBottom display="block">
                      Output image quality: {quality}%
                    </Typography>
                    <Slider
                      value={quality}
                      onChange={(e, val) => setQuality(val)}
                      min={70}
                      max={100}
                      disabled
                      sx={{ opacity: 0.6 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      PNG format recommended for steganography
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Fade>
          )}
          
          {/* Drag & Drop Area */}
          <Paper
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              p: { xs: 4, sm: 5, md: 6 },
              border: '2px dashed',
              borderColor: dragActive ? 'primary.main' : isOverCapacity ? 'error.main' : 'divider',
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              backgroundColor: dragActive 
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.background.default, 0.5),
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                borderColor: 'primary.main',
                transform: 'translateY(-4px)'
              }
            }}
          >
            <UploadIcon sx={{ 
              fontSize: { xs: 48, sm: 56, md: 64 }, 
              color: dragActive ? 'primary.main' : 'primary.main', 
              mb: 2,
              opacity: 0.8
            }} />
            <Typography variant="h6" gutterBottom color="primary.main" sx={{ fontSize: { xs: '1rem', sm: '1.1rem' } }}>
              {dragActive ? 'Drop image here' : 'Drop image here or click to browse'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports PNG, JPG, JPEG, BMP (PNG recommended)
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
                border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                background: theme.palette.mode === 'dark' ? alpha(theme.palette.background.paper, 0.8) : 'white'
              }}>
                <CardMedia
                  component="img"
                  image={previewUrl}
                  alt="Preview"
                  sx={{ 
                    maxHeight: 300, 
                    objectFit: 'contain',
                    p: 2,
                    backgroundColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.black, 0.5) : alpha(theme.palette.grey[100], 0.05)
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
                      label={`${image.width} × ${image.height}`} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Tooltip title={`Maximum characters that can be hidden in this image`}>
                      <Chip 
                        icon={<SecurityIcon />}
                        label={`Capacity: ~${maxMessageLength.toLocaleString()} chars`}
                        color={isOverCapacity ? 'error' : 'success'}
                        size="small"
                        variant="outlined"
                      />
                    </Tooltip>
                    <Chip 
                      label="PNG Recommended"
                      color="info"
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Zoom>
          )}
        </Paper>

        {/* Right Panel - Encryption Form */}
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
            <KeyIcon color="primary" />
            Encryption Details
          </Typography>

          {/* Message Input */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Secret Message
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={isMobile ? 4 : 5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your secret message here..."
              variant="outlined"
              disabled={processing}
              error={isOverCapacity}
              helperText={isOverCapacity && `Message exceeds capacity by ${message.length - maxMessageLength} characters`}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.common.white, 0.05)
                    : 'white',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04)
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MessageIcon color="action" />
                  </InputAdornment>
                )
              }}
            />
            {image && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(messagePercentage, 100)} 
                  color={messagePercentage > 90 ? 'error' : messagePercentage > 70 ? 'warning' : 'primary'}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {message.length.toLocaleString()} / {maxMessageLength.toLocaleString()} characters
                  </Typography>
                  <Typography variant="caption" color={messagePercentage > 90 ? 'error' : 'text.secondary'}>
                    {Math.round(messagePercentage)}% capacity used
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          {/* Password Input */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom fontWeight={600}>
              Encryption Password
            </Typography>
            <TextField
              fullWidth
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter strong encryption password (min. 6 characters)"
              variant="outlined"
              disabled={processing}
              error={password.length > 0 && password.length < 6}
              helperText={password.length > 0 && password.length < 6 && "Password must be at least 6 characters"}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? alpha(theme.palette.common.white, 0.05)
                    : 'white',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04)
                  }
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
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
              Password is encrypted using PBKDF2 with 100,000 iterations
            </Typography>
          </Box>

          {/* Error & Success Messages */}
          <Fade in={!!error || !!success}>
            <Box sx={{ mb: 3 }}>
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
                  icon={downloadComplete ? <DoneAllIcon /> : <CheckCircleIcon />}
                >
                  {success}
                </Alert>
              )}
            </Box>
          </Fade>

          {/* Progress Indicator */}
          {processing && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon fontSize="small" />
                Encrypting message and embedding in image...
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={encryptionProgress}
                sx={{ height: 8, borderRadius: 4, backgroundColor: alpha(theme.palette.primary.main, 0.2) }}
              />
              <Typography variant="caption" color="primary.main" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
                {Math.round(encryptionProgress)}%
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleEncrypt}
              disabled={processing || !image || !message || !password || isOverCapacity || password.length < 6}
              startIcon={processing ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{
                py: 1.5,
                borderRadius: 3,
                fontSize: '1rem',
                fontWeight: 600,
                background: processing 
                  ? theme.palette.grey[700]
                  : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)'
                },
                '&:disabled': {
                  background: theme.palette.grey[500],
                }
              }}
            >
              {processing ? 'Encrypting...' : 'Encrypt & Save Image'}
            </Button>
            
            {(image || message || password) && (
              <Button
                variant="outlined"
                size="large"
                onClick={clearForm}
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
                <strong>Security Features:</strong> AES-256 Encryption • PBKDF2 Key Derivation • LSB Steganography • HMAC Integrity • Anti-forensic techniques
              </span>
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* File Name Dialog */}
      <Dialog 
        open={showFileNameDialog} 
        onClose={() => !processing && setShowFileNameDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          pb: 2
        }}>
          <EditIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Save Encrypted Image
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <DialogContentText sx={{ mb: 2 }}>
            Choose a name for your encrypted image file. The image will be saved in PNG format.
          </DialogContentText>
          
          <TextField
            autoFocus
            fullWidth
            label="File name"
            value={fileName}
            onChange={handleFileNameChange}
            placeholder="encrypted-image"
            variant="outlined"
            helperText=".png will be added automatically"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Chip label=".png" size="small" variant="outlined" />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.background.default, 0.5),
              }
            }}
          />
          
          <Box sx={{ 
            mt: 2, 
            p: 1.5, 
            borderRadius: 2, 
            backgroundColor: alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon fontSize="small" color="info" />
              The image contains hidden encrypted data. Keep it safe and don't compress it further.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button 
            onClick={() => {
              setShowFileNameDialog(false);
              setPendingCanvas(null);
              setError('');
            }}
            disabled={processing}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDownloadWithFileName}
            variant="contained"
            startIcon={<DownloadIcon />}
            sx={{ 
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            }}
          >
            Save Image
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Box>
  );
};

export default Encrypt;