import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const email = params.get('email') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !otp) {
      toast({ title: 'Missing info', description: 'Email or OTP is missing', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const authData = await authService.adminVerify(email, otp);

      // If verification returns tokens, log the user in and go to dashboard
      if (authData?.access_token) {
        login(authData);
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      // Fallback: redirect to login if backend does not return tokens on verify
      toast({ title: 'Email verified', description: 'Please sign in to continue.' });
      navigate('/login', { replace: true });
    } catch (err) {
      toast({
        title: 'Verification failed',
        description: err instanceof Error ? err.message : 'Invalid or expired code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Verify your email</CardTitle>
          <CardDescription>
            {email ? `We sent a verification code to ${email}` : 'We sent a verification code to your email'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify'}
            </Button>
          </form>
          <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>Back to Login</Button>
        </CardContent>
      </Card>
    </div>
  );
} 