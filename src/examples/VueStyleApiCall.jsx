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
import httpClient from '../services/httpClient';
import { $apiUrl } from '../config/endpoints';

const VueStyleApiCall = () => {
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState([]);
  const [transactionTabItem, setTransactionTabItem] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [totalObjects, setTotalObjects] = useState(0);
  
  const [search, setSearch] = useState('');
  const [filterByDate, setFilterByDate] = useState(['', '']);
  const [transactionSelectedTab, setTransactionSelectedTab] = useState('all');

  // This is the EXACT conversion of your Vue.js pattern
  const getTransactionData = async () => {
    setLoading(true);
    
    const successHandler = (res) => {
      console.log('Success:', res);
      setTransactionData(res.data.result.data);
      setTransactionTabItem(res.data.result.allcount);
      setTotalPages(res.data.result.page_info.total_pages);
      setPage(res.data.result.page_info.current_page);
      setTotalObjects(res.data.result.page_info.total_objects);
      setLoading(false);
    };

    const failureHandler = (error) => {
      console.error('Failure:', error);
      setLoading(false);
    };

    let formData = {};
    if (search) formData["search"] = search;
    formData["page"] = page;
    formData["start_date"] = filterByDate[0];
    formData["end_date"] = filterByDate[1];
    formData["filter"] = transactionSelectedTab;

    try {
      // This is equivalent to: this.$axios("get", this.$apiUrl.GET_TRANSACTION_LIST, {...})
      const response = await httpClient.get($apiUrl.GET_TRANSACTION_LIST, {
        params: formData,
        // Note: isTokenRequired is handled automatically by httpClient
      });
      
      successHandler(response);
    } catch (error) {
      failureHandler(error);
    }
  };

  // Alternative: Using the same pattern but with the hook for automatic loading state
  const getTransactionDataWithHook = async () => {
    const successHandler = (res) => {
      console.log('Success with hook:', res);
      setTransactionData(res.data.result.data);
      setTransactionTabItem(res.data.result.allcount);
      setTotalPages(res.data.result.page_info.total_pages);
      setPage(res.data.result.page_info.current_page);
      setTotalObjects(res.data.result.page_info.total_objects);
    };

    const failureHandler = (error) => {
      console.error('Failure with hook:', error);
    };

    let formData = {};
    if (search) formData["search"] = search;
    formData["page"] = page;
    formData["start_date"] = filterByDate[0];
    formData["end_date"] = filterByDate[1];
    formData["filter"] = transactionSelectedTab;

    try {
      const response = await httpClient.get($apiUrl.GET_TRANSACTION_LIST, {
        params: formData,
      });
      
      successHandler(response);
    } catch (error) {
      failureHandler(error);
    }
  };

  const handleSearch = () => {
    getTransactionData();
  };

  const handleSearchWithHook = () => {
    getTransactionDataWithHook();
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom align="center">
        Vue.js Style API Call
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }} align="center">
        This shows the EXACT conversion of your Vue.js pattern to React
      </Typography>

      <Grid container spacing={3}>
        {/* Form */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Search & Filters (Vue.js Style)
            </Typography>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Page"
                  type="number"
                  value={page}
                  onChange={(e) => setPage(Number(e.target.value))}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Start Date"
                  value={filterByDate[0]}
                  onChange={(e) => setFilterByDate([e.target.value, filterByDate[1]])}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="End Date"
                  value={filterByDate[1]}
                  onChange={(e) => setFilterByDate([filterByDate[0], e.target.value])}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <TextField
                  fullWidth
                  label="Filter Tab"
                  value={transactionSelectedTab}
                  onChange={(e) => setTransactionSelectedTab(e.target.value)}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Button
                      variant="contained"
                      onClick={handleSearch}
                      disabled={loading}
                      fullWidth
                      sx={{ height: 48 }}
                    >
                      {loading ? <CircularProgress size={20} /> : 'Search'}
                    </Button>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Button
                      variant="outlined"
                      onClick={handleSearchWithHook}
                      fullWidth
                      sx={{ height: 48 }}
                    >
                      Hook Style
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
              Results (Vue.js Style)
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Transaction Tab Item:</strong> {transactionTabItem} | 
                <strong>Total Pages:</strong> {totalPages} | 
                <strong>Current Page:</strong> {page} | 
                <strong>Total Objects:</strong> {totalObjects}
              </Typography>
            </Box>

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
              Code Comparison: Vue.js vs React
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
    this.transaction_tab_item = res.data.result.allcount;
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
                  React Equivalent:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ 
                  backgroundColor: '#f5f5f5', 
                  p: 2, 
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.75rem'
                }}>
{`const getTransactionData = async () => {
  setLoading(true);
  
  const successHandler = (res) => {
    setTransactionData(res.data.result.data);
    setTransactionTabItem(res.data.result.allcount);
    setTotalPages(res.data.result.page_info.total_pages);
    setPage(res.data.result.page_info.current_page);
    setTotalObjects(res.data.result.page_info.total_objects);
    setLoading(false);
  };

  const failureHandler = (error) => {
    console.error('Failure:', error);
    setLoading(false);
  };

  let formData = {};
  if (search) formData["search"] = search;
  formData["page"] = page;
  formData["start_date"] = filterByDate[0];
  formData["end_date"] = filterByDate[1];
  formData["filter"] = transactionSelectedTab;

  try {
    const response = await httpClient.get($apiUrl.GET_TRANSACTION_LIST, {
      params: formData,
    });
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

export default VueStyleApiCall; 