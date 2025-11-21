import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmationDialog } from '@/components/common';
import { PayrollCycleService } from '@/services/payrollCycleService';
import { PayrollCycleWithRelations } from '@/types/payrollCycle';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Trash2, Calendar, Clock, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export default function PayrollCycleDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch payroll cycle details with organisation included
  const { 
    data: cycleResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['payroll-cycle', 'detail', id],
    queryFn: () => PayrollCycleService.getPayrollCycle(id!, { organisation: true }),
    enabled: !!id,
  });

  const payrollCycle = cycleResponse as PayrollCycleWithRelations | undefined;

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (cycleId: string) => PayrollCycleService.deletePayrollCycle(cycleId),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Payroll cycle deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['payroll-cycles'] });
      navigate('/admin/payroll-cycle');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete payroll cycle',
        variant: 'destructive',
      });
    },
  });

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
              View and manage payroll cycle information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(payrollCycle.status)}
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/payroll-cycle/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
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

        {/* Organisation Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organisation Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {payrollCycle.organisation ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Organisation Name
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {payrollCycle.organisation.name}
                  </p>
                </div>
                {payrollCycle.organisation.code && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Organisation Code
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {payrollCycle.organisation.code}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Organisation ID
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1 font-mono text-xs">
                    {payrollCycle.organisation.id}
                  </p>
                </div>
              </>
            ) : (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Organisation ID
                </label>
                <p className="text-sm text-gray-900 dark:text-white mt-1 font-mono text-xs">
                  {payrollCycle.organisation_id}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created At
                </label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {formatDateTime(payrollCycle.created_at)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Modified At
                </label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {formatDateTime(payrollCycle.modified_at)}
                </p>
              </div>
              {payrollCycle.created_by && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created By
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {payrollCycle.created_by}
                  </p>
                </div>
              )}
              {payrollCycle.modified_by && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Modified By
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {payrollCycle.modified_by}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Payroll Cycle"
        description={`Are you sure you want to delete the payroll cycle "${payrollCycle.name}"? This action cannot be undone and will permanently remove the payroll cycle from the system.`}
        type="delete"
        confirmText="Delete Payroll Cycle"
        onConfirm={() => {
          if (id) {
            deleteMutation.mutate(id);
          }
        }}
        loading={deleteMutation.isPending}
        itemName={payrollCycle.name}
      />
    </div>
  );
}

