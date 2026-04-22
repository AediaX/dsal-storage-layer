// BarcodeGenerator.jsx
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
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
} from "@mui/material";
import {
  ColorLens as ColorLensIcon,
  Refresh as RefreshIcon,
  FileCopy as CopyIcon,
  PictureAsPdf as PdfIcon,
  PhotoCamera as PhotoIcon,
  ArrowBack as ArrowBackIcon,
  Code as CodeIcon,
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon,
  QrCodeScanner as ScannerIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import jsBarcode from "jsbarcode";
import jsPDF from "jspdf";
import { useThemeContext } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { 
  vscDarkPlus, 
  vs 
} from "react-syntax-highlighter/dist/esm/styles/prism";

import {Barcode as BarcodeIcon} from "lucide-react";    

const BarcodeGenerator = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode } = useThemeContext();
  const barcodeContainerRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // Barcode Data
  const [barcodeData, setBarcodeData] = useState({
    data: "",
    format: "CODE128",
  });
  
  // Validation state
  const [validation, setValidation] = useState({
    isValid: true,
    message: "",
    example: "ABC123456789",
  });
  
  // Barcode Options
  const [options, setOptions] = useState({
    format: "CODE128",
    width: 2,
    height: 100,
    displayValue: true,
    textMargin: 10,
    fontSize: 16,
    background: "#ffffff",
    lineColor: "#000000",
    margin: 10,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    flat: false,
  });
  
  const [svgCode, setSvgCode] = useState("");
  const [svgCodeDialogOpen, setSvgCodeDialogOpen] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  
  // Color pickers
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeColorField, setActiveColorField] = useState("");
  
  // Barcode formats with detailed specifications
  const barcodeFormats = [
    { 
      value: "CODE128", 
      label: "CODE 128", 
      description: "Alphanumeric, high density",
      allowedChars: "All ASCII characters (0-9, A-Z, a-z, special chars)",
      maxLength: "Unlimited",
      minLength: 1,
      // eslint-disable-next-line no-control-regex
      pattern: /^[\x00-\x7F]+$/,
      example: "ABC123abc-456",
      usage: "Shipping, logistics, inventory"
    },
    { 
      value: "EAN13", 
      label: "EAN-13", 
      description: "13-digit product code",
      allowedChars: "Numbers only",
      maxLength: 13,
      minLength: 12,
      pattern: /^\d{12,13}$/,
      example: "5901234123457",
      usage: "Retail products, books"
    },
    { 
      value: "EAN8", 
      label: "EAN-8", 
      description: "8-digit product code",
      allowedChars: "Numbers only",
      maxLength: 8,
      minLength: 7,
      pattern: /^\d{7,8}$/,
      example: "12345670",
      usage: "Small retail products"
    },
    { 
      value: "UPC", 
      label: "UPC", 
      description: "Universal Product Code",
      allowedChars: "Numbers only",
      maxLength: 12,
      minLength: 11,
      pattern: /^\d{11,12}$/,
      example: "123456789012",
      usage: "North American retail"
    },
    { 
      value: "CODE39", 
      label: "CODE 39", 
      description: "Alphanumeric, variable length",
      allowedChars: "A-Z, 0-9, -, ., $, /, +, %, space",
      maxLength: "Unlimited",
      minLength: 1,
      pattern: /^[A-Z0-9\-\\.\\$\\/\\+% ]+$/,
      example: "ABC-123",
      usage: "Military, automotive"
    },
    { 
      value: "ITF", 
      label: "ITF-14", 
      description: "Interleaved 2 of 5",
      allowedChars: "Numbers only (even number of digits)",
      maxLength: "Unlimited",
      minLength: 2,
      pattern: /^\d+$/,
      example: "12345678901234",
      usage: "Carton labeling, logistics"
    },
    { 
      value: "MSI", 
      label: "MSI", 
      description: "MSI Plessey",
      allowedChars: "Numbers only",
      maxLength: "Unlimited",
      minLength: 1,
      pattern: /^\d+$/,
      example: "1234567",
      usage: "Inventory management"
    },
    { 
      value: "Pharmacode", 
      label: "Pharmacode", 
      description: "Pharmaceutical code",
      allowedChars: "Numbers only (1-999999)",
      maxLength: 6,
      minLength: 1,
      pattern: /^[1-9]\d{0,5}$/,
      example: "123456",
      usage: "Pharmaceutical packaging"
    },
    { 
      value: "Codabar", 
      label: "Codabar", 
      description: "Numeric + dash, dollar, etc",
      allowedChars: "0-9, -, $, :, /, ., +, A, B, C, D",
      maxLength: "Unlimited",
      minLength: 2,
      pattern: /^[0-9\-\\$:\\/\\.\\+ABCD]+$/,
      example: "A123456B",
      usage: "Libraries, blood banks"
    },
  ];

  // Size presets
  const sizePresets = [
    { label: "Small", width: 1, height: 60 },
    { label: "Medium", width: 2, height: 100 },
    { label: "Large", width: 3, height: 140 },
    { label: "XL", width: 4, height: 180 },
  ];

  // Validate data based on format
  const validateData = useCallback((data, format) => {
    const formatInfo = barcodeFormats.find(f => f.value === format);
    if (!formatInfo) return { isValid: true, message: "" };
    
    if (!data) {
      return { isValid: false, message: "Please enter barcode data" };
    }
    
    // Check length requirements
    if (formatInfo.maxLength !== "Unlimited" && data.length > formatInfo.maxLength) {
      return { 
        isValid: false, 
        message: `Maximum length is ${formatInfo.maxLength} characters` 
      };
    }
    
    if (data.length < formatInfo.minLength) {
      return { 
        isValid: false, 
        message: `Minimum length is ${formatInfo.minLength} characters` 
      };
    }
    
    // Check pattern
    if (formatInfo.pattern && !formatInfo.pattern.test(data)) {
      return { 
        isValid: false, 
        message: `Invalid characters. Allowed: ${formatInfo.allowedChars}` 
      };
    }
    
    // Special validation for EAN13 (checksum)
    if (format === "EAN13" && data.length === 12) {
      return { 
        isValid: true, 
        message: "Auto-checksum will be calculated", 
        warning: true 
      };
    }
    
    // Special validation for EAN8 (checksum)
    if (format === "EAN8" && data.length === 7) {
      return { 
        isValid: true, 
        message: "Auto-checksum will be calculated", 
        warning: true 
      };
    }
    
    // Special validation for UPC (checksum)
    if (format === "UPC" && data.length === 11) {
      return { 
        isValid: true, 
        message: "Auto-checksum will be calculated", 
        warning: true 
      };
    }
    
    return { isValid: true, message: "Valid format" };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate Barcode
  const generateBarcode = useCallback(() => {
    if (!barcodeData.data || !barcodeContainerRef.current) return;
    
    // Validate before generating
    const validationResult = validateData(barcodeData.data, options.format);
    setValidation(validationResult);
    
    if (!validationResult.isValid) {
      showNotification(validationResult.message, "error");
      return;
    }
    
    setLoading(true);
    
    try {
      // Clear previous barcode
      while (barcodeContainerRef.current.firstChild) {
        barcodeContainerRef.current.removeChild(barcodeContainerRef.current.firstChild);
      }
      
      // Create SVG element
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      barcodeContainerRef.current.appendChild(svg);
      
      // Prepare data (auto-calculate checksum for some formats)
      let processedData = barcodeData.data;
      
      // Generate barcode
      jsBarcode(svg, processedData, {
        format: options.format,
        width: options.width,
        height: options.height,
        displayValue: options.displayValue,
        textMargin: options.textMargin,
        fontSize: options.fontSize,
        background: options.background,
        lineColor: options.lineColor,
        margin: options.margin,
        marginTop: options.marginTop,
        marginBottom: options.marginBottom,
        marginLeft: options.marginLeft,
        marginRight: options.marginRight,
        flat: options.flat,
        valid: (valid) => {
          if (!valid) {
            showNotification("Invalid data for selected format", "error");
          }
        },
      });
      
      // Extract SVG code
      setTimeout(() => {
        const svgElement = barcodeContainerRef.current.querySelector("svg");
        if (svgElement) {
          const serializer = new XMLSerializer();
          let svgString = serializer.serializeToString(svgElement);
          svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
          setSvgCode(svgString);
        }
      }, 100);
      
    } catch (error) {
      console.error("Error generating barcode:", error);
      showNotification("Failed to generate barcode. Check your input data.", "error");
    } finally {
      setLoading(false);
    }
  }, [barcodeData.data, options, validateData]);

  // Generate on data/options change with debounce
  useEffect(() => {
    if (barcodeData.data) {
      // Real-time validation
      const validationResult = validateData(barcodeData.data, options.format);
      setValidation(validationResult);
      
      const timer = setTimeout(() => {
        if (validationResult.isValid) {
          generateBarcode();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    barcodeData.data,
    barcodeData.format,
    options.format,
    options.width,
    options.height,
    options.displayValue,
    options.textMargin,
    options.fontSize,
    options.background,
    options.lineColor,
    options.margin,
    options.flat,
    generateBarcode,
    validateData
  ]);

  const showNotification = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleDownload = async (format) => {
    if (!svgCode) {
      showNotification("Generate a barcode first", "warning");
      return;
    }
    
    try {
      if (format === "svg") {
        const blob = new Blob([svgCode], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `barcode_${barcodeData.data || "output"}.svg`;
        link.click();
        URL.revokeObjectURL(url);
        showNotification("Barcode downloaded as SVG");
      } else if (format === "png") {
        const svgElement = barcodeContainerRef.current?.querySelector("svg");
        if (svgElement) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const svgString = new XMLSerializer().serializeToString(svgElement);
          const img = new Image();
          
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = options.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = pngUrl;
            link.download = `barcode_${barcodeData.data || "output"}.png`;
            link.click();
            showNotification("Barcode downloaded as PNG");
          };
          
          img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
        }
      } else if (format === "jpg") {
        const svgElement = barcodeContainerRef.current?.querySelector("svg");
        if (svgElement) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const svgString = new XMLSerializer().serializeToString(svgElement);
          const img = new Image();
          
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.fillStyle = options.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            const jpgUrl = canvas.toDataURL("image/jpeg", 0.9);
            const link = document.createElement("a");
            link.href = jpgUrl;
            link.download = `barcode_${barcodeData.data || "output"}.jpg`;
            link.click();
            showNotification("Barcode downloaded as JPG");
          };
          
          img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
        }
      } else if (format === "pdf") {
        await downloadAsPDF();
      }
    } catch (error) {
      console.error("Download error:", error);
      showNotification("Failed to download barcode", "error");
    }
  };

  const downloadAsPDF = async () => {
    const svgElement = barcodeContainerRef.current?.querySelector("svg");
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
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });
        
        const imgWidth = 180;
        const imgHeight = (img.height * imgWidth) / img.width;
        const x = (pdf.internal.pageSize.width - imgWidth) / 2;
        const y = (pdf.internal.pageSize.height - imgHeight) / 2;
        
        pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
        pdf.save(`barcode_${barcodeData.data || "output"}.pdf`);
        showNotification("Barcode downloaded as PDF");
      };
      
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
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
      showNotification("Generate barcode first", "warning");
    }
  };

  const copyBarcode = async () => {
    const svgElement = barcodeContainerRef.current?.querySelector("svg");
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
            showNotification("Barcode copied to clipboard");
          } catch (err) {
            showNotification("Failed to copy", "error");
          }
        });
      };
      
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    }
  };

  const updateColor = (color) => {
    setOptions(prev => ({
      ...prev,
      [activeColorField === "line" ? "lineColor" : "background"]: color
    }));
    setShowColorPicker(false);
  };

  const resetToDefault = () => {
    setOptions({
      ...options,
      width: 2,
      height: 100,
      background: "#ffffff",
      lineColor: "#000000",
      displayValue: true,
      fontSize: 16,
      textMargin: 10,
      flat: false,
    });
    showNotification("Reset to default");
  };

  const handleFormatChange = (format) => {
    const formatInfo = barcodeFormats.find(f => f.value === format);
    setOptions(prev => ({ ...prev, format }));
    setBarcodeData(prev => ({ ...prev, format }));
    
    // Set example data for the selected format
    if (formatInfo) {
      setBarcodeData(prev => ({ ...prev, data: formatInfo.example }));
      setValidation({
        isValid: true,
        message: "",
        example: formatInfo.example,
      });
    }
  };

  const getLineCount = () => {
    if (!svgCode) return 0;
    return svgCode.split('\n').length;
  };

  // Get current format info
  const currentFormat = barcodeFormats.find(f => f.value === options.format);

  // Generate dynamic input field based on format
  const renderDynamicInput = () => {
    const format = currentFormat;
    if (!format) return null;

    // Special input for numeric formats with formatting options
    if (format.value === "EAN13" || format.value === "EAN8" || format.value === "UPC") {
      return (
        <TextField
          fullWidth
          label="Barcode Data"
          placeholder={format.example}
          value={barcodeData.data}
          onChange={(e) => {
            // Only allow numbers
            const value = e.target.value.replace(/[^\d]/g, '');
            setBarcodeData({ ...barcodeData, data: value });
          }}
          error={!validation.isValid && !validation.warning}
          helperText={
            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {validation.isValid ? (
                validation.warning ? (
                  <WarningIcon sx={{ fontSize: 16, color: "warning.main" }} />
                ) : (
                  <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
                )
              ) : (
                <InfoIcon sx={{ fontSize: 16 }} />
              )}
              {validation.message || `Enter ${format.minLength}-${format.maxLength} digits`}
            </Box>
          }
          FormHelperTextProps={{ sx: { mt: 1 } }}
          inputProps={{
            maxLength: format.maxLength,
            inputMode: "numeric",
          }}
          InputProps={{
            startAdornment: format.value === "EAN13" && barcodeData.data.length === 12 && (
              <InputAdornment position="start">
                <Chip label="Checksum auto" size="small" color="info" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      );
    }

    // Special input for CODE39 with uppercase conversion
    if (format.value === "CODE39") {
      return (
        <TextField
          fullWidth
          label="Barcode Data"
          placeholder={format.example}
          value={barcodeData.data}
          onChange={(e) => {
            // Convert to uppercase and allow only valid chars
            let value = e.target.value.toUpperCase();
            value = value.replace(/[^A-Z0-9\-\\.\\$\\/\\+% ]/g, '');
            setBarcodeData({ ...barcodeData, data: value });
          }}
          error={!validation.isValid}
          helperText={
            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {validation.isValid ? (
                <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
              ) : (
                <InfoIcon sx={{ fontSize: 16 }} />
              )}
              {validation.message || "Allowed: A-Z, 0-9, -, ., $, /, +, %, space"}
            </Box>
          }
          inputProps={{
            maxLength: 50,
          }}
          sx={{ mb: 2 }}
        />
      );
    }

    // Special input for Pharmacode (1-999999)
    if (format.value === "Pharmacode") {
      return (
        <TextField
          fullWidth
          label="Barcode Data"
          placeholder={format.example}
          value={barcodeData.data}
          onChange={(e) => {
            const value = e.target.value.replace(/[^\d]/g, '');
            const num = parseInt(value);
            if (value === "" || (num >= 1 && num <= 999999)) {
              setBarcodeData({ ...barcodeData, data: value });
            }
          }}
          error={!validation.isValid}
          helperText={
            <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {validation.isValid ? (
                <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
              ) : (
                <InfoIcon sx={{ fontSize: 16 }} />
              )}
              {validation.message || "Enter a number between 1 and 999,999"}
            </Box>
          }
          inputProps={{
            inputMode: "numeric",
          }}
          sx={{ mb: 2 }}
        />
      );
    }

    // Default input for other formats
    return (
      <TextField
        fullWidth
        label="Barcode Data"
        placeholder={format.example}
        value={barcodeData.data}
        onChange={(e) => setBarcodeData({ ...barcodeData, data: e.target.value })}
        error={!validation.isValid}
        helperText={
          <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {validation.isValid ? (
              <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
            ) : (
              <InfoIcon sx={{ fontSize: 16 }} />
            )}
            {validation.message || `Example: ${format.example}`}
          </Box>
        }
        sx={{ mb: 2 }}
      />
    );
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
          <BarcodeIcon sx={{ mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h6" sx={{ flex: 1, fontWeight: 700 }}>
            Barcode Generator
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ScannerIcon />}
            onClick={() => navigate("/user/qr-code-generator")}
            sx={{ mr: 1 }}
          >
            QR Code
          </Button>
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
                  Barcode Content
                </Typography>
                
                {/* Barcode Format Selection */}
                <FormControl fullWidth sx={{ mb: 2.5 }}>
                  <InputLabel>Barcode Format</InputLabel>
                  <Select
                    value={options.format}
                    onChange={(e) => handleFormatChange(e.target.value)}
                    label="Barcode Format"
                  >
                    {barcodeFormats.map(format => (
                      <MenuItem key={format.value} value={format.value}>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>{format.label}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {format.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Dynamic Input Field based on format */}
                {renderDynamicInput()}
                
                {/* Format Information Card */}
                {currentFormat && (
                  <Alert 
                    severity="info" 
                    sx={{ mb: 3, borderRadius: 2 }}
                    icon={<InfoIcon />}
                  >
                    <Typography variant="subtitle2" fontWeight={600}>
                      {currentFormat.label} Specifications
                    </Typography>
                    <Typography variant="caption" display="block">
                      <strong>Allowed:</strong> {currentFormat.allowedChars}
                    </Typography>
                    <Typography variant="caption" display="block">
                      <strong>Length:</strong> {currentFormat.maxLength === "Unlimited" ? "Variable" : `${currentFormat.minLength}-${currentFormat.maxLength} characters`}
                    </Typography>
                    <Typography variant="caption" display="block">
                      <strong>Usage:</strong> {currentFormat.usage}
                    </Typography>
                  </Alert>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                {/* Styling Options */}
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Appearance
                </Typography>
                
                {/* Size Control */}
                <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
                  Bar Width: {options.width}px | Height: {options.height}px
                </Typography>
                <Stack spacing={2} sx={{ mb: 3 }}>
                  <Box>
                    <Typography variant="caption">Bar Width</Typography>
                    <Slider
                      value={options.width}
                      onChange={(e, val) => setOptions({ ...options, width: val })}
                      min={1}
                      max={5}
                      step={0.5}
                      marks={sizePresets.map(preset => ({ value: preset.width, label: preset.label }))}
                    />
                  </Box>
                  <Box>
                    <Typography variant="caption">Height</Typography>
                    <Slider
                      value={options.height}
                      onChange={(e, val) => setOptions({ ...options, height: val })}
                      min={50}
                      max={200}
                      step={5}
                    />
                  </Box>
                </Stack>
                
                {/* Color Controls */}
                <Box sx={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(2, 1fr)", 
                  gap: 1.5,
                  mb: 3 
                }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<ColorLensIcon />}
                    onClick={() => {
                      setActiveColorField("line");
                      setShowColorPicker(true);
                    }}
                    sx={{ 
                      borderColor: options.lineColor, 
                      color: options.lineColor,
                      '&:hover': { borderColor: options.lineColor }
                    }}
                  >
                    Bar Color
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
                      borderColor: options.background, 
                      color: options.background,
                      '&:hover': { borderColor: options.background }
                    }}
                  >
                    Background
                  </Button>
                </Box>
                
                {/* Text Options */}
                <Box sx={{ mb: 2.5 }}>
                  <ToggleButtonGroup
                    value={options.displayValue}
                    exclusive
                    onChange={(e, val) => val !== null && setOptions({ ...options, displayValue: val })}
                    sx={{ mb: 2, width: "100%" }}
                  >
                    <ToggleButton value={true} sx={{ flex: 1 }}>Show Text</ToggleButton>
                    <ToggleButton value={false} sx={{ flex: 1 }}>Hide Text</ToggleButton>
                  </ToggleButtonGroup>
                  
                  {options.displayValue && (
                    <>
                      <TextField
                        fullWidth
                        type="number"
                        label="Font Size"
                        value={options.fontSize}
                        onChange={(e) => setOptions({ ...options, fontSize: parseInt(e.target.value) || 16 })}
                        sx={{ mb: 1 }}
                        inputProps={{ min: 8, max: 32 }}
                      />
                      <TextField
                        fullWidth
                        type="number"
                        label="Text Margin"
                        value={options.textMargin}
                        onChange={(e) => setOptions({ ...options, textMargin: parseInt(e.target.value) || 10 })}
                        inputProps={{ min: 0, max: 50 }}
                      />
                    </>
                  )}
                </Box>
                
                {/* Advanced Options */}
                <Box sx={{ mb: 2.5 }}>
                  <ToggleButtonGroup
                    value={options.flat}
                    exclusive
                    onChange={(e, val) => val !== null && setOptions({ ...options, flat: val })}
                    sx={{ width: "100%" }}
                  >
                    <ToggleButton value={false} sx={{ flex: 1 }}>Standard</ToggleButton>
                    <ToggleButton value={true} sx={{ flex: 1 }}>Flat (No rounded)</ToggleButton>
                  </ToggleButtonGroup>
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
                    onClick={generateBarcode}
                    disabled={!barcodeData.data || !validation.isValid}
                    startIcon={<BarcodeIcon />}
                    fullWidth
                  >
                    Generate
                  </Button>
                </Stack>
              </Paper>
            </motion.div>
            
            {/* Right Panel - Barcode Display & Download */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Paper sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 4, height: "100%", display: "flex", flexDirection: "column" }}>
                <Typography variant="h6" fontWeight={700} gutterBottom textAlign="center">
                  Preview
                </Typography>
                
                {/* Barcode Display */}
                <Box
                  ref={barcodeContainerRef}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: { xs: 250, sm: 300 },
                    mb: 3,
                    p: 3,
                    background: alpha(theme.palette.background.default, 0.5),
                    borderRadius: 2,
                    overflow: "auto",
                  }}
                />
                
                {loading && (
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                    <CircularProgress />
                  </Box>
                )}
                
                {!barcodeData.data && (
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                    Enter data and select a format to generate your barcode
                  </Alert>
                )}
                
                {/* Download Options */}
                {svgCode && (
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
                        <Button size="small" variant="contained" startIcon={<PdfIcon />} onClick={() => handleDownload("pdf")}>
                          PDF
                        </Button>
                      </Tooltip>
                      <Tooltip title="Copy to Clipboard">
                        <Button size="small" variant="outlined" startIcon={<CopyIcon />} onClick={copyBarcode}>
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
                      <Alert severity="success" sx={{ mt: 1, borderRadius: 2 }} icon={<CheckCircleIcon />}>
                        Barcode generated successfully! Click "SVG Code" to view in code editor.
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
                  value={activeColorField === "line" ? options.lineColor : options.background}
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
                <Typography variant="h6">SVG Code Editor - Barcode</Typography>
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
                    <BarcodeIcon sx={{ fontSize: 64, color: "text.disabled" }} />
                    <Typography color="textSecondary">
                      Generate a barcode first to see SVG code
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

export default BarcodeGenerator;