import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextValue, AuthUser, AuthResponse } from '@/types/auth';
import { authToken } from '@/services/authToken';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize from token or local user_data fallback
    const init = async () => {
      try {
        if (authToken.isAuthenticated()) {
          const tokenUser = authToken.getUserInfo();
          if (tokenUser) {
            const stored = localStorage.getItem('user_data');
            if (stored) {
              const parsedUser = JSON.parse(stored);
              setUser(parsedUser);
            }
          }
        } else {
          const stored = localStorage.getItem('user_data');
          if (stored) setUser(JSON.parse(stored));
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const login = (data: AuthResponse) => {
    const { access_token, refresh_token, admin, employee, organisation } = data;

    authToken.setToken(access_token);
    authToken.setRefreshToken(refresh_token);

    const userData: AuthUser = {
      id: admin?.id || employee?.id || '',
      name: (admin as any)?.full_name || (employee as any)?.name || '',
      email: (admin as any)?.email || (employee as any)?.email || '',
      role: admin ? 'admin' : 'employee',
      organisation_id: organisation.id,
    };

    localStorage.setItem('user_data', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    authToken.clearAuth();
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
