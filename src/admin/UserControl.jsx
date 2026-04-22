// admin/UserControl.jsx
import React, { useState, useEffect } from "react";
import {
  Box, AppBar, Toolbar, Typography, IconButton, Button, TextField,
  Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Chip, Avatar, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, Snackbar, Menu, MenuItem,
  ListItemIcon, ListItemText, InputAdornment, Tooltip,
  FormControlLabel, Switch, Divider, Card, CardContent,
  CircularProgress, Stack, CardActions, Collapse, useTheme, useMediaQuery,
  alpha
} from "@mui/material";
import {
  ArrowBack, Search, FilterList, MoreVert, Edit, Delete, CheckCircle, 
  AdminPanelSettings, Person, Email, Phone, LockReset, Visibility, 
  Close, Refresh, Download, VerifiedUser, Warning, ExpandMore,
  ExpandLess, CalendarToday, CreditCard
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { useThemeContext } from "../contexts/ThemeContext";

const UserControl = () => {
  const theme = useTheme();
  const { mode } = useThemeContext();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  
  // State for users
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : 10);
  const [expandedCard, setExpandedCard] = useState(null);
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form states
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    dob: "",
    isAdmin: false,
    isUser: true,
  });
  
  // Notification states
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  
  // Menu states
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextUser, setContextUser] = useState(null);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    users: 0,
    verified: 0,
    unverified: 0
  });

  // Update rows per page on mobile
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : 10);
  }, [isMobile]);

  // Fetch users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by createdAt date
      usersList.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
      });
      
      setUsers(usersList);
      setFilteredUsers(usersList);
      
      // Calculate stats
      const admins = usersList.filter(u => u.isAdmin).length;
      const verified = usersList.filter(u => u.emailVerified).length;
      const unverified = usersList.filter(u => !u.emailVerified).length;
      
      setStats({
        total: usersList.length,
        admins: admins,
        users: usersList.length - admins,
        verified: verified,
        unverified: unverified
      });
      
    } catch (error) {
      console.error("Error fetching users:", error);
      showNotification("Failed to load users", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = [...users];
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobile?.includes(searchTerm)
      );
    }
    
    if (roleFilter !== "all") {
      filtered = filtered.filter(user =>
        roleFilter === "admin" ? user.isAdmin : !user.isAdmin
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter(user =>
        statusFilter === "verified" ? user.emailVerified : !user.emailVerified
      );
    }
    
    setFilteredUsers(filtered);
    setPage(0);
  }, [searchTerm, roleFilter, statusFilter, users]);

  const showNotification = (message, severity = "success") => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    try {
      const userRef = doc(db, "users", selectedUser.id);
      await updateDoc(userRef, {
        fullName: editForm.fullName,
        mobile: editForm.mobile,
        dob: editForm.dob,
        isAdmin: editForm.isAdmin,
        isUser: !editForm.isAdmin,
        updatedAt: new Date().toISOString()
      });
      
      showNotification("User updated successfully");
      fetchUsers();
      setEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      showNotification("Failed to update user", "error");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      const userRef = doc(db, "users", selectedUser.id);
      await deleteDoc(userRef);
      
      showNotification("User deleted successfully");
      fetchUsers();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Failed to delete user", "error");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    
    try {
      await sendPasswordResetEmail(auth, selectedUser.email);
      showNotification(`Password reset email sent to ${selectedUser.email}`);
      setResetDialogOpen(false);
    } catch (error) {
      console.error("Error sending reset email:", error);
      showNotification("Failed to send reset email", "error");
    }
  };

  const handleToggleAdmin = async (user) => {
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        isAdmin: !user.isAdmin,
        isUser: user.isAdmin,
        updatedAt: new Date().toISOString()
      });
      
      showNotification(`${user.fullName}'s role updated`);
      fetchUsers();
      setAnchorEl(null);
    } catch (error) {
      console.error("Error toggling admin:", error);
      showNotification("Failed to update role", "error");
    }
  };

  const handleToggleVerification = async (user) => {
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        emailVerified: !user.emailVerified,
        updatedAt: new Date().toISOString()
      });
      
      showNotification(`${user.fullName}'s verification status updated`);
      fetchUsers();
      setAnchorEl(null);
    } catch (error) {
      console.error("Error toggling verification:", error);
      showNotification("Failed to update verification", "error");
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName || "",
      email: user.email || "",
      mobile: user.mobile || "",
      dob: user.dob || "",
      isAdmin: user.isAdmin || false,
      isUser: !user.isAdmin,
    });
    setEditDialogOpen(true);
    setAnchorEl(null);
  };

  const openViewDialog = (user) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
    setAnchorEl(null);
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const openResetDialog = (user) => {
    setSelectedUser(user);
    setResetDialogOpen(true);
    setAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setContextUser(null);
  };

  const exportToCSV = () => {
    const headers = ["Name", "Email", "Mobile", "DOB", "Role", "Verified", "Created At"];
    const csvData = filteredUsers.map(user => [
      user.fullName || "",
      user.email || "",
      user.mobile || "",
      user.dob || "",
      user.isAdmin ? "Admin" : "User",
      user.emailVerified ? "Yes" : "No",
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification("Users exported successfully");
  };

  const getStatusChip = (user) => {
    if (user.emailVerified) {
      return <Chip size="small" icon={<CheckCircle sx={{ fontSize: 16 }} />} label="Verified" color="success" />;
    }
    return <Chip size="small" icon={<Warning sx={{ fontSize: 16 }} />} label="Unverified" color="warning" />;
  };

  const getRoleChip = (user) => {
    if (user.isAdmin) {
      return <Chip size="small" icon={<AdminPanelSettings sx={{ fontSize: 16 }} />} label="Admin" color="primary" />;
    }
    return <Chip size="small" icon={<Person sx={{ fontSize: 16 }} />} label="User" color="default" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const toggleCardExpand = (userId) => {
    setExpandedCard(expandedCard === userId ? null : userId);
  };

  const renderMobileCard = (user) => {
    const isExpanded = expandedCard === user.id;
    
    return (
      <Card 
        key={user.id} 
        sx={{ 
          mb: 2, 
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          transition: "all 0.3s ease",
          border: mode === "dark" ? `1px solid ${theme.palette.divider}` : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          '&:hover': {
            transform: "translateY(-2px)",
            boxShadow: mode === "light" 
              ? "0 8px 25px rgba(0,0,0,0.1)"
              : "0 8px 25px rgba(0,0,0,0.3)"
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
              <Avatar 
                src={user.profileImage} 
                sx={{ width: 50, height: 50, bgcolor: theme.palette.primary.main }}
              >
                {!user.profileImage && user.fullName?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                  {user.fullName || "N/A"}
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  ID: {user.id.slice(0, 8)}...
                </Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => toggleCardExpand(user.id)} sx={{ color: theme.palette.text.secondary }}>
              {isExpanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Stack>
          
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            {getRoleChip(user)}
            {getStatusChip(user)}
          </Stack>
          
          <Collapse in={isExpanded}>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>{user.email}</Typography>
              </Box>
              {user.mobile && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>{user.mobile}</Typography>
                </Box>
              )}
              {user.dob && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>DOB: {user.dob}</Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CreditCard sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>Joined: {formatDate(user.createdAt)}</Typography>
              </Box>
              {user.authProvider && (
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Provider: {user.authProvider}
                </Typography>
              )}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <CardActions sx={{ px: 0, justifyContent: "space-between" }}>
              <Button 
                size="small" 
                startIcon={<Visibility />}
                onClick={() => openViewDialog(user)}
                sx={{ color: theme.palette.text.primary }}
              >
                View
              </Button>
              <Button 
                size="small" 
                startIcon={<Edit />}
                onClick={() => openEditDialog(user)}
                sx={{ color: theme.palette.text.primary }}
              >
                Edit
              </Button>
              <IconButton 
                size="small"
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                  setContextUser(user);
                }}
                sx={{ color: theme.palette.text.secondary }}
              >
                <MoreVert />
              </IconButton>
            </CardActions>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ 
      minHeight: "100vh", 
      bgcolor: theme.palette.background.default 
    }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          zIndex: 1100
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <IconButton 
            onClick={() => navigate("/admin/home")} 
            sx={{ 
              color: theme.palette.text.primary,
              mr: 1
            }}
          >
            <ArrowBack />
          </IconButton>
          <Typography 
            variant="h6" 
            sx={{ 
              flex: 1, 
              color: theme.palette.text.primary, 
              fontWeight: 700,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            User Management
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchUsers} sx={{ color: theme.palette.text.primary }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export CSV">
            <IconButton onClick={exportToCSV} sx={{ color: theme.palette.text.primary }}>
              <Download />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ 
        pt: { xs: 8, sm: 9 }, 
        pb: 4, 
        px: { xs: 2, sm: 3, md: 4 },
        maxWidth: '1400px',
        mx: 'auto'
      }}>
        
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 5, mt: 2 }}>
          <Box sx={{
            width: 80,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            borderRadius: 2,
            mx: 'auto',
            mb: 2
          }} />
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            User Control Panel
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: alpha(theme.palette.text.primary, 0.7),
              maxWidth: 500,
              mx: 'auto',
              mt: 1
            }}
          >
            Manage users, roles, and permissions
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 2,
          mb: 4
        }}>
          <Card sx={{ 
            borderRadius: 3, 
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Total Users</Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.text.primary }}>{stats.total}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            borderRadius: 3, 
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Administrators</Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.primary.main }}>{stats.admins}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            borderRadius: 3, 
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Regular Users</Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.secondary.main }}>{stats.users}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            borderRadius: 3, 
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-2px)' }
          }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Verified</Typography>
              <Typography variant="h4" fontWeight={700} sx={{ color: theme.palette.success.main }}>{stats.verified}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Filters Bar */}
        <Paper sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 3, 
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <TextField
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              fullWidth={isMobile}
              sx={{ flex: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: theme.palette.text.secondary }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            
            <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
              <TextField
                select
                label="Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                size="small"
                sx={{ flex: 1, minWidth: 120 }}
                SelectProps={{ native: true }}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </TextField>
              
              <TextField
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
                sx={{ flex: 1, minWidth: 120 }}
                SelectProps={{ native: true }}
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </TextField>
              
              <Button 
                variant="outlined" 
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
                startIcon={<FilterList />}
                size="small"
              >
                Reset
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Users Display */}
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Paper sx={{ 
            p: 8, 
            textAlign: "center", 
            borderRadius: 3, 
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}>
            <Typography sx={{ color: theme.palette.text.secondary }}>No users found</Typography>
          </Paper>
        ) : isMobile ? (
          // Mobile Card View
          <Box>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => renderMobileCard(user))
            }
            <TablePagination
              rowsPerPageOptions={[5, 10]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{
                color: theme.palette.text.primary,
                mt: 2,
                '& .MuiTablePagination-toolbar': {
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }
              }}
            />
          </Box>
        ) : (
          // Desktop Table View
          <Paper sx={{ 
            borderRadius: 3, 
            overflow: "hidden", 
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
          }}>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    bgcolor: mode === "light" ? alpha(theme.palette.primary.main, 0.04) : alpha(theme.palette.primary.main, 0.08)
                  }}>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>User</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Contact</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Role</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Joined</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary, textAlign: "center" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar 
                              src={user.profileImage} 
                              sx={{ width: 40, height: 40, bgcolor: theme.palette.primary.main }}
                            >
                              {!user.profileImage && user.fullName?.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600} sx={{ color: theme.palette.text.primary }}>{user.fullName || "N/A"}</Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                ID: {user.id.slice(0, 8)}...
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: theme.palette.text.primary }}>
                              <Email sx={{ fontSize: 14 }} /> {user.email}
                            </Typography>
                            {user.mobile && (
                              <Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, color: theme.palette.text.secondary }}>
                                <Phone sx={{ fontSize: 12 }} /> {user.mobile}
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>{getRoleChip(user)}</TableCell>
                        <TableCell>{getStatusChip(user)}</TableCell>
                        <TableCell sx={{ color: theme.palette.text.primary }}>{formatDate(user.createdAt)}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setAnchorEl(e.currentTarget);
                              setContextUser(user);
                            }}
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              sx={{ color: theme.palette.text.primary }}
            />
          </Paper>
        )}
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            border: mode === "dark" ? `1px solid ${theme.palette.divider}` : `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 2
          }
        }}
      >
        <MenuItem onClick={() => openViewDialog(contextUser)}>
          <ListItemIcon><Visibility fontSize="small" sx={{ color: theme.palette.text.primary }} /></ListItemIcon>
          <ListItemText sx={{ color: theme.palette.text.primary }}>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openEditDialog(contextUser)}>
          <ListItemIcon><Edit fontSize="small" sx={{ color: theme.palette.text.primary }} /></ListItemIcon>
          <ListItemText sx={{ color: theme.palette.text.primary }}>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleToggleAdmin(contextUser)}>
          <ListItemIcon><AdminPanelSettings fontSize="small" sx={{ color: theme.palette.text.primary }} /></ListItemIcon>
          <ListItemText sx={{ color: theme.palette.text.primary }}>{contextUser?.isAdmin ? "Remove Admin" : "Make Admin"}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleToggleVerification(contextUser)}>
          <ListItemIcon><VerifiedUser fontSize="small" sx={{ color: theme.palette.text.primary }} /></ListItemIcon>
          <ListItemText sx={{ color: theme.palette.text.primary }}>{contextUser?.emailVerified ? "Mark Unverified" : "Mark Verified"}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openResetDialog(contextUser)}>
          <ListItemIcon><LockReset fontSize="small" sx={{ color: theme.palette.text.primary }} /></ListItemIcon>
          <ListItemText sx={{ color: theme.palette.text.primary }}>Reset Password</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => openDeleteDialog(contextUser)} sx={{ color: theme.palette.error.main }}>
          <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit User Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              fullWidth
              value={editForm.fullName}
              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              disabled
              value={editForm.email}
            />
            <TextField
              label="Mobile"
              fullWidth
              value={editForm.mobile}
              onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
            />
            <TextField
              label="Date of Birth"
              type="date"
              fullWidth
              value={editForm.dob}
              onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.isAdmin}
                  onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked, isUser: !e.target.checked })}
                />
              }
              label="Administrator Access"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditUser} variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: theme.palette.error.main }}>Delete User</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.primary }}>
            Are you sure you want to delete <strong>{selectedUser?.fullName}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog 
        open={resetDialogOpen} 
        onClose={() => setResetDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Reset Password</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: theme.palette.text.primary }}>
            Send a password reset email to <strong>{selectedUser?.email}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetPassword} variant="contained">Send Email</Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: theme.palette.text.primary }}>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Avatar 
                  src={selectedUser.profileImage} 
                  sx={{ width: 100, height: 100, border: `3px solid ${theme.palette.primary.main}`, bgcolor: theme.palette.primary.main }}
                >
                  {!selectedUser.profileImage && selectedUser.fullName?.charAt(0)}
                </Avatar>
              </Box>
              
              <Divider />
              
              <Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Full Name</Typography>
                <Typography variant="body1" fontWeight={500} sx={{ color: theme.palette.text.primary }}>{selectedUser.fullName || "N/A"}</Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Email Address</Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>{selectedUser.email}</Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Mobile Number</Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>{selectedUser.mobile || "Not provided"}</Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Date of Birth</Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>{selectedUser.dob || "Not provided"}</Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Account Created</Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "N/A"}
                </Typography>
              </Box>
              
              <Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Authentication Provider</Typography>
                <Typography variant="body1" sx={{ color: theme.palette.text.primary }}>{selectedUser.authProvider || "email"}</Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserControl;