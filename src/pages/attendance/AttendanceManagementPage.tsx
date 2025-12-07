import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Calendar as CalendarIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService, AttendanceRecord } from '@/services/attendanceService';
import { ShiftService } from '@/services/shiftService';
import { LoadingSpinner, EmptyState } from '@/components/common';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format, getDaysInMonth, startOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { getOrganisationId } from '@/lib/shift-utils';
import { authToken } from '@/services/authToken';

export default function AttendanceManagementPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedShiftId, setSelectedShiftId] = useState<string>('all');
  const [shifts, setShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get organisation_id from user, with multiple fallbacks
  const organisationId = useMemo(() => {
    const fromUser = user?.organisation_id;
    const fromStorage = getOrganisationId();
    const fromAuthToken = authToken.getorganisationId();
    
    return fromUser || fromStorage || fromAuthToken || '';
  }, [user]);

  // Fetch shifts for dropdown
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setShiftsLoading(true);
        const response = await ShiftService.getShifts({ page: 1, page_size: 100 });
        if (response.status && response.data) {
          setShifts(response.data);
        }
      } catch (error) {
        console.error('Error fetching shifts:', error);
      } finally {
        setShiftsLoading(false);
      }
    };

    if (organisationId) {
      fetchShifts();
    }
  }, [organisationId]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // API call for attendance calendar data
  const { data: attendanceResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['attendance', 'calendar', { month: selectedMonth, year: selectedYear, shiftId: selectedShiftId, search: debouncedSearchTerm }],
    queryFn: () => {
      const monthName = months[selectedMonth];
      console.log('📡 Calendar API Call - Month:', monthName, 'Year:', selectedYear, 'Shift:', selectedShiftId, 'Search:', debouncedSearchTerm);
      
      const params: any = {
        month: monthName,
        year: selectedYear,
        page: 1,
        page_size: 1000, // Get all results
      };
      
      // Add shift_id only if a specific shift is selected (not "All")
      if (selectedShiftId && selectedShiftId !== 'all') {
        params.shift_id = selectedShiftId;
      }
      
      // Add search parameter if search term exists
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        params.search = {
          keys: ["name", "department"],
          value: debouncedSearchTerm.trim()
        };
      }
      
      return attendanceService.getAttendanceCalendar(params);
    },
    enabled: true,
  });

  const attendanceRecords = attendanceResponse?.data || [];
  
  // No need to filter by month/year since API returns data for selected month
  const filteredRecords = useMemo(() => {
    if (!attendanceRecords.length) {
      console.log('⚠️ No attendance records received from API');
      return [];
    }
    
    console.log(`📊 Received ${attendanceRecords.length} records for ${months[selectedMonth]} ${selectedYear}`);
    if (attendanceRecords.length > 0) {
      console.log('📋 Sample record:', attendanceRecords[0]);
    }
    
    return attendanceRecords;
  }, [attendanceRecords, selectedMonth, selectedYear, months]);

  // Generate all days of the selected month
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
    const daysInMonth = getDaysInMonth(monthStart);
    return eachDayOfInterval({
      start: monthStart,
      end: new Date(selectedYear, selectedMonth, daysInMonth)
    });
  }, [selectedMonth, selectedYear]);

  // Group attendance records by employee and date
  const attendanceByEmployee = useMemo(() => {
    const grouped: Record<string, Record<string, AttendanceRecord>> = {};
    
    filteredRecords.forEach((record) => {
      if (!record.employee_id || !record.date) {
        return;
      }
      
      if (!grouped[record.employee_id]) {
        grouped[record.employee_id] = {};
      }
      
      // Normalize date format to yyyy-MM-dd
      const normalizedDate = record.date.split('T')[0]; // Handle ISO datetime strings
      grouped[record.employee_id][normalizedDate] = record;
    });

    // Get unique employees (backend already filtered by search)
    const employees = Array.from(new Set(filteredRecords.map(r => r.employee_id)))
      .map(empId => {
        const firstRecord = filteredRecords.find(r => r.employee_id === empId);
        return {
          id: empId,
          name: firstRecord?.employee_name || 'Unknown',
          department: firstRecord?.department || 'Unknown',
          records: grouped[empId] || {}
        };
      });

    return employees;
  }, [filteredRecords]);

  // Get cell content for a specific employee and date
  const getCellContent = (employeeRecords: Record<string, AttendanceRecord>, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = employeeRecords[dateStr];

    if (!record) {
      // Check if it's a weekend
      if (isWeekend(date)) {
        return (
          <div className="text-center text-xs">
            <div className="text-gray-400">⚪</div>
            <div className="text-gray-500 text-[10px] mt-0.5">Week Off</div>
          </div>
        );
      }
      return null;
    }

    const status = record.status?.toLowerCase() || '';
    const hours = record.total_hours;
    
    // If we have a record but no status, show hours or a default indicator
    if (!status && !hours) {
      return (
        <div className="text-center text-xs">
          <div className="text-gray-400">-</div>
        </div>
      );
    }

    // Status colors and labels
    if (status === 'present' || status === 'on-duty') {
      if (hours) {
        return (
          <div className="text-center text-xs">
            <div className="text-green-600">🟢</div>
            <div className="text-green-700 text-[10px] mt-0.5 font-medium">
              {hours.toFixed(1)} hrs
            </div>
          </div>
        );
      }
      return (
        <div className="text-center text-xs">
          <div className="text-green-600">🟢</div>
          <div className="text-green-700 text-[10px] mt-0.5">On Duty</div>
        </div>
      );
    }

    if (status === 'absent') {
      return (
        <div className="text-center text-xs">
          <div className="text-red-600">🔴</div>
          <div className="text-red-700 text-[10px] mt-0.5">Absent</div>
        </div>
      );
    }

    if (status === 'half-day') {
      return (
        <div className="text-center text-xs">
          <div className="text-orange-600">🟠</div>
          <div className="text-orange-700 text-[10px] mt-0.5">Half Day</div>
        </div>
      );
    }

    if (status === 'on-leave') {
      return (
        <div className="text-center text-xs">
          <div className="text-purple-600">🟣</div>
          <div className="text-purple-700 text-[10px] mt-0.5">Leave</div>
        </div>
      );
    }

    if (status === 'weekend') {
      return (
        <div className="text-center text-xs">
          <div className="text-gray-400">⚪</div>
          <div className="text-gray-500 text-[10px] mt-0.5">Week Off</div>
        </div>
      );
    }

    // Default: show hours if available
    if (hours) {
      return (
        <div className="text-center text-xs">
          <div className="text-blue-600">🕒</div>
          <div className="text-blue-700 text-[10px] mt-0.5 font-medium">
            {hours.toFixed(1)} hrs
          </div>
        </div>
      );
    }

    return null;
  };

  const handleMonthChange = (value: number) => {
    setSelectedMonth(value);
  };

  const handleYearChange = (value: number) => {
    setSelectedYear(value);
  };

  const handleShiftChange = (value: string) => {
    setSelectedShiftId(value);
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

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">
          Error loading attendance data: {error instanceof Error ? error.message : 'Unknown error'}
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

              <Select value={selectedMonth.toString()} onValueChange={(value) => handleMonthChange(parseInt(value))}>
          <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedYear.toString()} onValueChange={(value) => handleYearChange(parseInt(value))}>
          <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedShiftId} 
                onValueChange={handleShiftChange}
                disabled={shiftsLoading}
              >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={shiftsLoading ? "Loading..." : "Select Shift"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
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

      {/* Attendance Calendar Grid */}
          {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh] w-full">
              <LoadingSpinner />
            </div>
          ) : attendanceByEmployee.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No attendance records found"
          description={`No attendance data available for ${months[selectedMonth]} ${selectedYear}. Records will appear here once attendance is tracked.`}
        />
          ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-gray-800">
                    <TableHead className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 min-w-[200px] text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Employee
                    </TableHead>
                    <TableHead className="sticky left-[200px] z-10 bg-gray-50 dark:bg-gray-800 min-w-[120px] text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Department
                    </TableHead>
                    {monthDays.map((day) => (
                      <TableHead 
                        key={format(day, 'yyyy-MM-dd')} 
                        className="text-center min-w-[80px] text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs">
                            {format(day, 'EEE')}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {format(day, 'd')}
                          </span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceByEmployee.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <TableCell className="sticky left-0 z-10 bg-white dark:bg-gray-900 font-medium text-sm text-gray-900 dark:text-white">
                        {employee.name}
                      </TableCell>
                      <TableCell className="sticky left-[200px] z-10 bg-white dark:bg-gray-900 text-sm text-gray-500 dark:text-gray-400">
                        {employee.department}
                      </TableCell>
                      {monthDays.map((day) => (
                        <TableCell 
                          key={format(day, 'yyyy-MM-dd')} 
                          className="text-center align-middle p-2"
                        >
                          {getCellContent(employee.records, day)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
        </CardContent>
      </Card>
      )}
    </div>
  );
}
