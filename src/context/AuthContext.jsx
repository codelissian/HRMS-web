import React, { createContext, useContext, useState, useEffect } from 'react';
import { authToken } from '../services/authToken';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user session and valid token
    const initializeAuth = async () => {
      try {
        if (authToken.isAuthenticated()) {
          const userInfo = authToken.getUserInfo();
          if (userInfo) {
            setUser(userInfo);
          } else {
            // Token exists but no user info, clear it
            authToken.clearAuth();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authToken.clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (email, password, apiResponse = null) => {
    // If API response is provided, use it (for real API integration)
    if (apiResponse && apiResponse.token) {
      try {
        // Store the token
        authToken.setToken(apiResponse.token);
        
        // Store refresh token if provided
        if (apiResponse.refreshToken) {
          authToken.setRefreshToken(apiResponse.refreshToken);
        }

        // Extract user info from response
        const userData = {
          id: apiResponse.user?.id || apiResponse.userId,
          email: apiResponse.user?.email || email,
          name: apiResponse.user?.name || apiResponse.user?.fullName,
          role: apiResponse.user?.role || 'employee',
          ...apiResponse.user
        };

        setUser(userData);
        localStorage.setItem('hrms_user', JSON.stringify(userData));
        
        return { success: true, user: userData };
      } catch (error) {
        console.error('Error processing login response:', error);
        return { success: false, message: 'Error processing login response' };
      }
    }

    // Fallback to local authentication (for development/testing)
    const users = JSON.parse(localStorage.getItem('hrms_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      const userData = { ...user };
      delete userData.password; // Don't store password in session
      setUser(userData);
      localStorage.setItem('hrms_user', JSON.stringify(userData));
      
      // Create a mock token for local development
      const mockToken = btoa(JSON.stringify({ userId: userData.id, email: userData.email }));
      authToken.setToken(mockToken);
      
      return { success: true, user: userData };
    }
    
    return { success: false, message: 'Invalid credentials' };
  };

  const register = (userData) => {
    const users = JSON.parse(localStorage.getItem('hrms_users') || '[]');
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      return { success: false, message: 'User already exists' };
    }
    
    const newUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem('hrms_users', JSON.stringify(users));
    
    return { success: true, user: newUser };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hrms_user');
    authToken.clearAuth();
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isEmployee = () => {
    return user?.role === 'employee';
  };

  const isAuthenticated = () => {
    return !!user && authToken.isAuthenticated();
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAdmin,
    isEmployee,
    isAuthenticated,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 