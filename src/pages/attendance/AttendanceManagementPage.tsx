import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Download,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService, AttendanceRecord } from '@/services/attendanceService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';
import { format, getDaysInMonth, startOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';

export default function AttendanceManagementPage() {
  const { toast } = useToast();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // API call for attendance data
  const { data: attendanceResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['attendance', 'list', { month: selectedMonth, year: selectedYear }],
    queryFn: () => {
      console.log('📡 API Call - Month:', selectedMonth, 'Year:', selectedYear);
      return attendanceService.getAttendanceList({
        month: selectedMonth,
        year: selectedYear
      });
    },
    enabled: true,
  });

  const attendanceRecords = attendanceResponse?.data || [];
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Filter records by selected month and year
  const filteredRecords = useMemo(() => {
    if (!attendanceRecords.length) {
      console.log('⚠️ No attendance records received from API');
      return [];
    }
    
    const monthStart = startOfMonth(new Date(selectedYear, selectedMonth));
    const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);
    
    const filtered = attendanceRecords.filter(record => {
      if (!record.date) return false;
      const recordDate = new Date(record.date);
      return recordDate >= monthStart && recordDate <= monthEnd;
    });
    
    console.log(`📊 Filtered ${filtered.length} records for ${months[selectedMonth]} ${selectedYear} out of ${attendanceRecords.length} total`);
    if (filtered.length > 0) {
      console.log('📋 Sample record:', filtered[0]);
    }
    
    return filtered;
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

    // Get unique employees
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
  }, [filteredRecords, selectedMonth, selectedYear]);

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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Monthly Attendance</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {months[selectedMonth]} {selectedYear}
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
              <label className="text-sm font-medium mb-2 block">Month</label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => handleMonthChange(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Year</label>
              <Select value={selectedYear.toString()} onValueChange={(value) => handleYearChange(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8 px-6">
              <LoadingSpinner />
            </div>
          ) : attendanceByEmployee.length === 0 ? (
            <div className="text-center py-8 px-6">
              <p className="text-muted-foreground">No attendance records found for {months[selectedMonth]} {selectedYear}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-10 bg-white dark:bg-gray-950 min-w-[200px] whitespace-nowrap">
                      Employee
                    </TableHead>
                    <TableHead className="sticky left-[200px] z-10 bg-white dark:bg-gray-950 min-w-[120px] whitespace-nowrap">
                      Department
                    </TableHead>
                    {monthDays.map((day) => (
                      <TableHead 
                        key={format(day, 'yyyy-MM-dd')} 
                        className="text-center min-w-[100px] whitespace-nowrap"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            {format(day, 'EEE')}
                          </span>
                          <span className="font-medium">
                            {format(day, 'd')}
                          </span>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceByEmployee.map((employee) => (
                    <TableRow key={employee.id} className="hover:bg-muted/50">
                      <TableCell className="sticky left-0 z-10 bg-white dark:bg-gray-950 font-medium">
                        {employee.name}
                      </TableCell>
                      <TableCell className="sticky left-[200px] z-10 bg-white dark:bg-gray-950 text-muted-foreground">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
