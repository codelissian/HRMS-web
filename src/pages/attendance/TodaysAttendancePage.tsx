import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  UserCheck, 
  Clock, 
  Calendar,
  Download,
  Users,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService, TodaysAttendanceRecord } from '@/services/attendanceService';
import { ShiftService } from '@/services/shiftService';
import { departmentService } from '@/services/departmentService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Pagination } from '@/components/common/Pagination';
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

  // Get selected date range (start and end of day in UTC)
  const dateRange = useMemo(() => {
    const date = new Date(selectedDate);
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    
    return {
      gte: startOfDay.toISOString(),
      lte: endOfDay.toISOString()
    };
  }, [selectedDate]);

  // Fetch attendance
  const { data: attendanceResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['attendance', 'today', { 
      organisationId,
      dateRange,
      shiftId: selectedShiftId,
      page: currentPage,
      page_size: pageSize
    }],
    queryFn: () => attendanceService.getTodaysAttendance({
      organisation_id: organisationId,
      shift_id: selectedShiftId || undefined,
      date: dateRange,
      page: currentPage,
      page_size: pageSize
    }, organisationId),
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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Today's Attendance</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportAttendance} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  if (!isNaN(date.getTime())) {
                    handleDateChange(date);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Shift</label>
              <Select 
                value={selectedShiftId} 
                onValueChange={handleShiftChange}
                disabled={shiftsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={shiftsLoading ? "Loading shifts..." : "Select Shift"} />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>{shift.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todayStats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{todayStats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Half Day</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{todayStats.halfDay}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{todayStats.onLeave}</div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Attendance Records */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8 px-6">
              <LoadingSpinner />
            </div>
          ) : attendanceRecords.length === 0 ? (
            <div className="text-center py-8 px-6">
              <p className="text-muted-foreground">No attendance records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] whitespace-nowrap">Employee</TableHead>
                    <TableHead className="whitespace-nowrap">Department</TableHead>
                    <TableHead className="whitespace-nowrap">Shift</TableHead>
                    <TableHead className="text-center whitespace-nowrap">Check-In</TableHead>
                    <TableHead className="text-center whitespace-nowrap">Check-Out</TableHead>
                    <TableHead className="text-center whitespace-nowrap">Is Late</TableHead>
                    <TableHead className="text-center whitespace-nowrap">Is Early</TableHead>
                    <TableHead className="text-center whitespace-nowrap">Status</TableHead>
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
                      <TableRow key={record.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium py-3">
                          <div className="flex items-center space-x-3">
                            {record.image ? (
                              <img src={record.image} alt={record.name} className="w-10 h-10 rounded-full flex-shrink-0 object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                  {record.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-sm leading-tight">{record.name}</div>
                              <div className="text-xs text-muted-foreground mt-0.5">{record.code}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-middle py-3 whitespace-nowrap">{departmentName || '-'}</TableCell>
                        <TableCell className="align-middle py-3 whitespace-nowrap">{shiftName}</TableCell>
                        <TableCell className="text-center align-middle py-3 whitespace-nowrap">
                          {checkInTime ? format(checkInTime, 'HH:mm:ss') : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-center align-middle py-3 whitespace-nowrap">
                          {checkOutTime ? format(checkOutTime, 'HH:mm:ss') : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-center align-middle py-3 whitespace-nowrap">
                          {checkInTime ? (
                            <div className="flex justify-center">
                              <Badge variant={isLate ? "destructive" : "outline"} className="inline-flex">
                                {isLate ? "Yes" : "No"}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center align-middle py-3 whitespace-nowrap">
                          {checkOutTime ? (
                            <div className="flex justify-center">
                              <Badge variant={isEarly ? "destructive" : "outline"} className="inline-flex">
                                {isEarly ? "Yes" : "No"}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center align-middle py-3 whitespace-nowrap">
                          <div className="flex justify-center">
                            <Badge className={getStatusColor(record.status || '')}>
                              {getStatusIcon(record.status || '')}
                              <span className="ml-1">{formatStatus(record.status || '')}</span>
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalCount > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} records
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  Page {currentPage} of {pageCount}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= pageCount}
                  onClick={() => setCurrentPage(prev => Math.min(pageCount, prev + 1))}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
