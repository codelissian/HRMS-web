import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Person,
  EventNote,
  AttachMoney,
  Schedule,
  TrendingUp,
  Work,
} from '@mui/icons-material';
import { StatCard } from '../../components/UI/CustomCard';
import { useAuth } from '../../context/AuthContext';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    totalSalary: 0,
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    loadEmployeeData();
  }, [user]);

  const loadEmployeeData = () => {
    if (!user) return;

    // Load leaves for this employee
    const allLeaves = JSON.parse(localStorage.getItem('hrms_leaves') || '[]');
    const employeeLeaves = allLeaves.filter(leave => leave.employeeId === user.id);
    
    // Load payroll for this employee
    const allPayrolls = JSON.parse(localStorage.getItem('hrms_payroll') || '[]');
    const employeePayrolls = allPayrolls.filter(payroll => payroll.employeeId === user.id);

    // Calculate stats
    setStats({
      totalLeaves: employeeLeaves.length,
      pendingLeaves: employeeLeaves.filter(l => l.status === 'pending').length,
      approvedLeaves: employeeLeaves.filter(l => l.status === 'approved').length,
      totalSalary: employeePayrolls.reduce((sum, p) => sum + (p.amount || 0), 0),
    });

    // Recent leaves (last 5)
    const recentLeavesData = employeeLeaves
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    setRecentLeaves(recentLeavesData);

    // Recent activities (simulated)
    setRecentActivities([
      {
        id: 1,
        type: 'leave_submitted',
        message: 'Leave request submitted for March 15-17',
        timestamp: new Date().toISOString(),
      },
      {
        id: 2,
        type: 'leave_approved',
        message: 'Leave request approved for February 10-12',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        type: 'salary_processed',
        message: 'Salary processed for February 2024',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
      },
    ]);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'leave_submitted':
        return <EventNote color="primary" />;
      case 'leave_approved':
        return <EventNote color="success" />;
      case 'salary_processed':
        return <AttachMoney color="info" />;
      default:
        return <Work color="default" />;
    }
  };

  const getLeaveStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Leaves"
            value={stats.totalLeaves}
            icon={<EventNote />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon={<Schedule />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Approved Leaves"
            value={stats.approvedLeaves}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Salary"
            value={`$${stats.totalSalary.toLocaleString()}`}
            icon={<AttachMoney />}
            color="info"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'background.default' }}>
                      {getActivityIcon(activity.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={activity.message}
                    secondary={new Date(activity.timestamp).toLocaleString()}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Leave Requests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '400px' }}>
            <Typography variant="h6" gutterBottom>
              Recent Leave Requests
            </Typography>
            {recentLeaves.length === 0 ? (
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  No recent leave requests
                </Typography>
              </Box>
            ) : (
              <List>
                {recentLeaves.map((leave) => (
                  <ListItem key={leave.id} divider>
                    <ListItemText
                      primary={leave.type}
                      secondary={
                        <Box>
                          <Typography variant="body2">
                            {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                          </Typography>
                          <Chip
                            label={leave.status}
                            color={getLeaveStatusColor(leave.status)}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <EventNote color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">Apply for Leave</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Submit a new leave request
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Schedule color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">View Attendance</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check your attendance record
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AttachMoney color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">View Salary</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Check your salary details
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Person color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h6">Profile</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Update your profile
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDashboard; 