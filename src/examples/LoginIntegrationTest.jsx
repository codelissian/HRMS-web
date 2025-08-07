import React, { useState } from 'react';
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
  Paper,
  Divider
} from '@mui/material';
import { useApiCall } from '../hooks/useApi';
import authApi from '../services/api/authApi';
import { useAuth } from '../context/AuthContext';

const LoginIntegrationTest = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const { login, user, isAuthenticated, logout } = useAuth();

  // API call using the new HTTP client system
  const { 
    execute: loginApi, 
    loading, 
    error, 
    data 
  } = useApiCall(authApi.login, {
    onSuccess: (response) => {
      console.log('API Login successful:', response);
      
      // Process the API response
      if (response.token) {
        const result = login(formData.email, formData.password, response);
        if (result.success) {
          console.log('User logged in successfully:', result.user);
        }
      }
    },
    onError: (error) => {
      console.error('API Login failed:', error);
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApiLogin = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    // This calls: POST https://hrms-backend-omega.vercel.app/api/v1/auth/login
    await loginApi(formData);
  };

  const handleLocalLogin = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      return;
    }

    // Fallback to local authentication
    const result = login(formData.email, formData.password);
    console.log('Local login result:', result);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Login Integration Test
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
        Testing the integration between the new HTTP client system and authentication
      </Typography>

      <Grid container spacing={3}>
        {/* Login Form */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Login Form
            </Typography>
            
            <form onSubmit={handleApiLogin}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
                sx={{ mb: 2 }}
              />
              
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || !formData.email || !formData.password}
                    sx={{ height: 48 }}
                  >
                    {loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      'API Login'
                    )}
                  </Button>
                </Grid>
                
                <Grid item xs={6}>
                  <Button
                    onClick={handleLocalLogin}
                    fullWidth
                    variant="outlined"
                    disabled={loading || !formData.email || !formData.password}
                    sx={{ height: 48 }}
                  >
                    Local Login
                  </Button>
                </Grid>
              </Grid>
            </form>

            {/* Error Display */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error.message || 'Login failed. Please try again.'}
              </Alert>
            )}

            {/* Success Display */}
            {data && (
              <Alert severity="success" sx={{ mt: 2 }}>
                API Login successful! Check console for details.
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Current State */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current State
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Authentication Status:
              </Typography>
              <Typography variant="body1" color={isAuthenticated() ? 'success.main' : 'error.main'}>
                {isAuthenticated() ? 'Authenticated' : 'Not Authenticated'}
              </Typography>
            </Box>

            {user && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Current User:
                </Typography>
                <Card variant="outlined" sx={{ mt: 1 }}>
                  <CardContent sx={{ py: 1 }}>
                    <Typography variant="body2">
                      <strong>Name:</strong> {user.name || 'N/A'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {user.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Role:</strong> {user.role}
                    </Typography>
                    <Typography variant="body2">
                      <strong>ID:</strong> {user.id}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            {isAuthenticated() && (
              <Button
                onClick={handleLogout}
                variant="outlined"
                color="error"
                fullWidth
              >
                Logout
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* API Response Details */}
      {data && (
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Response Details:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.875rem'
          }}>
            {JSON.stringify(data, null, 2)}
          </Typography>
        </Paper>
      )}

      {/* Test Credentials */}
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Test Credentials
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          For testing purposes, you can use these credentials:
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Admin User:
                </Typography>
                <Typography variant="body2">
                  Email: admin@example.com
                </Typography>
                <Typography variant="body2">
                  Password: admin123
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Employee User:
                </Typography>
                <Typography variant="body2">
                  Email: employee@example.com
                </Typography>
                <Typography variant="body2">
                  Password: employee123
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          <strong>Note:</strong> These are for local testing. For real API testing, use your actual backend credentials.
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginIntegrationTest; 