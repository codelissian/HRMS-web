import { httpClient } from '@/lib/httpClient';
import { authToken } from '@/services/authToken';

/**
 * Example demonstrating the automatic organisation_id functionality
 */

// Example 1: Basic usage - organisation_id automatically added
export const basicUsageExample = async () => {
  try {
    // GET request - organisation_id automatically added to query params
    const employees = await httpClient.get('/employees/list');
    console.log('Employees fetched with organisation_id in query params');
    
    // POST request - organisation_id automatically added to request body
    const newEmployee = await httpClient.post('/employees/create', {
      name: 'John Doe',
      email: 'john@example.com',
      position: 'Developer'
    });
    console.log('Employee created with organisation_id in request body');
    
    // PUT request - organisation_id automatically added to request body
    const updatedEmployee = await httpClient.put('/employees/123', {
      name: 'John Smith',
      email: 'johnsmith@example.com'
    });
    console.log('Employee updated with organisation_id in request body');
    
    // PATCH request - organisation_id automatically added to request body
    const patchedEmployee = await httpClient.patch('/employees/123', {
      email: 'newemail@example.com'
    });
    console.log('Employee patched with organisation_id in request body');
    
    // DELETE request - organisation_id automatically added to query params
    await httpClient.delete('/employees/123');
    console.log('Employee deleted with organisation_id in query params');
    
  } catch (error) {
    console.error('Error in basic usage example:', error);
  }
};

// Example 2: Disabling organisation_id for specific requests
export const disableorganisationIdExample = async () => {
  try {
    // This request will NOT include organisation_id
    const publicSettings = await httpClient.get('/public/settings', {
      includeOrganisationId: false
    });
    console.log('Public settings fetched without organisation_id');
    
    // Custom data handling - organisation_id not automatically added
    const customData = await httpClient.post('/custom-endpoint', {
      custom_field: 'value',
      organisation_id: 'custom_org_id' // Handle manually
    }, {
      includeOrganisationId: false
    });
    console.log('Custom data sent with manual organisation_id handling');
    
  } catch (error) {
    console.error('Error in disable organisation_id example:', error);
  }
};

// Example 3: File upload with automatic organisation_id
export const fileUploadExample = async (file: File) => {
  try {
    // File upload automatically includes organisation_id
    const uploadResult = await httpClient.uploadFile(
      '/files/upload',
      file,
      (progress) => console.log('Upload progress:', progress)
    );
    console.log('File uploaded with organisation_id automatically included');
    return uploadResult;
    
  } catch (error) {
    console.error('Error in file upload example:', error);
  }
};

// Example 4: Manual organisation_id handling
export const manualorganisationIdExample = async () => {
  try {
    // Get current organisation_id
    const currentOrgId = authToken.getorganisationId();
    console.log('Current organisation_id:', currentOrgId);
    
    // Set organisation_id manually (useful for testing or admin operations)
    authToken.setorganisationId('test_org_123');
    
    // Make request with new organisation_id
    const testData = await httpClient.post('/test-endpoint', {
      test_field: 'value'
    });
    console.log('Test data sent with manually set organisation_id');
    
    // Restore original organisation_id
    if (currentOrgId) {
      authToken.setorganisationId(currentOrgId);
    }
    
  } catch (error) {
    console.error('Error in manual organisation_id example:', error);
  }
};

// Example 5: Authentication endpoints (organisation_id NOT included)
export const authEndpointsExample = async () => {
  try {
    // These endpoints will NOT include organisation_id automatically
    
    // Login
    const loginResponse = await httpClient.post('/auth/login', {
      email: 'user@example.com',
      password: 'password123'
    }, {
      includeOrganisationId: false // No organisation_id for login
    });
    console.log('Login successful - organisation_id NOT included in request');
    
    // Register
    const registerResponse = await httpClient.post('/auth/register', {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123'
    }, {
      includeOrganisationId: false
    });
    console.log('Registration successful - organisation_id NOT included in request');
    
    // Forgot password
    const forgotPasswordResponse = await httpClient.post('/auth/forgot-password', {
      email: 'user@example.com'
    }, {
      includeOrganisationId: false
    });
    console.log('Forgot password request sent - organisation_id NOT included');
    
  } catch (error) {
    console.error('Error in auth endpoints example:', error);
  }
};

// Example 6: Error handling when organisation_id is not available
export const noorganisationIdExample = async () => {
  try {
    // Clear organisation_id to simulate scenario where it's not available
    const originalOrgId = authToken.getorganisationId();
    authToken.removeorganisationId();
    
    // Request will proceed without organisation_id (no error thrown)
    const result = await httpClient.get('/employees/list');
    console.log('Request completed without organisation_id');
    
    // Restore organisation_id
    if (originalOrgId) {
      authToken.setorganisationId(originalOrgId);
    }
    
  } catch (error) {
    console.error('Error in no organisation_id example:', error);
  }
};

// Example 7: Batch operations with consistent organisation_id
export const batchOperationsExample = async () => {
  try {
    const employees = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
      { name: 'Charlie', email: 'charlie@example.com' }
    ];
    
    // All requests automatically include the same organisation_id
    const promises = employees.map(employee => 
      httpClient.post('/employees/create', employee)
    );
    
    const results = await Promise.all(promises);
    console.log('Batch employee creation completed with consistent organisation_id');
    
  } catch (error) {
    console.error('Error in batch operations example:', error);
  }
};

// Example 8: Conditional organisation_id inclusion
export const conditionalorganisationIdExample = async (includeOrgId: boolean) => {
  try {
    const data = { name: 'Conditional User', email: 'conditional@example.com' };
    
    const result = await httpClient.post('/conditional-endpoint', data, {
      includeOrganisationId: includeOrgId
    });
    
    if (includeOrgId) {
      console.log('Request sent with organisation_id automatically included');
    } else {
      console.log('Request sent without automatic organisation_id inclusion');
    }
    
    return result;
    
  } catch (error) {
    console.error('Error in conditional organisation_id example:', error);
  }
}; 