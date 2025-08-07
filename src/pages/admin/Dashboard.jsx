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
} from '@mui/material';
import {
  People,
  AttachMoney,
  EventNote,
  TrendingUp,
  PersonAdd,
  Work,
} from '@mui/icons-material';
import { StatCard } from '../../components/UI/CustomCard';
import CustomTable from '../../components/UI/CustomTable';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalPayroll: 0,
    pendingLeaves: 0,
    activeEmployees: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [recentLeaves, setRecentLeaves] = useState([]);

  useEffect(() => {
    // Load data from localStorage
    const employees = JSON.parse(localStorage.getItem('hrms_employees') || '[]');
    const leaves = JSON.parse(localStorage.getItem('hrms_leaves') || '[]');
    const payroll = JSON.parse(localStorage.getItem('hrms_payroll') || '[]');

    // Calculate stats
    setStats({
      totalEmployees: employees.length,
      totalPayroll: payroll.reduce((sum, p) => sum + (p.amount || 0), 0),
      pendingLeaves: leaves.filter(l => l.status === 'pending').length,
      activeEmployees: employees.filter(e => e.status === 'active').length,
    });

    // Recent activities (simulated)
    setRecentActivities([
      {
        id: 1,
        type: 'employee_added',
        message: 'New employee John Doe added',
        timestamp: new Date().toISOString(),
        user: 'Admin',
      },
      {
        id: 2,
        type: 'leave_approved',
        message: 'Leave request approved for Jane Smith',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        user: 'Admin',
      },
      {
        id: 3,
        type: 'payroll_processed',
        message: 'Payroll processed for March 2024',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        user: 'Admin',
      },
    ]);

    // Recent leave requests
    const recentLeavesData = leaves
      .slice(0, 5)
      .map(leave => ({
        ...leave,
        employeeName: employees.find(e => e.id === leave.employeeId)?.name || 'Unknown',
      }));

    setRecentLeaves(recentLeavesData);
  }, []);

  const leaveColumns = [
    { field: 'employeeName', headerName: 'Employee', width: 150 },
    { field: 'type', headerName: 'Type', width: 120 },
    { field: 'startDate', headerName: 'Start Date', type: 'date', width: 120 },
    { field: 'endDate', headerName: 'End Date', type: 'date', width: 120 },
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
      width: 100,
    },
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'employee_added':
        return <PersonAdd color="primary" />;
      case 'leave_approved':
        return <EventNote color="success" />;
      case 'payroll_processed':
        return <AttachMoney color="info" />;
      default:
        return <Work color="default" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={<People />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Employees"
            value={stats.activeEmployees}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Leaves"
            value={stats.pendingLeaves}
            icon={<EventNote />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Payroll"
            value={`$${stats.totalPayroll.toLocaleString()}`}
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
            <CustomTable
              columns={leaveColumns}
              data={recentLeaves}
              page={0}
              rowsPerPage={5}
              totalCount={recentLeaves.length}
              onPageChange={() => {}}
              onRowsPerPageChange={() => {}}
              emptyMessage="No recent leave requests"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 