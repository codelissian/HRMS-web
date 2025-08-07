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
import httpClient from '../services/httpClient';

const DirectApiCallExample = () => {
  const [formData, setFormData] = useState({
    search: '',
    page: 1,
    start_date: null,
    end_date: null,
    filter: 'all'
  });

  const [transactionData, setTransactionData] = useState([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 0,
    total_objects: 0,
    allcount: 0
  });

  // Direct API call function (similar to your Vue.js pattern)
  const getTransactionData = async () => {
    const successHandler = (res) => {
      console.log('Transaction data received:', res);
      setTransactionData(res.data.result.data || []);
      setPagination({
        current_page: res.data.result.page_info.current_page || 1,
        total_pages: res.data.result.page_info.total_pages || 0,
        total_objects: res.data.result.page_info.total_objects || 0,
        allcount: res.data.result.allcount || 0
      });
    };

    const failureHandler = (error) => {
      console.error('Failed to fetch transactions:', error);
    };

    // Prepare form data (similar to your Vue.js pattern)
    let params = {};
    if (formData.search) params["search"] = formData.search;
    params["page"] = formData.page;
    params["start_date"] = formData.start_date ? formData.start_date.toISOString().split('T')[0] : undefined;
    params["end_date"] = formData.end_date ? formData.end_date.toISOString().split('T')[0] : undefined;
    params["filter"] = formData.filter;

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    // Direct API call using httpClient (equivalent to your this.$axios)
    try {
      const response = await httpClient.get('/employees', { params });
      successHandler(response);
    } catch (error) {
      failureHandler(error);
    }
  };

  // Using the hook for the same functionality
  const { 
    execute: fetchTransactions, 
    loading, 
    error, 
    data 
  } = useApiCall(
    () => {
      // Prepare params
      let params = {};
      if (formData.search) params["search"] = formData.search;
      params["page"] = formData.page;
      params["start_date"] = formData.start_date ? formData.start_date.toISOString().split('T')[0] : undefined;
      params["end_date"] = formData.end_date ? formData.end_date.toISOString().split('T')[0] : undefined;
      params["filter"] = formData.filter;

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      // Return the API call
      return httpClient.get('/employees', { params });
    },
    {
      onSuccess: (response) => {
        console.log('Hook: Transaction data received:', response);
        setTransactionData(response.data.result.data || []);
        setPagination({
          current_page: response.data.result.page_info.current_page || 1,
          total_pages: response.data.result.page_info.total_pages || 0,
          total_objects: response.data.result.page_info.total_objects || 0,
          allcount: response.data.result.allcount || 0
        });
      },
      onError: (error) => {
        console.error('Hook: Failed to fetch transactions:', error);
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDirectCall = () => {
    getTransactionData();
  };

  const handleHookCall = () => {
    fetchTransactions();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Direct API Call Example
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
        This shows how to implement API calls directly in the component (like your Vue.js pattern)
      </Typography>

      <Grid container spacing={3}>
        {/* Form */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Search & Filters
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  label="Search"
                  name="search"
                  value={formData.search}
                  onChange={handleInputChange}
                  placeholder="Search transactions..."
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Page"
                  name="page"
                  type="number"
                  value={formData.page}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Filter"
                  name="filter"
                  value={formData.filter}
                  onChange={handleInputChange}
                />
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      onClick={handleDirectCall}
                      fullWidth
                      sx={{ height: 48 }}
                    >
                      Direct Call
                    </Button>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      onClick={handleHookCall}
                      disabled={loading}
                      fullWidth
                      sx={{ height: 48 }}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Hook Call'}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error.message || 'Failed to fetch data'}
              </Alert>
            )}

            {pagination.total_objects > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Total: {pagination.total_objects} records | 
                  Page {pagination.current_page} of {pagination.total_pages}
                </Typography>
              </Box>
            )}

            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {transactionData.length > 0 ? (
                transactionData.map((item, index) => (
                  <Card key={item.id || index} sx={{ mb: 1 }}>
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body2">
                        <strong>ID:</strong> {item.id} | 
                        <strong>Name:</strong> {item.name} | 
                        <strong>Email:</strong> {item.email}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No data found
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Code Comparison */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Code Comparison
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Your Vue.js Pattern:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  backgroundColor: '#f5f5f5', 
                  p: 2, 
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}>
{`getTransactionData() {
  this.loading = true;
  const successHandler = (res) => {
    this.transaction_data = res.data.result.data;
    this.total_pages = res.data.result.page_info.total_pages;
    this.page = res.data.result.page_info.current_page;
    this.total_objects = res.data.result.page_info.total_objects;
    this.loading = false;
  };
  const failureHandler = () => {
    this.loading = false;
  };
  let formData = {};
  if (this.search) formData["search"] = this.search;
  formData["page"] = this.page;
  formData["start_date"] = this.filter_by_date[0];
  formData["end_date"] = this.filter_by_date[1];
  formData["filter"] = this.$store.state.inventory.transaction_selected_tab;
  return this.$axios("get", this.$apiUrl.GET_TRANSACTION_LIST, {
    params: formData,
    onSuccess: successHandler,
    onFailure: failureHandler,
    isTokenRequired: true,
  });
}`}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  React Equivalent (Direct Call):
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  backgroundColor: '#f5f5f5', 
                  p: 2, 
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}>
{`const getTransactionData = async () => {
  const successHandler = (res) => {
    setTransactionData(res.data.result.data);
    setPagination({
      current_page: res.data.result.page_info.current_page,
      total_pages: res.data.result.page_info.total_pages,
      total_objects: res.data.result.page_info.total_objects
    });
  };
  const failureHandler = (error) => {
    console.error('Failed:', error);
  };
  let params = {};
  if (formData.search) params["search"] = formData.search;
  params["page"] = formData.page;
  params["start_date"] = formData.start_date;
  params["end_date"] = formData.end_date;
  params["filter"] = formData.filter;
  try {
    const response = await httpClient.get('/employees', { params });
    successHandler(response);
  } catch (error) {
    failureHandler(error);
  }
};`}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DirectApiCallExample; 