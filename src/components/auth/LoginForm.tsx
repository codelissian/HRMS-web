import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { authService } from '@/services/authService';
import { DashboardPreview } from './DashboardPreview';
import { Settings2 } from 'lucide-react';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get user type from URL params
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'employee' || type === 'admin') {
      setUserType(type);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const authData = await authService.login({
        email,
        password,
        user_type: (userType || 'admin') as 'admin' | 'employee',
      });

      login(authData);

      toast({
        title: "Success",
        description: "Login successful!",
      });

      const isAdmin = !!authData.admin;
      navigate(isAdmin ? '/admin/dashboard' : '/employee/dashboard', { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col h-full">
        {/* Header */}
        <div className="p-4 lg:p-6 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0B2E5C] flex items-center justify-center">
              <Settings2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">OneHR</span>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-8 overflow-y-auto">
          <div className="w-full max-w-md py-4">
            <div className="mb-6">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                Welcome Back
              </h1>
              <p className="text-sm text-gray-600">
                Enter your email and password to access your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sellostore@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10 rounded-lg border-gray-300 focus:border-[#0B2E5C] focus:ring-[#0B2E5C]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-10 rounded-lg border-gray-300 focus:border-[#0B2E5C] focus:ring-[#0B2E5C] pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer"
                  >
                    Remember Me
                  </Label>
                </div>
                <button
                  type="button"
                  className="text-sm text-[#0B2E5C] hover:underline"
                >
                  Forgot Your Password?
                </button>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Log In
                  </div>
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Don't Have An Account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/register')}
                  className="text-[#0B2E5C] hover:underline font-medium"
                >
                  Register Now.
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
          <span>Copyright © 2025 OneHR Enterprises LTD.</span>
          <button className="hover:underline">Privacy Policy</button>
        </div>
      </div>

      {/* Right Side - Dashboard Preview */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B2E5C] to-[#0D3A6B] h-full overflow-hidden">
        <DashboardPreview />
      </div>
    </div>
  );
}
