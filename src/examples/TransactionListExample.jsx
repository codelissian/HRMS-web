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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useApiCall, useApiEffect } from '../hooks/useApi';
import employeeApi from '../services/api/employeeApi';

const TransactionListExample = () => {
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

  // Method 1: Using useApiCall hook (similar to your Vue.js pattern)
  const { 
    execute: fetchTransactions, 
    loading, 
    error, 
    data 
  } = useApiCall(employeeApi.getEmployees, {
    onSuccess: (response) => {
      console.log('Transactions fetched successfully:', response);
      // This is equivalent to your Vue.js successHandler
      setTransactionData(response.data || []);
      setPagination({
        current_page: response.page_info?.current_page || 1,
        total_pages: response.page_info?.total_pages || 0,
        total_objects: response.page_info?.total_objects || 0,
        allcount: response.allcount || 0
      });
    },
    onError: (error) => {
      console.error('Failed to fetch transactions:', error);
      // This is equivalent to your Vue.js failureHandler
    }
  });

  // Method 2: Using useApiEffect hook for automatic loading
  const { 
    data: autoLoadedData, 
    loading: autoLoading, 
    error: autoError 
  } = useApiEffect(
    () => employeeApi.getEmployees({ page: 1, limit: 10 }),
    [], // Empty dependency array means it runs once on mount
    {
      onSuccess: (response) => {
        console.log('Auto-loaded transactions:', response);
      }
    }
  );

  const handleSearch = () => {
    // Prepare form data similar to your Vue.js example
    const params = {
      page: formData.page,
      search: formData.search || undefined,
      start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : undefined,
      end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : undefined,
      filter: formData.filter
    };

    // Remove undefined values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined) {
        delete params[key];
      }
    });

    // This is the React equivalent of your Vue.js API call
    fetchTransactions(params);
  };

  const handlePageChange = (event, newPage) => {
    setFormData(prev => ({ ...prev, page: newPage + 1 }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (name) => (date) => {
    setFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  // Method 3: Direct API call without hooks (for one-off calls)
  const handleDirectApiCall = async () => {
    try {
      const response = await employeeApi.getEmployees({
        page: 1,
        limit: 5,
        search: 'test'
      });
      console.log('Direct API call result:', response);
    } catch (error) {
      console.error('Direct API call failed:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transaction List Example
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This demonstrates different ways to call APIs in React using the new HTTP client system
      </Typography>

      {/* Search and Filter Form */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
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
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={formData.start_date}
                onChange={handleDateChange('start_date')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={formData.end_date}
                onChange={handleDateChange('end_date')}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Filter</InputLabel>
              <Select
                name="filter"
                value={formData.filter}
                onChange={handleInputChange}
                label="Filter"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={loading}
                sx={{ flex: 1 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Search'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleDirectApiCall}
                sx={{ flex: 1 }}
              >
                Direct Call
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || 'Failed to fetch transactions'}
        </Alert>
      )}

      {/* Results Section */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Results
        </Typography>
        
        {/* Pagination Info */}
        {pagination.total_objects > 0 && (
          <Box sx={{ mb: 2 }}>
            <Chip 
              label={`Total: ${pagination.total_objects} records`} 
              color="primary" 
              sx={{ mr: 1 }}
            />
            <Chip 
              label={`Page ${pagination.current_page} of ${pagination.total_pages}`} 
              variant="outlined"
            />
          </Box>
        )}

        {/* Data Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : transactionData.length > 0 ? (
                transactionData.map((item, index) => (
                  <TableRow key={item.id || index}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>
                      <Chip 
                        label={item.status || 'Active'} 
                        color={item.status === 'Active' ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <TablePagination
            component="div"
            count={pagination.total_objects}
            page={pagination.current_page - 1}
            onPageChange={handlePageChange}
            rowsPerPage={10}
            rowsPerPageOptions={[10]}
          />
        )}
      </Paper>

      {/* Auto-loaded Data Section */}
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Auto-loaded Data (useApiEffect)
        </Typography>
        
        {autoLoading ? (
          <CircularProgress />
        ) : autoError ? (
          <Alert severity="error">{autoError.message}</Alert>
        ) : autoLoadedData ? (
          <Typography variant="body2">
            Auto-loaded {autoLoadedData.data?.length || 0} records
          </Typography>
        ) : null}
      </Paper>

      {/* API Response Details */}
      {data && (
        <Card sx={{ mt: 3 }}>
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
    </Box>
  );
};

export default TransactionListExample; 