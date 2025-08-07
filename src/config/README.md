# Configuration Guide

## Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=https://hrms-backend-omega.vercel.app/api/v1

# Development Settings
VITE_DEBUG_MODE=true
VITE_LOG_API_CALLS=true

# Feature Flags
VITE_ENABLE_MOCK_API=false
VITE_ENABLE_API_CACHE=true
```

## API Base URL

The system is configured to use your specified API base URL:
- **Production**: `https://hrms-backend-omega.vercel.app/api/v1`
- **Development**: Can be overridden via `VITE_API_BASE_URL` environment variable

## Available Endpoints

Based on your API structure, the following endpoints are configured:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile

### Employees
- `GET /employees` - List employees (with pagination, search, filters)
- `GET /employees/:id` - Get employee details
- `POST /employees` - Create new employee
- `PUT /employees/:id` - Update employee
- `DELETE /employees/:id` - Delete employee

### Organization
- `GET /organization/branches` - List branches
- `POST /organization/branches` - Create branch
- `PUT /organization/branches/:id` - Update branch

### Leaves
- `GET /leaves` - List leaves
- `POST /leaves` - Create leave request
- `PUT /leaves/:id/approve` - Approve leave
- `PUT /leaves/:id/reject` - Reject leave

### Payroll
- `GET /payroll` - List payroll records
- `POST /payroll/generate` - Generate payroll
- `GET /payroll/my-salary` - Get employee salary

## Usage Examples

### 1. Login API Call
```javascript
import authApi from '../services/api/authApi';

// Using the hook
const { execute: login, loading, error } = useApiCall(authApi.login);

// Direct call
const response = await authApi.login({
  email: 'user@example.com',
  password: 'password'
});
```

### 2. Employee List with Search
```javascript
import employeeApi from '../services/api/employeeApi';

const { execute: fetchEmployees, loading, data } = useApiCall(employeeApi.getEmployees);

// Search with filters
fetchEmployees({
  page: 1,
  search: 'john',
  department: 'IT',
  status: 'active'
});
```

### 3. File Upload
```javascript
const handleFileUpload = async (file) => {
  const response = await employeeApi.uploadPhoto(employeeId, file, (progress) => {
    console.log(`Upload progress: ${progress}%`);
  });
};
```

## Error Handling

The system automatically handles common errors:
- **401 Unauthorized**: Redirects to login page
- **403 Forbidden**: Shows access denied message
- **404 Not Found**: Shows resource not found message
- **500 Server Error**: Shows generic error message

## Debug Mode

Enable debug mode to see detailed API logs:
```env
VITE_DEBUG_MODE=true
VITE_LOG_API_CALLS=true
```

This will log:
- Request details (URL, method, headers, data)
- Response details (status, data, timing)
- Error details (status, message, stack trace) 