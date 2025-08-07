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
  Paper
} from '@mui/material';
import { useApiCall } from '../hooks/useApi';
import authApi from '../services/api/authApi';

const LoginExample = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Using the custom hook for API calls
  const { 
    execute: login, 
    loading, 
    error, 
    data 
  } = useApiCall(authApi.login, {
    onSuccess: (response) => {
      console.log('Login successful:', response);
      // Handle successful login
      // You can redirect or update auth context here
    },
    onError: (error) => {
      console.error('Login failed:', error);
      // Handle login error
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // This is the React equivalent of your Vue.js API call
    await login(formData);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Login Example
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
          This demonstrates how to call the login API using the new HTTP client system
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !formData.email || !formData.password}
                sx={{ height: 48 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Login'
                )}
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
            Login successful! User data: {JSON.stringify(data.user, null, 2)}
          </Alert>
        )}

        {/* API Response Details */}
        {data && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
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
            </CardContent>
          </Card>
        )}
      </Paper>
    </Box>
  );
};

export default LoginExample; 