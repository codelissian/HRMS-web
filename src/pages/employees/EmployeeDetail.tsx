import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ConfirmationDialog } from '@/components/common';
import { employeeService } from '@/services/employeeService';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Employee } from '../../types/database';
import { ArrowLeft, Edit, Download, Calendar, Clock, FileText, DollarSign, Plus, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { EmployeeAttendanceCalendar } from '@/components/employees/EmployeeAttendanceCalendar';
import { attendanceService } from '@/services/attendanceService';
import { salaryComponentService, SalaryComponent } from '@/services/salaryComponentService';
import { salaryComponentTypeService, SalaryComponentType } from '@/services/salaryComponentTypeService';
import { httpClient } from '@/lib/httpClient';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Salary Component Form States
  const [isSalaryComponentDialogOpen, setIsSalaryComponentDialogOpen] = useState(false);
  const [selectedComponentType, setSelectedComponentType] = useState('');
  const [calculationType, setCalculationType] = useState<'fixed' | 'percentage'>('fixed');
  const [componentValue, setComponentValue] = useState('');
  const [isSalaryComponentLoading, setIsSalaryComponentLoading] = useState(false);
  const [componentTypes, setComponentTypes] = useState<SalaryComponentType[]>([]);
  const [deletingComponentId, setDeletingComponentId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch employee details
  const { 
    data: employeeResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['employee', 'detail', id],
    queryFn: () => employeeService.getEmployee(id!, ['department', 'designation', 'shift', 'employee_leaves.leave']),
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

  // Fetch employee salary components
  const { data: salaryComponentsResponse } = useQuery({
    queryKey: ['employee', 'salary-components', id],
    queryFn: () => salaryComponentService.getEmployeeSalaryComponents(id!, employee?.organisation_id || ''),
    enabled: !!id && !!employee?.organisation_id,
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  // Fetch component types for the dropdown
  const fetchComponentTypes = async () => {
    try {
      const response = await salaryComponentTypeService.getSalaryComponentTypes({
        page: 1,
        page_size: 100
      });
      setComponentTypes(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch component types",
        variant: "destructive",
      });
    }
  };

  // Handle salary component form submission
  const handleSalaryComponentSubmit = async () => {
    if (!selectedComponentType || !componentValue) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if component already exists
    if (salaryComponentsResponse?.data) {
      const existingComponent = salaryComponentsResponse.data.find(
        comp => comp.salary_component_type_id === selectedComponentType
      );
      
      if (existingComponent) {
        const componentTypeName = componentTypes.find(type => type.id === selectedComponentType)?.name || 'this component type';
        toast({
          title: "Error",
          description: `A salary component for ${componentTypeName} already exists. Please select a different component type or delete the existing one first.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Validate percentage value
    if (calculationType === 'percentage') {
      const percentageValue = parseFloat(componentValue);
      if (isNaN(percentageValue) || percentageValue < 0 || percentageValue > 100) {
        toast({
          title: "Error",
          description: "Percentage value must be between 0 and 100",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate fixed amount value
    if (calculationType === 'fixed') {
      const fixedValue = parseFloat(componentValue);
      if (isNaN(fixedValue) || fixedValue < 0) {
        toast({
          title: "Error",
          description: "Fixed amount must be a positive number",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSalaryComponentLoading(true);
    try {
      const payload = {
        employee_id: id!,
        organisation_id: employee?.organisation_id!,
        salary_component_type_id: selectedComponentType,
        calculation: (calculationType === 'fixed' ? 'FIXED' : 'PERCENTAGE') as 'FIXED' | 'PERCENTAGE',
        value: parseFloat(componentValue)
      };

      await salaryComponentService.createSalaryComponent(payload);

      toast({
        title: "Success",
        description: "Salary component created successfully",
      });

      // Reset form
      setSelectedComponentType('');
      setCalculationType('fixed');
      setComponentValue('');
      setIsSalaryComponentDialogOpen(false);

      // Refresh salary components data
      queryClient.invalidateQueries({ queryKey: ['employee', 'salary-components', id] });
    } catch (error) {
      console.error('Error creating salary component:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create salary component",
        variant: "destructive",
      });
    } finally {
      setIsSalaryComponentLoading(false);
    }
  };

  // Handle delete salary component
  const handleDeleteSalaryComponent = async () => {
    if (!deletingComponentId) return;

    try {
      await httpClient.patch('/salary_components/internal/many', {
        id: deletingComponentId
      });

      toast({
        title: "Success",
        description: "Salary component deleted successfully",
      });

      // Reset delete state
      setDeletingComponentId(null);
      setShowDeleteDialog(false);

      // Refresh salary components data
      queryClient.invalidateQueries({ queryKey: ['employee', 'salary-components', id] });
    } catch (error) {
      console.error('Error deleting salary component:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete salary component",
        variant: "destructive",
      });
    }
  };

  // Handle delete button click
  const handleDeleteClick = (componentId: string) => {
    setDeletingComponentId(componentId);
    setShowDeleteDialog(true);
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


      {/* Employee Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Employee Overview</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/employees/${id}/edit`)}>
              <Edit className="h-4 w-4" />
            </Button>
          </div>
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
                    <span className="text-gray-900 dark:text-white">
                      {employee.department?.name || employee.department_id || 'Not assigned'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Designation:</span>
                    <span className="text-gray-900 dark:text-white">
                      {employee.designation?.name || employee.designation_id || 'Not assigned'}
                    </span>
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

      {/* Leave Balance Cards */}
      {employee.employee_leaves && employee.employee_leaves.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {employee.employee_leaves.map((employeeLeave) => {
            const leave = employeeLeave.leave;
            const daysLeft = employeeLeave.balance;
            
            return (
              <Card key={employeeLeave.id} className="relative overflow-hidden">
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: leave.color || '#6B7280' }}
                />
                <CardContent className="p-3 pl-4">
                  <div className="text-center">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-xs mb-1 truncate">
                      {leave.name}
                    </h3>
                    <div className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                      {daysLeft}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      days left
                    </p>
                  </div>
                  
                  {/* Additional leave info - more compact */}
                  <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      <div className="flex justify-between">
                        <span>Accrued:</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{employeeLeave.total_accrued}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Used:</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{employeeLeave.total_consumed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Next:</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {employeeLeave.next_accrual_date ? 
                            format(new Date(employeeLeave.next_accrual_date), 'MMM dd') : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No leave balances available</p>
            <p className="text-xs text-gray-400 mt-1">Leave balances will appear here once configured</p>
          </div>
        </Card>
      )}

      {/* Tabs for detailed information */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="leaves">Leave History</TabsTrigger>
          <TabsTrigger value="salary">Salary Components</TabsTrigger>
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
                  <span className="text-gray-900 dark:text-white">
                    {employee.shift?.name || employee.shift_id || 'Not assigned'}
                  </span>
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
              type: attendance.status === 'on-leave' ? 'leave' as const : 'attendance' as const,
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
                      <Badge variant={leave.status === 'APPROVED' ? 'default' : 'secondary'}>
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

        <TabsContent value="salary" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Salary Components
                </CardTitle>
                <Dialog open={isSalaryComponentDialogOpen} onOpenChange={setIsSalaryComponentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="flex items-center gap-2"
                      onClick={fetchComponentTypes}
                    >
                      <Plus className="h-4 w-4" />
                      Add Component
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md [&>button]:hidden">
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="text-xl font-semibold">Add Salary Component</DialogTitle>
                      <DialogDescription className="text-sm text-gray-600">
                        Create a new salary component for this employee
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Component Type Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="component-type" className="text-sm font-medium text-gray-700">
                          Component Type *
                        </Label>
                        <Select value={selectedComponentType} onValueChange={setSelectedComponentType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select component type" />
                          </SelectTrigger>
                          <SelectContent>
                            {componentTypes.map((type) => {
                              const isAlreadyUsed = salaryComponentsResponse?.data?.some(
                                comp => comp.salary_component_type_id === type.id
                              );
                              return (
                                <SelectItem 
                                  key={type.id} 
                                  value={type.id}
                                  disabled={isAlreadyUsed}
                                  className={isAlreadyUsed ? 'opacity-50' : ''}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>{type.name}</span>
                                    {isAlreadyUsed && (
                                      <span className="text-xs text-gray-500 ml-2">(Already exists)</span>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Component types that are already used for this employee are disabled.
                        </p>
                      </div>

                      {/* Fixed/Percentage Radio */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Calculation Type *
                        </Label>
                        <RadioGroup value={calculationType} onValueChange={(value: 'fixed' | 'percentage') => setCalculationType(value)} className="flex space-x-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id="fixed" />
                            <Label htmlFor="fixed">Fixed Amount</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="percentage" id="percentage" />
                            <Label htmlFor="percentage">Percentage</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {/* Value Input */}
                      <div className="space-y-2">
                        <Label htmlFor="value" className="text-sm font-medium text-gray-700">
                          Value *
                        </Label>
                        <Input
                          id="value"
                          type="number"
                          value={componentValue}
                          onChange={(e) => setComponentValue(e.target.value)}
                          placeholder={calculationType === 'fixed' ? 'Enter amount' : 'Enter percentage'}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsSalaryComponentDialogOpen(false)}
                        disabled={isSalaryComponentLoading}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSalaryComponentSubmit}
                        disabled={isSalaryComponentLoading}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                      >
                        {isSalaryComponentLoading ? "Creating..." : "Create Component"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {salaryComponentsResponse?.data && salaryComponentsResponse.data.length > 0 ? (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-600 dark:text-green-400">Basic Salary</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                              ₹{salaryComponentsResponse.data
                                .filter(comp => comp.salary_component_type?.type === 'BASIC')
                                .reduce((sum, comp) => sum + comp.value, 0)
                                .toLocaleString()}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Allowances</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                              ₹{salaryComponentsResponse.data
                                .filter(comp => comp.salary_component_type?.type === 'ALLOWANCE')
                                .reduce((sum, comp) => sum + comp.value, 0)
                                .toLocaleString()}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">Deductions</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                              ₹{salaryComponentsResponse.data
                                .filter(comp => comp.salary_component_type?.type === 'DEDUCTION')
                                .reduce((sum, comp) => sum + comp.value, 0)
                                .toLocaleString()}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-red-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Detailed Components Table */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Component Details</h3>
                    <div className="space-y-2">
                      {salaryComponentsResponse.data
                        .sort((a, b) => (a.salary_component_type?.sequence || 0) - (b.salary_component_type?.sequence || 0))
                        .map((component: SalaryComponent) => (
                        <div key={component.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {component.salary_component_type?.name || 'Unknown Component'}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {component.salary_component_type?.type || 'Unknown Type'} • 
                                  {component.calculation === 'FIXED' ? 'Fixed Amount' : 'Percentage'}
                                  {component.salary_component_type?.sequence && ` • Sequence: ${component.salary_component_type.sequence}`}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {component.calculation === 'FIXED' 
                                    ? `₹${component.value.toLocaleString()}`
                                    : `${component.value}%`
                                  }
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {component.salary_component_type?.type || 'Unknown'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(component.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Net Salary Calculation */}
                  <Card className="bg-gray-50 dark:bg-gray-800/50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Net Salary</h3>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ₹{(() => {
                            const basic = salaryComponentsResponse.data
                              .filter(comp => comp.salary_component_type?.type === 'BASIC')
                              .reduce((sum, comp) => sum + comp.value, 0);
                            const allowances = salaryComponentsResponse.data
                              .filter(comp => comp.salary_component_type?.type === 'ALLOWANCE')
                              .reduce((sum, comp) => sum + comp.value, 0);
                            const deductions = salaryComponentsResponse.data
                              .filter(comp => comp.salary_component_type?.type === 'DEDUCTION')
                              .reduce((sum, comp) => sum + comp.value, 0);
                            return (basic + allowances - deductions).toLocaleString();
                          })()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-500 dark:text-gray-400">No salary components configured</p>
                  <p className="text-sm text-gray-400 mt-1">Salary components will appear here once configured</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={showDeleteDialog}
          onOpenChange={(open) => {
            setShowDeleteDialog(open);
            if (!open) {
              setDeletingComponentId(null);
            }
          }}
          onConfirm={handleDeleteSalaryComponent}
          title="Delete Salary Component"
          description="Are you sure you want to delete this salary component? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="delete"
        />

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

    </div>
  );
}
