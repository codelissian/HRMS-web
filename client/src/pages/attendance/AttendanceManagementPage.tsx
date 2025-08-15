import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  RefreshCw
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { attendanceService, AttendanceRecord, AttendanceStats } from '@/services/attendanceService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';



export default function AttendanceManagementPage() {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // API calls
  const { data: statsResponse, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['attendance', 'stats', selectedMonth, selectedYear],
    queryFn: () => attendanceService.getAttendanceStats(selectedMonth, selectedYear),
    enabled: true,
  });

  const { data: attendanceResponse, isLoading: attendanceLoading, refetch: refetchAttendance } = useQuery({
    queryKey: ['attendance', 'list', selectedMonth, selectedYear, searchQuery, filterDepartment, filterStatus],
    queryFn: () => attendanceService.getAttendanceList({
      month: selectedMonth,
      year: selectedYear,
      search: searchQuery || undefined,
      department: filterDepartment !== 'all' ? filterDepartment : undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      page: 1,
      page_size: 100
    }),
    enabled: true,
  });

  // Show loading state if either stats or attendance is loading
  const isLoading = statsLoading || attendanceLoading;

  const handleRefresh = async () => {
    try {
      await Promise.all([refetchStats(), refetchAttendance()]);
      toast({
        title: "Success",
        description: "Attendance data refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh attendance data",
        variant: "destructive",
      });
    }
  };

  const stats = statsResponse?.data;
  const attendanceRecords = attendanceResponse?.data || [];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'half-day': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'on-leave': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'weekend': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <UserCheck className="h-4 w-4" />;
      case 'absent': return <Clock className="h-4 w-4" />;
      case 'half-day': return <Clock className="h-4 w-4" />;
      case 'on-leave': return <Calendar className="h-4 w-4" />;
      case 'weekend': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredEmployees = attendanceRecords.filter(employee => {
    const matchesSearch = employee.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         employee.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || employee.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || employee.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = Array.from(new Set(attendanceRecords.map(emp => emp.department)));

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
            Attendance Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor employee attendance and manage work schedules
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Generate Report
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
            
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
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

            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
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
              setSelectedMonth(new Date().getMonth());
              setSelectedYear(new Date().getFullYear());
            }}>
              Current Month
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white dark:bg-gray-850 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.total_employees || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-850 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Present Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.present_today || 0}
                </p>
                <div className="flex items-center text-sm mt-1">
                  {stats && stats.attendance_rate > stats.previous_month_rate ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={stats && stats.attendance_rate > stats.previous_month_rate ? "text-green-600" : "text-red-600"}>
                    {stats?.attendance_rate || 0}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-850 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Absent Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.absent_today || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {stats && stats.total_employees > 0 ? ((stats.absent_today / stats.total_employees) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-850 hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">On Leave</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.on_leave_today || 0}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  + Half Day: {stats?.half_day_today || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
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
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredEmployees.length} of {attendanceRecords.length} employees
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employee Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Attendance - {months[selectedMonth]} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Employee</th>
                  <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Department</th>
                  <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Check In</th>
                  <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Check Out</th>
                  <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Total Hours</th>
                  <th className="text-left p-3 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                         <td className="p-3">
                       <div className="flex items-center space-x-3">
                         <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                           {employee.avatar ? (
                             <img src={employee.avatar} alt={employee.employee_name} className="w-8 h-8 rounded-full" />
                           ) : (
                             <Users className="h-4 w-4 text-gray-500" />
                           )}
                         </div>
                         <div>
                           <div className="font-medium text-gray-900 dark:text-white">{employee.employee_name}</div>
                           <div className="text-sm text-gray-500 dark:text-gray-400">{employee.designation}</div>
                         </div>
                       </div>
                     </td>
                     <td className="p-3 text-gray-900 dark:text-white">{employee.department}</td>
                     <td className="p-3">
                       <Badge className={getStatusColor(employee.status)}>
                         <div className="flex items-center gap-1">
                           {getStatusIcon(employee.status)}
                           {employee.status.replace('-', ' ')}
                         </div>
                       </Badge>
                     </td>
                     <td className="p-3 text-gray-900 dark:text-white">
                       {employee.check_in_time || '-'}
                     </td>
                     <td className="p-3 text-gray-900 dark:text-white">
                       {employee.check_out_time || '-'}
                     </td>
                     <td className="p-3 text-gray-900 dark:text-white">
                       {employee.total_hours ? `${employee.total_hours}h` : '-'}
                     </td>
                    <td className="p-3">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
