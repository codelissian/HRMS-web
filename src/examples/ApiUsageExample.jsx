import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useApi, useApiCall, useApiEffect } from '../hooks/useApi';
import authApi from '../services/api/authApi';
import employeeApi from '../services/api/employeeApi';

/**
 * Example component demonstrating the new HTTP client system
 */
const ApiUsageExample = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [employeeData, setEmployeeData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
  });

  // Example 1: Using useApi hook for general API calls
  const { data: employees, loading: employeesLoading, error: employeesError, get: getEmployees } = useApi({
    onSuccess: (data) => console.log('Employees loaded:', data),
    onError: (error) => console.error('Failed to load employees:', error),
  });

  // Example 2: Using useApiCall hook for specific API calls
  const { data: userProfile, loading: profileLoading, error: profileError, execute: fetchProfile } = useApiCall(
    authApi.getProfile
  );

  // Example 3: Using useApiEffect for automatic data loading
  const { data: dashboardStats, loading: statsLoading, error: statsError } = useApiEffect(
    () => employeeApi.getStatistics('current-user-id'),
    [], // Empty dependencies - runs once on mount
  );

  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      await getEmployees('/employees', {
        params: {
          page: 1,
          limit: 10,
          status: 'active',
        },
      });
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await authApi.login(loginData);
      console.log('Login successful:', response);
      // Handle successful login (e.g., redirect, update context)
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  const handleCreateEmployee = async () => {
    try {
      const response = await employeeApi.createEmployee(employeeData);
      console.log('Employee created:', response);
      // Refresh employees list
      await loadEmployees();
      // Reset form
      setEmployeeData({ name: '', email: '', department: '', position: '' });
    } catch (error) {
      console.error('Failed to create employee:', error.message);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const response = await employeeApi.uploadPhoto('employee-id', file, (progress) => {
        console.log(`Upload progress: ${progress}%`);
      });
      console.log('File uploaded:', response);
    } catch (error) {
      console.error('Upload failed:', error.message);
    }
  };

  const handleExportEmployees = async () => {
    try {
      await employeeApi.exportEmployees({
        format: 'csv',
        fields: ['name', 'email', 'department', 'position'],
      });
    } catch (error) {
      console.error('Export failed:', error.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        HTTP Client System Examples
      </Typography>

      {/* Example 1: Login Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Example 1: Authentication API
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={handleLogin}>
                Login
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Example 2: Employee Creation */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Example 2: Employee API
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={employeeData.name}
                onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                value={employeeData.email}
                onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Department"
                value={employeeData.department}
                onChange={(e) => setEmployeeData({ ...employeeData, department: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                value={employeeData.position}
                onChange={(e) => setEmployeeData({ ...employeeData, position: e.target.value })}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={handleCreateEmployee}>
                Create Employee
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Example 3: File Upload */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Example 3: File Upload
          </Typography>
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload">
            <Button variant="contained" component="span">
              Upload Employee Photo
            </Button>
          </label>
        </CardContent>
      </Card>

      {/* Example 4: Data Loading with useApi */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Example 4: Data Loading with useApi Hook
          </Typography>
          {employeesLoading && <CircularProgress size={20} />}
          {employeesError && <Alert severity="error">{employeesError}</Alert>}
          {employees && (
            <Box>
              <Typography variant="subtitle1">Employees ({employees.length})</Typography>
              <Button variant="outlined" onClick={loadEmployees} sx={{ mt: 1 }}>
                Refresh
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Example 5: Profile Loading with useApiCall */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Example 5: Profile Loading with useApiCall Hook
          </Typography>
          {profileLoading && <CircularProgress size={20} />}
          {profileError && <Alert severity="error">{profileError}</Alert>}
          {userProfile && (
            <Box>
              <Typography variant="subtitle1">User Profile Loaded</Typography>
              <pre>{JSON.stringify(userProfile, null, 2)}</pre>
            </Box>
          )}
          <Button variant="outlined" onClick={fetchProfile} sx={{ mt: 1 }}>
            Load Profile
          </Button>
        </CardContent>
      </Card>

      {/* Example 6: Auto-loading with useApiEffect */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Example 6: Auto-loading with useApiEffect Hook
          </Typography>
          {statsLoading && <CircularProgress size={20} />}
          {statsError && <Alert severity="error">{statsError}</Alert>}
          {dashboardStats && (
            <Box>
              <Typography variant="subtitle1">Dashboard Statistics</Typography>
              <pre>{JSON.stringify(dashboardStats, null, 2)}</pre>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Example 7: Export Functionality */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Example 7: Export Functionality
          </Typography>
          <Button variant="contained" onClick={handleExportEmployees}>
            Export Employees (CSV)
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ApiUsageExample; 