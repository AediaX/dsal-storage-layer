import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  InputAdornment,
  Avatar,
  Tooltip,
  useTheme,
  Stack,
  Divider,
  Skeleton,
  Fade,
  Zoom,
  alpha,
  useMediaQuery,
  Card,
  CardContent,
  Tabs,
  Tab,
  Badge,
  Link as MuiLink,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ArrowBack,
  Visibility as ViewIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ContentCopy as ContentCopyIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  MoreVert as MoreVertIcon,
  Done as DoneIcon,
  Pending as PendingIcon,
  Sort as SortIcon,
  FlashOn as FlashOnIcon,
  Settings as SettingsIcon,
  RocketLaunch as RocketIcon,
  Cloud as CloudIcon,
  Devices as DevicesIcon,
  ExpandMore as ExpandMoreIcon,
  DesignServices as DesignIcon,
  Brush as BrushIcon,
  VideoLibrary as VideoIcon,
  SocialDistance as SocialIcon,
  Wallpaper as WallpaperIcon,
  SupportAgent as SupportIcon,
  PictureAsPdf as PdfIcon,
  Science as ScienceIcon,
  Signpost as SignIcon,
  Lightbulb as LightIcon,
  Campaign as CampaignIcon,
  Home as HomeIcon,
  LocalPrintshop as PrintIcon,
  DisplaySettings as LedIcon,
} from '@mui/icons-material';
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';

const ServiceConsultancyControl = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterTab, setFilterTab] = useState(0);
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [anchorEl, setAnchorEl] = useState(null);
  const [contextRequest, setContextRequest] = useState(null);

  // All service categories including More Services
  const serviceCategories = [
    { 
      type: 'consultancy', 
      label: 'Consultancy', 
      icon: <SettingsIcon />, 
      color: theme.palette.primary.main,
      services: ['Business Consultancy', 'IT Strategy', 'Digital Transformation']
    },
    { 
      type: 'automation', 
      label: 'Automation', 
      icon: <FlashOnIcon />, 
      color: theme.palette.secondary.main,
      services: ['Workflow Automation', 'RPA', 'Process Optimization']
    },
    { 
      type: 'mvp', 
      label: 'MVP Development', 
      icon: <RocketIcon />, 
      color: theme.palette.success.main,
      services: ['Product MVP', 'Prototype Development', 'POC']
    },
    { 
      type: 'saas', 
      label: 'SaaS Development', 
      icon: <CloudIcon />, 
      color: theme.palette.info.main,
      services: ['Cloud SaaS', 'Subscription Platform', 'Enterprise SaaS']
    },
    { 
      type: 'app-development', 
      label: 'App Development', 
      icon: <DevicesIcon />, 
      color: theme.palette.warning.main,
      services: ['Mobile Apps', 'Web Apps', 'Cross-platform Apps']
    },
    { 
      type: 'more-services', 
      label: 'More Services', 
      icon: <DesignIcon />, 
      color: theme.palette.success.main,
      services: [
        'UI/UX Designing', 'Video Editing', 'Poster Designing', 'Wallpaper Designing',
        'PPT Creation', 'Flex Designing & Delivery (Bhubaneswar)', 'LED Screen Installation',
        'Sign Board', 'Glow Sign Board Designing', 'Home Architecture Designing',
        'Advertisement', 'Social Media Handling', 'Support Service', 'Help in Research Paper'
      ]
    }
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'consultancy_requests'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const requestsData = [];
      for (const docSnap of querySnapshot.docs) {
        const requestData = docSnap.data();
        requestsData.push({
          id: docSnap.id,
          ...requestData,
          createdAt: requestData.createdAt || new Date().toISOString(),
          serviceType: requestData.serviceType || 'consultancy',
        });
      }
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (request, newStatus) => {
    try {
      const requestRef = doc(db, 'consultancy_requests', request.id);
      await updateDoc(requestRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setSuccess(`Request marked as ${newStatus}`);
      fetchRequests();
      setAnchorEl(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update request status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteRequest = async () => {
    try {
      await deleteDoc(doc(db, 'consultancy_requests', selectedRequest.id));
      setSuccess('Request deleted successfully');
      fetchRequests();
      setDeleteDialogOpen(false);
      setSelectedRequest(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting request:', error);
      setError('Failed to delete request');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setSuccess('Email copied to clipboard');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleCopyPhone = (phone) => {
    navigator.clipboard.writeText(phone);
    setSuccess('Phone number copied to clipboard');
    setTimeout(() => setSuccess(''), 2000);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const getServiceTypeLabel = (type) => {
    const category = serviceCategories.find(c => c.type === type);
    if (category) {
      return { label: category.label, icon: category.icon, color: category.color };
    }
    return { label: 'Consultancy', icon: <SettingsIcon />, color: theme.palette.primary.main };
  };

  const getServiceIcon = (serviceName) => {
    const iconMap = {
      'UI/UX Designing': <DesignIcon />,
      'Video Editing': <VideoIcon />,
      'Poster Designing': <BrushIcon />,
      'Wallpaper Designing': <WallpaperIcon />,
      'PPT Creation': <PdfIcon />,
      'Flex Designing & Delivery (Bhubaneswar)': <PrintIcon />,
      'LED Screen Installation': <LedIcon />,
      'Sign Board': <SignIcon />,
      'Glow Sign Board Designing': <LightIcon />,
      'Home Architecture Designing': <HomeIcon />,
      'Advertisement': <CampaignIcon />,
      'Social Media Handling': <SocialIcon />,
      'Support Service': <SupportIcon />,
      'Help in Research Paper': <ScienceIcon />,
    };
    return iconMap[serviceName] || <DesignIcon />;
  };

  const getFilteredRequests = () => {
    let filtered = requests.filter((request) => {
      const matchesSearch =
        request.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.serviceInterest?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesServiceType = serviceTypeFilter === 'all' || request.serviceType === serviceTypeFilter;

      let matchesStatus = true;
      if (filterTab === 1) matchesStatus = request.status === 'pending';
      else if (filterTab === 2) matchesStatus = request.status === 'in-review';
      else if (filterTab === 3) matchesStatus = request.status === 'contacted';
      else if (filterTab === 4) matchesStatus = request.status === 'completed';

      return matchesSearch && matchesServiceType && matchesStatus;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  const filteredRequests = getFilteredRequests();
  const paginatedRequests = filteredRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" icon={<ScheduleIcon sx={{ fontSize: 14 }} />} />;
      case 'in-review':
        return <Chip label="In Review" color="info" size="small" icon={<SearchIcon sx={{ fontSize: 14 }} />} />;
      case 'contacted':
        return <Chip label="Contacted" color="primary" size="small" icon={<PhoneIcon sx={{ fontSize: 14 }} />} />;
      case 'completed':
        return <Chip label="Completed" color="success" size="small" icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    inReview: requests.filter(r => r.status === 'in-review').length,
    contacted: requests.filter(r => r.status === 'contacted').length,
    completed: requests.filter(r => r.status === 'completed').length,
    consultancy: requests.filter(r => r.serviceType === 'consultancy').length,
    automation: requests.filter(r => r.serviceType === 'automation').length,
    mvp: requests.filter(r => r.serviceType === 'mvp').length,
    saas: requests.filter(r => r.serviceType === 'saas').length,
    appDevelopment: requests.filter(r => r.serviceType === 'app-development').length,
    moreServices: requests.filter(r => r.serviceType === 'more-services').length,
  };

  // Group requests by service category for summary
  const getRequestsByCategory = () => {
    const categoryMap = {};
    serviceCategories.forEach(cat => {
      categoryMap[cat.label] = requests.filter(r => r.serviceType === cat.type);
    });
    return categoryMap;
  };

  const requestsByCategory = getRequestsByCategory();

  const getBudgetRangeColor = (budget) => {
    if (budget?.includes('Less')) return theme.palette.info.main;
    if (budget?.includes('50,000 - 2,00,000')) return theme.palette.primary.main;
    if (budget?.includes('2,00,000 - 5,00,000')) return theme.palette.secondary.main;
    if (budget?.includes('5,00,000 - 10,00,000')) return theme.palette.warning.main;
    if (budget?.includes('10,00,000+')) return theme.palette.success.main;
    return theme.palette.text.secondary;
  };

  // Mobile Request Card Component
  const RequestCard = ({ request, index }) => {
    const [expanded, setExpanded] = useState(false);
    const serviceInfo = getServiceTypeLabel(request.serviceType);
    const serviceIcon = getServiceIcon(request.serviceInterest);
    
    return (
      <Zoom in style={{ transitionDelay: `${index * 50}ms` }}>
        <Card sx={{ 
          mb: 2, 
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          overflow: 'hidden',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4]
          }
        }}>
          <CardContent sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Badge
                color="warning"
                variant="dot"
                invisible={request.status !== 'pending'}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <Avatar sx={{ 
                  bgcolor: request.status === 'pending' ? theme.palette.warning.main : serviceInfo.color,
                  width: 48,
                  height: 48
                }}>
                  {request.fullName?.[0] || 'C'}
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: request.status === 'pending' ? 700 : 500 }}>
                  {request.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {request.company || 'Individual'}
                </Typography>
                <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {getStatusChip(request.status)}
                  <Chip 
                    label={serviceInfo.label} 
                    size="small" 
                    icon={serviceInfo.icon}
                    sx={{ bgcolor: alpha(serviceInfo.color, 0.1), color: serviceInfo.color }}
                  />
                </Box>
              </Box>
              <IconButton onClick={() => setExpanded(!expanded)} size="small">
                {expanded ? <CloseIcon /> : <ViewIcon />}
              </IconButton>
            </Stack>
            
            {expanded && (
              <Fade in={expanded}>
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Service Interest</Typography>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                        {serviceIcon}
                        <Typography variant="body2" fontWeight={500}>{request.serviceInterest}</Typography>
                      </Stack>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Message</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                        {request.message?.substring(0, 100)}...
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <MuiLink href={`mailto:${request.email}`} variant="caption">
                          {request.email}
                        </MuiLink>
                        <IconButton size="small" onClick={() => handleCopyEmail(request.email)}>
                          <ContentCopyIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                      </Stack>
                      {request.phone && (
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <MuiLink href={`tel:${request.phone}`} variant="caption">
                            {request.phone}
                          </MuiLink>
                          <IconButton size="small" onClick={() => handleCopyPhone(request.phone)}>
                            <ContentCopyIcon sx={{ fontSize: 12 }} />
                          </IconButton>
                        </Stack>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedRequest(request);
                            setViewDialogOpen(true);
                          }}
                          color="info"
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="More Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            setAnchorEl(e.currentTarget);
                            setContextRequest(request);
                          }}
                          color="primary"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedRequest(request);
                            setDeleteDialogOpen(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>
              </Fade>
            )}
          </CardContent>
        </Card>
      </Zoom>
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
            Service Requests Management
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchRequests} sx={{ color: theme.palette.text.primary }}>
              <RefreshIcon />
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
            Service Requests
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: alpha(theme.palette.text.primary, 0.7),
              maxWidth: 600,
              mx: 'auto',
              mt: 1
            }}
          >
            Manage all service inquiries including Consultancy, Automation, MVP, SaaS, App Development & More Services
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        <Fade in={!!success || !!error}>
          <Stack spacing={2} sx={{ mb: 3 }}>
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2 }}>{error}</Alert>}
          </Stack>
        </Fade>

        {/* Stats Cards - All Categories including More Services */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
          gap: 2,
          mb: 4
        }}>
          <Card sx={{ borderRadius: 3, bgcolor: theme.palette.background.paper, border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Total</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.total}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, bgcolor: theme.palette.background.paper, border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}` }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Pending</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>{stats.pending}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, bgcolor: theme.palette.background.paper, border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Completed</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>{stats.completed}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, bgcolor: theme.palette.background.paper, border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Consultancy</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.info.main }}>{stats.consultancy}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, bgcolor: theme.palette.background.paper, border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}` }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Automation</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>{stats.automation}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ borderRadius: 3, bgcolor: theme.palette.background.paper, border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>More Services</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, color: theme.palette.success.main }}>{stats.moreServices}</Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Service Category Summary Accordions */}
        <Accordion sx={{ mb: 3, borderRadius: 3, bgcolor: theme.palette.background.paper }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DesignIcon color="primary" /> Service Categories Overview
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2}>
              {serviceCategories.map((category, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <Paper sx={{ p: 2, borderRadius: 2, bgcolor: alpha(category.color, 0.05), border: `1px solid ${alpha(category.color, 0.2)}` }}>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                      <Box sx={{ color: category.color }}>{category.icon}</Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: category.color }}>
                        {category.label}
                      </Typography>
                      <Chip label={requestsByCategory[category.label]?.length || 0} size="small" sx={{ ml: 'auto' }} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      Services: {category.services.slice(0, 3).join(', ')}
                      {category.services.length > 3 && ` +${category.services.length - 3} more`}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Search and Filters */}
        <Paper sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 3, 
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                placeholder="Search by name, email, company, service..."
                value={searchTerm}
                onChange={handleSearch}
                size={isMobile ? "small" : "medium"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 2 }}
              />
              
              <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: 150 }}>
                <InputLabel>Service Type</InputLabel>
                <Select
                  value={serviceTypeFilter}
                  onChange={(e) => setServiceTypeFilter(e.target.value)}
                  label="Service Type"
                >
                  <MenuItem value="all">All Services</MenuItem>
                  <MenuItem value="consultancy">Consultancy</MenuItem>
                  <MenuItem value="automation">Automation</MenuItem>
                  <MenuItem value="mvp">MVP Development</MenuItem>
                  <MenuItem value="saas">SaaS Development</MenuItem>
                  <MenuItem value="app-development">App Development</MenuItem>
                  <MenuItem value="more-services">More Services</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size={isMobile ? "small" : "medium"} sx={{ minWidth: 150 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="createdAt">Date Received</MenuItem>
                  <MenuItem value="fullName">Name</MenuItem>
                  <MenuItem value="serviceInterest">Service</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                startIcon={<SortIcon />}
                size={isMobile ? "small" : "medium"}
              >
                {sortOrder === 'asc' ? 'Oldest First' : 'Newest First'}
              </Button>
            </Stack>
          </Stack>

          <Tabs 
            value={filterTab} 
            onChange={(e, v) => setFilterTab(v)} 
            sx={{ mt: 2, borderBottom: 1, borderColor: 'divider' }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All (${stats.total})`} />
            <Tab label={`Pending (${stats.pending})`} />
            <Tab label={`In Review (${stats.inReview})`} />
            <Tab label={`Contacted (${stats.contacted})`} />
            <Tab label={`Completed (${stats.completed})`} />
          </Tabs>
        </Paper>

        {/* Requests Table/Cards */}
        <Paper sx={{ 
          borderRadius: 3, 
          overflow: 'hidden',
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          {loading ? (
            <Box sx={{ p: 3 }}>
              <Stack spacing={2}>
                {[1, 2, 3, 4, 5].map((_, idx) => (
                  <Skeleton key={idx} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            </Box>
          ) : paginatedRequests.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography color="text.secondary">No service requests found</Typography>
            </Box>
          ) : (
            <>
              {/* Desktop Table View */}
              {!isMobile && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Contact</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Service Type</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Service</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Received</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRequests.map((request) => {
                        const serviceInfo = getServiceTypeLabel(request.serviceType);
                        const serviceIcon = getServiceIcon(request.serviceInterest);
                        return (
                          <TableRow 
                            key={request.id} 
                            hover 
                            sx={{ 
                              bgcolor: request.status === 'pending' ? alpha(theme.palette.warning.main, 0.02) : 'inherit',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.04)
                              }
                            }}
                          >
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ 
                                  bgcolor: request.status === 'pending' ? theme.palette.warning.main : serviceInfo.color,
                                  width: 40,
                                  height: 40
                                }}>
                                  {request.fullName?.[0] || 'C'}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: request.status === 'pending' ? 700 : 500, color: theme.palette.text.primary }}>
                                    {request.fullName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {request.company || 'Individual'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                  <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                  <Typography variant="caption" sx={{ color: theme.palette.text.primary }}>
                                    {request.email}
                                  </Typography>
                                  <IconButton size="small" onClick={() => handleCopyEmail(request.email)}>
                                    <ContentCopyIcon sx={{ fontSize: 12 }} />
                                  </IconButton>
                                </Stack>
                                {request.phone && (
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" sx={{ color: theme.palette.text.primary }}>
                                      {request.phone}
                                    </Typography>
                                    <IconButton size="small" onClick={() => handleCopyPhone(request.phone)}>
                                      <ContentCopyIcon sx={{ fontSize: 12 }} />
                                    </IconButton>
                                  </Stack>
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={serviceInfo.label} 
                                size="small" 
                                icon={serviceInfo.icon}
                                sx={{ bgcolor: alpha(serviceInfo.color, 0.1), color: serviceInfo.color }}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                {serviceIcon}
                                <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
                                  {request.serviceInterest}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>{getStatusChip(request.status)}</TableCell>
                            <TableCell>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Stack direction="row" spacing={1} justifyContent="center">
                                <Tooltip title="View Details">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setViewDialogOpen(true);
                                    }}
                                    sx={{ color: theme.palette.info.main }}
                                  >
                                    <ViewIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="More Actions">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      setAnchorEl(e.currentTarget);
                                      setContextRequest(request);
                                    }}
                                    sx={{ color: theme.palette.primary.main }}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setDeleteDialogOpen(true);
                                    }}
                                    sx={{ color: theme.palette.error.main }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Mobile Card View */}
              {isMobile && (
                <Box sx={{ p: 2 }}>
                  {paginatedRequests.map((request, index) => (
                    <RequestCard key={request.id} request={request} index={index} />
                  ))}
                </Box>
              )}

              <TablePagination
                rowsPerPageOptions={isMobile ? [5, 10, 25] : [5, 10, 25, 50]}
                component="div"
                count={filteredRequests.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                  color: theme.palette.text.primary,
                  borderTop: `1px solid ${theme.palette.divider}`
                }}
              />
            </>
          )}
        </Paper>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            borderRadius: 2
          }
        }}
      >
        <MenuItem onClick={() => handleUpdateStatus(contextRequest, 'pending')}>
          <ListItemIcon><PendingIcon fontSize="small" sx={{ color: theme.palette.warning.main }} /></ListItemIcon>
          <ListItemText>Mark as Pending</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(contextRequest, 'in-review')}>
          <ListItemIcon><SearchIcon fontSize="small" sx={{ color: theme.palette.info.main }} /></ListItemIcon>
          <ListItemText>Mark as In Review</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(contextRequest, 'contacted')}>
          <ListItemIcon><PhoneIcon fontSize="small" sx={{ color: theme.palette.primary.main }} /></ListItemIcon>
          <ListItemText>Mark as Contacted</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(contextRequest, 'completed')}>
          <ListItemIcon><DoneIcon fontSize="small" sx={{ color: theme.palette.success.main }} /></ListItemIcon>
          <ListItemText>Mark as Completed</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          setSelectedRequest(contextRequest);
          setViewDialogOpen(true);
          setAnchorEl(null);
        }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
      </Menu>

      {/* View Request Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', fontWeight: 700 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Service Request Details</Typography>
            <IconButton onClick={() => setViewDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedRequest && (
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main }}>
                  {selectedRequest.fullName?.[0] || 'C'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedRequest.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRequest.designation || 'No designation specified'}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mt: 1 }}>
                    <MuiLink href={`mailto:${selectedRequest.email}`} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 14 }} /> {selectedRequest.email}
                    </MuiLink>
                    {selectedRequest.phone && (
                      <MuiLink href={`tel:${selectedRequest.phone}`} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 14 }} /> {selectedRequest.phone}
                      </MuiLink>
                    )}
                  </Stack>
                </Box>
                <Box>
                  {getStatusChip(selectedRequest.status)}
                </Box>
              </Stack>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Company
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BusinessIcon sx={{ fontSize: 18 }} /> {selectedRequest.company || 'Not specified'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Service Type
                </Typography>
                <Chip 
                  label={getServiceTypeLabel(selectedRequest.serviceType).label} 
                  icon={getServiceTypeLabel(selectedRequest.serviceType).icon}
                  sx={{ bgcolor: alpha(getServiceTypeLabel(selectedRequest.serviceType).color, 0.1), color: getServiceTypeLabel(selectedRequest.serviceType).color }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Service Interest
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {getServiceIcon(selectedRequest.serviceInterest)}
                  <Chip label={selectedRequest.serviceInterest} color="primary" />
                </Stack>
              </Box>

              {selectedRequest.budget && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Budget Range
                  </Typography>
                  <Chip 
                    label={selectedRequest.budget} 
                    sx={{ 
                      bgcolor: alpha(getBudgetRangeColor(selectedRequest.budget), 0.1),
                      color: getBudgetRangeColor(selectedRequest.budget)
                    }}
                  />
                </Box>
              )}

              {/* Service-specific fields */}
              {selectedRequest.ideaDescription && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Product Idea
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[50], 0.5), borderRadius: 2 }}>
                    <Typography variant="body2">{selectedRequest.ideaDescription}</Typography>
                  </Paper>
                </Box>
              )}

              {selectedRequest.targetAudience && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Target Audience
                  </Typography>
                  <Typography variant="body2">{selectedRequest.targetAudience}</Typography>
                </Box>
              )}

              {selectedRequest.currentProcesses && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Current Processes
                  </Typography>
                  <Typography variant="body2">{selectedRequest.currentProcesses}</Typography>
                </Box>
              )}

              {selectedRequest.appType && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Application Type
                  </Typography>
                  <Chip label={selectedRequest.appType} variant="outlined" size="small" />
                </Box>
              )}

              {selectedRequest.platform && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Preferred Platform
                  </Typography>
                  <Chip label={selectedRequest.platform} variant="outlined" size="small" />
                </Box>
              )}

              {selectedRequest.features && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Key Features
                  </Typography>
                  <Typography variant="body2">{selectedRequest.features}</Typography>
                </Box>
              )}

              {selectedRequest.saasType && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    SaaS Type
                  </Typography>
                  <Chip label={selectedRequest.saasType} variant="outlined" size="small" />
                </Box>
              )}

              {selectedRequest.expectedUsers && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Expected Users
                  </Typography>
                  <Typography variant="body2">{selectedRequest.expectedUsers}</Typography>
                </Box>
              )}

              {/* For More Services - Additional details */}
              {selectedRequest.serviceType === 'more-services' && (
                <>
                  {selectedRequest.preferredLocation && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Preferred Location
                      </Typography>
                      <Typography variant="body2">{selectedRequest.preferredLocation}</Typography>
                    </Box>
                  )}
                  {selectedRequest.urgency && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Urgency Level
                      </Typography>
                      <Chip label={selectedRequest.urgency} size="small" color={selectedRequest.urgency === 'Urgent' ? 'error' : 'default'} />
                    </Box>
                  )}
                </>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Message / Requirements
                </Typography>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[50], 0.5), borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedRequest.message}
                  </Typography>
                </Paper>
              </Box>

              {(selectedRequest.preferredDate || selectedRequest.preferredTime) && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Preferred Schedule
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    {selectedRequest.preferredDate && (
                      <Chip icon={<CalendarIcon />} label={selectedRequest.preferredDate} variant="outlined" />
                    )}
                    {selectedRequest.preferredTime && (
                      <Chip icon={<TimeIcon />} label={selectedRequest.preferredTime} variant="outlined" />
                    )}
                  </Stack>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Request Received
                </Typography>
                <Typography variant="body2">
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EmailIcon />}
            onClick={() => {
              window.open(`mailto:${selectedRequest?.email}`, '_blank');
            }}
          >
            Send Email
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setViewDialogOpen(false);
              setDeleteDialogOpen(true);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this service request from <strong>{selectedRequest?.fullName}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteRequest} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServiceConsultancyControl;