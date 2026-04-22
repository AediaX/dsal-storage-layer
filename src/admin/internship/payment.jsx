import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Divider,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Stack,
  Badge,
  FormHelperText,
  Skeleton,
  Zoom,
  Fade,
  alpha,
} from "@mui/material";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
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
  Payment,
  Person,
  Email,
  ArrowBack,
  Receipt,
  Download,
  CheckCircle,
  Cancel as CancelIcon,
  Pending,
  Work,
  AccountBalanceWallet,
  CreditCard,
  Info,
  CalendarToday,
  AccessTime,
  Clear,
  School,
  Assessment,
  PieChart,
  BarChart,
  AttachMoney,
  Warning,
  Analytics,
  Insights,
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
  where,
} from "firebase/firestore";
import { app } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

const db = getFirestore(app);

// Payment Status Options
const paymentStatusOptions = [
  { value: "completed", label: "Completed", color: "success", icon: <CheckCircle /> },
  { value: "pending", label: "Pending", color: "warning", icon: <Pending /> },
  { value: "refunded", label: "Refunded", color: "error", icon: <CancelIcon /> },
  { value: "partial", label: "Partial", color: "info", icon: <Payment /> },
];

// Color palette for charts
const CHART_COLORS = {
  completed: '#4caf50',
  pending: '#ff9800',
  refunded: '#f44336',
  partial: '#2196f3',
  primary: '#1976d2',
  secondary: '#9c27b0',
  accent: '#ff4081',
};

// Format date helper
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  try {
    if (timestamp?.toDate) {
      return timestamp.toDate().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return "Invalid date";
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
};

// Format date only (no time)
const formatDateOnly = (date) => {
  if (!date) return "N/A";
  try {
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    return "Invalid date";
  }
};

// Format currency
const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  } catch (error) {
    return "₹0";
  }
};

// Format number with commas
const formatNumber = (num) => {
  try {
    return new Intl.NumberFormat("en-IN").format(num || 0);
  } catch (error) {
    return "0";
  }
};

const PaymentManagementDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isLaptop = useMediaQuery(theme.breakpoints.down("lg"));
  const isDesktop = useMediaQuery(theme.breakpoints.up("xl"));
  const navigate = useNavigate();

  // Data states
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(isMobile ? 5 : isTablet ? 8 : isLaptop ? 10 : 15);
 

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [sortField, setSortField] = useState("paidAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Date and Time filters
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [quickDateRange, setQuickDateRange] = useState("all");

  // Date-based calculations
  const [dateRangeStats, setDateRangeStats] = useState({
    count: 0,
    amount: 0,
    completed: 0,
    pending: 0,
    refunded: 0,
  });

  // Dynamic filter options
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [universities, setUniversities] = useState([]);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [updating, setUpdating] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPayment, setViewingPayment] = useState(null);

  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "success" });

  // Tab for mobile
  const [activeTab, setActiveTab] = useState(0);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (paymentMethodFilter !== "all") count++;
    if (universityFilter !== "all") count++;
    if (startDate) count++;
    if (endDate) count++;
    if (startTime) count++;
    if (endTime) count++;
    if (searchTerm) count++;
    return count;
  }, [statusFilter, paymentMethodFilter, universityFilter, startDate, endDate, startTime, endTime, searchTerm]);

  // Calculate date range statistics
  const calculateDateRangeStats = useCallback((data, start, end) => {
    if (!start && !end) {
      return {
        count: data.length,
        amount: data.reduce((sum, p) => sum + (p.amount || 0), 0),
        completed: data.filter(p => p.status === "completed").length,
        pending: data.filter(p => p.status === "pending").length,
        refunded: data.filter(p => p.status === "refunded").length,
        partial: data.filter(p => p.status === "partial").length,
      };
    }

    const filtered = data.filter(payment => {
      const paymentDate = payment.paidAt?.toDate ? payment.paidAt.toDate() : new Date(payment.paidAt);
      if (isNaN(paymentDate.getTime())) return false;
      
      const paymentDateOnly = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), paymentDate.getDate());
      
      if (start && end) {
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return paymentDateOnly >= startDateOnly && paymentDateOnly <= endDateOnly;
      } else if (start) {
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        return paymentDateOnly >= startDateOnly;
      } else if (end) {
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return paymentDateOnly <= endDateOnly;
      }
      return true;
    });

    return {
      count: filtered.length,
      amount: filtered.reduce((sum, p) => sum + (p.amount || 0), 0),
      completed: filtered.filter(p => p.status === "completed").length,
      pending: filtered.filter(p => p.status === "pending").length,
      refunded: filtered.filter(p => p.status === "refunded").length,
      partial: filtered.filter(p => p.status === "partial").length,
    };
  }, []);

  // Quick date range selection
  const handleQuickDateRange = (range) => {
    setQuickDateRange(range);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch(range) {
      case "today":
        setStartDate(today);
        setEndDate(today);
        break;
      case "yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setStartDate(yesterday);
        setEndDate(yesterday);
        break;
      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        setStartDate(weekAgo);
        setEndDate(today);
        break;
      case "month":
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        setStartDate(monthAgo);
        setEndDate(today);
        break;
      case "quarter":
        const quarterAgo = new Date(today);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        setStartDate(quarterAgo);
        setEndDate(today);
        break;
      case "year":
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        setStartDate(yearAgo);
        setEndDate(today);
        break;
      default:
        setStartDate(null);
        setEndDate(null);
    }
  };

  // Fetch payments with error handling
  const fetchPayments = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");
    
    try {
      const paymentsRef = collection(db, "payments");
      const q = query(paymentsRef, orderBy("paidAt", "desc"));
      const querySnapshot = await getDocs(q);

      const paymentsList = [];
      const methodsSet = new Set();
      const universitiesSet = new Set();

      for (const docSnap of querySnapshot.docs) {
        try {
          const data = { id: docSnap.id, ...docSnap.data() };
          paymentsList.push(data);
          if (data.paymentMethod) methodsSet.add(data.paymentMethod);
          if (data.university) universitiesSet.add(data.university);
          if (data.userData?.university) universitiesSet.add(data.userData.university);
        } catch (docError) {
          console.error("Error processing document:", docSnap.id, docError);
        }
      }

      setPayments(paymentsList);
      setFilteredPayments(paymentsList);
      setPaymentMethods(["all", ...Array.from(methodsSet).sort()]);
      setUniversities(["all", ...Array.from(universitiesSet).sort()]);
      
      // Calculate initial date range stats
      const stats = calculateDateRangeStats(paymentsList, startDate, endDate);
      setDateRangeStats(stats);
      
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Failed to load payment data. Please try again.");
      setSnackbar({ 
        open: true, 
        message: "Failed to fetch payments. Please refresh.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [calculateDateRangeStats, startDate, endDate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Update rows per page on screen size change
  useEffect(() => {
    setRowsPerPage(isMobile ? 5 : isTablet ? 8 : isLaptop ? 10 : 15);
  }, [isMobile, isTablet, isLaptop]);

  // Apply filters and search with error handling
  useEffect(() => {
    try {
      let result = [...payments];

      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        result = result.filter(
          (payment) =>
            payment.fullName?.toLowerCase().includes(term) ||
            payment.email?.toLowerCase().includes(term) ||
            payment.registrationNumber?.toLowerCase().includes(term) ||
            payment.course?.toLowerCase().includes(term) ||
            payment.razorpayPaymentId?.toLowerCase().includes(term) ||
            payment.university?.toLowerCase().includes(term) ||
            payment.userData?.university?.toLowerCase().includes(term)
        );
      }

      // Status filter
      if (statusFilter !== "all") {
        result = result.filter((payment) => payment.status === statusFilter);
      }

      // Payment method filter
      if (paymentMethodFilter !== "all") {
        result = result.filter((payment) => payment.paymentMethod === paymentMethodFilter);
      }

      // University filter
      if (universityFilter !== "all") {
        result = result.filter(
          (payment) =>
            payment.university === universityFilter ||
            payment.userData?.university === universityFilter
        );
      }

      // Date filter
      if (startDate || endDate) {
        result = result.filter((payment) => {
          try {
            const paymentDate = payment.paidAt?.toDate ? payment.paidAt.toDate() : new Date(payment.paidAt);
            if (isNaN(paymentDate.getTime())) return false;

            const paymentDateOnly = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), paymentDate.getDate());

            if (startDate && endDate) {
              const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
              const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
              return paymentDateOnly >= start && paymentDateOnly <= end;
            } else if (startDate) {
              const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
              return paymentDateOnly >= start;
            } else if (endDate) {
              const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
              return paymentDateOnly <= end;
            }
            return true;
          } catch (dateError) {
            console.error("Date filtering error:", dateError);
            return false;
          }
        });
      }

      // Time filter
      if (startTime || endTime) {
        result = result.filter((payment) => {
          try {
            const paymentDate = payment.paidAt?.toDate ? payment.paidAt.toDate() : new Date(payment.paidAt);
            if (isNaN(paymentDate.getTime())) return false;

            const paymentHours = paymentDate.getHours();
            const paymentMinutes = paymentDate.getMinutes();
            const paymentTimeValue = paymentHours * 60 + paymentMinutes;

            if (startTime && endTime) {
              const startValue = startTime.getHours() * 60 + startTime.getMinutes();
              const endValue = endTime.getHours() * 60 + endTime.getMinutes();
              return paymentTimeValue >= startValue && paymentTimeValue <= endValue;
            } else if (startTime) {
              const startValue = startTime.getHours() * 60 + startTime.getMinutes();
              return paymentTimeValue >= startValue;
            } else if (endTime) {
              const endValue = endTime.getHours() * 60 + endTime.getMinutes();
              return paymentTimeValue <= endValue;
            }
            return true;
          } catch (timeError) {
            console.error("Time filtering error:", timeError);
            return false;
          }
        });
      }

      // Sorting with error handling
      result.sort((a, b) => {
        try {
          let aVal = a[sortField];
          let bVal = b[sortField];

          if (sortField === "paidAt") {
            aVal = aVal?.toDate ? aVal.toDate().getTime() : 0;
            bVal = bVal?.toDate ? bVal.toDate().getTime() : 0;
          } else if (typeof aVal === "string") {
            aVal = aVal?.toLowerCase() || "";
            bVal = bVal?.toLowerCase() || "";
          } else if (typeof aVal === "number") {
            aVal = aVal || 0;
            bVal = bVal || 0;
          } else {
            aVal = aVal || "";
            bVal = bVal || "";
          }

          if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
          if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
          return 0;
        } catch (sortError) {
          console.error("Sorting error:", sortError);
          return 0;
        }
      });

      setFilteredPayments(result);
      setPage(0);
      
      // Update date range stats
      const stats = calculateDateRangeStats(result, startDate, endDate);
      setDateRangeStats(stats);
      
    } catch (filterError) {
      console.error("Filter application error:", filterError);
      setSnackbar({ 
        open: true, 
        message: "Error applying filters. Please try again.", 
        type: "error" 
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payments, searchTerm, statusFilter, paymentMethodFilter, universityFilter, sortField, sortDirection, startDate, endDate, startTime, calculateDateRangeStats]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get status chip
  const getStatusChip = (status) => {
    const option = paymentStatusOptions.find((opt) => opt.value === status);
    if (!option) return <Chip label={status || "Unknown"} size="small" />;
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

  // Validate edit form
  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.fullName?.trim()) errors.fullName = "Full name is required";
    if (!editFormData.email?.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = "Invalid email format";
    }
    if (editFormData.amount < 0) errors.amount = "Amount cannot be negative";
    if (!editFormData.registrationNumber?.trim()) {
      errors.registrationNumber = "Registration number is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle edit
  const handleEditClick = (payment) => {
    setSelectedPayment(payment);
    setEditFormData({
      fullName: payment.fullName || "",
      email: payment.email || "",
      course: payment.course || "",
      amount: payment.amount || 0,
      status: payment.status || "pending",
      paymentMethod: payment.paymentMethod || "razorpay",
      registrationNumber: payment.registrationNumber || "",
      university: payment.university || payment.userData?.university || "",
    });
    setFormErrors({});
    setEditDialogOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleUpdatePayment = async () => {
    if (!selectedPayment) return;
    if (!validateEditForm()) return;
    
    setUpdating(true);
    try {
      const paymentRef = doc(db, "payments", selectedPayment.id);
      await updateDoc(paymentRef, {
        ...editFormData,
        updatedAt: Timestamp.now(),
      });

      // Also update the associated internship application if registration number exists
      if (editFormData.registrationNumber) {
        try {
          const applicationsRef = collection(db, "internshipApplications");
          const q = query(applicationsRef, where("registrationNumber", "==", editFormData.registrationNumber));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const appDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, "internshipApplications", appDoc.id), {
              paymentStatus: editFormData.status,
              paymentAmount: editFormData.amount,
              paymentMethod: editFormData.paymentMethod,
              updatedAt: Timestamp.now(),
            });
          }
        } catch (appError) {
          console.error("Error updating application:", appError);
          // Continue with payment update even if application update fails
        }
      }

      setPayments((prev) =>
        prev.map((p) =>
          p.id === selectedPayment.id ? { ...p, ...editFormData } : p
        )
      );

      setSnackbar({ open: true, message: "Payment updated successfully!", type: "success" });
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating payment:", err);
      setSnackbar({ open: true, message: `Failed to update payment: ${err.message}`, type: "error" });
    } finally {
      setUpdating(false);
    }
  };

  // Handle delete
  const handleDeleteClick = (payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const handleDeletePayment = async () => {
    if (!paymentToDelete) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "payments", paymentToDelete.id));
      setPayments((prev) => prev.filter((p) => p.id !== paymentToDelete.id));
      setSnackbar({ open: true, message: "Payment deleted successfully!", type: "success" });
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting payment:", err);
      setSnackbar({ open: true, message: `Failed to delete payment: ${err.message}`, type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  // Calculate statistics with error handling
  const statistics = useMemo(() => {
    try {
      const totalPayments = payments.length;
      const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const completedPayments = payments.filter((p) => p.status === "completed").length;
      const completedAmount = payments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingPayments = payments.filter((p) => p.status === "pending").length;
      const refundedPayments = payments.filter((p) => p.status === "refunded").length;
      const partialPayments = payments.filter((p) => p.status === "partial").length;

      return {
        totalPayments,
        totalAmount,
        completedPayments,
        completedAmount,
        pendingPayments,
        refundedPayments,
        partialPayments,
        successRate: totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0,
        averageAmount: totalPayments > 0 ? totalAmount / totalPayments : 0,
      };
    } catch (statError) {
      console.error("Statistics calculation error:", statError);
      return {
        totalPayments: 0,
        totalAmount: 0,
        completedPayments: 0,
        completedAmount: 0,
        pendingPayments: 0,
        refundedPayments: 0,
        partialPayments: 0,
        successRate: 0,
        averageAmount: 0,
      };
    }
  }, [payments]);

  // Prepare chart data
  const chartData = useMemo(() => {
    try {
      // Status distribution
      const statusData = paymentStatusOptions.map(opt => ({
        name: opt.label,
        value: payments.filter(p => p.status === opt.value).length,
        color: CHART_COLORS[opt.value] || CHART_COLORS.primary,
      }));

      // Daily revenue for last 7 days
      const dailyRevenue = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const dayPayments = payments.filter(p => {
          try {
            const pDate = p.paidAt?.toDate ? p.paidAt.toDate() : new Date(p.paidAt);
            return pDate.toDateString() === date.toDateString();
          } catch {
            return false;
          }
        });
        
        dailyRevenue.push({
          date: date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
          amount: dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
          count: dayPayments.length,
        });
      }

      // University distribution
      const uniData = [];
      const uniMap = new Map();
      payments.forEach(p => {
        const uni = p.university || p.userData?.university || "Unknown";
        uniMap.set(uni, (uniMap.get(uni) || 0) + 1);
      });
      Array.from(uniMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([name, value]) => uniData.push({ name, value }));

      return { statusData, dailyRevenue, uniData };
    } catch (chartError) {
      console.error("Chart data preparation error:", chartError);
      return { statusData: [], dailyRevenue: [], uniData: [] };
    }
  }, [payments]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentMethodFilter("all");
    setUniversityFilter("all");
    setSortField("paidAt");
    setSortDirection("desc");
    setStartDate(null);
    setEndDate(null);
    setStartTime(null);
    setEndTime(null);
    setQuickDateRange("all");
  };

  // Export data with error handling
  const exportData = () => {
    try {
      const exportData = filteredPayments.map((p) => ({
        "Registration Number": p.registrationNumber || "N/A",
        "Full Name": p.fullName || "N/A",
        "Email": p.email || "N/A",
        "Course": p.course || "N/A",
        "University": p.university || p.userData?.university || "N/A",
        "Amount": p.amount || 0,
        "Status": p.status || "unknown",
        "Payment Method": p.paymentMethod || "N/A",
        "Payment ID": p.razorpayPaymentId || "N/A",
        "Paid At": formatDate(p.paidAt),
      }));

      const csvContent = [
        Object.keys(exportData[0] || {}).join(","),
        ...exportData.map((row) => 
          Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `payments_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setSnackbar({ open: true, message: "Data exported successfully!", type: "success" });
    } catch (exportError) {
      console.error("Export error:", exportError);
      setSnackbar({ open: true, message: "Failed to export data", type: "error" });
    }
  };

  // Pagination
  const paginatedPayments = filteredPayments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Loading skeleton
  const renderSkeleton = () => (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
    </Box>
  );

  // Render table row for desktop/tablet
  const renderTableRow = (payment) => (
    <TableRow 
      key={payment.id} 
      hover 
      sx={{ 
        "&:last-child td, &:last-child th": { border: 0 },
        transition: "background-color 0.2s",
      }}
    >
      <TableCell>
        <Box>
          <Typography variant="body2" fontWeight={500}>
            {payment.fullName || "N/A"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {payment.registrationNumber || "No Reg No"}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ maxWidth: 180 }} noWrap>
          {payment.email || "N/A"}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
          {payment.course || "N/A"}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
          {payment.university || payment.userData?.university || "N/A"}
        </Typography>
      </TableCell>
      <TableCell>
        <Typography variant="body2" fontWeight={600} color="primary.main">
          {formatCurrency(payment.amount)}
        </Typography>
      </TableCell>
      <TableCell>{getStatusChip(payment.status)}</TableCell>
      <TableCell>
        <Chip
          label={payment.paymentMethod || "razorpay"}
          size="small"
          variant="outlined"
          icon={<CreditCard fontSize="small" />}
        />
      </TableCell>
      <TableCell>
        <Typography variant="caption">{formatDate(payment.paidAt)}</Typography>
      </TableCell>
      <TableCell align="center">
        <Stack direction="row" spacing={0.5} justifyContent="center">
          <Tooltip title="View Details" arrow TransitionComponent={Zoom}>
            <IconButton
              size="small"
              onClick={() => {
                setViewingPayment(payment);
                setViewDialogOpen(true);
              }}
              sx={{ color: theme.palette.info.main }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit" arrow TransitionComponent={Zoom}>
            <IconButton 
              size="small" 
              onClick={() => handleEditClick(payment)} 
              sx={{ color: theme.palette.primary.main }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete" arrow TransitionComponent={Zoom}>
            <IconButton 
              size="small" 
              onClick={() => handleDeleteClick(payment)} 
              sx={{ color: theme.palette.error.main }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );

  // Render mobile card
  const renderMobileCard = (payment) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      key={payment.id}
    >
      <Card 
        sx={{ 
          mb: 2, 
          borderRadius: 3, 
          overflow: "hidden",
          boxShadow: theme.shadows[2],
        }}
      >
        <Box 
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.04), 
            p: 2,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                {payment.fullName || "N/A"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {payment.registrationNumber || "No Reg No"}
              </Typography>
            </Box>
            {getStatusChip(payment.status)}
          </Box>
        </Box>

        <CardContent sx={{ pt: 2 }}>
          <Stack spacing={1.5}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Email fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
                {payment.email || "N/A"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Work fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
                {payment.course || "N/A"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <School fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary" noWrap sx={{ flex: 1 }}>
                {payment.university || payment.userData?.university || "N/A"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AccountBalanceWallet fontSize="small" color="action" />
              <Typography variant="h6" color="primary.main" fontWeight="700">
                {formatCurrency(payment.amount)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CreditCard fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {payment.paymentMethod || "razorpay"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {formatDate(payment.paidAt)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>

        <Divider />

        <Box sx={{ display: "flex", justifyContent: "space-around", p: 1.5 }}>
          <Button
            size="small"
            startIcon={<Visibility />}
            onClick={() => {
              setViewingPayment(payment);
              setViewDialogOpen(true);
            }}
            sx={{ color: theme.palette.info.main }}
          >
            View
          </Button>
          <Button 
            size="small" 
            startIcon={<Edit />} 
            onClick={() => handleEditClick(payment)} 
            sx={{ color: theme.palette.primary.main }}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            startIcon={<Delete />} 
            onClick={() => handleDeleteClick(payment)} 
            sx={{ color: theme.palette.error.main }}
          >
            Delete
          </Button>
        </Box>
      </Card>
    </motion.div>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : '#f5f7fa',
          transition: "background-color 0.3s ease",
        }}
      >
        {/* App Bar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: theme.palette.primary.main,
            backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            borderRadius: 0,
            backdropFilter: 'blur(10px)',
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64, md: 72 } }}>
            <IconButton 
              edge="start" 
              color="inherit" 
              onClick={() => navigate(-1)} 
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1, 
                fontWeight: 700,
                fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                letterSpacing: '-0.01em',
              }}
            >
              Payment Management
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title="Analytics" arrow TransitionComponent={Zoom}>
                <IconButton 
                  color="inherit" 
                  onClick={() => setAnalyticsDialogOpen(true)} 
                  size={isMobile ? "small" : "medium"}
                >
                  <Analytics />
                </IconButton>
              </Tooltip>
              <Tooltip title="Export Data" arrow TransitionComponent={Zoom}>
                <IconButton 
                  color="inherit" 
                  onClick={exportData} 
                  size={isMobile ? "small" : "medium"}
                >
                  <Download />
                </IconButton>
              </Tooltip>
              <Tooltip title="Refresh" arrow TransitionComponent={Zoom}>
                <IconButton 
                  color="inherit" 
                  onClick={() => fetchPayments(true)} 
                  size={isMobile ? "small" : "medium"}
                  disabled={refreshing}
                >
                  <Refresh className={refreshing ? 'spin' : ''} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        <Container 
          maxWidth={false}
          sx={{ 
            pt: { xs: 8, sm: 10, md: 12 }, 
            pb: 4, 
            px: { xs: 1, sm: 2, md: 3, lg: 4, xl: 5 },
            maxWidth: isDesktop ? '1800px' : '100%',
          }}
        >
          {/* Statistics Cards - Fully Responsive */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: { xs: 1.5, sm: 2, md: 2.5 },
              mb: { xs: 2, sm: 3 },
            }}
          >
            {/* Total Revenue Card */}
            <Card
              sx={{
                flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)", lg: "1 1 0" },
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                      Total Revenue
                    </Typography>
                    <Typography 
                      variant="h4" 
                      fontWeight="700" 
                      sx={{ 
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' } 
                      }}
                    >
                      {formatCurrency(statistics.totalAmount)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                      from {formatNumber(statistics.totalPayments)} transactions
                    </Typography>
                  </Box>
                  <AttachMoney sx={{ fontSize: 48, opacity: 0.2 }} />
                </Box>
              </CardContent>
              <Box
                sx={{
                  position: "absolute",
                  bottom: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  bgcolor: "rgba(255,255,255,0.1)",
                }}
              />
            </Card>

            {/* Completed Payments Card */}
            <Card
              sx={{
                flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)", lg: "1 1 0" },
                borderRadius: 3,
                background: `linear-gradient(135deg, ${CHART_COLORS.completed} 0%, #2e7d32 100%)`,
                color: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                      Completed Payments
                    </Typography>
                    <Typography 
                      variant="h4" 
                      fontWeight="700"
                      sx={{ 
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' } 
                      }}
                    >
                      {formatNumber(statistics.completedPayments)}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mt: 1 }}>
                      {formatCurrency(statistics.completedAmount)} collected
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 48, opacity: 0.2 }} />
                </Box>
                <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mt: 1 }}>
                  Success Rate: {statistics.successRate.toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>

            {/* Pending & Refunded Card */}
            <Card
              sx={{
                flex: { xs: "1 1 100%", sm: "1 1 100%", md: "1 1 calc(50% - 8px)", lg: "1 1 0" },
                borderRadius: 3,
                background: `linear-gradient(135deg, ${CHART_COLORS.pending} 0%, #e65100 100%)`,
                color: "white",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                      Pending & Refunded
                    </Typography>
                    <Typography 
                      variant="h4" 
                      fontWeight="700"
                      sx={{ 
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' } 
                      }}
                    >
                      {formatNumber(statistics.pendingPayments + statistics.refundedPayments)}
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Pending: {formatNumber(statistics.pendingPayments)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Refunded: {formatNumber(statistics.refundedPayments)}
                      </Typography>
                    </Stack>
                  </Box>
                  <Warning sx={{ fontSize: 48, opacity: 0.2 }} />
                </Box>
              </CardContent>
            </Card>

            {/* Average Transaction Card */}
            <Card
              sx={{
                flex: { xs: "1 1 100%", sm: "1 1 100%", md: "1 1 calc(50% - 8px)", lg: "1 1 0" },
                borderRadius: 3,
                background: `linear-gradient(135deg, ${CHART_COLORS.secondary} 0%, #6a1b9a 100%)`,
                color: "white",
                position: "relative",
                overflow: "hidden",
                display: { xs: "block", lg: "block" },
              }}
            >
              <CardContent sx={{ position: "relative", zIndex: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                      Average Transaction
                    </Typography>
                    <Typography 
                      variant="h4" 
                      fontWeight="700"
                      sx={{ 
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' } 
                      }}
                    >
                      {formatCurrency(statistics.averageAmount)}
                    </Typography>
                  </Box>
                  <Insights sx={{ fontSize: 48, opacity: 0.2 }} />
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Date Range Quick Stats */}
          {(startDate || endDate) && (
            <Fade in>
              <Paper 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.info.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Stack 
                  direction={{ xs: "column", sm: "row" }} 
                  spacing={2} 
                  alignItems={{ xs: "flex-start", sm: "center" }}
                  justifyContent="space-between"
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday fontSize="small" color="info" />
                    <Typography variant="body2" color="info.main" fontWeight={500}>
                      Date Range: {startDate ? formatDateOnly(startDate) : "Start"} - {endDate ? formatDateOnly(endDate) : "End"}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={3}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Transactions</Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {formatNumber(dateRangeStats.count)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Revenue</Typography>
                      <Typography variant="h6" fontWeight={600} color="primary.main">
                        {formatCurrency(dateRangeStats.amount)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Completed</Typography>
                      <Typography variant="h6" fontWeight={600} color="success.main">
                        {formatNumber(dateRangeStats.completed)}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Fade>
          )}

          {/* Search and Filters */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2, md: 2.5 },
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Search by name, email, registration number, course, university, or payment ID..."
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              {/* Responsive filter row */}
              <Box sx={{ 
                display: "flex", 
                flexWrap: "wrap", 
                gap: 1,
                "& > *": {
                  flex: { xs: "1 1 100%", sm: "1 1 calc(50% - 4px)", md: "1 1 0" }
                }
              }}>
                <FormControl size="small">
                  <InputLabel>Status</InputLabel>
                  <Select 
                    value={statusFilter} 
                    label="Status" 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    {paymentStatusOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {opt.icon}
                          {opt.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>Payment Method</InputLabel>
                  <Select
                    value={paymentMethodFilter}
                    label="Payment Method"
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Methods</MenuItem>
                    {paymentMethods.filter((m) => m !== "all").map((method) => (
                      <MenuItem key={method} value={method}>
                        {method}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <InputLabel>University</InputLabel>
                  <Select
                    value={universityFilter}
                    label="University"
                    onChange={(e) => setUniversityFilter(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Universities</MenuItem>
                    {universities.filter((u) => u !== "all").map((university) => (
                      <MenuItem key={university} value={university}>
                        {university}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Badge badgeContent={activeFiltersCount} color="primary">
                  <Button
                    variant="outlined"
                    onClick={() => setFilterDialogOpen(true)}
                    startIcon={<FilterList />}
                    size="small"
                    sx={{ borderRadius: 2, height: 40 }}
                  >
                    More Filters
                  </Button>
                </Badge>

                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<Clear />}
                  size="small"
                  color="error"
                  sx={{ borderRadius: 2, height: 40 }}
                >
                  Clear
                </Button>

                <Button
                  variant="contained"
                  onClick={() => setStatsDialogOpen(true)}
                  startIcon={<Assessment />}
                  size="small"
                  sx={{ borderRadius: 2, height: 40 }}
                >
                  Stats
                </Button>
              </Box>
            </Stack>
          </Paper>

          {/* Data Display */}
          {loading ? (
            renderSkeleton()
          ) : error ? (
            <Alert 
              severity="error" 
              sx={{ borderRadius: 2 }}
              action={
                <Button color="inherit" size="small" onClick={fetchPayments}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          ) : filteredPayments.length === 0 ? (
            <Paper 
              sx={{ 
                p: { xs: 4, sm: 6 }, 
                textAlign: "center", 
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.02),
              }}
            >
              <Receipt sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No payment records found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {activeFiltersCount > 0 ? "Try adjusting your filters" : "No payments have been recorded yet"}
              </Typography>
              {activeFiltersCount > 0 && (
                <Button 
                  variant="outlined" 
                  onClick={clearFilters} 
                  sx={{ mt: 2 }}
                >
                  Clear Filters
                </Button>
              )}
            </Paper>
          ) : (
            <>
              {/* Desktop/Tablet Table */}
              {!isMobile && (
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    overflowX: "auto",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Table stickyHeader size={isTablet ? "small" : "medium"}>
                    <TableHead>
                      <TableRow>
                        {[
                          { field: "fullName", label: "Applicant", minWidth: 150 },
                          { field: null, label: "Email", minWidth: 180 },
                          { field: "course", label: "Course", minWidth: 120 },
                          { field: null, label: "University", minWidth: 150 },
                          { field: "amount", label: "Amount", minWidth: 100 },
                          { field: "status", label: "Status", minWidth: 120 },
                          { field: null, label: "Method", minWidth: 100 },
                          { field: "paidAt", label: "Paid At", minWidth: 140 },
                          { field: null, label: "Actions", minWidth: 120, align: "center" },
                        ].map((col) => (
                          <TableCell
                            key={col.label}
                            onClick={() => col.field && handleSort(col.field)}
                            sx={{ 
                              cursor: col.field ? "pointer" : "default", 
                              fontWeight: 600, 
                              whiteSpace: "nowrap",
                              minWidth: col.minWidth,
                              bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.50',
                            }}
                            align={col.align || "left"}
                          >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                              {col.label}
                              {col.field && sortField === col.field && (
                                sortDirection === "asc" ? 
                                  <ArrowUpward fontSize="small" /> : 
                                  <ArrowDownward fontSize="small" />
                              )}
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence>
                        {paginatedPayments.map(renderTableRow)}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Mobile Cards */}
              {isMobile && (
                <Box>
                  <Tabs
                    value={activeTab}
                    onChange={(e, v) => setActiveTab(v)}
                    sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
                    variant="fullWidth"
                  >
                    <Tab label={`All (${filteredPayments.length})`} />
                    <Tab label="Recent" />
                    <Tab label="Summary" />
                  </Tabs>
                  
                  {activeTab === 0 && (
                    <AnimatePresence>
                      {paginatedPayments.map(renderMobileCard)}
                    </AnimatePresence>
                  )}
                  
                  {activeTab === 1 && (
                    <AnimatePresence>
                      {paginatedPayments.slice(0, 10).map(renderMobileCard)}
                    </AnimatePresence>
                  )}

                  {activeTab === 2 && (
                    <Fade in>
                      <Paper sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="h6" gutterBottom>Quick Summary</Typography>
                        <Stack spacing={2}>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography color="text.secondary">Total Transactions</Typography>
                            <Typography fontWeight={600}>{formatNumber(filteredPayments.length)}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography color="text.secondary">Total Amount</Typography>
                            <Typography fontWeight={600} color="primary">
                              {formatCurrency(filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0))}
                            </Typography>
                          </Box>
                          <Divider />
                          {paymentStatusOptions.map(opt => {
                            const count = filteredPayments.filter(p => p.status === opt.value).length;
                            return (
                              <Box key={opt.value} sx={{ display: "flex", justifyContent: "space-between" }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  {opt.icon}
                                  <Typography color="text.secondary">{opt.label}</Typography>
                                </Box>
                                <Typography fontWeight={600}>{formatNumber(count)}</Typography>
                              </Box>
                            );
                          })}
                        </Stack>
                      </Paper>
                    </Fade>
                  )}
                </Box>
              )}

              {/* Pagination */}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <TablePagination
                  component="div"
                  count={filteredPayments.length}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={isMobile ? [5, 10] : isTablet ? [5, 8, 15] : [5, 10, 25, 50]}
                  labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
                  sx={{
                    '& .MuiTablePagination-select': {
                      minWidth: isMobile ? 50 : 80,
                    },
                  }}
                />
              </Box>
            </>
          )}
        </Container>

        {/* Advanced Filters Dialog */}
        <Dialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
            <Typography variant="h6" fontWeight={600}>Advanced Filters</Typography>
            <IconButton onClick={() => setFilterDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              {/* Quick Date Range */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Quick Date Range
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={quickDateRange}
                    onChange={(e) => handleQuickDateRange(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Time</MenuItem>
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="yesterday">Yesterday</MenuItem>
                    <MenuItem value="week">Last 7 Days</MenuItem>
                    <MenuItem value="month">Last 30 Days</MenuItem>
                    <MenuItem value="quarter">Last 3 Months</MenuItem>
                    <MenuItem value="year">Last 12 Months</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Divider />

              {/* Custom Date Range */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CalendarToday fontSize="small" />
                  Custom Date Range
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <DatePicker
                    label="Start Date"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{ 
                      textField: { 
                        size: "small", 
                        fullWidth: true,
                        sx: { borderRadius: 2 },
                      } 
                    }}
                  />
                  <DatePicker
                    label="End Date"
                    value={endDate}
                    onChange={setEndDate}
                    minDate={startDate}
                    slotProps={{ 
                      textField: { 
                        size: "small", 
                        fullWidth: true,
                        sx: { borderRadius: 2 },
                      } 
                    }}
                  />
                </Stack>
                {startDate && endDate && (
                  <FormHelperText sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Info fontSize="small" color="info" />
                      Range: {formatDateOnly(startDate)} - {formatDateOnly(endDate)}
                      ({Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1} days)
                    </Box>
                  </FormHelperText>
                )}
              </Box>

              <Divider />

              {/* Time Range */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <AccessTime fontSize="small" />
                  Time Range
                </Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TimePicker
                    label="Start Time"
                    value={startTime}
                    onChange={setStartTime}
                    slotProps={{ 
                      textField: { 
                        size: "small", 
                        fullWidth: true,
                        sx: { borderRadius: 2 },
                      } 
                    }}
                  />
                  <TimePicker
                    label="End Time"
                    value={endTime}
                    onChange={setEndTime}
                    slotProps={{ 
                      textField: { 
                        size: "small", 
                        fullWidth: true,
                        sx: { borderRadius: 2 },
                      } 
                    }}
                  />
                </Stack>
              </Box>

              <Divider />

              {/* Active Filters */}
              <Box>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  Active Filters ({activeFiltersCount})
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {statusFilter !== "all" && (
                    <Chip 
                      label={`Status: ${statusFilter}`} 
                      onDelete={() => setStatusFilter("all")} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  )}
                  {paymentMethodFilter !== "all" && (
                    <Chip 
                      label={`Method: ${paymentMethodFilter}`} 
                      onDelete={() => setPaymentMethodFilter("all")} 
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
                  {startDate && (
                    <Chip 
                      label={`Start: ${formatDateOnly(startDate)}`} 
                      onDelete={() => setStartDate(null)} 
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  )}
                  {endDate && (
                    <Chip 
                      label={`End: ${formatDateOnly(endDate)}`} 
                      onDelete={() => setEndDate(null)} 
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={clearFilters} color="error" startIcon={<Clear />}>
              Clear All
            </Button>
            <Button onClick={() => setFilterDialogOpen(false)} variant="contained">
              Apply Filters
            </Button>
          </DialogActions>
        </Dialog>

        {/* Analytics Dialog */}
        <Dialog
          open={analyticsDialogOpen}
          onClose={() => setAnalyticsDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <BarChart color="primary" />
              <Typography variant="h6" fontWeight={600}>Payment Analytics</Typography>
            </Box>
            <IconButton onClick={() => setAnalyticsDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={4}>
              {/* Daily Revenue Chart */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Daily Revenue (Last 7 Days)
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData.dailyRevenue}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                          <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value) => formatCurrency(value)}
                        contentStyle={{
                          borderRadius: 8,
                          border: 'none',
                          boxShadow: theme.shadows[3],
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke={CHART_COLORS.primary} 
                        fillOpacity={1} 
                        fill="url(#colorAmount)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>

              <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
                {/* Status Distribution */}
                <Paper sx={{ p: 3, borderRadius: 3, flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Status Distribution
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={chartData.statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {chartData.statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => formatNumber(value)}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>

                {/* Top Universities */}
                <Paper sx={{ p: 3, borderRadius: 3, flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Top Universities
                  </Typography>
                  <Box sx={{ height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={chartData.uniData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={120} />
                        <RechartsTooltip 
                          formatter={(value) => formatNumber(value)}
                        />
                        <Bar dataKey="value" fill={CHART_COLORS.secondary} radius={[0, 8, 8, 0]} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={() => setAnalyticsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog
          open={editDialogOpen}
          onClose={() => !updating && setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
            <Typography variant="h6" fontWeight={600}>Edit Payment Record</Typography>
            <IconButton onClick={() => setEditDialogOpen(false)} size="small" disabled={updating}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedPayment && (
              <Stack spacing={2.5}>
                <TextField
                  label="Full Name"
                  value={editFormData.fullName}
                  onChange={(e) => handleEditChange("fullName", e.target.value)}
                  fullWidth
                  size="small"
                  error={!!formErrors.fullName}
                  helperText={formErrors.fullName}
                  disabled={updating}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="Email"
                  value={editFormData.email}
                  onChange={(e) => handleEditChange("email", e.target.value)}
                  fullWidth
                  size="small"
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={updating}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="Course"
                  value={editFormData.course}
                  onChange={(e) => handleEditChange("course", e.target.value)}
                  fullWidth
                  size="small"
                  disabled={updating}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="University"
                  value={editFormData.university}
                  onChange={(e) => handleEditChange("university", e.target.value)}
                  fullWidth
                  size="small"
                  disabled={updating}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="Amount"
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) => handleEditChange("amount", parseFloat(e.target.value) || 0)}
                  fullWidth
                  size="small"
                  error={!!formErrors.amount}
                  helperText={formErrors.amount}
                  disabled={updating}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <FormControl size="small" fullWidth disabled={updating}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editFormData.status}
                    label="Status"
                    onChange={(e) => handleEditChange("status", e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    {paymentStatusOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {opt.icon}
                          {opt.label}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Registration Number"
                  value={editFormData.registrationNumber}
                  onChange={(e) => handleEditChange("registrationNumber", e.target.value)}
                  fullWidth
                  size="small"
                  error={!!formErrors.registrationNumber}
                  helperText={formErrors.registrationNumber}
                  disabled={updating}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button 
              onClick={() => setEditDialogOpen(false)} 
              startIcon={<Cancel />}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePayment} 
              variant="contained" 
              startIcon={updating ? <CircularProgress size={16} /> : <Save />} 
              disabled={updating}
            >
              {updating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Receipt color="primary" />
              <Typography variant="h6" fontWeight={600}>Payment Details</Typography>
            </Box>
            <IconButton onClick={() => setViewDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {viewingPayment && (
              <Stack spacing={3}>
                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                    <Receipt sx={{ mr: 1, verticalAlign: "middle" }} />
                    Payment Information
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">Payment ID</Typography>
                      <Typography variant="body1" fontWeight={500} sx={{ wordBreak: "break-all" }}>
                        {viewingPayment.razorpayPaymentId || "N/A"}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">Order ID</Typography>
                      <Typography variant="body1" sx={{ wordBreak: "break-all" }}>
                        {viewingPayment.razorpayOrderId || "N/A"}
                      </Typography>
                    </Box>
                  </Stack>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">Amount</Typography>
                      <Typography variant="h5" color="primary.main" fontWeight="700">
                        {formatCurrency(viewingPayment.amount)}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      {getStatusChip(viewingPayment.status)}
                    </Box>
                  </Stack>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body1">{viewingPayment.paymentMethod || "razorpay"}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">Paid At</Typography>
                      <Typography variant="body1">{formatDate(viewingPayment.paidAt)}</Typography>
                    </Box>
                  </Stack>
                </Paper>

                <Paper sx={{ p: 3, borderRadius: 3, bgcolor: alpha(theme.palette.info.main, 0.02) }}>
                  <Typography variant="subtitle1" fontWeight={600} color="info" gutterBottom>
                    <Person sx={{ mr: 1, verticalAlign: "middle" }} />
                    Student Information
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">Full Name</Typography>
                      <Typography variant="body1" fontWeight={500}>{viewingPayment.fullName || "N/A"}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{viewingPayment.email || "N/A"}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">Registration Number</Typography>
                      <Typography variant="body1">{viewingPayment.registrationNumber || "N/A"}</Typography>
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">Course</Typography>
                      <Typography variant="body1">{viewingPayment.course || "N/A"}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary">University</Typography>
                      <Typography variant="body1">{viewingPayment.university || viewingPayment.userData?.university || "N/A"}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Statistics Dialog */}
        <Dialog
          open={statsDialogOpen}
          onClose={() => setStatsDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
        >
          <DialogTitle sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PieChart color="primary" />
              <Typography variant="h6" fontWeight={600}>Payment Statistics</Typography>
            </Box>
            <IconButton onClick={() => setStatsDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <List>
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <Payment />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Total Transactions"
                  secondary={formatNumber(statistics.totalPayments)}
                  primaryTypographyProps={{ fontWeight: 600 }}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "success.main" }}>
                    <CheckCircle />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Completed Payments"
                  secondary={`${formatNumber(statistics.completedPayments)} (${formatCurrency(statistics.completedAmount)})`}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "warning.main" }}>
                    <Pending />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Pending Payments"
                  secondary={formatNumber(statistics.pendingPayments)}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "error.main" }}>
                    <CancelIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Refunded Payments"
                  secondary={formatNumber(statistics.refundedPayments)}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "info.main" }}>
                    <Info />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Partial Payments"
                  secondary={formatNumber(statistics.partialPayments)}
                />
              </ListItem>
            </List>

            <Paper sx={{ p: 3, mt: 3, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Summary
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                  <Typography variant="body1" fontWeight={600}>{formatCurrency(statistics.totalAmount)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Average Payment</Typography>
                  <Typography variant="body1" fontWeight={600}>{formatCurrency(statistics.averageAmount)}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Success Rate</Typography>
                  <Typography variant="body1" fontWeight={600} color="success.main">
                    {statistics.successRate.toFixed(1)}%
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button onClick={() => setStatsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
          <DialogTitle sx={{ color: theme.palette.error.main }}>
            Confirm Delete
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the payment record for{" "}
              <strong>{paymentToDelete?.fullName}</strong>?
            </Typography>
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button 
              onClick={handleDeletePayment} 
              color="error" 
              variant="contained"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: isMobile ? "center" : "left" }}
        >
          <Alert
            severity={snackbar.type}
            variant="filled"
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            elevation={6}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>

      {/* Add CSS for refresh animation */}
      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </LocalizationProvider>
  );
};

export default PaymentManagementDashboard;