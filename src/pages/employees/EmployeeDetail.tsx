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
import { ArrowLeft, Edit, Download, Calendar, Clock, FileText, DollarSign, Plus, Trash2, Mail, Phone, MapPin, Briefcase, User, Building2, CalendarDays, UserCircle, Home, Heart, GraduationCap, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeTable } from '@/components/employees/EmployeeTable';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
  const [deletingComponentName, setDeletingComponentName] = useState<string>('');
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
      setDeletingComponentName('');
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
    // Find the component to get its type name
    const component = salaryComponentsResponse?.data?.find(comp => comp.id === componentId);
    const componentTypeName = component?.salary_component_type?.name || 'Unknown Component';
    
    setDeletingComponentId(componentId);
    setDeletingComponentName(componentTypeName);
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <User className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Employee Not Found
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-6">
            {error instanceof Error ? error.message : 'The employee you are looking for does not exist'}
          </p>
          <Button onClick={() => navigate('/admin/employees')} className="bg-[#0B2E5C] hover:bg-[#0B2E5C]/90">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">

      {/* Basic Information Card */}
      <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
        <CardHeader className="relative pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Basic information</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-8 w-8 text-gray-500 hover:text-[#0B2E5C] hover:bg-[#0B2E5C]/10"
            onClick={() => navigate(`/admin/employees/${id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Employee Photo */}
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 border-2 border-gray-200 dark:border-gray-700">
                <AvatarFallback className="bg-[#0B2E5C] text-white text-3xl font-semibold">
                  {getInitials(employee.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Employee Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{employee.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <UserCircle className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">ID Number</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.id || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <UserCircle className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.gender || 'Not set'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.mobile || 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Place of Birth</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.place_of_birth || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Birth Date</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {employee.date_of_birth ? format(new Date(employee.date_of_birth), 'dd MMM yyyy') : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Blood Type</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.blood_type || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Marital Status</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.marital_status || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Religion</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{employee.religion || 'Not set'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      <Tabs defaultValue="attendance" className="space-y-6">
        <TabsList className="h-auto p-0 bg-transparent border-b border-gray-200 dark:border-gray-700 rounded-none">
          <TabsTrigger 
            value="attendance" 
            className="data-[state=active]:bg-transparent data-[state=active]:text-[#0B2E5C] data-[state=active]:border-b-2 data-[state=active]:border-[#0B2E5C] data-[state=active]:shadow-none rounded-none px-4 py-3 font-medium dark:data-[state=active]:text-[#0B2E5C]"
          >
            Attendance
          </TabsTrigger>
          <TabsTrigger 
            value="salary"
            className="data-[state=active]:bg-transparent data-[state=active]:text-[#0B2E5C] data-[state=active]:border-b-2 data-[state=active]:border-[#0B2E5C] data-[state=active]:shadow-none rounded-none px-4 py-3 font-medium dark:data-[state=active]:text-[#0B2E5C]"
          >
            Salary
          </TabsTrigger>
          <TabsTrigger 
            value="documents"
            className="data-[state=active]:bg-transparent data-[state=active]:text-[#0B2E5C] data-[state=active]:border-b-2 data-[state=active]:border-[#0B2E5C] data-[state=active]:shadow-none rounded-none px-4 py-3 font-medium dark:data-[state=active]:text-[#0B2E5C]"
          >
            Documents
          </TabsTrigger>
          <TabsTrigger 
            value="leave-balance"
            className="data-[state=active]:bg-transparent data-[state=active]:text-[#0B2E5C] data-[state=active]:border-b-2 data-[state=active]:border-[#0B2E5C] data-[state=active]:shadow-none rounded-none px-4 py-3 font-medium dark:data-[state=active]:text-[#0B2E5C]"
          >
            Leave Balance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leave-balance" className="space-y-6">
          {employee.employee_leaves && employee.employee_leaves.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {employee.employee_leaves.map((employeeLeave) => {
                const leave = employeeLeave.leave;
                const daysLeft = employeeLeave.balance;
                const usedPercentage = employeeLeave.total_accrued > 0 
                  ? (employeeLeave.total_consumed / employeeLeave.total_accrued) * 100 
                  : 0;
                
                return (
                  <Card 
                    key={employeeLeave.id} 
                    className="relative overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                    style={{ borderLeftColor: leave.color || '#6B7280', borderLeftWidth: '4px' }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 truncate">
                            {leave.name}
                          </h3>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                              {daysLeft}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">days</span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>Used: {employeeLeave.total_consumed}</span>
                            <span>Total: {employeeLeave.total_accrued}</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${Math.min(usedPercentage, 100)}%`,
                                backgroundColor: leave.color || '#6B7280'
                              }}
                            />
                          </div>
                        </div>

                        {/* Additional Info */}
                        {employeeLeave.next_accrual_date && (
                          <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Next accrual: <span className="font-medium text-gray-700 dark:text-gray-300">
                                {format(new Date(employeeLeave.next_accrual_date), 'MMM dd, yyyy')}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="text-center py-12 border border-gray-200 dark:border-gray-700">
              <div className="text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm font-medium mb-1">No leave balances available</p>
                <p className="text-xs text-gray-400">Leave balances will appear here once configured</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="attendance" className="space-y-6">
          <div className="space-y-6">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
              <CardHeader className="relative pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <EmployeeAttendanceCalendar
                  employeeId={employee.id}
                  employeeName={employee.name}
                  organisationId={employee.organisation_id}
                  onDateClick={(date) => console.log('Date clicked:', date)}
                  onEventClick={(event) => console.log('Event clicked:', event)}
                />
              </CardContent>
            </Card>
        </TabsContent>


        <TabsContent value="salary" className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="relative pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Salary Components</CardTitle>
                <div className="flex items-center gap-2">
                  <Dialog open={isSalaryComponentDialogOpen} onOpenChange={setIsSalaryComponentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="flex items-center gap-2 bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white"
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
                        className="w-full sm:w-auto bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white"
                      >
                        {isSalaryComponentLoading ? "Creating..." : "Create Component"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {salaryComponentsResponse?.data && salaryComponentsResponse.data.length > 0 ? (
                <div className="space-y-4">
                  {/* Detailed Components Table */}
                  <div className="space-y-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                            <TableHead className="font-semibold text-gray-900 dark:text-white">Component Name</TableHead>
                            <TableHead className="font-semibold text-gray-900 dark:text-white">Type</TableHead>
                            <TableHead className="font-semibold text-gray-900 dark:text-white">Calculation Type</TableHead>
                            <TableHead className="font-semibold text-gray-900 dark:text-white text-right">Value</TableHead>
                            <TableHead className="font-semibold text-gray-900 dark:text-white text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salaryComponentsResponse.data
                            .sort((a, b) => (a.salary_component_type?.sequence || 0) - (b.salary_component_type?.sequence || 0))
                            .map((component: SalaryComponent) => (
                            <TableRow key={component.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <TableCell className="font-medium text-gray-900 dark:text-white">
                                {component.salary_component_type?.name || 'Unknown Component'}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {component.salary_component_type?.type || 'Unknown'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-gray-600 dark:text-gray-400">
                                {component.calculation === 'FIXED' ? 'Fixed Amount' : 'Percentage'}
                              </TableCell>
                              <TableCell className="text-right font-semibold text-gray-900 dark:text-white">
                                {component.calculation === 'FIXED' 
                                  ? `₹${component.value.toLocaleString()}`
                                  : `${component.value}%`
                                }
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(component.id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Net Salary Calculation */}
                  <Card className="bg-gradient-to-r from-[#0B2E5C] to-[#0B2E5C]/90 border border-[#0B2E5C]">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">Net Salary</h3>
                          <p className="text-sm text-white/80">Total monthly compensation</p>
                        </div>
                        <p className="text-3xl font-bold text-white">
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
              setDeletingComponentName('');
            }
          }}
          onConfirm={handleDeleteSalaryComponent}
          title="Delete Salary Component"
          description={`Are you sure you want to delete the salary component type "${deletingComponentName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />

        <TabsContent value="documents" className="space-y-6">
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="relative pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {documentsResponse?.data && documentsResponse.data.length > 0 ? (
                <div className="space-y-3">
                  {documentsResponse.data.map((document: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#0B2E5C]/10 dark:bg-[#0B2E5C]/20 rounded-lg">
                          <FileText className="h-5 w-5 text-[#0B2E5C]" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{document.name}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-[#0B2E5C] text-[#0B2E5C] hover:bg-[#0B2E5C] hover:text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No documents found</p>
                  <p className="text-sm text-gray-400 mt-1">Uploaded documents will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}
