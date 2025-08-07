# Login Integration Guide

This guide explains how the login functionality has been integrated with the new HTTP client system using your specified auth endpoint.

## 🔗 **API Endpoint Configuration**

The login integration uses your specified endpoint:
- **Base URL**: `https://hrms-backend-omega.vercel.app/api/v1`
- **Login Endpoint**: `/auth/login`
- **Full URL**: `https://hrms-backend-omega.vercel.app/api/v1/auth/login`

## 🏗️ **Integration Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Login Form    │───▶│   useApiCall     │───▶│   authApi.login │
│   (React)       │    │   (Custom Hook)  │    │   (API Service) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   AuthContext    │    │   httpClient    │
                       │   (State Mgmt)   │    │   (Axios Wrapper)│
                       └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   authToken      │    │   API Backend   │
                       │   (JWT Storage)  │    │   (Your Server) │
                       └──────────────────┘    └─────────────────┘
```

## 📝 **Code Implementation**

### 1. Login Form Component (`src/pages/Login.jsx`)

```javascript
import { useApiCall } from '../hooks/useApi';
import authApi from '../services/api/authApi';

const Login = () => {
  const { execute: loginApi, loading, error, data } = useApiCall(authApi.login, {
    onSuccess: (response) => {
      // Handle successful login
      if (response.token) {
        const result = login(formData.email, formData.password, response);
        if (result.success) {
          navigate('/admin/dashboard');
        }
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // This calls: POST https://hrms-backend-omega.vercel.app/api/v1/auth/login
    await loginApi(formData);
  };
};
```

### 2. Auth API Service (`src/services/api/authApi.js`)

```javascript
import httpClient from '../httpClient';

class AuthApiService {
  async login(credentials) {
    return httpClient.post('/auth/login', credentials);
  }
}
```

### 3. Auth Context (`src/context/AuthContext.jsx`)

```javascript
const login = (email, password, apiResponse = null) => {
  if (apiResponse && apiResponse.token) {
    // Store JWT token
    authToken.setToken(apiResponse.token);
    
    // Extract user info
    const userData = {
      id: apiResponse.user?.id,
      email: apiResponse.user?.email,
      name: apiResponse.user?.name,
      role: apiResponse.user?.role,
    };
    
    setUser(userData);
    return { success: true, user: userData };
  }
  
  // Fallback to local auth for development
  return localLogin(email, password);
};
```

## 🔄 **Request/Response Flow**

### Request
```javascript
// When user submits login form
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Expected Response
```javascript
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "department": "IT"
  }
}
```

## 🛡️ **Security Features**

### 1. Automatic Token Management
- JWT tokens are automatically stored and retrieved
- Tokens are included in all subsequent API requests
- Automatic token validation and expiration checking

### 2. Error Handling
- Global error handling for 401 Unauthorized responses
- Automatic redirect to login page on token expiration
- User-friendly error messages

### 3. Request Interceptors
```javascript
// Automatically adds Authorization header
axiosInstance.interceptors.request.use((config) => {
  const token = authToken.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## 🧪 **Testing the Integration**

### 1. Using the Test Component
Navigate to the test component to try both API and local login:

```javascript
// Test with real API credentials
const testCredentials = {
  email: "your-actual-email@example.com",
  password: "your-actual-password"
};

// Or use local test credentials
const localCredentials = {
  email: "admin@example.com",
  password: "admin123"
};
```

### 2. Console Logging
Check the browser console for detailed logs:
- API request/response details
- Token storage confirmation
- User authentication status

### 3. Network Tab
Monitor the Network tab in DevTools to see:
- Actual HTTP requests to your backend
- Request headers (including Authorization)
- Response data and status codes

## 🔧 **Configuration Options**

### Environment Variables
```env
# API Configuration
VITE_API_BASE_URL=https://hrms-backend-omega.vercel.app/api/v1

# Debug Mode
VITE_DEBUG_MODE=true
VITE_LOG_API_CALLS=true
```

### API Configuration (`src/config/api.js`)
```javascript
const API_CONFIG = {
  BASE_URL: 'https://hrms-backend-omega.vercel.app/api/v1',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile',
    }
  }
};
```

## 🚀 **Migration from Vue.js**

### Vue.js Pattern (Original)
```javascript
return this.$axios("post", this.$apiUrl.LOGIN, {
  data: formData,
  onSuccess: successHandler,
  onFailure: failureHandler,
  isTokenRequired: false,
});
```

### React Pattern (New)
```javascript
const { execute: loginApi, loading, error } = useApiCall(authApi.login, {
  onSuccess: (response) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  }
});

await loginApi(formData);
```

## 📋 **Key Benefits**

1. **Automatic Loading States**: No manual `loading = true/false`
2. **Built-in Error Handling**: Global error management
3. **JWT Token Management**: Automatic token storage and usage
4. **Type Safety**: Better TypeScript support
5. **Request Cancellation**: Prevents race conditions
6. **Centralized Configuration**: All API settings in one place
7. **Modern React Patterns**: Uses hooks and async/await

## 🔍 **Troubleshooting**

### Common Issues

1. **CORS Errors**: Ensure your backend allows requests from your frontend domain
2. **401 Unauthorized**: Check if credentials are correct and API endpoint is working
3. **Network Errors**: Verify the API base URL is accessible
4. **Token Issues**: Check if JWT token format matches backend expectations

### Debug Steps

1. Enable debug mode in environment variables
2. Check browser console for detailed logs
3. Monitor Network tab for actual HTTP requests
4. Verify API endpoint is responding correctly
5. Test with Postman or similar tool first

## 📚 **Next Steps**

1. **Test with Real Backend**: Replace test credentials with actual API credentials
2. **Add More Auth Endpoints**: Implement register, logout, profile update
3. **Add Refresh Token Logic**: Implement automatic token refresh
4. **Add Remember Me**: Implement persistent login functionality
5. **Add Password Reset**: Implement forgot password flow 