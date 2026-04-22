/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
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
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Snackbar,
  Toolbar,
  AppBar,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Divider,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
} from "@mui/material";
import {
  Search,
  Edit,
  Delete,
  Visibility,
  ArrowUpward,
  ArrowDownward,
  Refresh,
  Close,
  Save,
  Cancel,
  FilterList,
  Pending,
  CheckCircle,
  Cancel as CancelIcon,
  School,
  Work,
  Person,
  Phone,
  Email,
  ArrowBack,
  ExpandMore,
  LocationOn,
  Clear,
  Badge,
  PictureAsPdf,
  Image,
  FolderZip,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { app } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import IDCard from "./IDCard"; // Adjust the import path as needed

const db = getFirestore(app);

const statusOptions = [
  { value: "pending", label: "Pending", color: "warning", icon: <Pending /> },
  { value: "shortlisted", label: "Shortlisted", color: "info", icon: <CheckCircle /> },
  { value: "selected", label: "Selected", color: "success", icon: <CheckCircle /> },
  { value: "rejected", label: "Rejected", color: "error", icon: <CancelIcon /> },
  { value: "completed", label: "Completed", color: "secondary", icon: <CheckCircle /> },
];

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  if (timestamp?.toDate) {
    return timestamp.toDate().toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  }
  return new Date(timestamp).toLocaleDateString("en-IN");
};

// ─── LOAD EXTERNAL SCRIPT HELPER ────────────────────────────────────────────
const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });

// ─── FETCH IMAGE AS BASE64 (for html2canvas CORS fix) ───────────────────────
const fetchAsBase64 = async (url) => {
  try {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new Promise((res) => {
      const reader = new FileReader();
      reader.onload = () => res(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
};

// ─── MAIN DASHBOARD COMPONENT ────────────────────────────────────────────────
const InternshipAdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState("appliedAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const [courseOptions, setCourseOptions] = useState([]);
  const [universityOptions, setUniversityOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingApplication, setViewingApplication] = useState(null);

  // ── ID CARD STATES ──
  const [idCardDialogOpen, setIdCardDialogOpen] = useState(false);
  const [idCardApplication, setIdCardApplication] = useState(null);
  const [idCardQR, setIdCardQR] = useState(null);
  const [idCardLogo, setIdCardLogo] = useState(null);
  const [downloadingCard, setDownloadingCard] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchTotal, setBatchTotal] = useState(0);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const idCardRef = useRef(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });
  const [activeTab, setActiveTab] = useState(0);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // ── FETCH LOGO AS BASE64 ONCE ──
  useEffect(() => {
    fetchAsBase64("/logo192.png").then(setIdCardLogo);
  }, []);

  // ── FETCH QR WHEN ID CARD OPENS ──
  useEffect(() => {
    if (!idCardApplication?.registrationNumber) return;
    setIdCardQR(null);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&qzone=1&color=060e2e&data=${encodeURIComponent(
      `https://www.aediax.com/internship/certificate-portal/${idCardApplication.registrationNumber}`
    )}`;
    fetchAsBase64(url).then(setIdCardQR);
  }, [idCardApplication]);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const q = query(collection(db, "internshipApplications"), orderBy("appliedAt", "desc"));
      const querySnapshot = await getDocs(q);
      const apps = [];
      const coursesSet = new Set();
      const universitiesSet = new Set();
      const locationsSet = new Set();

      querySnapshot.forEach((docSnap) => {
        const data = { id: docSnap.id, ...docSnap.data() };
        let displayUniversity = data.university;
        if (data.university === "Other" && data.customUniversity) displayUniversity = data.customUniversity;
        apps.push({ ...data, displayUniversity });
        if (data.chosenCourse) coursesSet.add(data.chosenCourse);
        if (displayUniversity) universitiesSet.add(displayUniversity);
        if (data.locations && Array.isArray(data.locations)) {
          data.locations.forEach(loc => { if (loc?.trim()) locationsSet.add(loc.trim()); });
        }
      });

      setApplications(apps);
      setFilteredApplications(apps);
      setCourseOptions(["all", ...Array.from(coursesSet).sort()]);
      setUniversityOptions(["all", ...Array.from(universitiesSet).sort()]);
      setLocationOptions(["all", ...Array.from(locationsSet).sort()]);
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  useEffect(() => {
    let result = [...applications];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a =>
        a.fullName?.toLowerCase().includes(term) ||
        a.email?.toLowerCase().includes(term) ||
        a.phone?.includes(term) ||
        a.registrationNumber?.toLowerCase().includes(term) ||
        a.chosenCourse?.toLowerCase().includes(term) ||
        a.displayUniversity?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "all") result = result.filter(a => a.status === statusFilter);
    if (courseFilter !== "all") result = result.filter(a => a.chosenCourse === courseFilter);
    if (universityFilter !== "all") result = result.filter(a => a.displayUniversity === universityFilter);
    if (locationFilter !== "all") result = result.filter(a => a.locations?.some(l => l === locationFilter));
    if (dateFrom || dateTo) {
      result = result.filter(a => {
        if (!a.appliedAt) return false;
        const appDate = a.appliedAt?.toDate ? a.appliedAt.toDate() : new Date(a.appliedAt);
        if (dateFrom && dateTo) {
          const to = new Date(dateTo); to.setHours(23,59,59,999);
          return appDate >= new Date(dateFrom) && appDate <= to;
        }
        if (dateFrom) return appDate >= new Date(dateFrom);
        if (dateTo) { const to = new Date(dateTo); to.setHours(23,59,59,999); return appDate <= to; }
        return true;
      });
    }
    result.sort((a, b) => {
      let aVal = a[sortField], bVal = b[sortField];
      if (sortField === "appliedAt") { aVal = aVal?.toDate?.().getTime() ?? 0; bVal = bVal?.toDate?.().getTime() ?? 0; }
      else if (sortField === "university") { aVal = a.displayUniversity?.toLowerCase() ?? ""; bVal = b.displayUniversity?.toLowerCase() ?? ""; }
      else if (typeof aVal === "string") { aVal = aVal?.toLowerCase() ?? ""; bVal = bVal?.toLowerCase() ?? ""; }
      else { aVal = aVal ?? ""; bVal = bVal ?? ""; }
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    setFilteredApplications(result);
    setPage(0);
  }, [applications, searchTerm, statusFilter, courseFilter, universityFilter, locationFilter, dateFrom, dateTo, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) setSortDirection(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDirection("asc"); }
  };

  const handleEditClick = (application) => {
    setSelectedApplication(application);
    const predefined = ["SUIIT","Sambalpur University","GM University Sambalpur","KIIT","VSSUT","XIM University","NIT Rourkela","Other"];
    const isCustom = application.university === "Other" || (application.university && !predefined.includes(application.university));
    setEditFormData({
      fullName: application.fullName || "",
      email: application.email || "",
      phone: application.phone || "",
      whatsapp: application.whatsapp || "",
      university: isCustom ? "Other" : (application.university || ""),
      customUniversity: isCustom ? (application.customUniversity || application.university || "") : "",
      studyYear: application.studyYear || "",
      course: application.course || "",
      department: application.department || "",
      scoreType: application.scoreType || "CGPA",
      scoreValue: application.scoreValue || "",
      tenthPercent: application.tenthPercent || "",
      twelfthPercent: application.twelfthPercent || "",
      chosenCourse: application.chosenCourse || "",
      locations: application.locations || [],
      readyToRelocate: application.readyToRelocate || false,
      reason: application.reason || "",
      status: application.status || "pending",
    });
    setEditDialogOpen(true);
  };

  const handleEditChange = (field, value) => setEditFormData(prev => ({ ...prev, [field]: value }));

  const handleUpdateApplication = async () => {
    if (!selectedApplication) return;
    setUpdating(true);
    try {
      const applicationRef = doc(db, "internshipApplications", selectedApplication.id);
      const updateData = {
        fullName: editFormData.fullName, email: editFormData.email, phone: editFormData.phone,
        whatsapp: editFormData.whatsapp, university: editFormData.university,
        studyYear: editFormData.studyYear, course: editFormData.course,
        department: editFormData.department, scoreType: editFormData.scoreType,
        scoreValue: editFormData.scoreValue, tenthPercent: editFormData.tenthPercent,
        twelfthPercent: editFormData.twelfthPercent, chosenCourse: editFormData.chosenCourse,
        locations: editFormData.locations, readyToRelocate: editFormData.readyToRelocate,
        reason: editFormData.reason, status: editFormData.status, updatedAt: Timestamp.now(),
      };
      if (editFormData.university === "Other") updateData.customUniversity = editFormData.customUniversity;
      else updateData.customUniversity = null;
      await updateDoc(applicationRef, updateData);
      let displayUniversity = updateData.university;
      if (updateData.university === "Other" && updateData.customUniversity) displayUniversity = updateData.customUniversity;
      setApplications(prev => prev.map(a => a.id === selectedApplication.id ? { ...a, ...updateData, displayUniversity } : a));
      setSnackbar({ open: true, message: "Application updated successfully!", type: "success" });
      setEditDialogOpen(false);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to update application.", type: "error" });
    } finally { setUpdating(false); }
  };

  const handleDeleteClick = (application) => { setApplicationToDelete(application); setDeleteDialogOpen(true); };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "internshipApplications", applicationToDelete.id));
      setApplications(prev => prev.filter(a => a.id !== applicationToDelete.id));
      setSnackbar({ open: true, message: "Application deleted successfully!", type: "success" });
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: "Failed to delete application.", type: "error" });
    } finally { setDeleting(false); }
  };

  const clearFilters = () => {
    setSearchTerm(""); setStatusFilter("all"); setCourseFilter("all");
    setUniversityFilter("all"); setLocationFilter("all");
    setDateFrom(""); setDateTo(""); setSortField("appliedAt"); setSortDirection("desc");
  };

  const getStatusChip = (status) => {
    const option = statusOptions.find(o => o.value === status);
    if (!option) return <Chip label={status} size="small" />;
    return <Chip label={option.label} size="small" color={option.color} icon={option.icon} sx={{ fontWeight: 500 }} />;
  };

  const getActiveFilterCount = () => {
    let c = 0;
    if (searchTerm) c++; if (statusFilter !== "all") c++;
    if (courseFilter !== "all") c++; if (universityFilter !== "all") c++;
    if (locationFilter !== "all") c++; if (dateFrom || dateTo) c++;
    return c;
  };

  // ── ID CARD OPEN ──
  const handleIDCardClick = (application) => {
    setIdCardApplication(application);
    setIdCardDialogOpen(true);
  };

  // ── DOWNLOAD SINGLE PNG ──
  const downloadIDCardPNG = async () => {
    if (!idCardRef.current) return;
    setDownloadingCard(true);
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      const canvas = await window.html2canvas(idCardRef.current, {
        scale: 3, backgroundColor: "#ffffff", useCORS: true, allowTaint: false,
      });
      const link = document.createElement("a");
      link.download = `${(idCardApplication.fullName || "intern").replace(/\s+/g, "-")}-id-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setSnackbar({ open: true, message: "PNG downloaded!", type: "success" });
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: "PNG download failed.", type: "error" });
    }
    setDownloadingCard(false);
  };

  // ── DOWNLOAD SINGLE PDF ──
  const downloadIDCardPDF = async () => {
    if (!idCardRef.current) return;
    setDownloadingCard(true);
    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      const canvas = await window.html2canvas(idCardRef.current, {
        scale: 3, backgroundColor: "#ffffff", useCORS: true, allowTaint: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      // Portrait ID card: 63.5mm × 101mm
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [63.5, 101] });
      pdf.addImage(imgData, "PNG", 0, 0, 63.5, 101);
      pdf.save(`${(idCardApplication.fullName || "intern").replace(/\s+/g, "-")}-id-card.pdf`);
      setSnackbar({ open: true, message: "PDF downloaded!", type: "success" });
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: "PDF download failed.", type: "error" });
    }
    setDownloadingCard(false);
  };

  // ── DOWNLOAD ALL FILTERED AS ZIP ──
  const downloadAllAsZIP = async () => {
    const apps = filteredApplications;
    if (!apps.length) return;
    setBatchTotal(apps.length);
    setBatchProgress(0);
    setBatchDialogOpen(true);

    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js");

      const JSZip = window.JSZip;
      const zip = new JSZip();

      // Create a temporary hidden container
      const container = document.createElement("div");
      container.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1;";
      document.body.appendChild(container);

      for (let i = 0; i < apps.length; i++) {
        const appItem = apps[i];
        setBatchProgress(i);

        // Fetch QR for this app
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&qzone=1&color=060e2e&data=${encodeURIComponent(
          `https://www.aediax.com/internship/certificate-portal/${appItem.registrationNumber || ""}`
        )}`;
        const qrB64 = await fetchAsBase64(qrUrl);

        // Render card in temp container
        const wrapper = document.createElement("div");
        container.appendChild(wrapper);

        // Use ReactDOM to render the card
        const { createRoot } = await import("react-dom/client");
        const root = createRoot(wrapper);

        await new Promise(resolve => {
          root.render(
            React.createElement(IDCard, { app: appItem, qrBase64: qrB64, logoBase64: idCardLogo }),
          );
          setTimeout(resolve, 600); // wait for render
        });

        const cardEl = wrapper.firstElementChild;
        if (cardEl) {
          try {
            const canvas = await window.html2canvas(cardEl, {
              scale: 2, backgroundColor: "#ffffff", useCORS: true, allowTaint: false,
            });
            const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
            const safeName = (appItem.fullName || `applicant-${i}`).replace(/[^a-zA-Z0-9-_ ]/g, "").replace(/\s+/g, "-");
            zip.file(`${safeName}-id-card.png`, blob);
          } catch (e) { console.error("Card render error:", e); }
        }

        root.unmount();
        container.removeChild(wrapper);
        setBatchProgress(i + 1);
      }

      document.body.removeChild(container);

      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `aediax-intern-id-cards-${new Date().toISOString().slice(0,10)}.zip`;
      link.click();
      setSnackbar({ open: true, message: `Downloaded ${apps.length} ID cards as ZIP!`, type: "success" });
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: "ZIP download failed. Try individual downloads.", type: "error" });
    }
    setBatchDialogOpen(false);
  };

  // ── DOWNLOAD ALL FILTERED AS MULTI-PAGE PDF ──
  const downloadAllAsPDF = async () => {
    const apps = filteredApplications;
    if (!apps.length) return;
    setBatchTotal(apps.length);
    setBatchProgress(0);
    setBatchDialogOpen(true);

    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [63.5, 101] });

      const container = document.createElement("div");
      container.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1;";
      document.body.appendChild(container);

      for (let i = 0; i < apps.length; i++) {
        const appItem = apps[i];
        setBatchProgress(i);

        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&qzone=1&color=060e2e&data=${encodeURIComponent(
          `https://www.aediax.com/internship/certificate-portal/${appItem.registrationNumber || ""}`
        )}`;
        const qrB64 = await fetchAsBase64(qrUrl);

        const wrapper = document.createElement("div");
        container.appendChild(wrapper);

        const { createRoot } = await import("react-dom/client");
        const root = createRoot(wrapper);
        await new Promise(resolve => {
          root.render(React.createElement(IDCard, { app: appItem, qrBase64: qrB64, logoBase64: idCardLogo }));
          setTimeout(resolve, 600);
        });

        const cardEl = wrapper.firstElementChild;
        if (cardEl) {
          try {
            const canvas = await window.html2canvas(cardEl, {
              scale: 3, backgroundColor: "#ffffff", useCORS: true, allowTaint: false,
            });
            if (i > 0) pdf.addPage([63.5, 101]);
            pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 63.5, 101);
          } catch (e) { console.error(e); }
        }

        root.unmount();
        container.removeChild(wrapper);
        setBatchProgress(i + 1);
      }

      document.body.removeChild(container);
      pdf.save(`aediax-all-id-cards-${new Date().toISOString().slice(0,10)}.pdf`);
      setSnackbar({ open: true, message: `PDF with ${apps.length} ID cards downloaded!`, type: "success" });
    } catch (e) {
      console.error(e);
      setSnackbar({ open: true, message: "Batch PDF failed. Try individual downloads.", type: "error" });
    }
    setBatchDialogOpen(false);
  };

  // ── SORT ICON HELPER ──
  const SortIcon = ({ field }) =>
    sortField === field
      ? (sortDirection === "asc"
          ? <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} />
          : <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} />)
      : null;

  // ── TABLE ROW ──
  const renderTableRow = (app) => (
    <TableRow key={app.id} hover sx={{ "&:last-child td": { border: 0 } }}>
      <TableCell>
        <Typography variant="body2" fontWeight={500}>{app.fullName || "N/A"}</Typography>
        <Typography variant="caption" color="text.secondary">{app.registrationNumber || "No Reg No"}</Typography>
      </TableCell>
      <TableCell>{app.email || "N/A"}</TableCell>
      <TableCell>{app.phone || "N/A"}</TableCell>
      <TableCell>
        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{app.chosenCourse || "N/A"}</Typography>
      </TableCell>
      <TableCell>
        <Tooltip title={app.locations?.join(", ") || "No locations"}>
          <Chip label={app.locations?.[0] || "N/A"} size="small" icon={<LocationOn />} variant="outlined" />
        </Tooltip>
      </TableCell>
      <TableCell>{getStatusChip(app.status)}</TableCell>
      <TableCell>{formatDate(app.appliedAt)}</TableCell>
      <TableCell align="center">
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => { setViewingApplication(app); setViewDialogOpen(true); }} color="info">
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="ID Card">
          <IconButton size="small" onClick={() => handleIDCardClick(app)} sx={{ color: "#0c1e5b" }}>
            <Badge fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => handleEditClick(app)} color="primary">
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => handleDeleteClick(app)} color="error">
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );

  // ── MOBILE CARD ──
  const renderMobileCard = (app) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} key={app.id}>
      <Card sx={{ mb: 2, borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 2, bgcolor: theme.palette.grey[50], borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>{app.fullName || "N/A"}</Typography>
              <Typography variant="caption" color="text.secondary">{app.registrationNumber || "No Reg No"}</Typography>
            </Box>
            {getStatusChip(app.status)}
          </Box>
        </Box>
        <CardContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
            <Email fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>{app.email || "N/A"}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
            <Phone fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">{app.phone || "N/A"} / {app.whatsapp || "N/A"}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
            <Work fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>{app.chosenCourse || "N/A"}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>{app.locations?.join(", ") || "N/A"}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <School fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>{app.displayUniversity || app.university || "N/A"}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>Applied: {formatDate(app.appliedAt)}</Typography>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: "flex-end", flexWrap: "wrap", gap: 0.5, p: 1.5 }}>
          <Button size="small" startIcon={<Visibility />} onClick={() => { setViewingApplication(app); setViewDialogOpen(true); }}>View</Button>
          <Button size="small" startIcon={<Badge />} onClick={() => handleIDCardClick(app)} sx={{ color: "#0c1e5b" }}>ID Card</Button>
          <Button size="small" startIcon={<Edit />} onClick={() => handleEditClick(app)} color="primary">Edit</Button>
          <Button size="small" startIcon={<Delete />} onClick={() => handleDeleteClick(app)} color="error">Delete</Button>
        </CardActions>
      </Card>
    </motion.div>
  );

  const paginatedApplications = filteredApplications.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // ── FILTER CONTROLS (shared) ──
  const filterControls = (size = "small") => (
    <>
      <FormControl size={size} sx={{ minWidth: 150, flex: 1 }}>
        <InputLabel>Status</InputLabel>
        <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value)}>
          <MenuItem value="all">All Status</MenuItem>
          {statusOptions.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{opt.icon} {opt.label}</Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl size={size} sx={{ minWidth: 180, flex: 1 }}>
        <InputLabel>Course</InputLabel>
        <Select value={courseFilter} label="Course" onChange={e => setCourseFilter(e.target.value)}>
          <MenuItem value="all">All Courses</MenuItem>
          {courseOptions.filter(c => c !== "all").map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size={size} sx={{ minWidth: 180, flex: 1 }}>
        <InputLabel>University</InputLabel>
        <Select value={universityFilter} label="University" onChange={e => setUniversityFilter(e.target.value)}>
          <MenuItem value="all">All Universities</MenuItem>
          {universityOptions.filter(u => u !== "all").map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl size={size} sx={{ minWidth: 180, flex: 1 }}>
        <InputLabel>Location</InputLabel>
        <Select value={locationFilter} label="Location" onChange={e => setLocationFilter(e.target.value)}>
          <MenuItem value="all">All Locations</MenuItem>
          {locationOptions.filter(l => l !== "all").map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField label="From Date" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
        size={size} InputLabelProps={{ shrink: true }} sx={{ minWidth: 150 }} />
      <TextField label="To Date" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
        size={size} InputLabelProps={{ shrink: true }} sx={{ minWidth: 150 }} />
    </>
  );

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, bgcolor: theme.palette.primary.main }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>Applications</Typography>
          <Tooltip title="Refresh">
            <IconButton color="inherit" onClick={fetchApplications}><Refresh /></IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ pt: { xs: 10, sm: 12 }, pb: 4, px: { xs: 1, sm: 2 } }}>
        {/* Header + Batch Download */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={600}>
              Total Applications: {filteredApplications.length}
            </Typography>
            {getActiveFilterCount() > 0 && (
              <Typography variant="caption" color="primary">({getActiveFilterCount()} active filters)</Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {/* Batch ID card downloads */}
            {filteredApplications.length > 0 && (
              <>
                <Tooltip title={`Download all ${filteredApplications.length} ID cards as ZIP`}>
                  <Button
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    startIcon={<FolderZip />}
                    onClick={downloadAllAsZIP}
                    sx={{ borderColor: "#0c1e5b", color: "#0c1e5b" }}
                  >
                    ID Cards ZIP
                  </Button>
                </Tooltip>
                <Tooltip title={`Download all ${filteredApplications.length} ID cards as PDF`}>
                  <Button
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    startIcon={<PictureAsPdf />}
                    onClick={downloadAllAsPDF}
                    sx={{ borderColor: "#0c1e5b", color: "#0c1e5b" }}
                  >
                    ID Cards PDF
                  </Button>
                </Tooltip>
              </>
            )}
            <Button
              variant="outlined"
              startIcon={getActiveFilterCount() > 0 ? <Clear /> : <FilterList />}
              onClick={clearFilters}
              size={isMobile ? "small" : "medium"}
              color={getActiveFilterCount() > 0 ? "primary" : "inherit"}
            >
              {getActiveFilterCount() > 0 ? `Clear All (${getActiveFilterCount()})` : "Clear Filters"}
            </Button>
          </Box>
        </Box>

        {/* Search + Filters */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name, email, phone, registration number, or course..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            size={isMobile ? "small" : "medium"}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search color="action" /></InputAdornment>,
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}><Close fontSize="small" /></IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          {isMobile ? (
            <Accordion expanded={filtersExpanded} onChange={() => setFiltersExpanded(!filtersExpanded)}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>{filterControls("small")}</Box>
              </AccordionDetails>
            </Accordion>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>{filterControls("small")}</Box>
          )}
        </Paper>

        {/* Data */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : filteredApplications.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
            <Typography color="text.secondary">No applications found.</Typography>
          </Paper>
        ) : (
          <>
            {/* Desktop Table */}
            {!isMobile && (
              <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: "auto" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      {[["fullName","Applicant"],["email","Email"],["phone","Phone"],["chosenCourse","Course"]].map(([f,label]) => (
                        <TableCell key={f} onClick={() => handleSort(f)} sx={{ cursor: "pointer", fontWeight: 600 }}>
                          {label}<SortIcon field={f} />
                        </TableCell>
                      ))}
                      <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                      <TableCell onClick={() => handleSort("status")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                        Status<SortIcon field="status" />
                      </TableCell>
                      <TableCell onClick={() => handleSort("appliedAt")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                        Applied Date<SortIcon field="appliedAt" />
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>{paginatedApplications.map(renderTableRow)}</TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Mobile Cards */}
            {isMobile && (
              <Box>
                <Tabs value={activeTab} onChange={(e,v) => setActiveTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
                  <Tab label="All Applications" />
                  <Tab label={`Filtered (${filteredApplications.length})`} />
                </Tabs>
                <AnimatePresence>{paginatedApplications.map(renderMobileCard)}</AnimatePresence>
              </Box>
            )}

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <TablePagination
                component="div"
                count={filteredApplications.length}
                page={page}
                onPageChange={(e, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25, 50]}
                labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
              />
            </Box>
          </>
        )}
      </Container>

      {/* ── ID CARD PREVIEW DIALOG ─────────────────────────────────────────── */}
      <Dialog
        open={idCardDialogOpen}
        onClose={() => setIdCardDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, background: "#f0f4ff" } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Badge sx={{ color: "#0c1e5b" }} />
            <Typography fontWeight={700} color="#0c1e5b">Intern ID Card</Typography>
          </Box>
          <IconButton onClick={() => setIdCardDialogOpen(false)} size="small"><Close /></IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", flexDirection: "column", alignItems: "center", pb: 2, pt: 1 }}>
          {/* Card Preview */}
          <Box sx={{ transform: "scale(0.95)", transformOrigin: "top center", mb: 2 }}>
            <IDCard
              ref={idCardRef}
              app={idCardApplication}
              qrBase64={idCardQR}
              logoBase64={idCardLogo}
            />
          </Box>

          {/* QR loading indicator */}
          {!idCardQR && idCardApplication && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              Loading QR code...
            </Typography>
          )}

          {/* Download Buttons */}
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center", mt: 1 }}>
            <Button
              variant="contained"
              startIcon={downloadingCard ? <CircularProgress size={16} color="inherit" /> : <Image />}
              onClick={downloadIDCardPNG}
              disabled={downloadingCard || !idCardQR}
              sx={{ background: "#0c1e5b", "&:hover": { background: "#1a3a8f" }, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Download PNG
            </Button>
            <Button
              variant="contained"
              startIcon={downloadingCard ? <CircularProgress size={16} color="inherit" /> : <PictureAsPdf />}
              onClick={downloadIDCardPDF}
              disabled={downloadingCard || !idCardQR}
              sx={{ background: "#7c3aed", "&:hover": { background: "#6d28d9" }, borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Download PDF
            </Button>
          </Box>
          {!idCardQR && idCardApplication && (
            <Typography variant="caption" color="warning.main" sx={{ mt: 1, textAlign: "center" }}>
              Wait for QR to load before downloading for best quality
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* ── BATCH PROGRESS DIALOG ─────────────────────────────────────────── */}
      <Dialog open={batchDialogOpen} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogContent sx={{ p: 3, textAlign: "center" }}>
          <Badge sx={{ fontSize: 40, color: "#0c1e5b", mb: 1 }} />
          <Typography variant="h6" fontWeight={700} color="#0c1e5b" gutterBottom>
            Generating ID Cards
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Processing {batchProgress} of {batchTotal} cards...
          </Typography>
          <LinearProgress
            variant="determinate"
            value={batchTotal ? (batchProgress / batchTotal) * 100 : 0}
            sx={{ borderRadius: 4, height: 8, "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #0c1e5b, #3b82f6)" } }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Please do not close this window
          </Typography>
        </DialogContent>
      </Dialog>

      {/* ── EDIT DIALOG ───────────────────────────────────────────────────── */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          Edit Application
          <IconButton onClick={() => setEditDialogOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedApplication && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <TextField label="Full Name" value={editFormData.fullName} onChange={e => handleEditChange("fullName", e.target.value)} fullWidth size="small" />
              <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                <TextField label="Email" value={editFormData.email} onChange={e => handleEditChange("email", e.target.value)} fullWidth size="small" />
                <TextField label="Phone" value={editFormData.phone} onChange={e => handleEditChange("phone", e.target.value)} fullWidth size="small" />
              </Box>
              <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                <TextField label="WhatsApp" value={editFormData.whatsapp} onChange={e => handleEditChange("whatsapp", e.target.value)} fullWidth size="small" />
                <FormControl size="small" fullWidth>
                  <InputLabel>University</InputLabel>
                  <Select value={editFormData.university} label="University" onChange={e => handleEditChange("university", e.target.value)}>
                    {["SUIIT","Sambalpur University","GM University Sambalpur","KIIT","VSSUT","XIM University","NIT Rourkela","Other"].map(u => (
                      <MenuItem key={u} value={u}>{u}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              {editFormData.university === "Other" && (
                <TextField label="Enter University Name" value={editFormData.customUniversity} onChange={e => handleEditChange("customUniversity", e.target.value)} fullWidth size="small" helperText="Enter the full name of your university" />
              )}
              <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                <TextField label="Study Year" value={editFormData.studyYear} onChange={e => handleEditChange("studyYear", e.target.value)} fullWidth size="small" />
                <TextField label="Course" value={editFormData.course} onChange={e => handleEditChange("course", e.target.value)} fullWidth size="small" />
              </Box>
              <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                <TextField label="Department" value={editFormData.department} onChange={e => handleEditChange("department", e.target.value)} fullWidth size="small" />
                <FormControl size="small" fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select value={editFormData.status} label="Status" onChange={e => handleEditChange("status", e.target.value)}>
                    {statusOptions.map(opt => (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>{opt.icon} {opt.label}</Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <TextField label="Selected Course" value={editFormData.chosenCourse} onChange={e => handleEditChange("chosenCourse", e.target.value)} fullWidth size="small" />
              <TextField label="Reason for Joining" value={editFormData.reason} onChange={e => handleEditChange("reason", e.target.value)} fullWidth multiline rows={3} size="small" />
              <FormControlLabel
                control={<Checkbox checked={editFormData.readyToRelocate} onChange={e => handleEditChange("readyToRelocate", e.target.checked)} />}
                label="Ready to Relocate"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} startIcon={<Cancel />}>Cancel</Button>
          <Button onClick={handleUpdateApplication} variant="contained" startIcon={<Save />} disabled={updating}>
            {updating ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── VIEW DIALOG ───────────────────────────────────────────────────── */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          Application Details
          <IconButton onClick={() => setViewDialogOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}><Close /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewingApplication && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Paper sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>Personal Information</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="body2"><strong>Name:</strong> {viewingApplication.fullName || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2"><strong>Email:</strong> {viewingApplication.email || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2"><strong>Phone:</strong> {viewingApplication.phone || "N/A"} / {viewingApplication.whatsapp || "N/A"}</Typography>
                </Box>
                <Typography variant="body2"><strong>Registration No:</strong> {viewingApplication.registrationNumber || "N/A"}</Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>Academic Details</Typography>
                <Typography variant="body2"><strong>University:</strong> {viewingApplication.displayUniversity || viewingApplication.university || "N/A"}</Typography>
                <Typography variant="body2"><strong>Study Year:</strong> {viewingApplication.studyYear || "N/A"}</Typography>
                <Typography variant="body2"><strong>Course:</strong> {viewingApplication.course || "N/A"}</Typography>
                <Typography variant="body2"><strong>Department:</strong> {viewingApplication.department || "N/A"}</Typography>
                <Typography variant="body2"><strong>Score:</strong> {viewingApplication.scoreValue} ({viewingApplication.scoreType})</Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: theme.palette.grey[50], borderRadius: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>Internship Details</Typography>
                <Typography variant="body2"><strong>Selected Course:</strong> {viewingApplication.chosenCourse || "N/A"}</Typography>
                <Typography variant="body2"><strong>Preferred Locations:</strong> {viewingApplication.locations?.join(", ") || "None"}</Typography>
                <Typography variant="body2"><strong>Ready to Relocate:</strong> {viewingApplication.readyToRelocate ? "Yes" : "No"}</Typography>
                <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <strong>Status:</strong> {getStatusChip(viewingApplication.status)}
                </Typography>
                <Typography variant="body2"><strong>Reason:</strong> {viewingApplication.reason || "N/A"}</Typography>
              </Paper>
              <Typography variant="caption" color="text.secondary" sx={{ textAlign: "right" }}>
                Applied on: {formatDate(viewingApplication.appliedAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<Badge />}
            onClick={() => { setViewDialogOpen(false); handleIDCardClick(viewingApplication); }}
            sx={{ color: "#0c1e5b", borderColor: "#0c1e5b" }}
          >
            View ID Card
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── DELETE DIALOG ─────────────────────────────────────────────────── */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the application from{" "}
            <strong>{applicationToDelete?.fullName}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>Cancel</Button>
          <Button onClick={handleDeleteApplication} color="error" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── SNACKBAR ──────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.type} variant="filled" onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InternshipAdminDashboard;