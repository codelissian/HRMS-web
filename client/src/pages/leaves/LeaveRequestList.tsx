import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LeaveRequestCard } from '@/components/leaves/LeaveRequestCard';
import { useApiCall } from '@/hooks/useApi';
import { LeaveRequest } from '@shared/schema';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { leaveService } from '@/services/leaveService';

const statusFilters = [
  { label: 'All', value: '', count: 24 },
  { label: 'Pending', value: 'pending', count: 12 },
  { label: 'Approved', value: 'approved', count: 8 },
  { label: 'Rejected', value: 'rejected', count: 4 },
];

export default function LeaveRequestList() {
  const [activeFilter, setActiveFilter] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { execute: approveRequest, loading: approving } = useApiCall();
  const { execute: rejectRequest, loading: rejecting } = useApiCall();

  // Fetch leave requests
  const { 
    data: requestsResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['/leave-requests/list', { status: activeFilter }],
    queryFn: () => leaveService.getLeaveRequests({
      page: 1,
      page_size: 50,
      status: activeFilter,
    }),
  });

  const requests = requestsResponse?.data || [];

  const handleApproveRequest = async (request: LeaveRequest) => {
    const result = await approveRequest('/leave-requests/update', 'PUT', {
      id: request.id,
      status: 'approved',
      approved_at: new Date().toISOString(),
    });
    
    if (result) {
      toast({
        title: 'Request Approved',
        description: 'The leave request has been approved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/leave-requests/list'] });
    }
  };

  const handleRejectRequest = async (request: LeaveRequest) => {
    const result = await rejectRequest('/leave-requests/update', 'PUT', {
      id: request.id,
      status: 'rejected',
      rejected_at: new Date().toISOString(),
    });
    
    if (result) {
      toast({
        title: 'Request Rejected',
        description: 'The leave request has been rejected.',
      });
      queryClient.invalidateQueries({ queryKey: ['/leave-requests/list'] });
    }
  };

  const handleViewRequest = (request: LeaveRequest) => {
    console.log('View request:', request);
    // Implement view logic - could open a modal with full details
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">
          Error loading leave requests: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leave Requests
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage employee leave requests and approvals
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex space-x-4">
        {statusFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? 'default' : 'outline'}
            onClick={() => setActiveFilter(filter.value)}
            className="font-medium"
          >
            {filter.label} ({filter.count})
          </Button>
        ))}
      </div>

      {/* Leave Request Cards */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No leave requests found.
            </p>
          </div>
        ) : (
          requests.map((request: LeaveRequest) => (
            <LeaveRequestCard
              key={request.id}
              request={{
                ...request,
                employee_name: 'Sample Employee', // This would come from joined data
                designation_name: 'Software Engineer', // This would come from joined data
                leave_type_name: 'Annual Leave', // This would come from joined data
              }}
              onApprove={handleApproveRequest}
              onReject={handleRejectRequest}
              onView={handleViewRequest}
              showActions={true}
            />
          ))
        )}
      </div>
    </div>
  );
}
