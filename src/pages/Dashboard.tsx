import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  UserCheck, 
  UserX, 
  Calendar, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Search,
  Eye,
  Clock,
  Briefcase,
  Cake
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LoadingSpinner, EmptyState } from '@/components/common';
import { employeeService } from '@/services/employeeService';
import { attendanceService } from '@/services/attendanceService';
import { leaveService } from '@/services/leaveService';
import { ShiftService } from '@/services/shiftService';
import { useAuth } from '@/hooks/useAuth';
import { getOrganisationId } from '@/lib/shift-utils';
import { authToken } from '@/services/authToken';
import { useNavigate } from 'react-router-dom';
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from '@/components/ui/chart';
import { 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

// Mock data for charts (replace with real API data later)
// Using shades of #0B2E5C (navigation drawer color)
const employeeDistributionData = [
  { name: 'Software Engineer', value: 50, color: '#0B2E5C' },
  { name: 'UI/UX Designer', value: 28, color: '#0D3A6B' },
  { name: 'Data Analyst', value: 25, color: '#0F467A' },
  { name: 'Mobile Development', value: 10, color: '#115289' },
  { name: 'Project Manager', value: 7, color: '#135E98' },
];

const employeeChartConfig = {
  'Software Engineer': {
    label: "Software Engineer",
    color: '#0B2E5C',
  },
  'UI/UX Designer': {
    label: "UI/UX Designer",
    color: '#0D3A6B',
  },
  'Data Analyst': {
    label: "Data Analyst",
    color: '#0F467A',
  },
  'Mobile Development': {
    label: "Mobile Development",
    color: '#115289',
  },
  'Project Manager': {
    label: "Project Manager",
    color: '#135E98',
  },
};

// Mock events data (replace with real API data later)
const eventsData = [
  { id: 1, title: 'Marketing Meeting', type: 'Meeting', time: '8:00 am', date: '07/08/2024' },
  { id: 2, title: 'Development meeting', type: 'Job interview', time: '10:00 am', date: '08/08/2024' },
  { id: 3, title: 'Safety', type: 'Consulting', time: '11:30 am', date: '10/08/2024' },
  { id: 4, title: 'Meeting with Designer', type: 'Meeting', time: '13:00 pm', date: '11/08/2024' },
];

// Mock birthdays data (replace with real API data later)
const birthdaysData = [
  { id: 1, name: 'Madelyn Philips', role: 'Sr. UI/UX Designer', date: '12/08/2024', initials: 'MP' },
  { id: 2, name: 'Ann Stanton', role: 'HR Manager', date: '20/08/2024', initials: 'AS' },
  { id: 3, name: 'Terry Saris', role: 'Software Developer', date: '22/08/2024', initials: 'TS' },
  { id: 4, name: 'Jordyn Curtis', role: 'Design Head', date: '28/08/2024', initials: 'JC' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');
  const [shifts, setShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get organisation_id from user, with multiple fallbacks
  const organisationId = useMemo(() => {
    const fromUser = user?.organisation_id;
    const fromStorage = getOrganisationId();
    const fromAuthToken = authToken.getorganisationId();
    
    // Try all sources in order of preference
    const orgId = fromUser || fromStorage || fromAuthToken || '';
    
    return orgId;
  }, [user]);

  // Fetch shifts for dropdown
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

    if (organisationId) {
      fetchShifts();
    }
  }, [organisationId]);

  // Fetch employees for the table
  const { data: employeesResponse, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees', 'dashboard', { 
      organisationId,
      page: 1, 
      page_size: 10,
      search: debouncedSearchQuery
    }],
    queryFn: () => employeeService.getEmployees({ 
      organisation_id: organisationId,
      page: 1, 
      page_size: 10,
      search: debouncedSearchQuery || undefined,
      include: ['department', 'designation']
    }),
    enabled: !!organisationId,
  });

  // Fetch today's attendance statistics from API
  const { data: attendanceStatsResponse, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', 'statistics', 'dashboard', { 
      organisationId,
      shiftId: selectedShiftId
    }],
    queryFn: () => {
      return attendanceService.getTodayAttendanceStatistics({
        organisation_id: organisationId,
        shift_id: selectedShiftId
      });
    },
    enabled: !!organisationId && !!selectedShiftId,
  });

  // Fetch leave requests for "On Leave" count
  const { data: leaveRequestsResponse, isLoading: leavesLoading } = useQuery({
    queryKey: ['leave-requests', 'active'],
    queryFn: () => leaveService.getLeaveRequests({ 
      page: 1, 
      page_size: 100,
      status: 'APPROVED'
    }),
  });

  const employees = employeesResponse?.data || [];
  
  // Get statistics from API
  const statistics = attendanceStatsResponse?.data || {
    total_employees: 0,
    present: 0,
    absent: 0,
    on_leave: 0,
    half_day: 0
  };
  
  const totalPresent = statistics.present || 0;
  const totalAbsent = statistics.absent || 0;
  const totalOnLeave = statistics.on_leave || 0;
  const totalHalfDay = statistics.half_day || 0;

  const isLoading = employeesLoading || attendanceLoading || leavesLoading;

  // Get user's first name for greeting
  const firstName = user?.name?.split(' ')[0] || 'User';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Handle view employee
  const handleViewEmployee = (employee: any) => {
    navigate(`/admin/employees/${employee.id}`);
  };

  return (
    <div className="space-y-6">
      {/* First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hello John Card - Column 3 */}
        <div className="lg:col-span-3">
          <Card className="bg-white border-gray-200 h-full flex flex-col">
            <CardContent className="p-6 flex flex-col flex-1">
              {/* Illustration Placeholder - Reduced height */}
              <div className="mb-4 h-24 bg-gradient-to-br from-[#0B2E5C]/10 to-[#0B2E5C]/5 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="h-12 w-12 text-[#0B2E5C] opacity-30" />
                </div>
                {/* Floating icons */}
                <Clock className="absolute top-2 left-2 h-4 w-4 text-[#0B2E5C] opacity-50 animate-pulse" />
                <Briefcase className="absolute top-4 right-4 h-3 w-3 text-[#0B2E5C] opacity-50 animate-pulse delay-75" />
                <Calendar className="absolute bottom-3 left-4 h-3 w-3 text-[#0B2E5C] opacity-50 animate-pulse delay-150" />
              </div>

              {/* Greeting Text */}
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    HELLO {firstName.toUpperCase()}!
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                    {greeting}! You have {leaveRequestsResponse?.data?.filter((lr: any) => lr.status === 'PENDING').length || 0} new applications. 
                    It's a lot of work for today! So let's get started.
                  </p>
                </div>
                <Button className="w-full bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white">
                  Review it
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>

        {/* Right Section - Column 9 */}
        <div className="lg:col-span-9 space-y-6">
          {/* Shift Filter */}
          <div className="flex items-center justify-end">
            <Select 
              value={selectedShiftId} 
              onValueChange={setSelectedShiftId}
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
          </div>
          
          {/* Row 1: Total Attendance Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Total */}
            <Card className="bg-white border-gray-200">
              <CardContent className="pt-6 pb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {attendanceLoading ? '-' : statistics.total_employees}
                </div>
              </CardContent>
            </Card>

            {/* Total Present */}
            <Card className="bg-white border-gray-200">
              <CardContent className="pt-6 pb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Present</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {attendanceLoading ? '-' : totalPresent}
                </div>
              </CardContent>
            </Card>

            {/* Total Absent */}
            <Card className="bg-white border-gray-200">
              <CardContent className="pt-6 pb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Absent</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {attendanceLoading ? '-' : totalAbsent}
                </div>
              </CardContent>
            </Card>

            {/* Total Half Day */}
            <Card className="bg-white border-gray-200">
              <CardContent className="pt-6 pb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Half Day</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {attendanceLoading ? '-' : totalHalfDay}
                </div>
              </CardContent>
            </Card>

            {/* Total On Leave */}
            <Card className="bg-white border-gray-200">
              <CardContent className="pt-6 pb-6">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total On Leave</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {attendanceLoading ? '-' : totalOnLeave}
                </div>
              </CardContent>
            </Card>
          </div>
              
          {/* Row 2: Employee Chart and Events/Meetings */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Employee Chart - 7 columns */}
            <div className="lg:col-span-7">
              <Card className="bg-white border-gray-200 h-full flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Employee
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="w-48 h-48">
                    <ChartContainer 
                      config={employeeChartConfig}
                      className="h-full w-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={employeeDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {employeeDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                  <div className="flex-1 space-y-3 ml-6">
                    {employeeDistributionData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              </Card>
            </div>

            {/* Events and Meetings - 5 columns */}
            <div className="lg:col-span-5">
              <Card className="bg-white border-gray-200 h-full flex flex-col relative">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                  Events and Meetings
                </CardTitle>
                <Button variant="outline" size="sm" className="h-8 text-xs border-[#0B2E5C] text-[#0B2E5C] hover:bg-[#0B2E5C] hover:text-white" disabled>
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden flex flex-col p-0 relative">
                <div className="space-y-2 overflow-y-auto px-4 pb-4 blur-sm pointer-events-none" style={{ maxHeight: '200px' }}>
                  {eventsData.map((event) => (
                    <div key={event.id} className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-8 h-8 bg-[#0B2E5C]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-4 w-4 text-[#0B2E5C]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                          {event.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                          {event.type}
                        </p>
                        <div className="flex items-center space-x-1 mt-0.5">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {event.time}
                          </span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {event.date}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-b-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-1">Coming Soon</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">This feature is under development</div>
                  </div>
                </div>
              </CardContent>
              </Card>
            </div>
          </div>
                </div>
              </div>
              
      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Employee List - Column 8 */}
        <div className="lg:col-span-8">
          <Card className="bg-white border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Employee Status
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="h-8 text-xs border-[#0B2E5C] text-[#0B2E5C] hover:bg-[#0B2E5C] hover:text-white">
                      Sort & Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search employees..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="border rounded-lg overflow-x-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800">
                          <TableHead className="h-10 text-xs font-medium text-gray-600 dark:text-gray-400">ID</TableHead>
                          <TableHead className="h-10 text-xs font-medium text-gray-600 dark:text-gray-400">Name</TableHead>
                          <TableHead className="h-10 text-xs font-medium text-gray-600 dark:text-gray-400">Job role</TableHead>
                          <TableHead className="h-10 text-xs font-medium text-gray-600 dark:text-gray-400">Status</TableHead>
                          <TableHead className="h-10 text-xs font-medium text-gray-600 dark:text-gray-400">TL</TableHead>
                          <TableHead className="h-10 text-xs font-medium text-gray-600 dark:text-gray-400">View</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employeesLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <LoadingSpinner size="sm" />
                            </TableCell>
                          </TableRow>
                        ) : employees.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                              No employees found
                            </TableCell>
                          </TableRow>
                        ) : (
                          employees.slice(0, 4).map((employee: any) => (
                            <TableRow 
                              key={employee.id} 
                              className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                              onClick={() => handleViewEmployee(employee)}
                            >
                              <TableCell className="text-xs text-gray-900 dark:text-white">
                                {(employee as any).code || employee.id?.slice(-4) || 'N/A'}
                              </TableCell>
                              <TableCell className="text-xs font-medium text-gray-900 dark:text-white">
                                {employee.name || 'N/A'}
                              </TableCell>
                              <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                                {employee.designation?.name || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={employee.active_flag ? 'default' : 'secondary'}
                                  className={employee.active_flag 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                                  }
                                >
                                  {employee.active_flag ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                                {employee.department?.name || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewEmployee(employee);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
                </div>

        {/* Birthdays - Column 4 */}
        <div className="lg:col-span-4">
          <Card className="bg-white border-gray-200 relative">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    Birthdays
                  </CardTitle>
                  <Select defaultValue="This month" disabled>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="This month">This month</SelectItem>
                      <SelectItem value="Next month">Next month</SelectItem>
                      <SelectItem value="This year">This year</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4 blur-sm pointer-events-none">
                    {birthdaysData.map((person) => (
                      <div key={person.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[#0B2E5C]/10 text-[#0B2E5C]">
                            {person.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {person.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {person.role}
                  </p>
                </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <Cake className="h-3 w-3" />
                          <span>{person.date}</span>
              </div>
                      </div>
                    ))}
            </div>
                {/* Coming Soon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-b-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-400 dark:text-gray-500 mb-1">Coming Soon</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">This feature is under development</div>
                  </div>
                </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}
