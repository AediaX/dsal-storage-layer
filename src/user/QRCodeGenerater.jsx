// QRCodeGenerator.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Slider,
  useTheme,
  alpha,
  Snackbar,
  Chip,
  Tooltip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  QrCode as QrCodeIcon,
  ColorLens as ColorLensIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
  FileCopy as CopyIcon,
  PictureAsPdf as PdfIcon,
  PhotoCamera as PhotoIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  ArrowBack as ArrowBackIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import QRCodeStyling from "qr-code-styling";
import jsPDF from "jspdf";
import { useThemeContext } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { 
  vscDarkPlus, 
  vs 
} from "react-syntax-highlighter/dist/esm/styles/prism";

const QRCodeGenerator = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode } = useThemeContext();
  const qrContainerRef = useRef(null);
  const qrCodeInstanceRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // QR Data
  const [qrData, setQrData] = useState({
    data: "",
    type: "url",
  });
  
  // QR Styling Options
  const [options, setOptions] = useState({
    width: 300,
    height: 300,
    margin: 10,
    type: "svg",
    qrOptions: {
      typeNumber: 0,
      mode: "Byte",
      errorCorrectionLevel: "H",
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: 0.4,
      margin: 5,
      crossOrigin: "anonymous",
    },
    dotsOptions: {
      color: "#000000",
      type: "square",
    },
    cornersSquareOptions: {
      color: "#000000",
      type: "square",
    },
    cornersDotOptions: {
      color: "#000000",
      type: "square",
    },
    backgroundOptions: {
      color: "#ffffff",
    },
  });
  
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoDialogOpen, setLogoDialogOpen] = useState(false);
  const [svgCodeDialogOpen, setSvgCodeDialogOpen] = useState(false);
  const [svgCode, setSvgCode] = useState("");
  const [codeCopied, setCodeCopied] = useState(false);
  
  // Color pickers
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorField, setActiveColorField] = useState("");
  
  // Size presets
  const sizePresets = [
    { label: "Small", size: 200 },
    { label: "Medium", size: 300 },
    { label: "Large", size: 400 },
    { label: "XL", size: 500 },
  ];
  
  const dotTypes = ["square", "rounded", "dots", "classy", "classy-rounded"];

  // Clear previous QR code instance
  const clearQRCode = useCallback(() => {
    if (qrCodeInstanceRef.current) {
      if (qrContainerRef.current) {
        while (qrContainerRef.current.firstChild) {
          qrContainerRef.current.removeChild(qrContainerRef.current.firstChild);
        }
      }
      qrCodeInstanceRef.current = null;
    }
  }, []);

  // Extract SVG code from the QR code instance
  const extractSVGCode = useCallback(async () => {
    if (!qrCodeInstanceRef.current) return;
    
    try {
      // Get the SVG element from the container
      const svgElement = qrContainerRef.current?.querySelector("svg");
      if (svgElement) {
        const serializer = new XMLSerializer();
        let svgString = serializer.serializeToString(svgElement);
        
        // Add XML declaration for better compatibility
        svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
        setSvgCode(svgString);
      } else {
        // If no SVG element found, try to get from the instance
        const svg = await qrCodeInstanceRef.current.getRawData("svg");
        if (svg) {
          let svgString = new XMLSerializer().serializeToString(svg);
          svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
          setSvgCode(svgString);
        }
      }
    } catch (error) {
      console.error("Error extracting SVG code:", error);
      setSvgCode("");
    }
  }, []);

  // Generate QR Code
  const generateQRCode = useCallback(async () => {
    if (!qrData.data) return;
    
    setLoading(true);
    
    try {
      let qrDataString = qrData.data;
      
      // Format data based on type
      switch (qrData.type) {
        case "email":
          qrDataString = `mailto:${qrData.data}`;
          break;
        case "phone":
          qrDataString = `tel:${qrData.data}`;
          break;
        case "wifi":
          if (qrData.data && typeof qrData.data === 'object') {
            qrDataString = `WIFI:S:${qrData.data.network || ''};T:${qrData.data.encryption || 'WPA'};P:${qrData.data.password || ''};;`;
          }
          break;
        case "sms":
          if (qrData.data && typeof qrData.data === 'object') {
            qrDataString = `sms:${qrData.data.number || ''}?body=${qrData.data.message || ''}`;
          }
          break;
        default:
          qrDataString = qrData.data;
      }
      
      clearQRCode();
      
      // Create new QR code instance with SVG type to get SVG output
      const qr = new QRCodeStyling({
        ...options,
        type: "svg",
        data: qrDataString,
        image: logoPreview || null,
      });
      
      qr.append(qrContainerRef.current);
      qrCodeInstanceRef.current = qr;
      
      // Wait for the SVG to render, then extract the code
      setTimeout(async () => {
        await extractSVGCode();
      }, 100);
      
    } catch (error) {
      console.error("Error generating QR code:", error);
      showNotification("Failed to generate QR code", "error");
    } finally {
      setLoading(false);
    }
  }, [qrData, options, logoPreview, clearQRCode, extractSVGCode]);

  // Update colors and regenerate
  const updateColor = useCallback((color) => {
    setOptions(prev => {
      const updated = { ...prev };
      if (activeColorField === "dots") {
        updated.dotsOptions = { ...prev.dotsOptions, color };
      } else if (activeColorField === "corners") {
        updated.cornersSquareOptions = { ...prev.cornersSquareOptions, color };
        updated.cornersDotOptions = { ...prev.cornersDotOptions, color };
      } else if (activeColorField === "background") {
        updated.backgroundOptions = { ...prev.backgroundOptions, color };
      }
      return updated;
    });
    setShowColorPicker(false);
  }, [activeColorField]);

  // Generate on data/options change with debounce
  useEffect(() => {
    if (qrData.data) {
      const timer = setTimeout(() => {
        generateQRCode();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    qrData.data, 
    qrData.type, 
    options.dotsOptions.color, 
    options.cornersSquareOptions.color, 
    options.backgroundOptions.color, 
    options.dotsOptions.type,
    options.width,
    logoPreview,
    generateQRCode
  ]);

  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDownload = async (format) => {
    if (!qrCodeInstanceRef.current) {
      showNotification("Generate a QR code first", "warning");
      return;
    }
    
    try {
      if (format === "svg") {
        if (svgCode) {
          const blob = new Blob([svgCode], { type: "image/svg+xml" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = "qrcode.svg";
          link.click();
          URL.revokeObjectURL(url);
          showNotification("QR Code downloaded as SVG");
        } else {
          showNotification("SVG code not available", "error");
        }
      } else {
        await qrCodeInstanceRef.current.download({ extension: format });
        showNotification(`QR Code downloaded as ${format.toUpperCase()}`);
      }
    } catch (error) {
      console.error("Download error:", error);
      showNotification("Failed to download QR code", "error");
    }
  };

  const downloadAsPDF = async () => {
    if (!qrContainerRef.current) return;
    
    const svgElement = qrContainerRef.current.querySelector("svg");
    if (svgElement) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
        
        const imgWidth = 100;
        const imgHeight = (img.height * imgWidth) / img.width;
        const x = (pdf.internal.pageSize.width - imgWidth) / 2;
        const y = (pdf.internal.pageSize.height - imgHeight) / 2;
        
        pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
        pdf.save("qrcode.pdf");
        showNotification("QR Code downloaded as PDF");
      };
      
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    } else {
      showNotification("Failed to generate PDF", "error");
    }
  };

  const copySVGCode = async () => {
    if (svgCode) {
      try {
        await navigator.clipboard.writeText(svgCode);
        setCodeCopied(true);
        showNotification("SVG code copied to clipboard");
        setTimeout(() => setCodeCopied(false), 2000);
      } catch (err) {
        showNotification("Failed to copy SVG code", "error");
      }
    } else {
      showNotification("Generate QR code first", "warning");
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/jpg")) {
      if (file.size <= 2 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setLogoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
        setLogoDialogOpen(false);
        showNotification("Logo added successfully");
      } else {
        showNotification("Logo must be less than 2MB", "error");
      }
    } else {
      showNotification("Only PNG, JPG images are allowed", "error");
    }
  };

  const removeLogo = () => {
    setLogoPreview(null);
    showNotification("Logo removed");
  };

  const resetToDefault = () => {
    setOptions(prev => ({
      ...prev,
      dotsOptions: { ...prev.dotsOptions, color: "#000000", type: "square" },
      cornersSquareOptions: { ...prev.cornersSquareOptions, color: "#000000", type: "square" },
      cornersDotOptions: { ...prev.cornersDotOptions, color: "#000000", type: "square" },
      backgroundOptions: { ...prev.backgroundOptions, color: "#ffffff" },
    }));
    removeLogo();
    showNotification("Reset to default");
  };

  const copyQRCode = async () => {
    if (!qrContainerRef.current) return;
    
    const svgElement = qrContainerRef.current.querySelector("svg");
    if (svgElement) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(async (blob) => {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob,
              }),
            ]);
            showNotification("QR Code copied to clipboard");
          } catch (err) {
            showNotification("Failed to copy", "error");
          }
        });
      };
      
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    }
  };

  const getQRDataExamples = () => {
    const examples = {
      url: "https://example.com",
      text: "Hello, this is a secret message!",
      email: "user@example.com",
      phone: "+1234567890",
    };
    return examples[qrData.type] || "";
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearQRCode();
    };
  }, [clearQRCode]);

  // Get line count for SVG code
  const getLineCount = () => {
    if (!svgCode) return 0;
    return svgCode.split('\n').length;
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Fixed App Bar */}
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
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <IconButton onClick={() => navigate(-1)} edge="start" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <QrCodeIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700,color: theme.palette.text.primary }}>
            QR Code Generator
          </Typography>
          <Chip
            label={mode === "dark" ? "Dark Mode" : "Light Mode"}
            size="small"
            variant="outlined"
          />
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ pt: { xs: 8, sm: 9 }, pb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Container maxWidth="lg" disableGutters>
          {/* Responsive CSS Grid Layout */}
          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: { xs: 3, md: 4 },
          }}>
            {/* Left Panel - Input & Controls */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, height: "100%" }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Content
                </Typography>
                
                {/* QR Type Selection */}
                <FormControl fullWidth sx={{ mb: 2.5 }}>
                  <InputLabel>QR Code Type</InputLabel>
                  <Select
                    value={qrData.type}
                    onChange={(e) => {
                      clearQRCode();
                      setQrData({ ...qrData, type: e.target.value, data: "" });
                    }}
                    label="QR Code Type"
                  >
                    <MenuItem value="url">URL / Website</MenuItem>
                    <MenuItem value="text">Plain Text</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="phone">Phone Number</MenuItem>
                    <MenuItem value="wifi">Wi-Fi Network</MenuItem>
                    <MenuItem value="sms">SMS</MenuItem>
                  </Select>
                </FormControl>
                
                {/* Dynamic Input Fields */}
                {qrData.type === "wifi" ? (
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Network Name (SSID)"
                      value={qrData.data.network || ""}
                      onChange={(e) => setQrData({ ...qrData, data: { ...qrData.data, network: e.target.value } })}
                    />
                    <FormControl fullWidth>
                      <InputLabel>Encryption</InputLabel>
                      <Select
                        value={qrData.data.encryption || "WPA"}
                        onChange={(e) => setQrData({ ...qrData, data: { ...qrData.data, encryption: e.target.value } })}
                        label="Encryption"
                      >
                        <MenuItem value="WPA">WPA/WPA2</MenuItem>
                        <MenuItem value="WEP">WEP</MenuItem>
                        <MenuItem value="nopass">No Password</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      label="Password"
                      type="password"
                      value={qrData.data.password || ""}
                      onChange={(e) => setQrData({ ...qrData, data: { ...qrData.data, password: e.target.value } })}
                    />
                  </Stack>
                ) : qrData.type === "sms" ? (
                  <Stack spacing={2.5}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={qrData.data.number || ""}
                      onChange={(e) => setQrData({ ...qrData, data: { ...qrData.data, number: e.target.value } })}
                    />
                    <TextField
                      fullWidth
                      label="Message"
                      multiline
                      rows={3}
                      value={qrData.data.message || ""}
                      onChange={(e) => setQrData({ ...qrData, data: { ...qrData.data, message: e.target.value } })}
                    />
                  </Stack>
                ) : (
                  <TextField
                    fullWidth
                    label={qrData.type === "url" ? "Enter URL" : qrData.type === "email" ? "Email Address" : qrData.type === "phone" ? "Phone Number" : "Enter Text"}
                    placeholder={getQRDataExamples()}
                    value={qrData.data}
                    onChange={(e) => setQrData({ ...qrData, data: e.target.value })}
                    multiline={qrData.type === "text"}
                    rows={qrData.type === "text" ? 3 : 1}
                    sx={{ mb: 1 }}
                  />
                )}
                
                <Divider sx={{ my: 3 }} />
                
                {/* Styling Options */}
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Personalization
                </Typography>
                
                {/* Size Control */}
                <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
                  Size: {options.width}px
                </Typography>
                <Slider
                  value={options.width}
                  onChange={(e, val) => setOptions({ ...options, width: val, height: val })}
                  min={150}
                  max={600}
                  step={10}
                  marks={sizePresets.map(preset => ({ value: preset.size, label: preset.label }))}
                  sx={{ mb: 3 }}
                />
                
                {/* Color Controls */}
                <Box sx={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(3, 1fr)", 
                  gap: 1.5,
                  mb: 3 
                }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ColorLensIcon />}
                    onClick={() => {
                      setActiveColorField("dots");
                      setShowColorPicker(true);
                    }}
                    sx={{ 
                      borderColor: options.dotsOptions.color, 
                      color: options.dotsOptions.color,
                      '&:hover': { borderColor: options.dotsOptions.color }
                    }}
                  >
                    Dots
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ColorLensIcon />}
                    onClick={() => {
                      setActiveColorField("corners");
                      setShowColorPicker(true);
                    }}
                    sx={{ 
                      borderColor: options.cornersSquareOptions.color, 
                      color: options.cornersSquareOptions.color,
                      '&:hover': { borderColor: options.cornersSquareOptions.color }
                    }}
                  >
                    Corners
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ColorLensIcon />}
                    onClick={() => {
                      setActiveColorField("background");
                      setShowColorPicker(true);
                    }}
                    sx={{ 
                      borderColor: options.backgroundOptions.color, 
                      color: options.backgroundOptions.color,
                      '&:hover': { borderColor: options.backgroundOptions.color }
                    }}
                  >
                    Background
                  </Button>
                </Box>
                
                {/* Dot Style */}
                <FormControl fullWidth sx={{ mb: 2.5 }}>
                  <InputLabel>Dot Style</InputLabel>
                  <Select
                    value={options.dotsOptions.type}
                    onChange={(e) => setOptions({ ...options, dotsOptions: { ...options.dotsOptions, type: e.target.value } })}
                    label="Dot Style"
                  >
                    {dotTypes.map(type => (
                      <MenuItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Logo Upload */}
                <Box sx={{ mb: 2.5 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    onClick={() => setLogoDialogOpen(true)}
                    sx={{ mb: 1 }}
                  >
                    Add Logo / Image
                  </Button>
                  {logoPreview && (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1 }}>
                      <Chip
                        icon={<ImageIcon />}
                        label="Logo added"
                        color="success"
                        size="small"
                      />
                      <IconButton onClick={removeLogo} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  )}
                </Box>
                
                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={resetToDefault}
                    startIcon={<RefreshIcon />}
                    fullWidth
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    onClick={generateQRCode}
                    disabled={!qrData.data}
                    startIcon={<QrCodeIcon />}
                    fullWidth
                  >
                    Generate
                  </Button>
                </Stack>
              </Paper>
            </motion.div>
            
            {/* Right Panel - QR Display & Download */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, height: "100%", display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" fontWeight={700} gutterBottom textAlign="center">
                  Preview
                </Typography>
                
                {/* QR Code Display */}
                <Box
                  ref={qrContainerRef}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: { xs: 320, sm: 400 },
                    mb: 3,
                    p: 3,
                    background: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 2,
                  }}
                />
                
                {loading && (
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
                
                {!qrData.data && (
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                    Enter data and click Generate to create your QR code
                  </Alert>
                )}
                
                {/* Download Options */}
                {qrCodeInstanceRef.current && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body2" gutterBottom textAlign="center" fontWeight={500}>
                      Download
                    </Typography>
                    <Box sx={{ 
                      display: "flex", 
                      flexWrap: "wrap", 
                      justifyContent: "center", 
                      gap: 1.5,
                      mb: 2
                    }}>
                      <Tooltip title="Download as PNG">
                        <Button size="small" variant="contained" startIcon={<PhotoIcon />} onClick={() => handleDownload("png")}>
                          PNG
                        </Button>
                      </Tooltip>
                      <Tooltip title="Download as JPG">
                        <Button size="small" variant="contained" startIcon={<PhotoIcon />} onClick={() => handleDownload("jpg")}>
                          JPG
                        </Button>
                      </Tooltip>
                      <Tooltip title="Download as SVG">
                        <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={() => handleDownload("svg")}>
                          SVG
                        </Button>
                      </Tooltip>
                      <Tooltip title="Download as PDF">
                        <Button size="small" variant="contained" startIcon={<PdfIcon />} onClick={downloadAsPDF}>
                          PDF
                        </Button>
                      </Tooltip>
                      <Tooltip title="Copy to Clipboard">
                        <Button size="small" variant="outlined" startIcon={<CopyIcon />} onClick={copyQRCode}>
                          Copy
                        </Button>
                      </Tooltip>
                      <Tooltip title="View SVG Code">
                        <Button 
                          size="small" 
                          variant="outlined" 
                          startIcon={<CodeIcon />} 
                          onClick={() => setSvgCodeDialogOpen(true)}
                        >
                          SVG Code
                        </Button>
                      </Tooltip>
                    </Box>
                    {svgCode && (
                      <Alert severity="success" sx={{ mt: 1, borderRadius: 2 }} icon={<CodeIcon />}>
                        SVG code is ready! Click "SVG Code" to view in code editor.
                      </Alert>
                    )}
                  </>
                )}
              </Paper>
            </motion.div>
          </Box>
          
          {/* Color Picker Dialog */}
          <Dialog open={showColorPicker} onClose={() => setShowColorPicker(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Choose Color</DialogTitle>
            <DialogContent>
              <Stack spacing={2.5} sx={{ mt: 2 }}>
                <input
                  type="color"
                  value={
                    activeColorField === "dots" ? options.dotsOptions.color :
                    activeColorField === "corners" ? options.cornersSquareOptions.color :
                    options.backgroundOptions.color
                  }
                  onChange={(e) => updateColor(e.target.value)}
                  style={{ width: "100%", height: 100, cursor: "pointer", borderRadius: 8 }}
                />
                <Typography variant="body2" gutterBottom fontWeight={500}>
                  Preset Colors
                </Typography>
                <Box sx={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(6, 1fr)", 
                  gap: 1.5 
                }}>
                  {["#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"].map(color => (
                    <Box
                      key={color}
                      sx={{
                        width: "100%",
                        aspectRatio: "1/1",
                        bgcolor: color,
                        borderRadius: 2,
                        cursor: "pointer",
                        border: `2px solid ${theme.palette.divider}`,
                        transition: "transform 0.2s",
                        '&:hover': { transform: "scale(1.05)" },
                      }}
                      onClick={() => updateColor(color)}
                    />
                  ))}
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowColorPicker(false)}>Close</Button>
            </DialogActions>
          </Dialog>
          
          {/* Logo Upload Dialog */}
          <Dialog open={logoDialogOpen} onClose={() => setLogoDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Upload Logo</DialogTitle>
            <DialogContent>
              <Box sx={{ textAlign: "center", py: 3 }}>
                <input
                  accept="image/png,image/jpeg,image/jpg"
                  type="file"
                  id="logo-upload"
                  style={{ display: "none" }}
                  onChange={handleLogoUpload}
                />
                <label htmlFor="logo-upload">
                  <Button variant="contained" component="span" startIcon={<UploadIcon />}>
                    Choose Image
                  </Button>
                </label>
                <Typography variant="caption" display="block" sx={{ mt: 2 }} color="textSecondary">
                  PNG or JPG, max 2MB. Recommended: 200x200px
                </Typography>
                {logoPreview && (
                  <Box sx={{ mt: 2 }}>
                    <img src={logoPreview} alt="Logo preview" style={{ maxWidth: 100, maxHeight: 100 }} />
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLogoDialogOpen(false)}>Cancel</Button>
            </DialogActions>
          </Dialog>
          
          {/* SVG Code Dialog with VS Code-like Editor */}
          <Dialog 
            open={svgCodeDialogOpen} 
            onClose={() => setSvgCodeDialogOpen(false)} 
            maxWidth="lg" 
            fullWidth
            PaperProps={{
              sx: {
                height: "80vh",
                maxHeight: "80vh",
              }
            }}
          >
            <DialogTitle sx={{ 
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CodeIcon color="primary" />
                <Typography variant="h6">SVG Code Editor</Typography>
                {svgCode && (
                  <Chip 
                    label={`${getLineCount()} lines`} 
                    size="small" 
                    variant="outlined" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Box>
              <Button
                variant="contained"
                startIcon={codeCopied ? <ContentCopyIcon /> : <CopyIcon />}
                onClick={copySVGCode}
                disabled={!svgCode || codeCopied}
                color={codeCopied ? "success" : "primary"}
              >
                {codeCopied ? "Copied!" : "Copy Code"}
              </Button>
            </DialogTitle>
            <DialogContent sx={{ p: 0, overflow: "hidden" }}>
              <Box sx={{ height: "100%", overflow: "auto" }}>
                {svgCode ? (
                  <SyntaxHighlighter
                    language="svg"
                    style={mode === "dark" ? vscDarkPlus : vs}
                    showLineNumbers={true}
                    wrapLines={true}
                    wrapLongLines={false}
                    customStyle={{
                      margin: 0,
                      padding: "20px",
                      fontSize: "13px",
                      fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace",
                      height: "100%",
                      minHeight: "400px",
                    }}
                    lineNumberStyle={{
                      minWidth: "3em",
                      paddingRight: "1em",
                      color: "#858585",
                      userSelect: "none",
                    }}
                  >
                    {svgCode}
                  </SyntaxHighlighter>
                ) : (
                  <Box 
                    sx={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      height: "100%",
                      minHeight: 400,
                      flexDirection: "column",
                      gap: 2
                    }}
                  >
                    <CodeIcon sx={{ fontSize: 64, color: "text.disabled" }} />
                    <Typography color="textSecondary">
                      Generate a QR code first to see SVG code
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ 
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              p: 2
            }}>
              <Button onClick={() => setSvgCodeDialogOpen(false)}>Close</Button>
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />} 
                onClick={() => handleDownload("svg")}
                disabled={!svgCode}
              >
                Download SVG File
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </Box>
  );
};

export default QRCodeGenerator;