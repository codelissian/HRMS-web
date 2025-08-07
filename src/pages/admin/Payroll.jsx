import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Download,
  Visibility,
  AttachMoney,
} from '@mui/icons-material';
import CustomTable from '../../components/UI/CustomTable';
import CustomForm from '../../components/UI/CustomForm';

const Payroll = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterPayrolls();
  }, [payrolls, searchTerm, monthFilter]);

  const loadData = () => {
    const storedPayrolls = JSON.parse(localStorage.getItem('hrms_payroll') || '[]');
    const storedEmployees = JSON.parse(localStorage.getItem('hrms_employees') || '[]');
    
    // Add employee names to payroll data
    const payrollsWithEmployeeNames = storedPayrolls.map(payroll => ({
      ...payroll,
      employeeName: storedEmployees.find(emp => emp.id === payroll.employeeId)?.name || 'Unknown Employee',
      employeeEmail: storedEmployees.find(emp => emp.id === payroll.employeeId)?.email || 'Unknown Email',
    }));
    
    setPayrolls(payrollsWithEmployeeNames);
    setEmployees(storedEmployees);
  };

  const filterPayrolls = () => {
    let filtered = payrolls;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(payroll =>
        payroll.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payroll.month?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by month
    if (monthFilter) {
      filtered = filtered.filter(payroll => payroll.month === monthFilter);
    }

    setFilteredPayrolls(filtered);
  };

  const handleAddPayroll = () => {
    setEditingPayroll(null);
    setOpenDialog(true);
  };

  const handleEditPayroll = (payroll) => {
    setEditingPayroll(payroll);
    setOpenDialog(true);
  };

  const handleDeletePayroll = (payrollId) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      const updatedPayrolls = payrolls.filter(payroll => payroll.id !== payrollId);
      localStorage.setItem('hrms_payroll', JSON.stringify(updatedPayrolls));
      setPayrolls(updatedPayrolls);
      setAlert({
        type: 'success',
        message: 'Payroll record deleted successfully'
      });
    }
  };

  const handleSavePayroll = (formData) => {
    setLoading(true);
    
    try {
      let updatedPayrolls;
      
      if (editingPayroll) {
        // Update existing payroll
        updatedPayrolls = payrolls.map(payroll =>
          payroll.id === editingPayroll.id ? { ...payroll, ...formData } : payroll
        );
      } else {
        // Add new payroll
        const newPayroll = {
          ...formData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          status: 'processed',
        };
        updatedPayrolls = [...payrolls, newPayroll];
      }
      
      localStorage.setItem('hrms_payroll', JSON.stringify(updatedPayrolls));
      setPayrolls(updatedPayrolls);
      setOpenDialog(false);
      setAlert({
        type: 'success',
        message: `Payroll ${editingPayroll ? 'updated' : 'added'} successfully`
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'An error occurred while saving payroll'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPayroll = () => {
    return payrolls.reduce((sum, payroll) => sum + (payroll.amount || 0), 0);
  };

  const getMonthOptions = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months.map(month => ({ value: month, label: month }));
  };

  const getEmployeeOptions = () => {
    return employees.map(emp => ({ value: emp.id, label: emp.name }));
  };

  const payrollFields = [
    {
      name: 'employeeId',
      type: 'select',
      label: 'Employee',
      required: true,
      options: getEmployeeOptions(),
    },
    {
      name: 'month',
      type: 'select',
      label: 'Month',
      required: true,
      options: getMonthOptions(),
    },
    {
      name: 'year',
      type: 'number',
      label: 'Year',
      required: true,
    },
    {
      name: 'basicSalary',
      type: 'number',
      label: 'Basic Salary',
      required: true,
    },
    {
      name: 'allowances',
      type: 'number',
      label: 'Allowances',
      required: true,
    },
    {
      name: 'deductions',
      type: 'number',
      label: 'Deductions',
      required: true,
    },
    {
      name: 'amount',
      type: 'number',
      label: 'Net Amount',
      required: true,
    },
  ];

  const columns = [
    { field: 'employeeName', headerName: 'Employee', width: 200 },
    { field: 'month', headerName: 'Month', width: 120 },
    { field: 'year', headerName: 'Year', width: 100 },
    { field: 'basicSalary', headerName: 'Basic Salary', type: 'currency', width: 150 },
    { field: 'allowances', headerName: 'Allowances', type: 'currency', width: 120 },
    { field: 'deductions', headerName: 'Deductions', type: 'currency', width: 120 },
    { field: 'amount', headerName: 'Net Amount', type: 'currency', width: 150 },
    {
      field: 'status',
      headerName: 'Status',
      type: 'chip',
      chipColor: (value) => value === 'processed' ? 'success' : 'warning',
      width: 120,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      render: (value, row) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleEditPayroll(row)}
            color="primary"
          >
            <Edit />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeletePayroll(row.id)}
            color="error"
          >
            <Delete />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3 }}>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Payroll
              </Typography>
              <Typography variant="h5" component="div">
                ${calculateTotalPayroll().toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Records
              </Typography>
              <Typography variant="h5" component="div">
                {payrolls.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flex: 1, maxWidth: 'calc(100% - 300px)' }}>
          <TextField
            size="small"
            placeholder="Search payroll by employee name or month..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ maxWidth: 220 }}
          />
          <FormControl size="small" sx={{ maxWidth: 220 }}>
            <InputLabel>Filter by Month</InputLabel>
            <Select
              value={monthFilter}
              label="Filter by Month"
              onChange={(e) => setMonthFilter(e.target.value)}
            >
              <MenuItem value="">All Months</MenuItem>
              {getMonthOptions().map(option => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddPayroll}
          >
            Add Payroll
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={() => {
              // Export functionality can be implemented here
              setAlert({
                type: 'info',
                message: 'Export functionality coming soon!'
              });
            }}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      <CustomTable
        columns={columns}
        data={filteredPayrolls.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredPayrolls.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        emptyMessage="No payroll records found"
      />

      {/* Add/Edit Payroll Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingPayroll ? 'Edit Payroll' : 'Add New Payroll'}
        </DialogTitle>
        <DialogContent>
          <CustomForm
            fields={payrollFields}
            values={editingPayroll || {}}
            errors={{}}
            onChange={(e) => {
              if (editingPayroll) {
                setEditingPayroll({
                  ...editingPayroll,
                  [e.target.name]: e.target.value,
                });
              }
            }}
            onSubmit={handleSavePayroll}
            submitText={editingPayroll ? 'Update Payroll' : 'Add Payroll'}
            loading={loading}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payroll; 