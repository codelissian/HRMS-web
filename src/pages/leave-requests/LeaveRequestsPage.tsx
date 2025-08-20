import React, { useState, useEffect } from 'react';
import { useDepartments } from '@/hooks/useDepartments';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { leaveService } from '@/services/leaveService';
import { 
  CalendarDays, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search,
  Filter,
  Download,
  Eye
} from 'lucide-react';



// Default statistics structure
const defaultStatistics = {
  total_requests: 0,
  pending_requests: 0,
  approved_requests: 0,
  rejected_requests: 0,
  cancelled_requests: 0,
  total_days_requested: 0,
  average_processing_time: 0,
  leave_type_distribution: {},
  department_distribution: {}
};

export default function LeaveRequestsPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [statistics, setStatistics] = useState(defaultStatistics);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  
  // Confirmation dialog states
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string>('');
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string>('');
  
  // View dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<any>(null);
  const [isLoadingLeaveDetails, setIsLoadingLeaveDetails] = useState(false);
  
  const { departments, isLoading, error } = useDepartments();

  // Fetch statistics based on selected department
  const fetchStatistics = async (departmentId: string) => {
    setIsLoadingStats(true);
    try {
      const requestBody: { department_id?: string } = {};
      
      // Only pass department_id if a specific department is selected
      if (departmentId !== 'all') {
        requestBody.department_id = departmentId;
      }
      
      const response = await leaveService.getLeaveStatistics(requestBody);
      
      if (response.status && response.data) {
        // Transform the API response to match expected format
        const apiData = response.data as any;
        const transformedStats = {
          total_requests: (apiData.PENDING || 0) + (apiData.APPROVED || 0) + (apiData.REJECTED || 0) + (apiData.CANCELLED || 0) + (apiData.PARTIALLY_APPROVED || 0),
          pending_requests: apiData.PENDING || 0,
          approved_requests: apiData.APPROVED || 0,
          rejected_requests: apiData.REJECTED || 0,
          cancelled_requests: apiData.CANCELLED || 0,
          total_days_requested: 0,
          average_processing_time: 0,
          leave_type_distribution: {},
          department_distribution: {}
        };
        
        setStatistics(transformedStats);
      }
    } catch (error) {
      // Keep existing statistics on error
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Handle department tab change
  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    fetchStatistics(departmentId);
  };

  // Fetch leave requests
  const fetchLeaveRequests = async () => {
    setIsLoadingRequests(true);
    try {
      const filters = {
        page: currentPage,
        page_size: pageSize,
        search: searchTerm || undefined,
        department_id: selectedDepartment === 'all' ? undefined : selectedDepartment,
        status: (statusFilter === 'all' ? undefined : statusFilter) as 'pending' | 'approved' | 'rejected' | 'cancelled' | undefined,
        include: ['employee', 'leave']
      };

      console.log('Fetching leave requests with filters:', filters);

      const response = await leaveService.getLeaveRequests(filters);
      
      if (response.status && response.data) {
        setLeaveRequests(response.data);
        setTotalCount(response.total_count || 0);
      }
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Show approve confirmation dialog
  const showApproveDialog = (id: string, employeeName: string) => {
    setSelectedRequestId(id);
    setSelectedEmployeeName(employeeName);
    setApproveDialogOpen(true);
  };

  // Show reject confirmation dialog
  const showRejectDialog = (id: string, employeeName: string) => {
    setSelectedRequestId(id);
    setSelectedEmployeeName(employeeName);
    setRejectDialogOpen(true);
  };

  // Show leave request details dialog
  const showLeaveDetails = async (id: string) => {
    setSelectedRequestId(id);
    setViewDialogOpen(true);
    setIsLoadingLeaveDetails(true);
    
    try {
      const response = await leaveService.getLeaveRequest(id);
      if (response.status && response.data) {
        setSelectedLeaveRequest(response.data);
      }
    } catch (error) {
      console.error('Error fetching leave request details:', error);
    } finally {
      setIsLoadingLeaveDetails(false);
    }
  };

  // Approve leave request
  const handleApprove = async () => {
    if (processingRequests.has(selectedRequestId)) return; // Prevent double-clicks
    
    setProcessingRequests(prev => new Set(prev).add(selectedRequestId));
    try {
      const response = await leaveService.approveLeaveRequest(selectedRequestId);
      
      if (response.status) {
        // Reset status filter to show all requests including the newly approved one
        setStatusFilter('all');
        // Refresh the data after approval
        await fetchLeaveRequests();
        await fetchStatistics(selectedDepartment);
        // You can add a success toast here
      }
    } catch (error) {
      console.error('Error approving leave request:', error);
      // You can add an error toast here
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequestId);
        return newSet;
      });
      setApproveDialogOpen(false);
    }
  };

  // Reject leave request
  const handleReject = async () => {
    if (processingRequests.has(selectedRequestId)) return; // Prevent double-clicks
    
    setProcessingRequests(prev => new Set(prev).add(selectedRequestId));
    try {
      const response = await leaveService.rejectLeaveRequest(selectedRequestId);
      if (response.status) {
        // Reset status filter to show all requests including the newly rejected one
        setStatusFilter('all');
        // Refresh the data after rejection
        await fetchLeaveRequests();
        await fetchStatistics(selectedDepartment);
        // You can add a success toast here
      }
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      // You can add an error toast here
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedRequestId);
        return newSet;
      });
      setRejectDialogOpen(false);
    }
  };

  // Fetch initial statistics for "all" departments
  useEffect(() => {
    fetchStatistics('all');
  }, []);

  // Fetch leave requests when filters change
  useEffect(() => {
    fetchLeaveRequests();
  }, [currentPage, pageSize, searchTerm, selectedDepartment, statusFilter]);

  // Fetch leave requests on component mount
  useEffect(() => {
    fetchLeaveRequests();
  }, []);



  const getStatusBadge = (status: string) => {
    const statusConfig = {
      // Handle both uppercase and lowercase status values
      PENDING: { variant: 'secondary' as const, icon: Clock, text: 'Pending' },
      APPROVED: { variant: 'default' as const, icon: CheckCircle, text: 'Approved' },
      REJECTED: { variant: 'destructive' as const, icon: XCircle, text: 'Rejected' },
      CANCELLED: { variant: 'outline' as const, icon: AlertCircle, text: 'Cancelled' },
      // Also handle lowercase for backward compatibility
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending' },
      approved: { variant: 'default' as const, icon: CheckCircle, text: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, text: 'Rejected' },
      cancelled: { variant: 'outline' as const, icon: AlertCircle, text: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

          return (
        <Badge variant={config.variant} className="flex items-center justify-center gap-1 min-w-[80px]">
          <Icon className="w-3 h-3" />
          {config.text}
        </Badge>
      );
  };

  const getLeaveTypeBadge = (leaveType: { leave_type_color: string; leave_type_icon: string; leave_type_code: string }) => (
    <Badge 
      variant="outline" 
      className="flex items-center gap-1"
      style={{ borderColor: leaveType.leave_type_color, color: leaveType.leave_type_color }}
    >
      <span>{leaveType.leave_type_icon}</span>
      {leaveType.leave_type_code}
    </Badge>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <p className="text-red-600 dark:text-red-400">
          Error loading departments: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Department Tabs */}
      <div className="bg-white dark:bg-gray-850 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleDepartmentChange('all')}
              className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                selectedDepartment === 'all'
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All
            </button>
            
            {departments.map((department) => (
              <button
                key={department.id}
                onClick={() => handleDepartmentChange(department.id)}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
                  selectedDepartment === department.id
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {department.name}
              </button>
            ))}
          </div>
        </div>
      </div>



      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center justify-center h-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {statistics.total_requests}
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  All time requests
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center justify-center h-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {statistics.pending_requests}
                </div>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Awaiting approval
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center justify-center h-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {statistics.approved_requests}
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Successfully approved
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <div className="flex items-center justify-center h-8">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {statistics.rejected_requests}
                </div>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Declined requests
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className='pt-6'>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by employee name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leave Requests</h2>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardContent className="p-0 pb-4">

          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Employee</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Leave Type</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Duration</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider whitespace-nowrap">Applied Date</th>
                  <th className="text-center py-4 px-6 font-semibold text-gray-700 dark:text-gray-300 text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>                {isLoadingRequests ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <LoadingSpinner />
                    </td>
                  </tr>
                ) : leaveRequests.length > 0 ? (
                  leaveRequests.map((request) => (
                    <tr key={request.id} className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {request.employee?.name || 'Unknown Employee'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {request.employee?.email || 'No email'}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            Code: {request.employee?.code || 'N/A'} • Mobile: {request.employee?.mobile || 'N/A'}
                          </div>
                        </div>
                      </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Leave Type: {request.leave.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                          Reason: {request.reason}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {request.total_days} day{request.total_days > 1 ? "'s" : ''}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center">
                          {getStatusBadge(request.status)}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                                                  <div className={`flex ${(request.status === 'PENDING' || request.status === 'pending') ? 'gap-2' : 'justify-center'}`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="p-2 group"
                              title="View Details"
                              onClick={() => showLeaveDetails(request.id)}
                            >
                              <Eye className="w-5 h-5 text-blue-600 group-hover:text-blue-400 transition-colors duration-200" />
                            </Button>
                          {(request.status === 'PENDING' || request.status === 'pending') && (
                            <>
                                                              <Button 
                                  variant="ghost"
                                  size="sm" 
                                  className="p-2 group"
                                  onClick={() => showApproveDialog(request.id, request.employee?.name || 'Unknown Employee')}
                                  title="Approve Request"
                                >
                                  <CheckCircle className="w-5 h-5 text-green-600 group-hover:text-green-400 transition-colors duration-200" />
                                </Button>
                                                              <Button 
                                  variant="ghost"
                                  size="sm"
                                  className="p-2 group"
                                  onClick={() => showRejectDialog(request.id, request.employee?.name || 'Unknown Employee')}
                                  title="Reject Request"
                                >
                                  <XCircle className="w-5 h-5 text-red-600 group-hover:text-red-400 transition-colors duration-200" />
                                </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-gray-400">
                      No leave requests found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Request Count Description */}
          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
            Showing {leaveRequests.length} of {totalCount} requests
          </div>

        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Approve Leave Request"
        description="Are you sure you want to approve this leave request for"
        type="approve"
        confirmText="Approve"
        cancelText="Cancel"
        onConfirm={handleApprove}
        loading={processingRequests.has(selectedRequestId)}
        itemName={selectedEmployeeName}
      />

      <ConfirmationDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="Reject Leave Request"
        description="Are you sure you want to reject this leave request for"
        type="danger"
        confirmText="Reject"
        cancelText="Cancel"
        onConfirm={handleReject}
        loading={processingRequests.has(selectedRequestId)}
        itemName={selectedEmployeeName}
      />

      {/* Leave Request Details Dialog */}
      <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${viewDialogOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Leave Request Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewDialogOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            {isLoadingLeaveDetails ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : selectedLeaveRequest ? (
              <div className="space-y-6">
                {/* Employee Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Employee Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {selectedLeaveRequest.employee?.name || 'N/A'}</div>
                      <div><span className="font-medium">Email:</span> {selectedLeaveRequest.employee?.email || 'N/A'}</div>
                      <div><span className="font-medium">Code:</span> {selectedLeaveRequest.employee?.code || 'N/A'}</div>
                      <div><span className="font-medium">Mobile:</span> {selectedLeaveRequest.employee?.mobile || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Leave Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Leave Type:</span> {selectedLeaveRequest.leave.name || 'N/A'}</div>
                      <div><span className="font-medium">Reason:</span> {selectedLeaveRequest.reason || 'N/A'}</div>
                      <div><span className="font-medium">Comments:</span> {selectedLeaveRequest.comments || 'N/A'}</div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Status:</span> 
                        {getStatusBadge(selectedLeaveRequest.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Duration and Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Duration</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Start Date:</span> {new Date(selectedLeaveRequest.start_date).toLocaleDateString()}</div>
                      <div><span className="font-medium">End Date:</span> {new Date(selectedLeaveRequest.end_date).toLocaleDateString()}</div>
                      <div><span className="font-medium">Total Days:</span> {selectedLeaveRequest.total_days} day{selectedLeaveRequest.total_days > 1 ? 's' : ''}</div>
                      <div><span className="font-medium">Half Day:</span> {selectedLeaveRequest.is_half_day ? 'Yes' : 'No'}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Additional Details</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-medium">Applied Date:</span> {new Date(selectedLeaveRequest.created_at).toLocaleDateString()}</div>
                      <div><span className="font-medium">Work Handover To:</span> {selectedLeaveRequest.work_handover_to || 'N/A'}</div>
                      <div><span className="font-medium">Emergency Contact:</span> {selectedLeaveRequest.emergency_contact_name || 'N/A'}</div>
                      <div><span className="font-medium">Emergency Phone:</span> {selectedLeaveRequest.emergency_contact_phone || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Handover Notes */}
                {selectedLeaveRequest.handover_notes && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Handover Notes</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedLeaveRequest.handover_notes}</p>
                  </div>
                )}

                {/* Approver Comments */}
                {selectedLeaveRequest.approver_comments && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Approver Comments</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{selectedLeaveRequest.approver_comments}</p>
                  </div>
                )}

                {/* Action Buttons - Only show for PENDING status */}
                {selectedLeaveRequest.status === 'PENDING' && (
                  <div className="flex justify-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 px-8"
                      onClick={() => {
                        setViewDialogOpen(false);
                        showApproveDialog(selectedLeaveRequest.id, selectedLeaveRequest.employee?.name || 'Unknown Employee');
                      }}
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approve Request
                    </Button>
                    <Button
                      variant="destructive"
                      size="lg"
                      className="px-8"
                      onClick={() => {
                        setViewDialogOpen(false);
                        showRejectDialog(selectedLeaveRequest.id, selectedLeaveRequest.employee?.name || 'Unknown Employee');
                      }}
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Reject Request
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                No leave request details found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 