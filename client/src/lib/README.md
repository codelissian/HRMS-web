# HTTP Client with Automatic organisation ID

This HTTP client automatically includes the `organisation_id` parameter for all non-authentication API requests, ensuring proper data isolation between organisations in a multi-tenant HRMS system.

## Features

- **Automatic organisation ID**: Automatically adds `organisation_id` to all non-auth requests
- **Smart Endpoint Detection**: Identifies authentication endpoints to exclude them from organisation_id inclusion
- **Flexible Control**: Allows explicit control over organisation_id inclusion per request
- **Method-Aware**: Handles different HTTP methods appropriately:
  - GET requests: Adds to query parameters
  - POST/PUT/PATCH requests: Adds to request body

## How It Works

### 1. organisation ID Storage
The `organisation_id` is automatically extracted from login responses and stored in localStorage:

```typescript
import { authToken } from '@/services/authToken';

// The organisation_id is automatically extracted and stored during login
// You can also manually set it if needed:
authToken.setorganisationId('org123');
```

### 2. Automatic Inclusion
For all non-authentication requests, the `organisation_id` is automatically added:

```typescript
import { httpClient } from '@/lib/httpClient';

// GET request - organisation_id added to query params
await httpClient.get('/employees/list');
// Result: GET /employees/list?organisation_id=org123

// POST request - organisation_id added to request body
await httpClient.post('/employees/create', { name: 'John Doe' });
// Result: POST /employees/create with body: { name: 'John Doe', organisation_id: 'org123' }
```

### 3. Authentication Endpoints Excluded
The following endpoints automatically exclude `organisation_id`:
- `/auth/*` - All authentication endpoints
- `/login` - Login endpoints
- `/register` - Registration endpoints
- `/forgot-password` - Password reset
- `/reset-password` - Password reset
- `/verify` - Email verification
- `/refresh` - Token refresh
- `/logout` - Logout

## Configuration Options

### RequestOptions.includeorganisationId

You can explicitly control whether `organisation_id` should be included:

```typescript
// Disable organisation_id for this specific request
await httpClient.post('/some-endpoint', data, {
  includeorganisationId: false
});

// Enable organisation_id (default behavior)
await httpClient.post('/some-endpoint', data, {
  includeorganisationId: true
});
```

## Examples

### Basic Usage
```typescript
// All these automatically include organisation_id
await httpClient.get('/employees/list');
await httpClient.post('/employees/create', employeeData);
await httpClient.put('/employees/123', updatedData);
await httpClient.patch('/employees/123', partialData);
await httpClient.delete('/employees/123');
```

### Custom Control
```typescript
// Disable organisation_id for specific requests
await httpClient.get('/public/settings', {
  includeorganisationId: false
});

// Custom organisation_id handling
const customData = { ...data, custom_org_field: 'value' };
await httpClient.post('/custom-endpoint', customData, {
  includeorganisationId: false // Handle organisation_id manually
});
```

### File Uploads
```typescript
// File uploads automatically include organisation_id
await httpClient.uploadFile('/files/upload', file, onProgress);
```

## Authentication Response Format

The system expects the login response to contain `organisation_id` in one of these locations:

```typescript
// Direct organisation_id
{
  token: "jwt_token",
  organisation_id: "org123"
}

// Nested in user object
{
  token: "jwt_token",
  user: {
    id: "user123",
    organisation_id: "org123"
  }
}

// Nested in data object
{
  data: {
    token: "jwt_token",
    user: {
      id: "user123",
      organisation_id: "org123"
    }
  }
}
```

## Error Handling

If `organisation_id` is not available:
- The request proceeds without it
- No error is thrown
- The system logs a warning (in development)

## Best Practices

1. **Always use the httpClient**: Don't make direct axios calls for organisation-specific data
2. **Handle organisation_id manually when needed**: Use `includeorganisationId: false` for custom logic
3. **Test authentication endpoints**: Ensure they don't include organisation_id
4. **Monitor localStorage**: Check that organisation_id is properly stored after login

## Troubleshooting

### organisation ID Not Being Added
1. Check if user is authenticated
2. Verify organisation_id is stored in localStorage
3. Ensure the endpoint is not an authentication endpoint
4. Check if `includeorganisationId: false` was set

### Authentication Endpoints Including organisation ID
1. Verify the endpoint URL matches the auth patterns
2. Check if the endpoint is being called through the correct method
3. Ensure the endpoint is not being modified elsewhere

### TypeScript Errors
1. The `includeorganisationId` option is properly typed in `RequestOptions`
2. All utility functions are properly typed
3. The interceptor uses proper type assertions where needed 