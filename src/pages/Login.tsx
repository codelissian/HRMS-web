import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Login() {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user && !loading) {
      const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
      navigate(dashboardPath, { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  // Show loading while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // If already authenticated, don't render login form (will redirect)
  if (isAuthenticated && user) {
    return null;
  }

  // Show login form for unauthenticated users
  return <LoginForm />;
}
