import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Add,
  EventNote,
  CheckCircle,
  Cancel,
  Schedule,
} from '@mui/icons-material';
import CustomForm from '../../components/UI/CustomForm';
import CustomTable from '../../components/UI/CustomTable';
import { useAuth } from '../../context/AuthContext';

const Leave = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadLeaves();
  }, [user]);

  const loadLeaves = () => {
    if (!user) return;
    
    const allLeaves = JSON.parse(localStorage.getItem('hrms_leaves') || '[]');
    const employeeLeaves = allLeaves.filter(leave => leave.employeeId === user.id);
    setLeaves(employeeLeaves);
  };

  const handleApplyLeave = () => {
    setOpenDialog(true);
  };

  const handleSubmitLeave = (formData) => {
    setLoading(true);
    
    try {
      const newLeave = {
        ...formData,
        id: Date.now().toString(),
        employeeId: user.id,
        employeeName: user.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const existingLeaves = JSON.parse(localStorage.getItem('hrms_leaves') || '[]');
      const updatedLeaves = [...existingLeaves, newLeave];
      
      localStorage.setItem('hrms_leaves', JSON.stringify(updatedLeaves));
      setLeaves(updatedLeaves.filter(leave => leave.employeeId === user.id));
      setOpenDialog(false);
      setAlert({
        type: 'success',
        message: 'Leave request submitted successfully'
      });
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'An error occurred while submitting leave request'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // Include both start and end dates
  };

  const leaveFields = [
    {
      name: 'type',
      type: 'select',
      label: 'Leave Type',
      required: true,
      options: [
        { value: 'sick', label: 'Sick Leave' },
        { value: 'casual', label: 'Casual Leave' },
        { value: 'annual', label: 'Annual Leave' },
        { value: 'personal', label: 'Personal Leave' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      name: 'startDate',
      type: 'date',
      label: 'Start Date',
      required: true,
    },
    {
      name: 'endDate',
      type: 'date',
      label: 'End Date',
      required: true,
    },
    {
      name: 'reason',
      type: 'text',
      label: 'Reason for Leave',
      required: true,
      multiline: true,
      rows: 3,
    },
    {
      name: 'comments',
      type: 'text',
      label: 'Additional Comments',
      multiline: true,
      rows: 2,
    },
  ];

  const columns = [
    { field: 'type', headerName: 'Type', width: 150 },
    { field: 'startDate', headerName: 'Start Date', type: 'date', width: 120 },
    { field: 'endDate', headerName: 'End Date', type: 'date', width: 120 },
    { 
      field: 'days', 
      headerName: 'Days', 
      width: 80,
      render: (value, row) => calculateDays(row.startDate, row.endDate),
    },
    { field: 'reason', headerName: 'Reason', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      type: 'chip',
      chipColor: (value) => {
        switch (value) {
          case 'approved': return 'success';
          case 'pending': return 'warning';
          case 'rejected': return 'error';
          default: return 'default';
        }
      },
      width: 120,
    },
    { field: 'createdAt', headerName: 'Applied On', type: 'date', width: 120 },
  ];

  const getLeaveStats = () => {
    const totalLeaves = leaves.length;
    const pendingLeaves = leaves.filter(l => l.status === 'pending').length;
    const approvedLeaves = leaves.filter(l => l.status === 'approved').length;
    const rejectedLeaves = leaves.filter(l => l.status === 'rejected').length;

    return { totalLeaves, pendingLeaves, approvedLeaves, rejectedLeaves };
  };

  const stats = getLeaveStats();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleApplyLeave}
        >
          Apply for Leave
        </Button>
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Leave Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventNote color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.totalLeaves}
              </Typography>
              <Typography color="textSecondary">
                Total Leaves
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.pendingLeaves}
              </Typography>
              <Typography color="textSecondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.approvedLeaves}
              </Typography>
              <Typography color="textSecondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Cancel color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" component="div">
                {stats.rejectedLeaves}
              </Typography>
              <Typography color="textSecondary">
                Rejected
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Leave History */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Leave History
          </Typography>
          <CustomTable
            columns={columns}
            data={leaves.slice(page * rowsPerPage, (page + 1) * rowsPerPage)}
            page={page}
            rowsPerPage={rowsPerPage}
            totalCount={leaves.length}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            emptyMessage="No leave requests found"
          />
        </CardContent>
      </Card>

      {/* Apply Leave Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Apply for Leave
        </DialogTitle>
        <DialogContent>
          <CustomForm
            fields={leaveFields}
            values={{}}
            errors={{}}
            onChange={() => {}}
            onSubmit={handleSubmitLeave}
            submitText="Submit Leave Request"
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

export default Leave; 