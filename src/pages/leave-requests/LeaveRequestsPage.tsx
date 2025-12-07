import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDepartments } from '@/hooks/useDepartments';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner, ConfirmationDialog, EmptyState, Pagination } from '@/components/common';
import { LeaveRequestTable } from '@/components/leaves';
import { leaveService } from '@/services/leaveService';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  ClipboardList
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [statistics, setStatistics] = useState(defaultStatistics);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
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

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch statistics based on selected department
  const fetchStatistics = async (departmentId: string) => {
    setIsLoadingStats(true);
    try {
      const requestBody: { department_id?: string } = {};
      
      // Only pass department_id if a specific department is selected
      if (departmentId !== 'all') {
        requestBody.department_id = departmentId;
      }
      
      console.log('🔍 Fetching statistics for department:', departmentId);
      const response = await leaveService.getLeaveStatistics(requestBody);
      console.log('📊 Statistics API response:', response);
      
      if (response.status && response.data) {
        // Transform the API response to match expected format
        const apiData = response.data as any;
        console.log('📊 Raw API data:', apiData);
        
        // Handle different possible response structures
        let transformedStats;
        
        if (typeof apiData === 'object' && apiData !== null) {
          // Check if it's the expected structure with status counts
          if (apiData.PENDING !== undefined || apiData.APPROVED !== undefined) {
            transformedStats = {
              total_requests: (apiData.PENDING || 0) + (apiData.APPROVED || 0) + (apiData.REJECTED || 0) + (apiData.CANCELLED || 0) + (apiData.PARTIALLY_APPROVED || 0),
              pending_requests: apiData.PENDING || 0,
              approved_requests: apiData.APPROVED || 0,
              rejected_requests: apiData.REJECTED || 0,
              cancelled_requests: apiData.CANCELLED || 0,
              total_days_requested: apiData.total_days_requested || 0,
              average_processing_time: apiData.average_processing_time || 0,
              leave_type_distribution: apiData.leave_type_distribution || {},
              department_distribution: apiData.department_distribution || {}
            };
          } else if (apiData.total_requests !== undefined) {
            // If it's already in the expected format
            transformedStats = apiData;
          } else {
            // Fallback: try to extract counts from any available data
            transformedStats = {
              total_requests: apiData.total || apiData.count || 0,
              pending_requests: apiData.pending || 0,
              approved_requests: apiData.approved || 0,
              rejected_requests: apiData.rejected || 0,
              cancelled_requests: apiData.cancelled || 0,
              total_days_requested: apiData.total_days || 0,
              average_processing_time: apiData.avg_processing_time || 0,
              leave_type_distribution: apiData.leave_types || {},
              department_distribution: apiData.departments || {}
            };
          }
        } else {
          // Fallback for unexpected data types
          transformedStats = {
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
        }
        
        console.log('📊 Transformed statistics:', transformedStats);
        setStatistics(transformedStats);
      } else {
        console.log('❌ Statistics response not successful:', response);
      }
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
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
    if (!user?.organisation_id) {
      console.error('Organisation ID not found');
      return;
    }

    setIsLoadingRequests(true);
    try {
      const filters = {
        organisation_id: user.organisation_id,
        type: 'leave' as const,
        page: currentPage,
        page_size: pageSize,
        search: debouncedSearchTerm || undefined,
        department_id: selectedDepartment === 'all' ? undefined : selectedDepartment,
        status: (statusFilter === 'all' ? undefined : statusFilter) as 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | undefined
      };

      console.log('Fetching leave requests with filters:', filters);

      const response = await leaveService.getLeaveRequests(filters);
      
      if (response.status && response.data) {
        setLeaveRequests(response.data);
        setTotalCount(response.total_count || 0);
        setPageCount(response.page_count || 0);
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

  // Handle row click - show details dialog (same as eye icon)
  const handleRowClick = (request: any) => {
    showLeaveDetails(request.id);
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
  }, [currentPage, pageSize, debouncedSearchTerm, selectedDepartment, statusFilter]);



  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: 'secondary' as const, icon: Clock, text: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      APPROVED: { variant: 'default' as const, icon: CheckCircle, text: 'Approved', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      REJECTED: { variant: 'destructive' as const, icon: XCircle, text: 'Rejected', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      CANCELLED: { variant: 'outline' as const, icon: AlertCircle, text: 'Cancelled', className: '' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

          return (
      <Badge variant={config.variant} className={`flex items-center justify-center gap-1 min-w-[100px] ${config.className}`}>
          <Icon className="w-3 h-3" />
          {config.text}
        </Badge>
      );
  };

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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 pb-6">
            {isLoadingStats ? (
              <div className="flex items-center justify-center h-12">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Requests</div>
                <div className="text-3xl font-bold">{statistics.total_requests}</div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 pb-6">
            {isLoadingStats ? (
              <div className="flex items-center justify-center h-12">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Pending</div>
                <div className="text-3xl font-bold">{statistics.pending_requests}</div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 pb-6">
            {isLoadingStats ? (
              <div className="flex items-center justify-center h-12">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Approved</div>
                <div className="text-3xl font-bold">{statistics.approved_requests}</div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 pb-6">
            {isLoadingStats ? (
              <div className="flex items-center justify-center h-12">
                <LoadingSpinner size="sm" />
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Rejected</div>
                <div className="text-3xl font-bold">{statistics.rejected_requests}</div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
                <Input
                  placeholder="Search by employee name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
        
            <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
        
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
      </div>

      {/* Leave Requests Table */}
      {isLoadingRequests ? (
        <div className="flex items-center justify-center min-h-[60vh] w-full">
                      <LoadingSpinner />
                          </div>
      ) : totalCount > 0 ? (
        <>
          <LeaveRequestTable
            leaveRequests={leaveRequests}
            loading={isLoadingRequests}
            onView={showLeaveDetails}
            onApprove={showApproveDialog}
            onReject={showRejectDialog}
            onRowClick={handleRowClick}
          />
          
          {/* Pagination */}
          {totalCount > 0 && (
            <Card>
              <CardContent className="p-4">
                <Pagination
                  currentPage={currentPage}
                  pageSize={pageSize}
                  totalCount={totalCount}
                  pageCount={pageCount}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={(newPageSize) => {
                    setPageSize(newPageSize);
                    setCurrentPage(1);
                  }}
                  showFirstLast={false}
                />
        </CardContent>
      </Card>
          )}
        </>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No leave requests found"
          description="Leave requests will appear here once employees submit them. You can filter by department and status to find specific requests."
        />
      )}

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
      <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${viewDialogOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white dark:bg-gray-900 rounded-lg max-w-lg w-full mx-4 shadow-xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Leave Request</h3>
            <button onClick={() => setViewDialogOpen(false)} className="text-gray-400 hover:text-gray-600">
              <XCircle className="h-5 w-5" />
            </button>
            </div>

            {isLoadingLeaveDetails ? (
            <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : selectedLeaveRequest ? (
            <div className="p-4 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{selectedLeaveRequest.employee?.name}</p>
                  <p className="text-sm text-gray-500">{selectedLeaveRequest.employee?.code}</p>
                  </div>
                        {getStatusBadge(selectedLeaveRequest.status)}
                      </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Leave Type</span>
                  <span className="font-medium">{selectedLeaveRequest.leave_type_name || selectedLeaveRequest.leave?.name}</span>
                    </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span className="font-medium">{selectedLeaveRequest.total_days} day{selectedLeaveRequest.total_days > 1 ? 's' : ''}</span>
                  </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">From</span>
                  <span>{new Date(selectedLeaveRequest.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">To</span>
                  <span>{new Date(selectedLeaveRequest.end_date).toLocaleDateString()}</span>
                    </div>
                {selectedLeaveRequest.is_half_day && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Half Day</span>
                    <span>Yes</span>
                  </div>
                )}
                  </div>

              {selectedLeaveRequest.reason && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500 mb-1">Reason</p>
                  <p className="text-sm">{selectedLeaveRequest.reason}</p>
                    </div>
              )}

              {selectedLeaveRequest.comments && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500 mb-1">Comments</p>
                  <p className="text-sm">{selectedLeaveRequest.comments}</p>
                  </div>
              )}

              {selectedLeaveRequest.work_handover_to && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500 mb-1">Work Handover</p>
                  <p className="text-sm">{selectedLeaveRequest.work_handover_to}</p>
                </div>
              )}

                {selectedLeaveRequest.handover_notes && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500 mb-1">Handover Notes</p>
                  <p className="text-sm">{selectedLeaveRequest.handover_notes}</p>
                </div>
              )}

              {selectedLeaveRequest.emergency_contact_name && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500 mb-1">Emergency Contact</p>
                  <p className="text-sm">{selectedLeaveRequest.emergency_contact_name}</p>
                  {selectedLeaveRequest.emergency_contact_phone && (
                    <p className="text-sm text-gray-500">{selectedLeaveRequest.emergency_contact_phone}</p>
                  )}
                  </div>
                )}

                {selectedLeaveRequest.approver_comments && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500 mb-1">Approver Comments</p>
                  <p className="text-sm">{selectedLeaveRequest.approver_comments}</p>
                  </div>
                )}

                {selectedLeaveRequest.status === 'PENDING' && (
                <div className="flex gap-2 pt-3 border-t">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setViewDialogOpen(false);
                      showRejectDialog(selectedLeaveRequest.id, selectedLeaveRequest.employee?.name || 'Unknown Employee');
                    }}
                  >
                    Reject
                  </Button>
                    <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        setViewDialogOpen(false);
                        showApproveDialog(selectedLeaveRequest.id, selectedLeaveRequest.employee?.name || 'Unknown Employee');
                      }}
                    >
                    Approve
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
              No details found
              </div>
            )}
        </div>
      </div>
    </div>
  );
} 