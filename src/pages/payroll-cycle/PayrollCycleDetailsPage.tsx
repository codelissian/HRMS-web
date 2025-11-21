import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { PayrollCycleService } from '@/services/payrollCycleService';
import { PayrollCycleWithRelations } from '@/types/payrollCycle';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function PayrollCycleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch payroll cycle details
  const { 
    data: cycleResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['payroll-cycle', 'detail', id],
    queryFn: () => PayrollCycleService.getPayrollCycle(id!),
    enabled: !!id,
  });

  const payrollCycle = cycleResponse as PayrollCycleWithRelations | undefined;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400', label: 'Draft' },
      ACTIVE: { variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Active' },
      PAID: { variant: 'default' as const, className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Paid' },
      CANCELLED: { variant: 'destructive' as const, className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Cancelled' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

    return (
      <Badge variant={config.variant} className={`inline-flex px-2 py-1 ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const getMonthName = (month: number) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1] || `Month ${month}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/payroll-cycle')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Payroll Cycle Details</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">
                {error instanceof Error ? error.message : 'Failed to load payroll cycle details'}
              </p>
              <Button onClick={() => navigate('/admin/payroll-cycle')}>
                Back to Payroll Cycles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!payrollCycle) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/payroll-cycle')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Payroll Cycle Details</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Payroll cycle not found
              </p>
              <Button onClick={() => navigate('/admin/payroll-cycle')}>
                Back to Payroll Cycles
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/payroll-cycle')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Payroll Cycle Details
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              View payroll cycle information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(payrollCycle.status)}
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Cycle Name
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {payrollCycle.name}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Pay Period
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {formatDate(payrollCycle.pay_period_start)} - {formatDate(payrollCycle.pay_period_end)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Salary Period
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {getMonthName(payrollCycle.salary_month)} {payrollCycle.salary_year}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Working Days
              </label>
              <p className="text-sm text-gray-900 dark:text-white mt-1">
                {payrollCycle.working_days} days
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </label>
              <div className="mt-1">
                {getStatusBadge(payrollCycle.status)}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Active
              </label>
              <div className="mt-1">
                <Badge 
                  variant={payrollCycle.active_flag ? 'default' : 'secondary'}
                  className={payrollCycle.active_flag 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                  }
                >
                  {payrollCycle.active_flag ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amount Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Amount
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Amount
              </label>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {payrollCycle.amount 
                  ? new Intl.NumberFormat('en-IN', { 
                      style: 'currency', 
                      currency: 'INR',
                      maximumFractionDigits: 2
                    }).format(payrollCycle.amount)
                  : '-'}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}

