import React, { useState, useEffect, useCallback } from "react";
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

const db = getFirestore(app);

// Status options as provided
const statusOptions = [
  { value: "pending", label: "Pending", color: "warning", icon: <Pending /> },
  { value: "shortlisted", label: "Shortlisted", color: "info", icon: <CheckCircle /> },
  { value: "selected", label: "Selected", color: "success", icon: <CheckCircle /> },
  { value: "rejected", label: "Rejected", color: "error", icon: <CancelIcon /> },
  { value: "completed", label: "Completed", color: "secondary", icon: <CheckCircle /> },
];

// Helper function to format date
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



const InternshipAdminDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  // State for applications data
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortField, setSortField] = useState("appliedAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Dynamic filter options
  const [courseOptions, setCourseOptions] = useState([]);
  const [universityOptions, setUniversityOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingApplication, setViewingApplication] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  // Tab for mobile view
  const [activeTab, setActiveTab] = useState(0);
  
  // Filter accordion expanded state
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Fetch all applications
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

      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        
        // Handle university display - if university is "Other", show customUniversity value
        let displayUniversity = data.university;
        if (data.university === "Other" && data.customUniversity) {
          displayUniversity = data.customUniversity;
        }
        
        apps.push({ ...data, displayUniversity });
        
        // Collect unique courses and universities for filters
        if (data.chosenCourse) coursesSet.add(data.chosenCourse);
        if (displayUniversity) universitiesSet.add(displayUniversity);
        
        // Collect unique locations for filter
        if (data.locations && Array.isArray(data.locations)) {
          data.locations.forEach(loc => {
            if (loc && loc.trim()) locationsSet.add(loc.trim());
          });
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

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Apply filters and search
  useEffect(() => {
    let result = [...applications];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (app) =>
          app.fullName?.toLowerCase().includes(term) ||
          app.email?.toLowerCase().includes(term) ||
          app.phone?.includes(term) ||
          app.registrationNumber?.toLowerCase().includes(term) ||
          app.chosenCourse?.toLowerCase().includes(term) ||
          app.displayUniversity?.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((app) => app.status === statusFilter);
    }

    // Course filter
    if (courseFilter !== "all") {
      result = result.filter((app) => app.chosenCourse === courseFilter);
    }

    // University filter (using displayUniversity)
    if (universityFilter !== "all") {
      result = result.filter((app) => app.displayUniversity === universityFilter);
    }

    // Location filter
    if (locationFilter !== "all") {
      result = result.filter((app) => 
        app.locations && Array.isArray(app.locations) && 
        app.locations.some(loc => loc === locationFilter)
      );
    }

    // Date range filter
    if (dateFrom || dateTo) {
      result = result.filter((app) => {
        if (!app.appliedAt) return false;
        const appDate = app.appliedAt?.toDate ? app.appliedAt.toDate() : new Date(app.appliedAt);
        
        if (dateFrom && dateTo) {
          const fromDate = new Date(dateFrom);
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          return appDate >= fromDate && appDate <= toDate;
        } else if (dateFrom) {
          const fromDate = new Date(dateFrom);
          return appDate >= fromDate;
        } else if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          return appDate <= toDate;
        }
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === "appliedAt") {
        aVal = aVal?.toDate ? aVal.toDate().getTime() : 0;
        bVal = bVal?.toDate ? bVal.toDate().getTime() : 0;
      } else if (sortField === "university") {
        aVal = a.displayUniversity?.toLowerCase() || "";
        bVal = b.displayUniversity?.toLowerCase() || "";
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

    setFilteredApplications(result);
    setPage(0);
  }, [applications, searchTerm, statusFilter, courseFilter, universityFilter, locationFilter, dateFrom, dateTo, sortField, sortDirection]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Handle edit
  const handleEditClick = (application) => {
    setSelectedApplication(application);
    
    // Determine if university is custom (not in predefined list)
    const predefinedUniversities = ["SUIIT", "Sambalpur University", "GM University Sambalpur", "KIIT", "VSSUT", "XIM University", "NIT Rourkela", "Other"];
    const isCustomUniversity = application.university === "Other" || 
      (application.university && !predefinedUniversities.includes(application.university));
    
    setEditFormData({
      fullName: application.fullName || "",
      email: application.email || "",
      phone: application.phone || "",
      whatsapp: application.whatsapp || "",
      university: isCustomUniversity ? "Other" : (application.university || ""),
      customUniversity: isCustomUniversity ? (application.customUniversity || application.university || "") : "",
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

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateApplication = async () => {
    if (!selectedApplication) return;
    setUpdating(true);
    try {
      const applicationRef = doc(db, "internshipApplications", selectedApplication.id);
      
      // Prepare update data
      const updateData = {
        fullName: editFormData.fullName,
        email: editFormData.email,
        phone: editFormData.phone,
        whatsapp: editFormData.whatsapp,
        university: editFormData.university,
        studyYear: editFormData.studyYear,
        course: editFormData.course,
        department: editFormData.department,
        scoreType: editFormData.scoreType,
        scoreValue: editFormData.scoreValue,
        tenthPercent: editFormData.tenthPercent,
        twelfthPercent: editFormData.twelfthPercent,
        chosenCourse: editFormData.chosenCourse,
        locations: editFormData.locations,
        readyToRelocate: editFormData.readyToRelocate,
        reason: editFormData.reason,
        status: editFormData.status,
        updatedAt: Timestamp.now(),
      };
      
      // If university is "Other", save customUniversity
      if (editFormData.university === "Other") {
        updateData.customUniversity = editFormData.customUniversity;
      } else {
        updateData.customUniversity = null; // Clear custom university if not "Other"
      }
      
      await updateDoc(applicationRef, updateData);
      
      // Update local state with display university
      let displayUniversity = updateData.university;
      if (updateData.university === "Other" && updateData.customUniversity) {
        displayUniversity = updateData.customUniversity;
      }
      
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id 
            ? { ...app, ...updateData, displayUniversity } 
            : app
        )
      );
      
      setSnackbar({ open: true, message: "Application updated successfully!", type: "success" });
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating application:", err);
      setSnackbar({ open: true, message: "Failed to update application.", type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  // Handle delete
  const handleDeleteClick = (application) => {
    setApplicationToDelete(application);
    setDeleteDialogOpen(true);
  };

  const handleDeleteApplication = async () => {
    if (!applicationToDelete) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "internshipApplications", applicationToDelete.id));
      
      // Update local state
      setApplications((prev) => prev.filter((app) => app.id !== applicationToDelete.id));
      
      setSnackbar({ open: true, message: "Application deleted successfully!", type: "success" });
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting application:", err);
      setSnackbar({ open: true, message: "Failed to delete application.", type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCourseFilter("all");
    setUniversityFilter("all");
    setLocationFilter("all");
    setDateFrom("");
    setDateTo("");
    setSortField("appliedAt");
    setSortDirection("desc");
  };

  // Get status chip color
  const getStatusChip = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    if (!option) return <Chip label={status} size="small" />;
    return (
      <Chip
        label={option.label}
        size="small"
        color={option.color}
        icon={option.icon}
        sx={{ fontWeight: 500 }}
      />
    );
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (searchTerm) count++;
    if (statusFilter !== "all") count++;
    if (courseFilter !== "all") count++;
    if (universityFilter !== "all") count++;
    if (locationFilter !== "all") count++;
    if (dateFrom || dateTo) count++;
    return count;
  };

  // Render table row for desktop
  const renderTableRow = (app) => (
    <TableRow key={app.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
      <TableCell>
        <Typography variant="body2" fontWeight={500}>
          {app.fullName || "N/A"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {app.registrationNumber || "No Reg No"}
        </Typography>
      </TableCell>
      <TableCell>{app.email || "N/A"}</TableCell>
      <TableCell>{app.phone || "N/A"}</TableCell>
      <TableCell>
        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
          {app.chosenCourse || "N/A"}
        </Typography>
      </TableCell>
      <TableCell>
        <Tooltip title={app.locations?.join(", ") || "No locations"}>
          <Chip 
            label={app.locations?.[0] || "N/A"} 
            size="small" 
            icon={<LocationOn />}
            variant="outlined"
          />
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

  // Render mobile card
  const renderMobileCard = (app) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      key={app.id}
    >
      <Card sx={{ mb: 2, borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 2, bgcolor: theme.palette.grey[50], borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {app.fullName || "N/A"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {app.registrationNumber || "No Reg No"}
              </Typography>
            </Box>
            {getStatusChip(app.status)}
          </Box>
        </Box>
        
        <CardContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
            <Email fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
              {app.email || "N/A"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
            <Phone fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {app.phone || "N/A"} / {app.whatsapp || "N/A"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
            <Work fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
              {app.chosenCourse || "N/A"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, gap: 1 }}>
            <LocationOn fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
              {app.locations?.join(", ") || "N/A"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1 }}>
            <School fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
              {app.displayUniversity || app.university || "N/A"}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            Applied: {formatDate(app.appliedAt)}
          </Typography>
        </CardContent>
        
        <Divider />
        
        <CardActions sx={{ justifyContent: "flex-end", gap: 1, p: 1.5 }}>
          <Button size="small" startIcon={<Visibility />} onClick={() => { setViewingApplication(app); setViewDialogOpen(true); }}>
            View
          </Button>
          <Button size="small" startIcon={<Edit />} onClick={() => handleEditClick(app)} color="primary">
            Edit
          </Button>
          <Button size="small" startIcon={<Delete />} onClick={() => handleDeleteClick(app)} color="error">
            Delete
          </Button>
        </CardActions>
      </Card>
    </motion.div>
  );

  // Pagination
  const paginatedApplications = filteredApplications.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* App Bar with Back Button */}
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, bgcolor: theme.palette.primary.main }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Applications
          </Typography>
          <Tooltip title="Refresh">
            <IconButton color="inherit" onClick={fetchApplications}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ pt: { xs: 10, sm: 12 }, pb: 4, px: { xs: 1, sm: 2 } }}>
        {/* Header Stats */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={600}>
              Total Applications: {filteredApplications.length}
            </Typography>
            {getActiveFilterCount() > 0 && (
              <Typography variant="caption" color="primary">
                ({getActiveFilterCount()} active filters)
              </Typography>
            )}
          </Box>
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

        {/* Search and Filters */}
        <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
          <TextField
            fullWidth
            placeholder="Search by name, email, phone, registration number, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size={isMobile ? "small" : "medium"}
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
            sx={{ mb: 2 }}
          />

          {/* Filters - Expandable on Mobile */}
          {isMobile ? (
            <Accordion expanded={filtersExpanded} onChange={() => setFiltersExpanded(!filtersExpanded)}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>
                  Filters {getActiveFilterCount() > 0 && `(${getActiveFilterCount()})`}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                      <MenuItem value="all">All Status</MenuItem>
                      {statusOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {opt.icon}
                            {opt.label}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Course</InputLabel>
                    <Select value={courseFilter} label="Course" onChange={(e) => setCourseFilter(e.target.value)}>
                      <MenuItem value="all">All Courses</MenuItem>
                      {courseOptions.filter(c => c !== "all").map((course) => (
                        <MenuItem key={course} value={course}>{course}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>University</InputLabel>
                    <Select value={universityFilter} label="University" onChange={(e) => setUniversityFilter(e.target.value)}>
                      <MenuItem value="all">All Universities</MenuItem>
                      {universityOptions.filter(u => u !== "all").map((uni) => (
                        <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel>Location</InputLabel>
                    <Select value={locationFilter} label="Location" onChange={(e) => setLocationFilter(e.target.value)}>
                      <MenuItem value="all">All Locations</MenuItem>
                      {locationOptions.filter(l => l !== "all").map((loc) => (
                        <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    label="From Date"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                    label="To Date"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          ) : (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150, flex: 1 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Status</MenuItem>
                  {statusOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {opt.icon}
                        {opt.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
                <InputLabel>Course</InputLabel>
                <Select value={courseFilter} label="Course" onChange={(e) => setCourseFilter(e.target.value)}>
                  <MenuItem value="all">All Courses</MenuItem>
                  {courseOptions.filter(c => c !== "all").map((course) => (
                    <MenuItem key={course} value={course}>{course}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
                <InputLabel>University</InputLabel>
                <Select value={universityFilter} label="University" onChange={(e) => setUniversityFilter(e.target.value)}>
                  <MenuItem value="all">All Universities</MenuItem>
                  {universityOptions.filter(u => u !== "all").map((uni) => (
                    <MenuItem key={uni} value={uni}>{uni}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
                <InputLabel>Location</InputLabel>
                <Select value={locationFilter} label="Location" onChange={(e) => setLocationFilter(e.target.value)}>
                  <MenuItem value="all">All Locations</MenuItem>
                  {locationOptions.filter(l => l !== "all").map((loc) => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="From Date"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />

              <TextField
                label="To Date"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                sx={{ minWidth: 150 }}
              />
            </Box>
          )}
        </Paper>

        {/* Data Display */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
        ) : filteredApplications.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
            <Typography color="text.secondary">No applications found.</Typography>
          </Paper>
        ) : (
          <>
            {/* Desktop Table View */}
            {!isMobile && (
              <TableContainer component={Paper} sx={{ borderRadius: 3, overflowX: "auto" }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell onClick={() => handleSort("fullName")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                        Applicant
                        {sortField === "fullName" && (sortDirection === "asc" ? <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} />)}
                      </TableCell>
                      <TableCell onClick={() => handleSort("email")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                        Email
                        {sortField === "email" && (sortDirection === "asc" ? <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} />)}
                      </TableCell>
                      <TableCell onClick={() => handleSort("phone")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                        Phone
                        {sortField === "phone" && (sortDirection === "asc" ? <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} />)}
                      </TableCell>
                      <TableCell onClick={() => handleSort("chosenCourse")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                        Course
                        {sortField === "chosenCourse" && (sortDirection === "asc" ? <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} />)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                      <TableCell onClick={() => handleSort("status")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                        Status
                        {sortField === "status" && (sortDirection === "asc" ? <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} />)}
                      </TableCell>
                      <TableCell onClick={() => handleSort("appliedAt")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                        Applied Date
                        {sortField === "appliedAt" && (sortDirection === "asc" ? <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} />)}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedApplications.map(renderTableRow)}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Mobile Card View */}
            {isMobile && (
              <Box>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
                  <Tab label="All Applications" />
                  <Tab label={`Filtered (${filteredApplications.length})`} />
                </Tabs>
                {activeTab === 0 && (
                  <AnimatePresence>
                    {paginatedApplications.map(renderMobileCard)}
                  </AnimatePresence>
                )}
                {activeTab === 1 && (
                  <AnimatePresence>
                    {paginatedApplications.map(renderMobileCard)}
                  </AnimatePresence>
                )}
              </Box>
            )}

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <TablePagination
                component="div"
                count={filteredApplications.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={isMobile ? [5, 10] : [5, 10, 25, 50]}
                labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
              />
            </Box>
          </>
        )}
      </Container>

      {/* Edit Dialog - Keep existing code */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          Edit Application
          <IconButton onClick={() => setEditDialogOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedApplication && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
              <TextField
                label="Full Name"
                value={editFormData.fullName}
                onChange={(e) => handleEditChange("fullName", e.target.value)}
                fullWidth
                size="small"
              />
              <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                <TextField
                  label="Email"
                  value={editFormData.email}
                  onChange={(e) => handleEditChange("email", e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Phone"
                  value={editFormData.phone}
                  onChange={(e) => handleEditChange("phone", e.target.value)}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                <TextField
                  label="WhatsApp"
                  value={editFormData.whatsapp}
                  onChange={(e) => handleEditChange("whatsapp", e.target.value)}
                  fullWidth
                  size="small"
                />
                
                {/* University Selection with Custom Field */}
                <FormControl size="small" fullWidth>
                  <InputLabel>University</InputLabel>
                  <Select
                    value={editFormData.university}
                    label="University"
                    onChange={(e) => handleEditChange("university", e.target.value)}
                  >
                    <MenuItem value="SUIIT">SUIIT</MenuItem>
                    <MenuItem value="Sambalpur University">Sambalpur University</MenuItem>
                    <MenuItem value="GM University Sambalpur">GM University Sambalpur</MenuItem>
                    <MenuItem value="KIIT">KIIT</MenuItem>
                    <MenuItem value="VSSUT">VSSUT</MenuItem>
                    <MenuItem value="XIM University">XIM University</MenuItem>
                    <MenuItem value="NIT Rourkela">NIT Rourkela</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              {/* Custom University Field - shown only when "Other" is selected */}
              {editFormData.university === "Other" && (
                <TextField
                  label="Enter University Name"
                  value={editFormData.customUniversity}
                  onChange={(e) => handleEditChange("customUniversity", e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Please enter your university name"
                  helperText="Enter the full name of your university"
                />
              )}
              
              <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                <TextField
                  label="Study Year"
                  value={editFormData.studyYear}
                  onChange={(e) => handleEditChange("studyYear", e.target.value)}
                  fullWidth
                  size="small"
                />
                <TextField
                  label="Course"
                  value={editFormData.course}
                  onChange={(e) => handleEditChange("course", e.target.value)}
                  fullWidth
                  size="small"
                />
              </Box>
              <Box sx={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 2 }}>
                <TextField
                  label="Department"
                  value={editFormData.department}
                  onChange={(e) => handleEditChange("department", e.target.value)}
                  fullWidth
                  size="small"
                />
                <FormControl size="small" fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editFormData.status}
                    label="Status"
                    onChange={(e) => handleEditChange("status", e.target.value)}
                  >
                    {statusOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {opt.icon}
                          {opt.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <TextField
                label="Selected Course"
                value={editFormData.chosenCourse}
                onChange={(e) => handleEditChange("chosenCourse", e.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                label="Reason for Joining"
                value={editFormData.reason}
                onChange={(e) => handleEditChange("reason", e.target.value)}
                fullWidth
                multiline
                rows={3}
                size="small"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={editFormData.readyToRelocate}
                    onChange={(e) => handleEditChange("readyToRelocate", e.target.checked)}
                  />
                }
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

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle>
          Application Details
          <IconButton onClick={() => setViewDialogOpen(false)} sx={{ position: "absolute", right: 8, top: 8 }}>
            <Close />
          </IconButton>
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
                <Typography variant="body2">
                  <strong>University:</strong> {viewingApplication.displayUniversity || viewingApplication.university || "N/A"}
                </Typography>
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
                <Typography variant="body2"><strong>Status:</strong> {getStatusChip(viewingApplication.status)}</Typography>
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
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.type} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InternshipAdminDashboard;