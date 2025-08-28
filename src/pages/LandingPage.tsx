import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, BarChart3, Shield, Clock, FileText, Star, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();

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

  // If already authenticated, don't render landing page (will redirect)
  if (isAuthenticated && user) {
    return null;
  }
  
  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Comprehensive employee profiles, onboarding, and organisational structure management."
    },
    {
      icon: Calendar,
      title: "Leave Management", 
      description: "Streamlined leave requests, approvals, and balance tracking with automated workflows."
    },
    {
      icon: Clock,
      title: "Attendance Tracking",
      description: "Real-time attendance monitoring with flexible work schedules and overtime calculation."
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Detailed insights into workforce metrics, performance trends, and operational efficiency."
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Secure access control with customizable permissions for different organisational roles."
    },
    {
      icon: FileText,
      title: "Document Management",
      description: "Centralized storage for employee documents, contracts, and organisational policies."
    }
  ];

  const stats = [
    { label: "Companies Trust Us", value: "500+" },
    { label: "Employees Managed", value: "50K+" },
    { label: "Countries Supported", value: "25+" },
    { label: "Uptime Guarantee", value: "99.9%" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Side - App Information */}
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-4">
                <Star className="w-3 h-3 mr-1" />
                Next-Generation HRMS
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                OneHR
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
                Complete Human Resource Management System
              </p>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                Streamline your HR operations with our comprehensive platform designed for modern organisations. 
                Manage employees, track attendance, process leave requests, and gain valuable insights - all in one place.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Key Features</h2>
              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">{feature.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Login Options */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Welcome Back</h2>
                <p className="text-gray-600 dark:text-gray-400">Choose your login type to continue</p>
              </div>

              <div className="space-y-4">
                {/* Employee Login */}
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Employee Login</CardTitle>
                          <CardDescription>Access your personal dashboard</CardDescription>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate('/login?type=employee')}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      Continue as Employee
                    </Button>
                  </CardContent>
                </Card>

                {/* Admin Login */}
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Admin Login</CardTitle>
                          <CardDescription>Manage your organisation</CardDescription>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => navigate('/login?type=admin')}
                      className="w-full bg-purple-500 hover:bg-purple-600"
                      variant="default"
                    >
                      Continue as Admin
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New to OneHR?{' '}
                  <button 
                    onClick={() => navigate('/register')}
                    className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Create an account
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}