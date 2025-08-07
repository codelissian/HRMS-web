# Vue.js vs React API Call Patterns

This document shows the conversion from your Vue.js `baseAxios` pattern to the new React HTTP client system.

## Vue.js Pattern (Original)

```javascript
// Your Vue.js baseAxios call
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
```

## React Equivalent (New System)

### Method 1: Using useApiCall Hook (Recommended)

```javascript
import React, { useState } from 'react';
import { useApiCall } from '../hooks/useApi';
import employeeApi from '../services/api/employeeApi';

const TransactionList = () => {
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

  // This replaces your Vue.js axios call
  const { 
    execute: fetchTransactions, 
    loading, 
    error, 
    data 
  } = useApiCall(employeeApi.getEmployees, {
    onSuccess: (response) => {
      // This is equivalent to your successHandler
      setTransactionData(response.data || []);
      setPagination({
        current_page: response.page_info?.current_page || 1,
        total_pages: response.page_info?.total_pages || 0,
        total_objects: response.page_info?.total_objects || 0,
        allcount: response.allcount || 0
      });
    },
    onError: (error) => {
      // This is equivalent to your failureHandler
      console.error('Failed to fetch transactions:', error);
    }
  });

  const handleSearch = () => {
    // Prepare params similar to your Vue.js formData
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

  return (
    <div>
      {/* Your UI components */}
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Loading...' : 'Search'}
      </button>
      
      {error && <div>Error: {error.message}</div>}
      
      {transactionData.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
};
```

### Method 2: Direct API Call (Simple Cases)

```javascript
import React, { useState } from 'react';
import authApi from '../services/api/authApi';

const LoginComponent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login(credentials);
      console.log('Login successful:', response);
      // Handle successful login
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleLogin({ email: 'test@example.com', password: 'password' })}>
        Login
      </button>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};
```

### Method 3: Automatic Loading with useApiEffect

```javascript
import React from 'react';
import { useApiEffect } from '../hooks/useApi';
import employeeApi from '../services/api/employeeApi';

const EmployeeList = () => {
  // Automatically loads data when component mounts
  const { 
    data, 
    loading, 
    error 
  } = useApiEffect(
    () => employeeApi.getEmployees({ page: 1, limit: 10 }),
    [], // Empty dependency array = run once on mount
    {
      onSuccess: (response) => {
        console.log('Employees loaded:', response);
      }
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data?.data?.map(employee => (
        <div key={employee.id}>{employee.name}</div>
      ))}
    </div>
  );
};
```

## Key Differences

| Aspect | Vue.js (Original) | React (New) |
|--------|------------------|-------------|
| **API Call Pattern** | `this.$axios(method, url, options)` | `useApiCall(apiService.method, options)` |
| **Success Handler** | `onSuccess: successHandler` | `onSuccess: (response) => { ... }` |
| **Error Handler** | `onFailure: failureHandler` | `onError: (error) => { ... }` |
| **Loading State** | Manual `this.loading = true/false` | Automatic via `useApiCall` hook |
| **Token Handling** | `isTokenRequired: true` | Automatic via interceptors |
| **State Management** | `this.transaction_data = ...` | `useState` hooks |
| **Base URL** | `this.$apiUrl.GET_TRANSACTION_LIST` | `https://hrms-backend-omega.vercel.app/api/v1` |

## Benefits of the New React System

1. **Automatic Loading States**: No need to manually manage `loading = true/false`
2. **Built-in Error Handling**: Global error handling with automatic 401 redirects
3. **Request Cancellation**: Automatic cleanup when components unmount
4. **Type Safety**: Better TypeScript support
5. **Reusable Hooks**: `useApiCall`, `useApiEffect` for different scenarios
6. **Centralized Configuration**: All API settings in one place
7. **Modern Async/Await**: Cleaner than callback-based approach
8. **Automatic Token Management**: No need to manually add tokens to requests

## Migration Steps

1. Replace `this.$axios` calls with `useApiCall` hook
2. Convert success/error callbacks to `onSuccess`/`onError` options
3. Replace manual loading state with hook-provided `loading`
4. Use `useState` instead of `this.data` properties
5. Update API endpoints to use the new base URL
6. Remove manual token handling (now automatic) 