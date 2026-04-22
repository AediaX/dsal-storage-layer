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
} from '@mui/material';
import {
  ArrowBack,
  Visibility as ViewIcon,
  Reply as ReplyIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  MarkEmailRead as MarkEmailReadIcon,
  MarkEmailUnread as MarkEmailUnreadIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as ContentCopyIcon,
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

const ContactControl = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterTab, setFilterTab] = useState(0);
  const [replyForm, setReplyForm] = useState({
    subject: '',
    message: '',
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    try {
      const q = query(collection(db, 'contacts'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const messagesData = [];
      for (const docSnap of querySnapshot.docs) {
        const messageData = docSnap.data();
        messagesData.push({
          id: docSnap.id,
          ...messageData,
          timestamp: messageData.timestamp?.toDate?.() || new Date(messageData.timestamp),
        });
      }
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (message) => {
    try {
      const messageRef = doc(db, 'contacts', message.id);
      await updateDoc(messageRef, {
        status: 'read',
        readAt: new Date().toISOString(),
      });
      setSuccess('Message marked as read');
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error marking message:', error);
      setError('Failed to update message status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleMarkAsUnread = async (message) => {
    try {
      const messageRef = doc(db, 'contacts', message.id);
      await updateDoc(messageRef, {
        status: 'unread',
      });
      setSuccess('Message marked as unread');
      fetchMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error marking message:', error);
      setError('Failed to update message status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteMessage = async () => {
    try {
      await deleteDoc(doc(db, 'contacts', selectedMessage.id));
      setSuccess('Message deleted successfully');
      fetchMessages();
      setDeleteDialogOpen(false);
      setSelectedMessage(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error deleting message:', error);
      setError('Failed to delete message');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReply = () => {
    setReplyForm({
      subject: `Re: ${selectedMessage.subject}`,
      message: `\n\n--- Original Message ---\nFrom: ${selectedMessage.name} (${selectedMessage.email})\nSubject: ${selectedMessage.subject}\n\n${selectedMessage.message}`,
    });
    setReplyDialogOpen(true);
    setViewDialogOpen(false);
  };

  const handleSendReply = () => {
    const mailtoLink = `mailto:${selectedMessage.email}?subject=${encodeURIComponent(replyForm.subject)}&body=${encodeURIComponent(replyForm.message)}`;
    window.open(mailtoLink, '_blank');
    
    setSuccess('Email client opened. Please send the reply from your email provider.');
    setReplyDialogOpen(false);
    setTimeout(() => setSuccess(''), 5000);
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

  const getFilteredMessages = () => {
    let filtered = messages.filter((message) => {
      const matchesSearch =
        message.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message?.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterTab === 0) return matchesSearch;
      if (filterTab === 1) return matchesSearch && message.status === 'unread';
      if (filterTab === 2) return matchesSearch && message.status === 'read';

      return matchesSearch;
    });

    return filtered;
  };

  const filteredMessages = getFilteredMessages();
  const paginatedMessages = filteredMessages.slice(
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
    if (status === 'unread') {
      return <Chip label="Unread" color="error" size="small" icon={<ScheduleIcon sx={{ fontSize: 14 }} />} />;
    }
    return <Chip label="Read" color="success" size="small" icon={<CheckCircleIcon sx={{ fontSize: 14 }} />} />;
  };

  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === 'unread').length,
    read: messages.filter(m => m.status === 'read').length,
  };

  // Mobile Message Card Component
  const MessageCard = ({ message, index }) => {
    const [expanded, setExpanded] = useState(false);
    
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
                color="error"
                variant="dot"
                invisible={message.status !== 'unread'}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <Avatar sx={{ 
                  bgcolor: message.status === 'unread' ? theme.palette.error.main : theme.palette.primary.main,
                  width: 48,
                  height: 48
                }}>
                  {message.name?.[0] || 'U'}
                </Avatar>
              </Badge>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: message.status === 'unread' ? 700 : 500 }}>
                  {message.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {message.email}
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  {getStatusChip(message.status)}
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
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Subject: {message.subject}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Received: {new Date(message.timestamp).toLocaleString()}
                    </Typography>
                    {message.phone && (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <MuiLink href={`tel:${message.phone}`} variant="body2">
                          {message.phone}
                        </MuiLink>
                        <IconButton size="small" onClick={() => handleCopyPhone(message.phone)}>
                          <ContentCopyIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Stack>
                    )}
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      {message.status === 'unread' && (
                        <Tooltip title="Mark as Read">
                          <IconButton
                            size="small"
                            onClick={() => handleMarkAsRead(message)}
                            color="success"
                          >
                            <MarkEmailReadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {message.status === 'read' && (
                        <Tooltip title="Mark as Unread">
                          <IconButton
                            size="small"
                            onClick={() => handleMarkAsUnread(message)}
                            color="warning"
                          >
                            <MarkEmailUnreadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Reply">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedMessage(message);
                            handleReply();
                          }}
                          color="primary"
                        >
                          <ReplyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedMessage(message);
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
            Contact Control
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchMessages} sx={{ color: theme.palette.text.primary }}>
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
            Contact Messages
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
            Manage and respond to user inquiries
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        <Fade in={!!success || !!error}>
          <Stack spacing={2} sx={{ mb: 3 }}>
            {success && <Alert severity="success" onClose={() => setSuccess('')} sx={{ borderRadius: 2 }}>{success}</Alert>}
            {error && <Alert severity="error" onClose={() => setError('')} sx={{ borderRadius: 2 }}>{error}</Alert>}
          </Stack>
        </Fade>

        {/* Stats Cards */}
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
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
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 600 }}>
                    Total Messages
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: theme.palette.text.primary }}>
                    {stats.total}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2, p: 1 }}>
                  <EmailIcon sx={{ color: theme.palette.primary.main, fontSize: { xs: 20, sm: 28 } }} />
                </Box>
              </Stack>
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
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 600 }}>
                    Unread
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: theme.palette.error.main }}>
                    {stats.unread}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), borderRadius: 2, p: 1 }}>
                  <ScheduleIcon sx={{ color: theme.palette.error.main, fontSize: { xs: 20, sm: 28 } }} />
                </Box>
              </Stack>
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
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, textTransform: 'uppercase', fontWeight: 600 }}>
                    Read
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.5, color: theme.palette.success.main }}>
                    {stats.read}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 2, p: 1 }}>
                  <CheckCircleIcon sx={{ color: theme.palette.success.main, fontSize: { xs: 20, sm: 28 } }} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Box>

        {/* Search and Filters */}
        <Paper sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 3, 
          borderRadius: 3,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Search by name, email, subject..."
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
              sx={{ flex: 1 }}
            />
          </Stack>

          <Tabs 
            value={filterTab} 
            onChange={(e, v) => setFilterTab(v)} 
            sx={{ mt: 2, borderBottom: 1, borderColor: 'divider' }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={`All (${stats.total})`} />
            <Tab label={`Unread (${stats.unread})`} />
            <Tab label={`Read (${stats.read})`} />
          </Tabs>
        </Paper>

        {/* Messages Table/Cards */}
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
          ) : paginatedMessages.length === 0 ? (
            <Box sx={{ p: 8, textAlign: 'center' }}>
              <EmailIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography color="text.secondary">No messages found</Typography>
            </Box>
          ) : (
            <>
              {/* Desktop Table View */}
              {!isMobile && (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>From</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Subject</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Received</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Status</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedMessages.map((message) => (
                        <TableRow 
                          key={message.id} 
                          hover 
                          sx={{ 
                            bgcolor: message.status === 'unread' ? alpha(theme.palette.error.main, 0.02) : 'inherit',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.04)
                            }
                          }}
                        >
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Badge
                                color="error"
                                variant="dot"
                                invisible={message.status !== 'unread'}
                                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                              >
                                <Avatar sx={{ 
                                  bgcolor: message.status === 'unread' ? theme.palette.error.main : theme.palette.primary.main,
                                  width: 40,
                                  height: 40
                                }}>
                                  {message.name?.[0] || 'U'}
                                </Avatar>
                              </Badge>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: message.status === 'unread' ? 700 : 500, color: theme.palette.text.primary }}>
                                  {message.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {message.email}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: message.status === 'unread' ? 600 : 400, color: theme.palette.text.primary }}>
                              {message.subject}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(message.timestamp).toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>{getStatusChip(message.status)}</TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={1} justifyContent="center">
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedMessage(message);
                                    setViewDialogOpen(true);
                                  }}
                                  sx={{ color: theme.palette.info.main }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {message.status === 'unread' && (
                                <Tooltip title="Mark as Read">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkAsRead(message)}
                                    sx={{ color: theme.palette.success.main }}
                                  >
                                    <MarkEmailReadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {message.status === 'read' && (
                                <Tooltip title="Mark as Unread">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleMarkAsUnread(message)}
                                    sx={{ color: theme.palette.warning.main }}
                                  >
                                    <MarkEmailUnreadIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Reply">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedMessage(message);
                                    handleReply();
                                  }}
                                  sx={{ color: theme.palette.primary.main }}
                                >
                                  <ReplyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedMessage(message);
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
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Mobile Card View */}
              {isMobile && (
                <Box sx={{ p: 2 }}>
                  {paginatedMessages.map((message, index) => (
                    <MessageCard key={message.id} message={message} index={index} />
                  ))}
                </Box>
              )}

              <TablePagination
                rowsPerPageOptions={isMobile ? [5, 10, 25] : [5, 10, 25, 50]}
                component="div"
                count={filteredMessages.length}
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

      {/* View Message Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', fontWeight: 700 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Message Details</Typography>
            <IconButton onClick={() => setViewDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedMessage && (
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: theme.palette.primary.main }}>
                  {selectedMessage.name?.[0] || 'U'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedMessage.name}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                    <MuiLink href={`mailto:${selectedMessage.email}`} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <EmailIcon sx={{ fontSize: 14 }} /> {selectedMessage.email}
                    </MuiLink>
                    {selectedMessage.phone && (
                      <MuiLink href={`tel:${selectedMessage.phone}`} variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon sx={{ fontSize: 14 }} /> {selectedMessage.phone}
                      </MuiLink>
                    )}
                  </Stack>
                </Box>
                <Box>
                  {getStatusChip(selectedMessage.status)}
                </Box>
              </Stack>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Subject
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedMessage.subject}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Message
                </Typography>
                <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.grey[50], 0.5), borderRadius: 2 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedMessage.message}
                  </Typography>
                </Paper>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Received
                </Typography>
                <Typography variant="body2">
                  {new Date(selectedMessage.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<ReplyIcon />}
            onClick={handleReply}
            sx={{ borderRadius: 2 }}
          >
            Reply
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => {
              setViewDialogOpen(false);
              setDeleteDialogOpen(true);
            }}
            sx={{ borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onClose={() => setReplyDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', fontWeight: 700 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Reply to {selectedMessage?.name}</Typography>
            <IconButton onClick={() => setReplyDialogOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="To"
              value={selectedMessage?.email || ''}
              disabled
              size="small"
            />
            <TextField
              fullWidth
              label="Subject"
              value={replyForm.subject}
              onChange={(e) => setReplyForm({ ...replyForm, subject: e.target.value })}
              size="small"
            />
            <TextField
              fullWidth
              label="Message"
              multiline
              rows={10}
              value={replyForm.message}
              onChange={(e) => setReplyForm({ ...replyForm, message: e.target.value })}
              placeholder="Type your reply here..."
            />
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="caption">
                This will open your default email client. Make sure you're logged into your email account to send the reply.
              </Typography>
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={() => setReplyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            startIcon={<OpenInNewIcon />}
            onClick={handleSendReply}
            sx={{ borderRadius: 2 }}
          >
            Open Email Client
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this message from <strong>{selectedMessage?.name}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteMessage} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContactControl;