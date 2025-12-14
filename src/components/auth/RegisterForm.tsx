import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserPlus, HelpCircle } from 'lucide-react';
import { DashboardPreview } from './DashboardPreview';
import { Settings2 } from 'lucide-react';
import { HelpSupportDialog } from '@/components/common';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  mobile: z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    
    try {
      await authService.adminRegister(data);
      toast({
        title: 'Registration successful!',
        description: 'Please check your email for verification instructions.',
      });
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Register Form */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col h-full">
        {/* Header */}
        <div className="p-4 lg:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0B2E5C] flex items-center justify-center">
                <Settings2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">OneHR</span>
            </div>
            <Button
              variant="ghost"
              onClick={() => setHelpDialogOpen(true)}
              className="h-auto py-1.5 px-3 gap-2"
            >
              <HelpCircle className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700">Help and Support</span>
            </Button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-8 overflow-y-auto">
          <div className="w-full max-w-md py-4">
            <div className="mb-5">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                Create Account
              </h1>
              <p className="text-sm text-gray-600">
                Enter your information to create your admin account.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Enter your full name"
                  {...register('full_name')}
                  className="h-10 rounded-lg border-gray-300 focus:border-[#0B2E5C] focus:ring-[#0B2E5C]"
                />
                {errors.full_name && (
                  <p className="text-xs text-red-500">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="sellostore@company.com"
                  {...register('email')}
                  className="h-10 rounded-lg border-gray-300 focus:border-[#0B2E5C] focus:ring-[#0B2E5C]"
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                  Mobile Number
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter your mobile number (optional)"
                  {...register('mobile')}
                  className="h-10 rounded-lg border-gray-300 focus:border-[#0B2E5C] focus:ring-[#0B2E5C]"
                />
                {errors.mobile && (
                  <p className="text-xs text-red-500">{errors.mobile.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    {...register('password')}
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
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white rounded-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </div>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-xs text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login?type=admin')}
                  className="text-[#0B2E5C] hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex items-center justify-between text-xs text-gray-500 flex-shrink-0">
          <span>onehr by wesolvr</span>
          <button className="hover:underline">Privacy Policy</button>
        </div>
      </div>

      {/* Right Side - Dashboard Preview */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B2E5C] to-[#0D3A6B] h-full overflow-hidden">
        <DashboardPreview />
      </div>

      {/* Help & Support Dialog */}
      <HelpSupportDialog
        open={helpDialogOpen}
        onOpenChange={setHelpDialogOpen}
      />
    </div>
  );
}
