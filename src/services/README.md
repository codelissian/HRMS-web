# HTTP Client System Documentation

This document describes the modern HTTP client system implemented for the React HRMS application, converted from the original Vue.js axios configuration.

## 🏗️ Architecture Overview

The HTTP client system follows a layered architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                        │
├─────────────────────────────────────────────────────────────┤
│                    Custom Hooks                            │
│  (useApi, useApiCall, useApiEffect)                        │
├─────────────────────────────────────────────────────────────┤
│                   API Services                             │
│  (authApi, employeeApi, leaveApi, etc.)                    │
├─────────────────────────────────────────────────────────────┤
│                  HTTP Client                               │
│  (httpClient.js - Axios wrapper)                           │
├─────────────────────────────────────────────────────────────┤
│                Authentication Service                      │
│  (authToken.js - JWT management)                           │
├─────────────────────────────────────────────────────────────┤
│                    Axios                                   │
│  (HTTP client library)                                     │
└─────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
src/
├── services/
│   ├── httpClient.js              # Main HTTP client wrapper
│   ├── authToken.js               # JWT token management
│   ├── api/
│   │   ├── authApi.js             # Authentication API calls
│   │   ├── employeeApi.js         # Employee management API calls
│   │   ├── leaveApi.js            # Leave management API calls
│   │   └── ...                    # Other API modules
│   └── README.md                  # This documentation
├── hooks/
│   └── useApi.js                  # Custom React hooks for API calls
├── config/
│   └── api.js                     # API configuration and endpoints
└── examples/
    └── ApiUsageExample.jsx        # Usage examples
```

## 🚀 Key Features

### ✅ **Modern React Patterns**
- Custom hooks for state management
- Proper error handling and loading states
- Request cancellation support
- Automatic retry logic

### ✅ **Authentication & Security**
- JWT token management
- Automatic token refresh
- Secure token storage
- Role-based access control

### ✅ **Advanced Functionality**
- File upload with progress tracking
- File download handling
- Bulk operations support
- Export functionality

### ✅ **Developer Experience**
- TypeScript-like documentation
- Comprehensive error messages
- Centralized configuration
- Reusable components

## 🔧 Core Components

### 1. HTTP Client (`httpClient.js`)

The main HTTP client wrapper that provides a clean interface for making API calls.

```javascript
import httpClient from '../services/httpClient';

// Basic usage
const response = await httpClient.get('/employees');
const newEmployee = await httpClient.post('/employees', employeeData);
const updatedEmployee = await httpClient.put(`/employees/${id}`, data);
await httpClient.delete(`/employees/${id}`);

// Advanced usage with options
const response = await httpClient.request('post', '/employees', {
  data: employeeData,
  headers: { 'Custom-Header': 'value' },
  timeout: 15000,
  requireAuth: true,
  cancelPrevious: true,
});
```

### 2. Authentication Service (`authToken.js`)

Manages JWT tokens and authentication state.

```javascript
import { authToken } from '../services/authToken';

// Token management
authToken.setToken(jwtToken);
const token = authToken.getToken();
const isAuthenticated = authToken.isAuthenticated();
authToken.removeToken();

// User information
const userInfo = authToken.getUserInfo();
const isExpiringSoon = authToken.isTokenExpiringSoon();
```

### 3. API Services

Domain-specific API modules that encapsulate business logic.

```javascript
import authApi from '../services/api/authApi';
import employeeApi from '../services/api/employeeApi';

// Authentication
const loginResult = await authApi.login({ email, password });
const profile = await authApi.getProfile();

// Employee management
const employees = await employeeApi.getEmployees({ page: 1, limit: 10 });
const employee = await employeeApi.getEmployee(id);
const newEmployee = await employeeApi.createEmployee(employeeData);
```

### 4. Custom Hooks (`useApi.js`)

React hooks for managing API state and operations.

```javascript
import { useApi, useApiCall, useApiEffect } from '../hooks/useApi';

// useApi - General purpose API hook
const { data, loading, error, get, post, cancel } = useApi({
  onSuccess: (data) => console.log('Success:', data),
  onError: (error) => console.error('Error:', error),
});

// useApiCall - Single API call hook
const { data, loading, error, execute } = useApiCall(authApi.getProfile);

// useApiEffect - Auto-executing hook
const { data, loading, error } = useApiEffect(
  () => employeeApi.getEmployees(),
  [dependencies]
);
```

## 📖 Usage Examples

### Basic API Call

```javascript
import { useApi } from '../hooks/useApi';

const EmployeeList = () => {
  const { data: employees, loading, error, get } = useApi();

  useEffect(() => {
    get('/employees');
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div>
      {employees?.map(employee => (
        <EmployeeCard key={employee.id} employee={employee} />
      ))}
    </div>
  );
};
```

### Form Submission with API

```javascript
import { useApiCall } from '../hooks/useApi';
import employeeApi from '../services/api/employeeApi';

const EmployeeForm = () => {
  const { loading, error, execute } = useApiCall(employeeApi.createEmployee);
  const [formData, setFormData] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await execute(formData);
      // Handle success
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Employee'}
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
    </form>
  );
};
```

### File Upload with Progress

```javascript
import { useApi } from '../hooks/useApi';

const FileUpload = () => {
  const { uploadFile } = useApi();
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (file) => {
    try {
      await uploadFile('/upload', file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percentCompleted);
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleFileUpload(e.target.files[0])} />
      {progress > 0 && <LinearProgress variant="determinate" value={progress} />}
    </div>
  );
};
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_API_VERSION=v1
```

### API Configuration

Modify `src/config/api.js` to customize:

- Base URL and version
- Timeout settings
- Retry configuration
- File upload limits
- Endpoint definitions

## 🔒 Security Features

### Authentication Flow

1. **Login**: User credentials → JWT token
2. **Token Storage**: Secure localStorage with encryption
3. **Auto-attachment**: Token automatically added to requests
4. **Token Refresh**: Automatic refresh before expiration
5. **Logout**: Token removal and cleanup

### Error Handling

- **401 Unauthorized**: Automatic redirect to login
- **403 Forbidden**: Access denied handling
- **422 Validation**: Form validation errors
- **500 Server**: Graceful error messages
- **Network Errors**: Offline handling

## 🧪 Testing

### Mock API Responses

```javascript
// Mock API for testing
const mockApi = {
  getEmployees: jest.fn().mockResolvedValue([
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
  ]),
  createEmployee: jest.fn().mockResolvedValue({ id: 3, name: 'New Employee' }),
};

// Test component
const { result } = renderHook(() => useApiCall(mockApi.getEmployees));
await act(async () => {
  await result.current.execute();
});
expect(result.current.data).toHaveLength(2);
```

## 🚀 Migration from Vue.js

### Key Differences

| Vue.js (Original) | React (New) |
|-------------------|-------------|
| `baseAxios(method, url, options)` | `httpClient.request(method, url, options)` |
| Callback-based success/error | Promise-based with hooks |
| Manual state management | Automatic state management |
| Global error handling | Component-level error handling |
| Direct axios usage | Wrapped with additional features |

### Migration Steps

1. **Replace baseAxios calls** with httpClient methods
2. **Convert callbacks** to async/await with hooks
3. **Update error handling** to use React state
4. **Implement loading states** using hook state
5. **Add request cancellation** where needed

## 📚 Best Practices

### ✅ Do's

- Use API services for domain-specific logic
- Implement proper error handling in components
- Use loading states for better UX
- Cancel requests when components unmount
- Validate file uploads before sending
- Use environment variables for configuration

### ❌ Don'ts

- Don't make direct axios calls in components
- Don't store sensitive data in localStorage without encryption
- Don't ignore error states
- Don't make API calls without loading indicators
- Don't forget to handle request cancellation
- Don't hardcode API endpoints

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Check API base URL configuration
2. **Authentication Failures**: Verify token storage and refresh logic
3. **Request Timeouts**: Adjust timeout settings in configuration
4. **File Upload Failures**: Check file size and type validation
5. **State Management Issues**: Ensure proper hook usage

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem('debug', 'true');
```

This will log all API requests and responses to the console.

## 📈 Performance Optimization

### Request Optimization

- Use request cancellation for search inputs
- Implement debouncing for frequent API calls
- Cache responses where appropriate
- Use pagination for large datasets

### Bundle Optimization

- Tree-shake unused API methods
- Lazy load API services
- Use dynamic imports for large modules

## 🤝 Contributing

When adding new API endpoints:

1. Add endpoint to `src/config/api.js`
2. Create API service method in appropriate module
3. Add proper error handling
4. Update documentation
5. Add tests

## 📄 License

This HTTP client system is part of the HRMS project and follows the same license terms. 