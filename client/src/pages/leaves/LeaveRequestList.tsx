import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock3,
  UserX,
  Building2,
  CalendarDays,
  BarChart3
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { leaveService, LeaveRequestWithDetails, LeaveRequestFilters, LeaveStatistics } from '@/services/leaveService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { LeaveRequestCard } from '@/components/leaves/LeaveRequestCard';
import { format } from 'date-fns';

// Predefined leave types for filtering
const LEAVE_TYPES = [
  { value: 'regularization', label: 'Regularization', color: 'bg-blue-100 text-blue-800' },
  { value: 'sick_leave', label: 'Sick Leave', color: 'bg-red-100 text-red-800' },
  { value: 'casual_leave', label: 'Casual Leave', color: 'bg-green-100 text-green-800' },
  { value: 'marriage_leave', label: 'Marriage Leave', color: 'bg-purple-100 text-purple-800' },
  { value: 'emergency_leave', label: 'Emergency Leave', color: 'bg-orange-100 text-orange-800' },
  { value: 'annual_leave', label: 'Annual Leave', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'maternity_leave', label: 'Maternity Leave', color: 'bg-pink-100 text-pink-800' },
  { value: 'paternity_leave', label: 'Paternity Leave', color: 'bg-cyan-100 text-cyan-800' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All Status', icon: BarChart3, color: 'bg-gray-100 text-gray-800' },
  { value: 'pending', label: 'Pending', icon: Clock3, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'approved', label: 'Approved', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: 'Cancelled', icon: UserX, color: 'bg-gray-100 text-gray-600' },
];

export default function LeaveRequestList() {
  const { toast } = useToast();
  const [filters, setFilters] = useState<LeaveRequestFilters>({
    status: 'all',
    leave_type: 'all',
    department: 'all',
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    search: '',
    is_half_day: false,
  });
  
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // API calls
  const { data: statsResponse, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['leave', 'statistics', filters.month, filters.year],
    queryFn: () => leaveService.getLeaveStatistics({
      month: filters.month,
      year: filters.year
    }),
    enabled: true,
  });

  const { data: leaveTypesResponse } = useQuery({
    queryKey: ['leave', 'types'],
    queryFn: () => leaveService.getLeaveTypes({}),
    enabled: true,
  });

  const { data: requestsResponse, isLoading: requestsLoading, refetch: refetchRequests } = useQuery({
    queryKey: ['leave', 'requests', filters],
    queryFn: () => leaveService.getLeaveRequests({
      ...filters,
      status: filters.status === 'all' ? undefined : filters.status,
      leave_type: filters.leave_type === 'all' ? undefined : filters.leave_type,
      department: filters.department === 'all' ? undefined : filters.department,
      page: 1,
      page_size: 100
    }),
    enabled: true,
  });

  const stats = statsResponse?.data;
  const leaveTypes = leaveTypesResponse?.data || [];
  const requests = requestsResponse?.data || [];

  const isLoading = statsLoading || requestsLoading;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const handleFilterChange = (key: keyof LeaveRequestFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSelectedRequests([]); // Reset selection when filters change
  };

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchStats(), refetchRequests()]);
      toast({
        title: "Success",
        description: "Leave data refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh leave data",
        variant: "destructive",
      });
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) return;
    
    try {
      await leaveService.bulkApproveRequests(selectedRequests);
      toast({
        title: "Success",
        description: `${selectedRequests.length} requests approved successfully`,
      });
      setSelectedRequests([]);
      refetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve requests",
        variant: "destructive",
      });
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequests.length === 0) return;
    
    try {
      await leaveService.bulkRejectRequests(selectedRequests, "Bulk rejected");
      toast({
        title: "Success",
        description: `${selectedRequests.length} requests rejected successfully`,
      });
      setSelectedRequests([]);
      refetchRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject requests",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === requests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests.map(req => req.id));
    }
  };

  const handleSelectRequest = (requestId: string) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'pending':
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Leave Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Manage employee leave requests and approvals
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {/* Month/Year Selection */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">Select Period:</span>
            </div>
            
            <Select value={filters.month?.toString()} onValueChange={(value) => handleFilterChange('month', parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.year?.toString()} onValueChange={(value) => handleFilterChange('year', parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              handleFilterChange('month', new Date().getMonth());
              handleFilterChange('year', new Date().getFullYear());
            }}>
              Current Month
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-850 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.total_requests || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-850 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.pending_requests || 0}
                </p>
                <div className="flex items-center text-sm mt-1">
                  <Clock3 className="h-4 w-4 text-yellow-600 mr-1" />
                  <span className="text-yellow-600">
                    {stats && stats.total_requests > 0 ? ((stats.pending_requests / stats.total_requests) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock3 className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-850 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.approved_requests || 0}
                </p>
                <div className="flex items-center text-sm mt-1">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-green-600">
                    {stats && stats.total_requests > 0 ? ((stats.approved_requests / stats.total_requests) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-850 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Days</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.total_days_requested || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Average: {stats && stats.total_requests > 0 ? (stats.total_days_requested / stats.total_requests).toFixed(1) : 0} days
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                <CalendarDays className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees, departments..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.leave_type || 'all'} onValueChange={(value) => handleFilterChange('leave_type', value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Leave Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {LEAVE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="half-day"
                checked={filters.is_half_day || false}
                onCheckedChange={(checked) => handleFilterChange('is_half_day', checked)}
              />
              <label htmlFor="half-day" className="text-sm text-gray-600 dark:text-gray-400">
                Half Day Only
              </label>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {requests.length} requests
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedRequests.length} request(s) selected
                </span>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBulkApprove}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve All
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleBulkReject}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leave Request Cards */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <Calendar className="h-12 w-12 text-gray-400" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    No leave requests found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Try adjusting your filters or search criteria
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="flex items-center gap-3">
              <Checkbox
                checked={selectedRequests.includes(request.id)}
                onCheckedChange={() => handleSelectRequest(request.id)}
                className="mt-2"
              />
              <div className="flex-1">
                <LeaveRequestCard
                  request={request}
                  onApprove={() => {
                    // Handle approve
                    console.log('Approve:', request.id);
                  }}
                  onReject={() => {
                    // Handle reject
                    console.log('Reject:', request.id);
                  }}
                  onView={() => {
                    // Handle view
                    console.log('View:', request.id);
                  }}
                  showActions={true}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
