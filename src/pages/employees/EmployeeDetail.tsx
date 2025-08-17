import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { EmployeeAttendanceCalendar } from '@/components/employees/EmployeeAttendanceCalendar';
import { employeeService } from '@/services/employeeService';
import { attendanceService } from '@/services/attendanceService';
import { Employee } from '@shared/schema';
import { ArrowLeft, Edit, Download, Calendar, Clock, FileText, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showEditForm, setShowEditForm] = useState(false);

  // Fetch employee details
  const { 
    data: employeeResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['employee', 'detail', id],
    queryFn: () => employeeService.getEmployee(id!),
    enabled: !!id,
  });

  const employee = employeeResponse?.data;

  // Fetch employee attendance
  const { data: attendanceResponse } = useQuery({
    queryKey: ['employee', 'attendance', id],
    queryFn: () => attendanceService.getEmployeeAttendance(id!, { page: 1, page_size: 100 }),
    enabled: !!id,
  });

  // Fetch employee leave history
  const { data: leaveHistoryResponse } = useQuery({
    queryKey: ['employee', 'leave-history', id],
    queryFn: () => employeeService.getLeaveHistory(id!, { page: 1, page_size: 10 }),
    enabled: !!id,
  });

  // Fetch employee documents
  const { data: documentsResponse } = useQuery({
    queryKey: ['employee', 'documents', id],
    queryFn: () => employeeService.getDocuments(id!),
    enabled: !!id,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">
          Error loading employee: {error instanceof Error ? error.message : 'Employee not found'}
        </p>
        <Button onClick={() => navigate('/admin/employees')} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/admin/employees')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditForm(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Employee Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-white text-lg">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {employee.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">{employee.email}</p>
                  <p className="text-gray-500 dark:text-gray-400">{employee.mobile}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Status:</span>
                    <Badge 
                      variant={employee.status === 'active' ? 'default' : 'secondary'}
                      className={employee.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                    >
                      {employee.status || 'Active'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Department:</span>
                    <span className="text-gray-900 dark:text-white">{employee.department_id || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Designation:</span>
                    <span className="text-gray-900 dark:text-white">{employee.designation_id || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Joining Date:</span>
                    <span className="text-gray-900 dark:text-white">
                      {employee.joining_date ? format(new Date(employee.joining_date), 'MMM dd, yyyy') : 'Not set'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leave History</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Date of Birth:</span>
                  <span className="text-gray-900 dark:text-white">
                    {employee.date_of_birth ? format(new Date(employee.date_of_birth), 'MMM dd, yyyy') : 'Not set'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Emergency Contact:</span>
                  <span className="text-gray-900 dark:text-white">{employee.emergency_contact || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">PAN Number:</span>
                  <span className="text-gray-900 dark:text-white">{employee.pan_number || 'Not set'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Address:</span>
                  <span className="text-gray-900 dark:text-white">{employee.address || 'Not set'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Work Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Shift:</span>
                  <span className="text-gray-900 dark:text-white">{employee.shift_id || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Role:</span>
                  <span className="text-gray-900 dark:text-white">{employee.role_id || 'Not assigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Payroll Included:</span>
                  <Badge variant={employee.included_in_payroll ? 'default' : 'secondary'}>
                    {employee.included_in_payroll ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          {/* Convert API attendance data to calendar events */}
          {(() => {
            const attendanceEvents = attendanceResponse?.data?.map(attendance => ({
              id: attendance.id,
              date: attendance.date,
              type: attendance.status === 'on-leave' ? 'leave' : 'attendance',
              title: attendance.status === 'on-leave' ? 'On Leave' : 
                     attendance.status === 'half-day' ? 'Half Day' : 
                     attendance.status === 'present' ? 'Present' : 'Absent',
              status: attendance.status,
              leaveType: attendance.status === 'on-leave' ? 'personal' : undefined,
              description: attendance.status === 'on-leave' ? 'Employee on leave' : undefined,
              checkInTime: attendance.check_in_time,
              checkOutTime: attendance.check_out_time,
              totalHours: attendance.total_hours,
              lateMinutes: attendance.late_minutes,
              earlyDeparture: attendance.early_departure
            })) || [];

            return (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Attendance Calendar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EmployeeAttendanceCalendar
                      employeeId={employee.id}
                      employeeName={employee.name}
                      events={attendanceEvents}
                      onDateClick={(date) => console.log('Date clicked:', date)}
                      onEventClick={(event) => console.log('Event clicked:', event)}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Recent Attendance Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attendanceResponse?.data && attendanceResponse.data.length > 0 ? (
                      <div className="space-y-2">
                        {attendanceResponse.data.map((attendance: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-2 border rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{attendance.date}</span>
                                {attendance.check_in_time && (
                                  <span className="text-sm text-gray-500">
                                    In: {attendance.check_in_time}
                                  </span>
                                )}
                                {attendance.check_out_time && (
                                  <span className="text-sm text-gray-500">
                                    Out: {attendance.check_out_time}
                                  </span>
                                )}
                              </div>
                              {attendance.total_hours && (
                                <p className="text-sm text-gray-500">
                                  Total: {attendance.total_hours}h
                                </p>
                              )}
                            </div>
                            <Badge variant={attendance.status === 'present' ? 'default' : 'secondary'}>
                              {attendance.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No attendance records found
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Leave History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaveHistoryResponse?.data && leaveHistoryResponse.data.length > 0 ? (
                <div className="space-y-2">
                  {leaveHistoryResponse.data.map((leave: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <span className="font-medium">{leave.leave_type}</span>
                        <p className="text-sm text-gray-500">{leave.from_date} - {leave.to_date}</p>
                      </div>
                      <Badge variant={leave.status === 'approved' ? 'default' : 'secondary'}>
                        {leave.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No leave history found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documentsResponse?.data && documentsResponse.data.length > 0 ? (
                <div className="space-y-2">
                  {documentsResponse.data.map((document: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <span>{document.name}</span>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No documents found
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Employee Form Modal */}
      <EmployeeForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        onSubmit={(data) => {
          // TODO: Implement update functionality
          console.log('Update employee:', data);
          setShowEditForm(false);
        }}
        loading={false}
        initialData={employee}
        title="Edit Employee"
        description="Update employee information"
      />
    </div>
  );
}
