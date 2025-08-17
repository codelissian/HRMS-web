import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, ArrowLeft, Shield, Users } from 'lucide-react';
import { authService } from '@/services/authService';

export function LoginForm() {
  const [loginMethod, setLoginMethod] = useState('email');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    
    if (!emailOrPhone || !password) {
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
        email: loginMethod === 'email' ? emailOrPhone : undefined,
        mobile: loginMethod === 'phone' ? emailOrPhone : undefined,
        password,
        user_type: (userType || 'employee') as 'admin' | 'employee',
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

  const getUserTypeInfo = () => {
    if (userType === 'admin') {
      return {
        icon: Shield,
        title: 'Admin Login',
        description: 'Access administrative dashboard',
        color: 'purple'
      };
    }
    return {
      icon: Users,
      title: 'Employee Login', 
      description: 'Access your personal dashboard',
      color: 'blue'
    };
  };

  const typeInfo = getUserTypeInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className={`w-10 h-10 rounded-lg bg-${typeInfo.color}-500 flex items-center justify-center`}>
              <typeInfo.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{typeInfo.title}</CardTitle>
              <CardDescription className="text-sm">{typeInfo.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loginMethod">Login Method <span className="text-red-500">*</span></Label>
              <Select value={loginMethod} onValueChange={setLoginMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select login method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="emailOrPhone">
                {loginMethod === 'email' ? 'Email Address' : 'Phone Number'} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="emailOrPhone"
                type={loginMethod === 'email' ? 'email' : 'tel'}
                placeholder={loginMethod === 'email' ? 'Enter your email address' : 'Enter your phone number'}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="focus:ring-2 focus:ring-blue-500 pr-10"
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
            
            <Button 
              type="submit" 
              className={`w-full bg-${typeInfo.color}-500 hover:bg-${typeInfo.color}-600`} 
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
                  Sign In
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                Sign up
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
