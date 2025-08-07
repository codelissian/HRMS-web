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
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Search,
  FilterList,
} from '@mui/icons-material';
import CustomTable from '../../components/UI/CustomTable';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaves, searchTerm, statusFilter]);

  const loadData = () => {
    const storedLeaves = JSON.parse(localStorage.getItem('hrms_leaves') || '[]');
    const storedEmployees = JSON.parse(localStorage.getItem('hrms_employees') || '[]');
    
    // Add employee names to leave data
    const leavesWithEmployeeNames = storedLeaves.map(leave => ({
      ...leave,
      employeeName: storedEmployees.find(emp => emp.id === leave.employeeId)?.name || 'Unknown Employee',
      employeeEmail: storedEmployees.find(emp => emp.id === leave.employeeId)?.email || 'Unknown Email',
    }));
    
    setLeaves(leavesWithEmployeeNames);
    setEmployees(storedEmployees);
  };

  const filterLeaves = () => {
    let filtered = leaves;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(leave =>
        leave.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leave.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(leave => leave.status === statusFilter);
    }

    setFilteredLeaves(filtered);
  };

  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setOpenDialog(true);
  };

  const handleApproveLeave = (leaveId) => {
    if (window.confirm('Are you sure you want to approve this leave request?')) {
      const updatedLeaves = leaves.map(leave =>
        leave.id === leaveId ? { ...leave, status: 'approved' } : leave
      );
      localStorage.setItem('hrms_leaves', JSON.stringify(updatedLeaves));
      setLeaves(updatedLeaves);
      setAlert({
        type: 'success',
        message: 'Leave request approved successfully'
      });
    }
  };

  const handleRejectLeave = (leaveId) => {
    if (window.confirm('Are you sure you want to reject this leave request?')) {
      const updatedLeaves = leaves.map(leave =>
        leave.id === leaveId ? { ...leave, status: 'rejected' } : leave
      );
      localStorage.setItem('hrms_leaves', JSON.stringify(updatedLeaves));
      setLeaves(updatedLeaves);
      setAlert({
        type: 'success',
        message: 'Leave request rejected successfully'
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const columns = [
    { field: 'employeeName', headerName: 'Employee', width: 200 },
    { field: 'type', headerName: 'Leave Type', width: 150 },
    { field: 'startDate', headerName: 'Start Date', type: 'date', width: 120 },
    { field: 'endDate', headerName: 'End Date', type: 'date', width: 120 },
    { field: 'days', headerName: 'Days', width: 80 },
    {
      field: 'status',
      headerName: 'Status',
      type: 'chip',
      chipColor: getStatusColor,
      width: 120,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 200,
      render: (value, row) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => handleViewLeave(row)}
            color="info"
          >
            <Visibility />
          </IconButton>
          {row.status === 'pending' && (
            <>
              <IconButton
                size="small"
                onClick={() => handleApproveLeave(row.id)}
                color="success"
              >
                <CheckCircle />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleRejectLeave(row.id)}
                color="error"
              >
                <Cancel />
              </IconButton>
            </>
          )}
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flex: 1, maxWidth: 'calc(100% - 200px)' }}>
          <TextField
            size="small"
            placeholder="Search leaves by employee name, type, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ maxWidth: 220 }}
          />
          <FormControl size="small" sx={{ maxWidth: 220 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <CustomTable
        columns={columns}
        data={filteredLeaves.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredLeaves.length}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        emptyMessage="No leave requests found"
      />

      {/* Leave Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Leave Request Details
        </DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Employee Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave.employeeName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Employee Email
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave.employeeEmail}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Leave Type
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave.type}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedLeave.status}
                    color={getStatusColor(selectedLeave.status)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Start Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedLeave.startDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    End Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedLeave.endDate).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Number of Days
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave.days}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reason
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedLeave.reason}
                  </Typography>
                </Grid>
                {selectedLeave.comments && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Comments
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedLeave.comments}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {selectedLeave?.status === 'pending' && (
            <>
              <Button
                onClick={() => {
                  handleApproveLeave(selectedLeave.id);
                  setOpenDialog(false);
                }}
                color="success"
                variant="contained"
              >
                Approve
              </Button>
              <Button
                onClick={() => {
                  handleRejectLeave(selectedLeave.id);
                  setOpenDialog(false);
                }}
                color="error"
                variant="contained"
              >
                Reject
              </Button>
            </>
          )}
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leaves; 