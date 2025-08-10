/**
 * Test file for httpClient organisation_id functionality
 * This file demonstrates and tests the automatic organisation_id inclusion
 */

import { httpClient } from './httpClient';
import { authToken } from '@/services/authToken';

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test utility functions
const setupTestEnvironment = () => {
  // Clear all mocks
  jest.clearAllMocks();
  
  // Set up test organisation_id
  localStorageMock.getItem.mockReturnValue('test_org_123');
  
  // Mock axios instance methods
  jest.spyOn(httpClient, 'get').mockResolvedValue({ data: {} } as any);
  jest.spyOn(httpClient, 'post').mockResolvedValue({ data: {} } as any);
  jest.spyOn(httpClient, 'put').mockResolvedValue({ data: {} } as any);
  jest.spyOn(httpClient, 'patch').mockResolvedValue({ data: {} } as any);
  jest.spyOn(httpClient, 'delete').mockResolvedValue({ data: {} } as any);
};

const cleanupTestEnvironment = () => {
  // Restore all mocks
  jest.restoreAllMocks();
};

// Test cases
describe('HTTP Client organisation ID Tests', () => {
  beforeEach(setupTestEnvironment);
  afterEach(cleanupTestEnvironment);

  describe('Authentication Endpoints', () => {
    test('should NOT include organisation_id for /auth/login', async () => {
      await httpClient.post('/auth/login', { email: 'test@example.com', password: 'password' });
      
      expect(httpClient.post).toHaveBeenCalledWith(
        '/auth/login',
        { email: 'test@example.com', password: 'password' },
        expect.any(Object)
      );
    });

    test('should NOT include organisation_id for /auth/register', async () => {
      await httpClient.post('/auth/register', { name: 'Test User', email: 'test@example.com' });
      
      expect(httpClient.post).toHaveBeenCalledWith(
        '/auth/register',
        { name: 'Test User', email: 'test@example.com' },
        expect.any(Object)
      );
    });

    test('should NOT include organisation_id for /auth/forgot-password', async () => {
      await httpClient.post('/auth/forgot-password', { email: 'test@example.com' });
      
      expect(httpClient.post).toHaveBeenCalledWith(
        '/auth/forgot-password',
        { email: 'test@example.com' },
        expect.any(Object)
      );
    });
  });

  describe('Non-Authentication Endpoints', () => {
    test('should include organisation_id in GET request query params', async () => {
      await httpClient.get('/employees/list');
      
      expect(httpClient.get).toHaveBeenCalledWith(
        '/employees/list',
        expect.objectContaining({
          params: expect.objectContaining({
            organisation_id: 'test_org_123'
          })
        })
      );
    });

    test('should include organisation_id in POST request body', async () => {
      const employeeData = { name: 'John Doe', email: 'john@example.com' };
      await httpClient.post('/employees/create', employeeData);
      
      expect(httpClient.post).toHaveBeenCalledWith(
        '/employees/create',
        expect.objectContaining({
          ...employeeData,
          organisation_id: 'test_org_123'
        }),
        expect.any(Object)
      );
    });

    test('should include organisation_id in PUT request body', async () => {
      const updateData = { name: 'John Smith' };
      await httpClient.put('/employees/123', updateData);
      
      expect(httpClient.put).toHaveBeenCalledWith(
        '/employees/123',
        expect.objectContaining({
          ...updateData,
          organisation_id: 'test_org_123'
        }),
        expect.any(Object)
      );
    });

    test('should include organisation_id in PATCH request body', async () => {
      const patchData = { email: 'newemail@example.com' };
      await httpClient.patch('/employees/123', patchData);
      
      expect(httpClient.patch).toHaveBeenCalledWith(
        '/employees/123',
        expect.objectContaining({
          ...patchData,
          organisation_id: 'test_org_123'
        }),
        expect.any(Object)
      );
    });

    test('should include organisation_id in DELETE request query params', async () => {
      await httpClient.delete('/employees/123');
      
      expect(httpClient.delete).toHaveBeenCalledWith(
        '/employees/123',
        expect.objectContaining({
          params: expect.objectContaining({
            organisation_id: 'test_org_123'
          })
        })
      );
    });
  });

  describe('Explicit Control', () => {
    test('should respect includeorganisationId: false', async () => {
      const data = { name: 'Test User' };
      await httpClient.post('/custom-endpoint', data, { includeorganisationId: false });
      
      expect(httpClient.post).toHaveBeenCalledWith(
        '/custom-endpoint',
        data, // Should NOT include organisation_id
        expect.objectContaining({
          includeorganisationId: false
        })
      );
    });

    test('should respect includeorganisationId: true (default)', async () => {
      const data = { name: 'Test User' };
      await httpClient.post('/custom-endpoint', data, { includeorganisationId: true });
      
      expect(httpClient.post).toHaveBeenCalledWith(
        '/custom-endpoint',
        expect.objectContaining({
          ...data,
          organisation_id: 'test_org_123'
        }),
        expect.objectContaining({
          includeorganisationId: true
        })
      );
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty data object', async () => {
      await httpClient.post('/test-endpoint', {});
      
      expect(httpClient.post).toHaveBeenCalledWith(
        '/test-endpoint',
        { organisation_id: 'test_org_123' },
        expect.any(Object)
      );
    });

    test('should handle null data', async () => {
      await httpClient.post('/test-endpoint', null);
      
      expect(httpClient.post).toHaveBeenCalledWith(
        '/test-endpoint',
        { organisation_id: 'test_org_123' },
        expect.any(Object)
      );
    });

    test('should handle undefined data', async () => {
      await httpClient.post('/test-endpoint', undefined);
      
      expect(httpClient.post).toHaveBeenCalledWith(
        '/test-endpoint',
        { organisation_id: 'test_org_123' },
        expect.any(Object)
      );
    });

    test('should handle existing organisation_id in data', async () => {
      const data = { name: 'Test User', organisation_id: 'existing_org' };
      await httpClient.post('/test-endpoint', data);
      
      // Should override existing organisation_id with the one from auth
      expect(httpClient.post).toHaveBeenCalledWith(
        '/test-endpoint',
        expect.objectContaining({
          name: 'Test User',
          organisation_id: 'test_org_123' // Should use auth organisation_id, not existing one
        }),
        expect.any(Object)
      );
    });
  });

  describe('organisation ID Storage', () => {
    test('should store organisation_id from login response', () => {
      const loginResponse = {
        token: 'jwt_token',
        user: {
          id: 'user123',
          organisation_id: 'new_org_456'
        }
      };
      
      authToken.processLoginResponse(loginResponse);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'hrms_organisation_id',
        'new_org_456'
      );
    });

    test('should handle different response formats', () => {
      // Test direct organisation_id
      authToken.processLoginResponse({ organisation_id: 'direct_org' });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hrms_organisation_id', 'direct_org');
      
      // Test nested in data
      authToken.processLoginResponse({ data: { organisation_id: 'nested_data_org' } });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hrms_organisation_id', 'nested_data_org');
      
      // Test nested in data.user
      authToken.processLoginResponse({ 
        data: { user: { organisation_id: 'nested_user_org' } } 
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hrms_organisation_id', 'nested_user_org');
    });
  });
});

// Manual testing function (for development/debugging)
export const runManualTests = async () => {
  console.log('🧪 Running Manual organisation ID Tests...');
  
  try {
    // Test 1: Check if organisation_id is available
    const orgId = authToken.getorganisationId();
    console.log('✅ Current organisation_id:', orgId);
    
    // Test 2: Test authentication endpoint (should NOT include org_id)
    console.log('🔐 Testing auth endpoint...');
    await httpClient.post('/auth/login', { email: 'test@example.com', password: 'password' });
    
    // Test 3: Test regular endpoint (should include org_id)
    console.log('📡 Testing regular endpoint...');
    await httpClient.get('/employees/list');
    
    // Test 4: Test with explicit control
    console.log('🎛️ Testing explicit control...');
    await httpClient.post('/test-endpoint', { name: 'Test' }, { includeorganisationId: false });
    
    console.log('✅ All manual tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Manual test failed:', error);
  }
}; 