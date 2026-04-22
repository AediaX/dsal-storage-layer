// CertificateList.jsx - Page 1: List of completed interns
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
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Toolbar,
  AppBar,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Fade,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  Select,
  Badge,
  Drawer,
  Divider,
} from "@mui/material";
import {
  Search,
  Refresh,
  Close,
  School,
  Work,
  Email,
  Phone,
  ArrowUpward,
  ArrowDownward,
  Description,
  VerifiedUser,
  FilterList,
  ChevronRight,
  ArrowBack,
  Sort,
  Clear,
  Category,
  LocationOn,
  PersonAdd,
  CheckCircle,
  FilterAltOff,
  ViewList,
  GridView,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { app } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

const db = getFirestore(app);

const CertificateList = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [interns, setInterns] = useState([]);
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [certificateCountFilter, setCertificateCountFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [availableUniversities, setAvailableUniversities] = useState([]);
  
  // Sort options
  const [sortField, setSortField] = useState("fullName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  
  // Filter drawer
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  
  // View mode
  const [viewMode, setViewMode] = useState(isMobile ? "card" : "table");
  
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  const fetchCompletedInterns = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const q = query(
        collection(db, "internshipApplications"),
        where("status", "==", "completed"),
        orderBy("fullName")
      );
      const querySnapshot = await getDocs(q);
      const internsList = [];
      const coursesSet = new Set();
      const universitiesSet = new Set();
      
      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        let displayUniversity = data.university;
        if (data.university === "Other" && data.customUniversity) {
          displayUniversity = data.customUniversity;
        }
        const certificateCount = data.certificates?.length || 0;
        internsList.push({ ...data, displayUniversity, certificateCount });
        
        if (data.chosenCourse) coursesSet.add(data.chosenCourse);
        if (displayUniversity) universitiesSet.add(displayUniversity);
      });
      
      setInterns(internsList);
      setFilteredInterns(internsList);
      setAvailableCourses(Array.from(coursesSet).sort());
      setAvailableUniversities(Array.from(universitiesSet).sort());
    } catch (err) {
      console.error("Error fetching interns:", err);
      setError("Failed to load completed interns");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletedInterns();
  }, [fetchCompletedInterns]);

  // Apply all filters
  useEffect(() => {
    let result = [...interns];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (intern) =>
          intern.fullName?.toLowerCase().includes(term) ||
          intern.email?.toLowerCase().includes(term) ||
          intern.phone?.includes(term) ||
          intern.registrationNumber?.toLowerCase().includes(term) ||
          intern.chosenCourse?.toLowerCase().includes(term) ||
          intern.displayUniversity?.toLowerCase().includes(term)
      );
    }
    
    // Course filter
    if (courseFilter !== "all") {
      result = result.filter((intern) => intern.chosenCourse === courseFilter);
    }
    
    // Certificate count filter
    if (certificateCountFilter !== "all") {
      if (certificateCountFilter === "none") {
        result = result.filter((intern) => intern.certificateCount === 0);
      } else if (certificateCountFilter === "has") {
        result = result.filter((intern) => intern.certificateCount > 0);
      } else if (certificateCountFilter === "1-3") {
        result = result.filter((intern) => intern.certificateCount >= 1 && intern.certificateCount <= 3);
      } else if (certificateCountFilter === "4+") {
        result = result.filter((intern) => intern.certificateCount >= 4);
      }
    }
    
    // University filter
    if (universityFilter !== "all") {
      result = result.filter((intern) => intern.displayUniversity === universityFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === "certificateCount") {
        aVal = a.certificateCount || 0;
        bVal = b.certificateCount || 0;
      } else if (typeof aVal === "string") {
        aVal = aVal?.toLowerCase() || "";
        bVal = bVal?.toLowerCase() || "";
      } else {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }
      
      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    
    setFilteredInterns(result);
    setPage(0);
    
    // Count active filters
    let count = 0;
    if (searchTerm) count++;
    if (courseFilter !== "all") count++;
    if (certificateCountFilter !== "all") count++;
    if (universityFilter !== "all") count++;
    setActiveFiltersCount(count);
  }, [interns, searchTerm, courseFilter, certificateCountFilter, universityFilter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSortMenuOpen = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortMenuClose = () => {
    setSortAnchorEl(null);
  };

  const handleSortChange = (field, direction) => {
    setSortField(field);
    setSortDirection(direction);
    handleSortMenuClose();
  };

  const handleViewCertificates = (intern) => {
    navigate(`/admin/internship/certificates/${intern.registrationNumber || intern.id}`);
  };

  const getCertificateIcon = (count) => {
    if (count === 0) return <Description sx={{ color: theme.palette.grey[400] }} />;
    if (count > 0) return <VerifiedUser sx={{ color: theme.palette.success.main }} />;
    return <Description />;
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setCourseFilter("all");
    setCertificateCountFilter("all");
    setUniversityFilter("all");
  };

  const getSortLabel = () => {
    const labels = {
      fullName: "Name",
      email: "Email",
      chosenCourse: "Course",
      certificateCount: "Certificate Count",
      registrationNumber: "Registration No",
      displayUniversity: "University",
    };
    return `${labels[sortField] || sortField} (${sortDirection === "asc" ? "A-Z" : "Z-A"})`;
  };

  const paginatedInterns = filteredInterns.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Filter Drawer Content
  const filterDrawerContent = (
    <Box sx={{ width: isMobile ? "100%" : 320, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Filters
        </Typography>
        <IconButton onClick={() => setFilterDrawerOpen(false)}>
          <Close />
        </IconButton>
      </Box>
      <Divider sx={{ mb: 2 }} />
      
      {/* Course Filter */}
      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
        <Category fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
        Course
      </Typography>
      <FormControl size="small" fullWidth sx={{ mb: 2 }}>
        <Select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="all">All Courses</MenuItem>
          {availableCourses.map((course) => (
            <MenuItem key={course} value={course}>{course}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {/* Certificate Count Filter */}
      <Typography variant="subtitle2" gutterBottom>
        <VerifiedUser fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
        Certificates
      </Typography>
      <FormControl size="small" fullWidth sx={{ mb: 2 }}>
        <Select
          value={certificateCountFilter}
          onChange={(e) => setCertificateCountFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="none">No Certificates</MenuItem>
          <MenuItem value="has">Has Certificates</MenuItem>
          <MenuItem value="1-3">1-3 Certificates</MenuItem>
          <MenuItem value="4+">4+ Certificates</MenuItem>
        </Select>
      </FormControl>
      
      {/* University Filter */}
      <Typography variant="subtitle2" gutterBottom>
        <LocationOn fontSize="small" sx={{ mr: 1, verticalAlign: "middle" }} />
        University
      </Typography>
      <FormControl size="small" fullWidth sx={{ mb: 2 }}>
        <Select
          value={universityFilter}
          onChange={(e) => setUniversityFilter(e.target.value)}
          displayEmpty
        >
          <MenuItem value="all">All Universities</MenuItem>
          {availableUniversities.map((uni) => (
            <MenuItem key={uni} value={uni}>{uni}</MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <Divider sx={{ my: 2 }} />
      
      <Button
        fullWidth
        variant="outlined"
        startIcon={<Clear />}
        onClick={clearAllFilters}
        sx={{ mb: 1 }}
      >
        Clear All Filters
      </Button>
      <Button
        fullWidth
        variant="contained"
        onClick={() => setFilterDrawerOpen(false)}
      >
        Apply Filters
      </Button>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", }}>
      {/* AppBar with no border radius */}
      <AppBar position="fixed" sx={{ borderRadius: 0 }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate("/admin/internship")} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Certificate Management
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* View Toggle */}
            <Tooltip title={viewMode === "table" ? "Switch to Card View" : "Switch to Table View"}>
              <IconButton 
                color="inherit" 
                onClick={() => setViewMode(viewMode === "table" ? "card" : "table")}
              >
                {viewMode === "table" ? <GridView /> : <ViewList />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton color="inherit" onClick={fetchCompletedInterns}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ pt: { xs: 10, sm: 12 }, pb: 4, px: { xs: 2, sm: 3 } }}>
        <Fade in timeout={500}>
          <Box>
            {/* Header with Filters and Sort */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 3, justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700}>
                  Completed Interns
                  <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                    ({filteredInterns.length})
                  </Typography>
                </Typography>
                {activeFiltersCount > 0 && (
                  <Chip
                    size="small"
                    label={`${activeFiltersCount} active filter${activeFiltersCount !== 1 ? 's' : ''}`}
                    onDelete={clearAllFilters}
                    sx={{ mt: 1 }}
                  />
                )}
              </Box>
              
              <Box sx={{ display: "flex", gap: 1 }}>
                {/* Sort Button */}
                <Button
                  variant="outlined"
                  startIcon={<Sort />}
                  onClick={handleSortMenuOpen}
                  size={isMobile ? "small" : "medium"}
                  endIcon={sortDirection === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />}
                >
                  {isMobile ? "Sort" : getSortLabel()}
                </Button>
                
                {/* Filter Button with Badge */}
                <Badge badgeContent={activeFiltersCount} color="primary" invisible={activeFiltersCount === 0}>
                  <Button
                    variant={activeFiltersCount > 0 ? "contained" : "outlined"}
                    startIcon={<FilterList />}
                    onClick={() => setFilterDrawerOpen(true)}
                    size={isMobile ? "small" : "medium"}
                  >
                    Filters
                  </Button>
                </Badge>
                
                {/* Clear All Button */}
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outlined"
                    startIcon={<FilterAltOff />}
                    onClick={clearAllFilters}
                    size={isMobile ? "small" : "medium"}
                    color="error"
                  >
                    Clear
                  </Button>
                )}
              </Box>
            </Box>

            {/* Search Bar */}
            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3 }}>
              <TextField
                fullWidth
                placeholder="Search by name, email, phone, registration number, course, or university..."
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
              />
            </Paper>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                {searchTerm && (
                  <Chip
                    label={`Search: ${searchTerm}`}
                    onDelete={() => setSearchTerm("")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {courseFilter !== "all" && (
                  <Chip
                    label={`Course: ${courseFilter}`}
                    onDelete={() => setCourseFilter("all")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {certificateCountFilter !== "all" && (
                  <Chip
                    label={`Certificates: ${certificateCountFilter === "none" ? "No Certificates" : certificateCountFilter === "has" ? "Has Certificates" : certificateCountFilter === "1-3" ? "1-3 Certificates" : "4+ Certificates"}`}
                    onDelete={() => setCertificateCountFilter("all")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
                {universityFilter !== "all" && (
                  <Chip
                    label={`University: ${universityFilter}`}
                    onDelete={() => setUniversityFilter("all")}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            )}

            {/* Sort Menu */}
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={() => handleSortChange("fullName", "asc")}>
                <ListItemIcon><PersonAdd fontSize="small" /></ListItemIcon>
                <ListItemText>Name (A-Z)</ListItemText>
                {sortField === "fullName" && sortDirection === "asc" && <CheckCircle fontSize="small" color="primary" />}
              </MenuItem>
              <MenuItem onClick={() => handleSortChange("fullName", "desc")}>
                <ListItemIcon><PersonAdd fontSize="small" /></ListItemIcon>
                <ListItemText>Name (Z-A)</ListItemText>
                {sortField === "fullName" && sortDirection === "desc" && <CheckCircle fontSize="small" color="primary" />}
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => handleSortChange("certificateCount", "desc")}>
                <ListItemIcon><VerifiedUser fontSize="small" /></ListItemIcon>
                <ListItemText>Most Certificates First</ListItemText>
                {sortField === "certificateCount" && sortDirection === "desc" && <CheckCircle fontSize="small" color="primary" />}
              </MenuItem>
              <MenuItem onClick={() => handleSortChange("certificateCount", "asc")}>
                <ListItemIcon><VerifiedUser fontSize="small" /></ListItemIcon>
                <ListItemText>Least Certificates First</ListItemText>
                {sortField === "certificateCount" && sortDirection === "asc" && <CheckCircle fontSize="small" color="primary" />}
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => handleSortChange("chosenCourse", "asc")}>
                <ListItemIcon><Work fontSize="small" /></ListItemIcon>
                <ListItemText>Course (A-Z)</ListItemText>
                {sortField === "chosenCourse" && sortDirection === "asc" && <CheckCircle fontSize="small" color="primary" />}
              </MenuItem>
              <MenuItem onClick={() => handleSortChange("displayUniversity", "asc")}>
                <ListItemIcon><School fontSize="small" /></ListItemIcon>
                <ListItemText>University (A-Z)</ListItemText>
                {sortField === "displayUniversity" && sortDirection === "asc" && <CheckCircle fontSize="small" color="primary" />}
              </MenuItem>
              <MenuItem onClick={() => handleSortChange("registrationNumber", "asc")}>
                <ListItemIcon><Description fontSize="small" /></ListItemIcon>
                <ListItemText>Registration No (A-Z)</ListItemText>
                {sortField === "registrationNumber" && sortDirection === "asc" && <CheckCircle fontSize="small" color="primary" />}
              </MenuItem>
            </Menu>

            {/* Filter Drawer */}
            <Drawer
              anchor="right"
              open={filterDrawerOpen}
              onClose={() => setFilterDrawerOpen(false)}
            >
              {filterDrawerContent}
            </Drawer>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
            ) : filteredInterns.length === 0 ? (
              <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
                <VerifiedUser sx={{ fontSize: 64, color: theme.palette.grey[400], mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Completed Interns Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeFiltersCount > 0 ? "Try clearing your filters to see more results." : "Only interns with 'completed' status can receive certificates."}
                </Typography>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="contained"
                    startIcon={<Clear />}
                    onClick={clearAllFilters}
                    sx={{ mt: 2 }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </Paper>
            ) : (
              <>
                {viewMode === "table" && !isMobile ? (
                  <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: "hidden" }}>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow sx={{ bgcolor: theme.palette.grey[100] }}>
                          <TableCell onClick={() => handleSort("fullName")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                            Intern
                            {sortField === "fullName" && (sortDirection === "asc" ? <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} />)}
                          </TableCell>
                          <TableCell onClick={() => handleSort("email")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                            Contact
                            {sortField === "email" && (sortDirection === "asc" ? <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} />)}
                          </TableCell>
                          <TableCell onClick={() => handleSort("chosenCourse")} sx={{ cursor: "pointer", fontWeight: 600 }}>
                            Course
                            {sortField === "chosenCourse" && (sortDirection === "asc" ? <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} />)}
                          </TableCell>
                          <TableCell onClick={() => handleSort("certificateCount")} sx={{ cursor: "pointer", fontWeight: 600, textAlign: "center" }}>
                            Certificates
                            {sortField === "certificateCount" && (sortDirection === "asc" ? <ArrowUpward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} /> : <ArrowDownward fontSize="small" sx={{ ml: 0.5, verticalAlign: "middle" }} />)}
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedInterns.map((intern) => (
                          <TableRow key={intern.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                            <TableCell>
                              <Typography variant="body2" fontWeight={600}>
                                {intern.fullName || "N/A"}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Reg: {intern.registrationNumber || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{intern.email || "N/A"}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {intern.phone || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{intern.chosenCourse || "N/A"}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {intern.displayUniversity}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                icon={getCertificateIcon(intern.certificateCount)}
                                label={`${intern.certificateCount} Certificate${intern.certificateCount !== 1 ? 's' : ''}`}
                                size="small"
                                color={intern.certificateCount > 0 ? "success" : "default"}
                                variant={intern.certificateCount > 0 ? "filled" : "outlined"}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                variant="contained"
                                size="small"
                                endIcon={<ChevronRight />}
                                onClick={() => handleViewCertificates(intern)}
                                sx={{ borderRadius: 2, textTransform: "none" }}
                              >
                                Manage
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box>
                    {paginatedInterns.map((intern, index) => (
                      <motion.div
                        key={intern.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card sx={{ mb: 2, borderRadius: 3 }}>
                          <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={700}>
                                  {intern.fullName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Reg: {intern.registrationNumber || "N/A"}
                                </Typography>
                              </Box>
                              <Chip
                                icon={getCertificateIcon(intern.certificateCount)}
                                label={`${intern.certificateCount}`}
                                size="small"
                                color={intern.certificateCount > 0 ? "success" : "default"}
                              />
                            </Box>
                            
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                              <Email fontSize="small" color="action" />
                              <Typography variant="body2">{intern.email}</Typography>
                            </Box>
                            
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                              <Phone fontSize="small" color="action" />
                              <Typography variant="body2">{intern.phone}</Typography>
                            </Box>
                            
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                              <Work fontSize="small" color="action" />
                              <Typography variant="body2">{intern.chosenCourse}</Typography>
                            </Box>
                            
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <School fontSize="small" color="action" />
                              <Typography variant="body2">{intern.displayUniversity}</Typography>
                            </Box>
                          </CardContent>
                          
                          <Box sx={{ p: 2, pt: 0 }}>
                            <Button
                              fullWidth
                              variant="contained"
                              endIcon={<ChevronRight />}
                              onClick={() => handleViewCertificates(intern)}
                              sx={{ borderRadius: 2, textTransform: "none" }}
                            >
                              Manage Certificates
                            </Button>
                          </Box>
                        </Card>
                      </motion.div>
                    ))}
                  </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <TablePagination
                    component="div"
                    count={filteredInterns.length}
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
          </Box>
        </Fade>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.type} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CertificateList;