// CertificateDetail.jsx - Page 2: Certificate management for specific intern
import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
  Toolbar,
  AppBar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Divider,
  Tooltip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Search,
  Edit,
  Delete,
  Visibility,
  Refresh,
  Close,
  Save,
  Cancel,
  CloudUpload,
  Download,
  PictureAsPdf,
  Description,
  School,
  Work,
  EmojiEvents,
  Business,
  MenuBook,
  VerifiedUser,
  Add,
  FilterList,
  ArrowBack,
  Image as ImageIcon,
  InsertDriveFile,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import {
  getFirestore,
  doc,
  updateDoc,
  getDocs,
  Timestamp,
  arrayUnion,
  arrayRemove,
  query,
  collection,
  
} from "firebase/firestore";
import { app } from "../../lib/firebase";
import { useNavigate, useParams } from "react-router-dom";
import { uploadCertificateToGitHub, deleteFileFromGitHub } from "../../lib/githubUploadCertificate";

const db = getFirestore(app);

const certificateTypes = [
  { value: "internship", label: "Internship", icon: <Work />, color: "#1976d2" },
  { value: "project", label: "Project", icon: <MenuBook />, color: "#2e7d32" },
  { value: "competition", label: "Competition", icon: <EmojiEvents />, color: "#ed6c02" },
  { value: "experience", label: "Experience", icon: <Business />, color: "#9c27b0" },
  { value: "part_time_job", label: "Part Time Job", icon: <Work />, color: "#d32f2f" },
  { value: "course", label: "Course", icon: <School />, color: "#0288d1" },
  { value: "other", label: "Other", icon: <Description />, color: "#757575" },
];

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  if (timestamp?.toDate) {
    return timestamp.toDate().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  return new Date(timestamp).toLocaleDateString("en-IN");
};

// Helper function to parse comma-separated tags
const parseTagsFromInput = (input) => {
  if (!input || !input.trim()) return [];
  // Split by comma, trim each tag, remove empty ones
  return input.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
};

const CertificateDetail = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const { id } = useParams();

  const [intern, setIntern] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState("uploadedAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    certificateType: "internship",
    title: "",
    subTitle: "",
    tags: [],
    tagInput: "",
    issueDate: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  const fetchIntern = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const q = query(collection(db, "internshipApplications"));
      const querySnapshot = await getDocs(q);
      let foundIntern = null;
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        if (data.registrationNumber === id || doc.id === id) {
          foundIntern = data;
        }
      });
      
      if (foundIntern) {
        let displayUniversity = foundIntern.university;
        if (foundIntern.university === "Other" && foundIntern.customUniversity) {
          displayUniversity = foundIntern.customUniversity;
        }
        foundIntern.displayUniversity = displayUniversity;
        
        if (foundIntern.status !== "completed") {
          setError("This intern has not completed their internship. Only completed interns can have certificates.");
        }
        
        setIntern(foundIntern);
        const certs = foundIntern.certificates || [];
        setCertificates(certs);
        setFilteredCertificates(certs);
      } else {
        setError("Intern not found");
      }
    } catch (err) {
      console.error("Error fetching intern:", err);
      setError("Failed to load intern data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIntern();
  }, [fetchIntern]);

  useEffect(() => {
    let result = [...certificates];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (cert) =>
          cert.title?.toLowerCase().includes(term) ||
          cert.subTitle?.toLowerCase().includes(term) ||
          cert.tags?.some(tag => tag.toLowerCase().includes(term)) ||
          cert.certificateType?.toLowerCase().includes(term)
      );
    }
    
    if (typeFilter !== "all") {
      result = result.filter((cert) => cert.certificateType === typeFilter);
    }
    
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === "uploadedAt" || sortField === "issueDate") {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else if (typeof aVal === "string") {
        aVal = aVal?.toLowerCase() || "";
        bVal = bVal?.toLowerCase() || "";
      } else {
        aVal = aVal || "";
        bVal = bVal || "";
      }
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    setFilteredCertificates(result);
    setPage(0);
  }, [certificates, searchTerm, typeFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setFilePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleAddTag = () => {
    const tags = parseTagsFromInput(uploadFormData.tagInput);
    if (tags.length > 0) {
      setUploadFormData(prev => ({
        ...prev,
        tags: [...prev.tags, ...tags],
        tagInput: ""
      }));
    }
  };

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setUploadFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleEditAddTag = () => {
    const tags = parseTagsFromInput(editFormData.tagInput);
    if (tags.length > 0) {
      setEditFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), ...tags],
        tagInput: ""
      }));
    }
  };

  const handleEditTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditAddTag();
    }
  };

  const handleEditRemoveTag = (tagToRemove) => {
    setEditFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUploadCertificate = async () => {
    if (!selectedFile) {
      setSnackbar({ open: true, message: "Please select a file to upload", type: "error" });
      return;
    }
    if (!uploadFormData.title.trim()) {
      setSnackbar({ open: true, message: "Please enter certificate title", type: "error" });
      return;
    }

    setUploading(true);
    try {
      const uploadResult = await uploadCertificateToGitHub(selectedFile);
      
      if (!uploadResult.success) {
        throw new Error("Failed to upload to GitHub");
      }

      const newCertificate = {
        id: Date.now().toString(),
        certificateType: uploadFormData.certificateType,
        title: uploadFormData.title,
        subTitle: uploadFormData.subTitle || "",
        tags: uploadFormData.tags,
        url: uploadResult.url,
        fileName: uploadResult.fileName,
        originalName: uploadResult.originalName,
        fileSize: uploadResult.fileSize,
        fileType: uploadResult.fileType,
        extension: uploadResult.extension,
        issueDate: uploadFormData.issueDate || null,
        uploadedAt: new Date().toISOString(),
        githubRepo: uploadResult.repo,
        githubPath: uploadResult.path,
      };

      const internRef = doc(db, "internshipApplications", intern.id);
      await updateDoc(internRef, {
        certificates: arrayUnion(newCertificate),
        updatedAt: Timestamp.now(),
      });

      setCertificates(prev => [...prev, newCertificate]);
      
      setSnackbar({ open: true, message: "Certificate uploaded successfully!", type: "success" });
      setUploadDialogOpen(false);
      resetUploadForm();
    } catch (err) {
      console.error("Upload error:", err);
      setSnackbar({ open: true, message: "Failed to upload certificate", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadFormData({
      certificateType: "internship",
      title: "",
      subTitle: "",
      tags: [],
      tagInput: "",
      issueDate: "",
    });
  };

  const handleEditClick = (certificate) => {
    setEditingCertificate(certificate);
    setEditFormData({
      certificateType: certificate.certificateType,
      title: certificate.title,
      subTitle: certificate.subTitle || "",
      tags: certificate.tags || [],
      tagInput: "",
      issueDate: certificate.issueDate || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdateCertificate = async () => {
    if (!editingCertificate) return;
    setUpdating(true);
    try {
      const updatedCertificate = {
        ...editingCertificate,
        certificateType: editFormData.certificateType,
        title: editFormData.title,
        subTitle: editFormData.subTitle,
        tags: editFormData.tags,
        issueDate: editFormData.issueDate,
        updatedAt: new Date().toISOString(),
      };

      const internRef = doc(db, "internshipApplications", intern.id);
      await updateDoc(internRef, {
        certificates: arrayRemove(editingCertificate)
      });
      await updateDoc(internRef, {
        certificates: arrayUnion(updatedCertificate),
        updatedAt: Timestamp.now(),
      });

      setCertificates(prev => 
        prev.map(cert => 
          cert.id === editingCertificate.id ? updatedCertificate : cert
        )
      );

      setSnackbar({ open: true, message: "Certificate updated successfully!", type: "success" });
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Update error:", err);
      setSnackbar({ open: true, message: "Failed to update certificate", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteClick = (certificate) => {
    setCertificateToDelete(certificate);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCertificate = async () => {
    if (!certificateToDelete) return;
    setDeleting(true);
    try {
      if (certificateToDelete.githubRepo && certificateToDelete.githubPath) {
        await deleteFileFromGitHub(
          certificateToDelete.url,
          certificateToDelete.githubRepo,
          certificateToDelete.githubPath
        );
      }

      const internRef = doc(db, "internshipApplications", intern.id);
      await updateDoc(internRef, {
        certificates: arrayRemove(certificateToDelete),
        updatedAt: Timestamp.now(),
      });

      setCertificates(prev => prev.filter(cert => cert.id !== certificateToDelete.id));

      setSnackbar({ open: true, message: "Certificate deleted successfully!", type: "success" });
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Delete error:", err);
      setSnackbar({ open: true, message: "Failed to delete certificate", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (certificate) => {
    try {
      const response = await fetch(certificate.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = certificate.originalName || `${certificate.title}.${certificate.extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      setSnackbar({ open: true, message: "Failed to download certificate", type: "error" });
    }
  };

  const getCertificateTypeInfo = (type) => {
    return certificateTypes.find(t => t.value === type) || certificateTypes.find(t => t.value === "other");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
  };

  const paginatedCertificates = filteredCertificates.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* AppBar with no border radius */}
      <AppBar position="fixed" sx={{ borderRadius: 0 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/admin/internship/certificates')} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Certificate Upload
          </Typography>
          <Tooltip title="Refresh">
            <IconButton color="inherit" onClick={fetchIntern}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ pt: { xs: 10, sm: 12 }, pb: 4, px: { xs: 2, sm: 3 } }}>
        <Fade in timeout={500}>
          <Box>
            {error ? (
              <Alert severity="error" sx={{ borderRadius: 2, mb: 2 }}>{error}</Alert>
            ) : intern && (
              <>
                <Zoom in timeout={300}>
                  <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center" }}>
                      <Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          {intern.fullName}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {intern.email} • {intern.phone}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Reg: {intern.registrationNumber} • {intern.chosenCourse}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          {intern.displayUniversity}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<VerifiedUser />}
                        label="Completed"
                        sx={{ fontWeight: 600, mt: isMobile ? 2 : 0 }}
                      />
                    </Box>
                  </Paper>
                </Zoom>

                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                    Certificates
                    <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                      ({filteredCertificates.length})
                    </Typography>
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" startIcon={<FilterList />} onClick={clearFilters} size={isMobile ? "small" : "medium"}>
                      Clear Filters
                    </Button>
                    <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setUploadDialogOpen(true)} size={isMobile ? "small" : "medium"}>
                      Upload
                    </Button>
                  </Box>
                </Box>

                <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
                  <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                    <TextField
                      fullWidth
                      placeholder="Search certificates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setSearchTerm("")}>
                              <Close fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <FormControl size="small" sx={{ minWidth: isMobile ? "100%" : 200 }}>
                      <InputLabel>Certificate Type</InputLabel>
                      <Select value={typeFilter} label="Certificate Type" onChange={(e) => setTypeFilter(e.target.value)}>
                        <MenuItem value="all">All Types</MenuItem>
                        {certificateTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {type.icon}
                              {type.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Paper>

                {filteredCertificates.length === 0 ? (
                  <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
                    <Description sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No Certificates Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {certificates.length === 0 ? "This intern doesn't have any certificates yet." : "No certificates match your filters."}
                    </Typography>
                    <Button variant="contained" startIcon={<CloudUpload />} onClick={() => setUploadDialogOpen(true)}>
                      Upload First Certificate
                    </Button>
                  </Paper>
                ) : (
                  <>
                    {!isMobile ? (
                      <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>File</TableCell>
                              <TableCell sortDirection={sortField === "title" ? sortDirection : false}>
                                <TableSortLabel active={sortField === "title"} direction={sortField === "title" ? sortDirection : "asc"} onClick={() => handleSort("title")}>
                                  Title
                                </TableSortLabel>
                              </TableCell>
                              <TableCell sortDirection={sortField === "certificateType" ? sortDirection : false}>
                                <TableSortLabel active={sortField === "certificateType"} direction={sortField === "certificateType" ? sortDirection : "asc"} onClick={() => handleSort("certificateType")}>
                                  Type
                                </TableSortLabel>
                              </TableCell>
                              <TableCell>Tags</TableCell>
                              <TableCell sortDirection={sortField === "issueDate" ? sortDirection : false}>
                                <TableSortLabel active={sortField === "issueDate"} direction={sortField === "issueDate" ? sortDirection : "asc"} onClick={() => handleSort("issueDate")}>
                                  Issue Date
                                </TableSortLabel>
                              </TableCell>
                              <TableCell align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {paginatedCertificates.map((cert) => {
                              const typeInfo = getCertificateTypeInfo(cert.certificateType);
                              const isImage = cert.fileType?.startsWith('image/');
                              return (
                                <TableRow key={cert.id} hover>
                                  <TableCell>
                                    <Avatar variant="rounded" sx={{ bgcolor: typeInfo.color, width: 40, height: 40 }}>
                                      {isImage ? <ImageIcon /> : <InsertDriveFile />}
                                    </Avatar>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={600}>{cert.title}</Typography>
                                    {cert.subTitle && <Typography variant="caption" color="text.secondary">{cert.subTitle}</Typography>}
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={typeInfo.label} size="small" sx={{ bgcolor: typeInfo.color, color: "white" }} />
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                      {cert.tags?.slice(0, 2).map((tag, idx) => (
                                        <Chip key={idx} label={tag} size="small" variant="outlined" />
                                      ))}
                                      {cert.tags?.length > 2 && <Chip label={`+${cert.tags.length - 2}`} size="small" />}
                                    </Box>
                                  </TableCell>
                                  <TableCell>{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "N/A"}</TableCell>
                                  <TableCell align="center">
                                    <Tooltip title="View">
                                      <IconButton size="small" onClick={() => { setViewingCertificate(cert); setViewDialogOpen(true); }} color="info">
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Download">
                                      <IconButton size="small" onClick={() => handleDownload(cert)} color="primary">
                                        <Download fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit">
                                      <IconButton size="small" onClick={() => handleEditClick(cert)} color="warning">
                                        <Edit fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                      <IconButton size="small" onClick={() => handleDeleteClick(cert)} color="error">
                                        <Delete fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <AnimatePresence>
                        {paginatedCertificates.map((cert, index) => {
                          const typeInfo = getCertificateTypeInfo(cert.certificateType);
                          const isImage = cert.fileType?.startsWith('image/');
                          return (
                            <motion.div
                              key={cert.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Card sx={{ mb: 2, borderRadius: 3 }}>
                                {isImage && cert.url && (
                                  <CardMedia component="img" height="160" image={`${cert.url.split('?')[0]}?t=${Date.now()}`} alt={cert.title} sx={{ objectFit: "cover", cursor: "pointer" }} onClick={() => { setViewingCertificate(cert); setViewDialogOpen(true); }} />
                                )}
                                <CardContent>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                    <Avatar sx={{ bgcolor: typeInfo.color, width: 32, height: 32 }}>{typeInfo.icon}</Avatar>
                                    <Typography variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>{cert.title}</Typography>
                                    <Chip label={typeInfo.label} size="small" sx={{ bgcolor: typeInfo.color, color: "white" }} />
                                  </Box>
                                  {cert.subTitle && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{cert.subTitle}</Typography>}
                                  {cert.tags?.length > 0 && (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
                                      {cert.tags.map((tag, idx) => <Chip key={idx} label={tag} size="small" variant="outlined" />)}
                                    </Box>
                                  )}
                                  <Typography variant="caption" color="text.secondary">
                                    Issued: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "N/A"} • Uploaded: {formatDate(cert.uploadedAt)}
                                  </Typography>
                                </CardContent>
                                <Divider />
                                <CardActions sx={{ justifyContent: "flex-end", gap: 1, p: 1.5 }}>
                                  <IconButton size="small" onClick={() => { setViewingCertificate(cert); setViewDialogOpen(true); }} color="info"><Visibility fontSize="small" /></IconButton>
                                  <IconButton size="small" onClick={() => handleDownload(cert)} color="primary"><Download fontSize="small" /></IconButton>
                                  <IconButton size="small" onClick={() => handleEditClick(cert)} color="warning"><Edit fontSize="small" /></IconButton>
                                  <IconButton size="small" onClick={() => handleDeleteClick(cert)} color="error"><Delete fontSize="small" /></IconButton>
                                </CardActions>
                              </Card>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}

                    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                      <TablePagination
                        component="div"
                        count={filteredCertificates.length}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                        rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25, 50]}
                      />
                    </Box>
                  </>
                )}
              </>
            )}
          </Box>
        </Fade>
      </Container>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          Upload Certificate
          <IconButton onClick={() => setUploadDialogOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Paper variant="outlined" sx={{ p: 3, textAlign: "center", cursor: "pointer", borderStyle: "dashed", borderWidth: 2 }} onClick={() => document.getElementById('file-input').click()}>
              <input id="file-input" type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={handleFileSelect} />
              {filePreview ? (
                <Box><img src={filePreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain" }} /><Typography variant="caption" sx={{ mt: 1, display: "block" }}>{selectedFile?.name}</Typography></Box>
              ) : selectedFile ? (
                <Box><PictureAsPdf sx={{ fontSize: 64, color: theme.palette.error.main }} /><Typography variant="caption" sx={{ mt: 1, display: "block" }}>{selectedFile.name}</Typography></Box>
              ) : (
                <Box><CloudUpload sx={{ fontSize: 48, color: theme.palette.grey[500], mb: 1 }} /><Typography variant="body2">Click to upload certificate</Typography><Typography variant="caption">Supports images and PDF files</Typography></Box>
              )}
            </Paper>

            <FormControl size="small" fullWidth>
              <InputLabel>Certificate Type</InputLabel>
              <Select value={uploadFormData.certificateType} label="Certificate Type" onChange={(e) => setUploadFormData(prev => ({ ...prev, certificateType: e.target.value }))}>
                {certificateTypes.map((type) => (<MenuItem key={type.value} value={type.value}><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{type.icon}{type.label}</Box></MenuItem>))}
              </Select>
            </FormControl>

            <TextField label="Certificate Title" value={uploadFormData.title} onChange={(e) => setUploadFormData(prev => ({ ...prev, title: e.target.value }))} fullWidth size="small" required />

            <TextField label="Subtitle" value={uploadFormData.subTitle} onChange={(e) => setUploadFormData(prev => ({ ...prev, subTitle: e.target.value }))} fullWidth size="small" />

            <Box>
              <Typography variant="subtitle2" gutterBottom>Tags (separate by commas)</Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField 
                  label="Add Tags (comma separated)" 
                  value={uploadFormData.tagInput} 
                  onChange={(e) => setUploadFormData(prev => ({ ...prev, tagInput: e.target.value }))} 
                  size="small" 
                  fullWidth 
                  onKeyPress={handleTagInputKeyPress}
                  placeholder="e.g., Web Development, React, Frontend"
                />
                <Button variant="outlined" onClick={handleAddTag} startIcon={<Add />}>Add</Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Tip: You can add multiple tags at once by separating them with commas
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {uploadFormData.tags.map((tag, idx) => (
                  <Chip key={idx} label={tag} onDelete={() => handleRemoveTag(tag)} size="small" />
                ))}
              </Box>
            </Box>

            <TextField label="Issue Date" type="date" value={uploadFormData.issueDate} onChange={(e) => setUploadFormData(prev => ({ ...prev, issueDate: e.target.value }))} fullWidth size="small" InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} startIcon={<Cancel />}>Cancel</Button>
          <Button onClick={handleUploadCertificate} variant="contained" startIcon={<CloudUpload />} disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>Edit Certificate<IconButton onClick={() => setEditDialogOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}><Close /></IconButton></DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Certificate Type</InputLabel>
              <Select value={editFormData.certificateType} label="Certificate Type" onChange={(e) => setEditFormData(prev => ({ ...prev, certificateType: e.target.value }))}>
                {certificateTypes.map((type) => (<MenuItem key={type.value} value={type.value}><Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{type.icon}{type.label}</Box></MenuItem>))}
              </Select>
            </FormControl>
            <TextField label="Certificate Title" value={editFormData.title} onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))} fullWidth size="small" />
            <TextField label="Subtitle" value={editFormData.subTitle} onChange={(e) => setEditFormData(prev => ({ ...prev, subTitle: e.target.value }))} fullWidth size="small" />
            <Box>
              <Typography variant="subtitle2" gutterBottom>Tags (separate by commas)</Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
                <TextField 
                  label="Add Tags (comma separated)" 
                  value={editFormData.tagInput || ""} 
                  onChange={(e) => setEditFormData(prev => ({ ...prev, tagInput: e.target.value }))} 
                  size="small" 
                  fullWidth 
                  onKeyPress={handleEditTagInputKeyPress}
                  placeholder="e.g., Web Development, React, Frontend"
                />
                <Button variant="outlined" onClick={handleEditAddTag} startIcon={<Add />}>Add</Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                Tip: You can add multiple tags at once by separating them with commas
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {(editFormData.tags || []).map((tag, idx) => (
                  <Chip key={idx} label={tag} onDelete={() => handleEditRemoveTag(tag)} size="small" />
                ))}
              </Box>
            </Box>
            <TextField label="Issue Date" type="date" value={editFormData.issueDate} onChange={(e) => setEditFormData(prev => ({ ...prev, issueDate: e.target.value }))} fullWidth size="small" InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<Cancel />}>Cancel</Button>
          <Button onClick={handleUpdateCertificate} variant="contained" startIcon={<Save />} disabled={updating}>{updating ? "Saving..." : "Save Changes"}</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>Certificate Details<IconButton onClick={() => setViewDialogOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}><Close /></IconButton></DialogTitle>
        <DialogContent dividers>
          {viewingCertificate && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {viewingCertificate.url && (
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  {viewingCertificate.fileType?.startsWith('image/') ? (
                    <img src={`${viewingCertificate.url.split('?')[0]}?t=${Date.now()}`} alt={viewingCertificate.title} style={{ maxWidth: "100%", maxHeight: 400, objectFit: "contain", borderRadius: 8 }} />
                  ) : (
                    <Paper sx={{ p: 4, textAlign: "center", bgcolor: theme.palette.grey[50] }}>
                      <PictureAsPdf sx={{ fontSize: 80, color: theme.palette.error.main }} />
                      <Button variant="outlined" startIcon={<Download />} onClick={() => handleDownload(viewingCertificate)} sx={{ mt: 2 }}>Download PDF</Button>
                    </Paper>
                  )}
                </Box>
              )}
              <Paper sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>Certificate Information</Typography>
                <Typography variant="body2"><strong>Title:</strong> {viewingCertificate.title}</Typography>
                <Typography variant="body2"><strong>Subtitle:</strong> {viewingCertificate.subTitle || "N/A"}</Typography>
                <Typography variant="body2"><strong>Type:</strong> {getCertificateTypeInfo(viewingCertificate.certificateType)?.label}</Typography>
                <Typography variant="body2"><strong>Tags:</strong> {viewingCertificate.tags?.join(", ") || "None"}</Typography>
                <Typography variant="body2"><strong>Issue Date:</strong> {viewingCertificate.issueDate ? new Date(viewingCertificate.issueDate).toLocaleDateString() : "N/A"}</Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>File Information</Typography>
                <Typography variant="body2"><strong>Original Name:</strong> {viewingCertificate.originalName}</Typography>
                <Typography variant="body2"><strong>File Size:</strong> {(viewingCertificate.fileSize / 1024).toFixed(2)} KB</Typography>
                <Typography variant="body2"><strong>Uploaded:</strong> {formatDate(viewingCertificate.uploadedAt)}</Typography>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Download />} onClick={() => viewingCertificate && handleDownload(viewingCertificate)}>Download</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete "{certificateToDelete?.title}"? This will also remove the file from storage.</Typography></DialogContent>
        <DialogActions><Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button><Button onClick={handleDeleteCertificate} color="error" disabled={deleting}>{deleting ? "Deleting..." : "Delete"}</Button></DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snackbar.type} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default CertificateDetail;