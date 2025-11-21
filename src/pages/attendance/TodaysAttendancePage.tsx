import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, Clock, Calendar, Download, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService, TodaysAttendanceRecord } from '@/services/attendanceService';
import { ShiftService } from '@/services/shiftService';
import { departmentService } from '@/services/departmentService';
import { LoadingSpinner, EmptyState, Pagination } from '@/components/common';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { getOrganisationId } from '@/lib/shift-utils';
import { authToken } from '@/services/authToken';

export default function TodaysAttendancePage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [shifts, setShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get organisation_id from user, with multiple fallbacks
  const organisationId = useMemo(() => {
    const fromUser = user?.organisation_id;
    const fromStorage = getOrganisationId();
    const fromAuthToken = authToken.getorganisationId();
    
    // Try all sources in order of preference
    const orgId = fromUser || fromStorage || fromAuthToken || '';
    
    // Debug logging to help identify the issue
    if (!orgId) {
      console.warn('⚠️ No organisation_id found:', {
        hasUser: !!user,
        userOrganisationId: fromUser,
        fromStorage,
        fromAuthToken,
        userObject: user
      });
    } else {
      console.log('✅ Organisation ID found:', orgId, { 
        fromUser: !!fromUser, 
        fromStorage: !!fromStorage,
        fromAuthToken: !!fromAuthToken
      });
    }
    
    return orgId;
  }, [user]);

  // Fetch shifts and departments
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setShiftsLoading(true);
        const response = await ShiftService.getShifts({ page: 1, page_size: 100 });
        if (response.status && response.data) {
          setShifts(response.data);
          // Set first shift as default
          if (response.data.length > 0) {
            setSelectedShiftId(prev => prev || response.data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching shifts:', error);
      } finally {
        setShiftsLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const response = await departmentService.getDepartments({ page: 1, page_size: 100 });
        if (response.status && response.data) {
          setDepartments(response.data);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      }
    };

    if (organisationId) {
      fetchShifts();
      fetchDepartments();
    }
  }, [organisationId]);

  // Get selected date range (start and end of day)
  const dateRange = useMemo(() => {
    const date = new Date(selectedDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Format as ISO datetime without milliseconds
    return {
      gte: `${year}-${month}-${day}T00:00:00Z`,
      lte: `${year}-${month}-${day}T23:59:59Z`
    };
  }, [selectedDate]);

  // Fetch attendance
  const { data: attendanceResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['attendance', 'today', { 
      organisationId,
      dateRange,
      shiftId: selectedShiftId,
      page: currentPage,
      page_size: pageSize,
      search: debouncedSearchTerm
    }],
    queryFn: () => {
      const params: any = {
        organisation_id: organisationId,
        shift_id: selectedShiftId || undefined,
        date: dateRange,
        page: currentPage,
        page_size: pageSize
      };

      // Add search parameter if search term exists
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        params.search = {
          keys: ["name", "code", "department"],
          value: debouncedSearchTerm.trim()
        };
      }

      return attendanceService.getTodaysAttendance(params, organisationId);
    },
    enabled: !!organisationId && !!selectedShiftId,
  });

  const attendanceRecords = attendanceResponse?.data || [];
  const totalCount = attendanceResponse?.total_count || 0;
  const pageCount = attendanceResponse?.page_count || 0;

  const getStatusColor = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    switch (normalizedStatus) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'half_day':
      case 'half-day': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'on_leave':
      case 'on-leave': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'weekend': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    switch (normalizedStatus) {
      case 'present': return <UserCheck className="h-4 w-4" />;
      case 'absent': return <Clock className="h-4 w-4" />;
      case 'half_day':
      case 'half-day': return <Clock className="h-4 w-4" />;
      case 'on_leave':
      case 'on-leave': return <Calendar className="h-4 w-4" />;
      case 'weekend': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    const normalizedStatus = status?.toLowerCase() || '';
    switch (normalizedStatus) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'half_day': return 'Half Day';
      case 'on_leave': return 'On Leave';
      case 'weekend': return 'Weekend';
      default: return status || 'Unknown';
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setCurrentPage(1); // Reset to first page when date changes
  };

  const handleShiftChange = (shiftId: string) => {
    setSelectedShiftId(shiftId);
    setCurrentPage(1); // Reset to first page when shift changes
  };

  const handleExportAttendance = async () => {
    try {
      toast({
        title: 'Export',
        description: 'Export functionality will be implemented',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export attendance data',
        variant: 'destructive',
      });
    }
  };

  // Calculate statistics
  const todayStats = useMemo(() => {
    const present = attendanceRecords.filter(r => r.status?.toLowerCase() === 'present').length;
    const absent = attendanceRecords.filter(r => r.status?.toLowerCase() === 'absent').length;
    const halfDay = attendanceRecords.filter(r => 
      r.status?.toLowerCase() === 'half_day' || r.status?.toLowerCase() === 'half-day'
    ).length;
    const onLeave = attendanceRecords.filter(r => 
      r.status?.toLowerCase() === 'on_leave' || r.status?.toLowerCase() === 'on-leave'
    ).length;
    const total = attendanceRecords.length;

    return {
      present,
      absent,
      halfDay,
      onLeave,
      total
    };
  }, [attendanceRecords]);

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">
          Error loading today's attendance: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <Button 
          onClick={() => refetch()} 
          className="mt-4"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error if no organisation ID is available after all checks
  if (!organisationId) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please select an organization to view attendance</p>
        <p className="text-sm text-muted-foreground mt-2">
          If you're logged in, please refresh the page or contact support.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <input
          type="date"
          value={format(selectedDate, 'yyyy-MM-dd')}
          onChange={(e) => {
            const date = new Date(e.target.value);
            if (!isNaN(date.getTime())) {
              handleDateChange(date);
            }
          }}
          className="w-[180px] px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-sm"
        />

        <Select 
          value={selectedShiftId} 
          onValueChange={handleShiftChange}
          disabled={shiftsLoading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={shiftsLoading ? "Loading..." : "Select Shift"} />
          </SelectTrigger>
          <SelectContent>
            {shifts.map((shift) => (
              <SelectItem key={shift.id} value={shift.id}>{shift.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={handleExportAttendance} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Today's Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total</div>
            <div className="text-3xl font-bold">{todayStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Present</div>
            <div className="text-3xl font-bold">{todayStats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Absent</div>
            <div className="text-3xl font-bold">{todayStats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Half Day</div>
            <div className="text-3xl font-bold">{todayStats.halfDay}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total On Leave</div>
            <div className="text-3xl font-bold">{todayStats.onLeave}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Attendance Records */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh] w-full">
          <LoadingSpinner />
        </div>
      ) : attendanceRecords.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No attendance records found"
          description={`No attendance data available for ${format(selectedDate, 'MMMM dd, yyyy')}. Records will appear here once employees check in.`}
        />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-800">
                      <TableHead className="w-[200px] text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Employee</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Department</TableHead>
                      <TableHead className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shift</TableHead>
                      <TableHead className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check-In</TableHead>
                      <TableHead className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check-Out</TableHead>
                      <TableHead className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Is Late</TableHead>
                      <TableHead className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Is Early</TableHead>
                      <TableHead className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => {
                    // Get check-in and check-out times from attendance_records
                    const clockIn = record.attendance_records?.find(r => r.event_type === 'CLOCK_IN');
                    const clockOut = record.attendance_records?.find(r => r.event_type === 'CLOCK_OUT');
                    
                    const checkInTime = clockIn ? new Date(clockIn.event_time) : null;
                    const checkOutTime = clockOut ? new Date(clockOut.event_time) : null;
                    
                    // Get shift details
                    const shift = shifts.find(s => s.id === record.shift_id);
                    const shiftName = shift?.name || 'N/A';
                    
                    // Get department name (if departments are available)
                    const department = departments?.find(d => d.id === record.department_id);
                    const departmentName = department?.name || '';
                    
                    // Calculate Is Late (check if check-in is after shift start + grace period)
                    let isLate = false;
                    if (checkInTime && shift?.start) {
                      const shiftStartTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${shift.start}`);
                      const graceMinutes = shift.grace_minutes || 0;
                      const allowedStartTime = new Date(shiftStartTime.getTime() + graceMinutes * 60000);
                      isLate = checkInTime > allowedStartTime;
                    }
                    
                    // Calculate Is Early (check if check-out is before shift end)
                    let isEarly = false;
                    if (checkOutTime && shift?.end) {
                      const shiftEndTime = new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${shift.end}`);
                      isEarly = checkOutTime < shiftEndTime;
                    }

                    return (
                      <TableRow key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <TableCell className="py-3">
                          <div className="flex items-center space-x-3">
                            {record.image ? (
                              <img src={record.image} alt={record.name} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                  {record.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm text-gray-900 dark:text-white">{record.name}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{record.code}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-900 dark:text-white">{departmentName || '-'}</TableCell>
                        <TableCell className="text-sm text-gray-900 dark:text-white">{shiftName}</TableCell>
                        <TableCell className="text-center text-sm text-gray-900 dark:text-white">
                          {checkInTime ? format(checkInTime, 'HH:mm:ss') : <span className="text-gray-500">-</span>}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-900 dark:text-white">
                          {checkOutTime ? format(checkOutTime, 'HH:mm:ss') : <span className="text-gray-500">-</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          {checkInTime ? (
                            <Badge variant={isLate ? "destructive" : "outline"} className="inline-flex px-2 py-1">
                              {isLate ? "Yes" : "No"}
                            </Badge>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {checkOutTime ? (
                            <Badge variant={isEarly ? "destructive" : "outline"} className="inline-flex px-2 py-1">
                              {isEarly ? "Yes" : "No"}
                            </Badge>
                          ) : (
                            <span className="text-gray-500 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={`${getStatusColor(record.status || '')} inline-flex items-center gap-1 px-2 py-1`}>
                            {getStatusIcon(record.status || '')}
                            <span>{formatStatus(record.status || '')}</span>
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

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
      )}
    </div>
  );
}
