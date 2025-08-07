import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Alert,
  Divider,
} from '@mui/material';
import {
  EventNote,
  CheckCircle,
  Cancel,
  Pending,
  CalendarToday,
} from '@mui/icons-material';
import { format } from 'date-fns';

const LeaveSection = ({ employeeId }) => {
  const [leaveData, setLeaveData] = useState([]);
  const [summary, setSummary] = useState({
    totalLeaves: 0,
    leavesTaken: 0,
    leavesRemaining: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    loadLeaveData();
  }, [employeeId]);

  const loadLeaveData = () => {
    try {
      const allLeaves = JSON.parse(localStorage.getItem('hrms_leaves') || '[]');
      const employeeLeaves = allLeaves.filter(leave => leave.employeeId === employeeId);
      
      setLeaveData(employeeLeaves);
      
      // Calculate summary
      const leavesTaken = employeeLeaves.filter(leave => leave.status === 'approved').length;
      const pendingRequests = employeeLeaves.filter(leave => leave.status === 'pending').length;
      const totalLeaves = 20; // Assuming 20 leaves per year
      const leavesRemaining = totalLeaves - leavesTaken;
      
      setSummary({
        totalLeaves,
        leavesTaken,
        leavesRemaining,
        pendingRequests,
      });
    } catch (error) {
      console.error('Error loading leave data:', error);
    }
  };

  const handleApproveLeave = (leaveId) => {
    try {
      const allLeaves = JSON.parse(localStorage.getItem('hrms_leaves') || '[]');
      const updatedLeaves = allLeaves.map(leave => 
        leave.id === leaveId ? { ...leave, status: 'approved' } : leave
      );
      
      localStorage.setItem('hrms_leaves', JSON.stringify(updatedLeaves));
      loadLeaveData(); // Reload data
    } catch (error) {
      console.error('Error approving leave:', error);
    }
  };

  const handleRejectLeave = (leaveId) => {
    try {
      const allLeaves = JSON.parse(localStorage.getItem('hrms_leaves') || '[]');
      const updatedLeaves = allLeaves.map(leave => 
        leave.id === leaveId ? { ...leave, status: 'rejected' } : leave
      );
      
      localStorage.setItem('hrms_leaves', JSON.stringify(updatedLeaves));
      loadLeaveData(); // Reload data
    } catch (error) {
      console.error('Error rejecting leave:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'rejected':
        return <Cancel />;
      case 'pending':
        return <Pending />;
      default:
        return null;
    }
  };

  const pendingRequests = leaveData.filter(leave => leave.status === 'pending');
  const leaveHistory = leaveData.filter(leave => leave.status !== 'pending');

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CalendarToday sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {summary.totalLeaves}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Leaves
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {summary.leavesTaken}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Leaves Taken
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <EventNote sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {summary.leavesRemaining}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Leaves Remaining
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Pending sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" gutterBottom>
                {summary.pendingRequests}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Requests
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Pending Leave Requests
          </Typography>
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>From Date</TableCell>
                    <TableCell>To Date</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingRequests.map((leave) => (
                    <TableRow key={leave.id} hover>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell>{format(new Date(leave.fromDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(leave.toDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{leave.days}</TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(leave.status)}
                          label={leave.status}
                          color={getStatusColor(leave.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => handleApproveLeave(leave.id)}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="error"
                            onClick={() => handleRejectLeave(leave.id)}
                            sx={{ minWidth: 'auto', px: 1 }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Leave History */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Leave History
        </Typography>
        {leaveHistory.length > 0 ? (
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Leave Type</TableCell>
                    <TableCell>From Date</TableCell>
                    <TableCell>To Date</TableCell>
                    <TableCell>Days</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Applied On</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaveHistory.map((leave) => (
                    <TableRow key={leave.id} hover>
                      <TableCell>{leave.type}</TableCell>
                      <TableCell>{format(new Date(leave.fromDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(leave.toDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{leave.days}</TableCell>
                      <TableCell>{leave.reason}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(leave.status)}
                          label={leave.status}
                          color={getStatusColor(leave.status)}
                          size="small"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(leave.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          <Alert severity="info">
            No leave history found for this employee.
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default LeaveSection; 