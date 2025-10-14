import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Settings, Calculator, DollarSign, Plus, Trash2, Edit, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { httpClient } from '@/lib/httpClient';
import { ApiResponse } from '@/types/api';
import { Employee } from '@/types/database';
import { employeeService } from '@/services/employeeService';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { useAuth } from '@/hooks/useAuth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ComponentType {
  id: string;
  name: string;
  type?: string;
  sequence?: number;
  created_at: string;
  updated_at: string;
}

export function PayrollPage() {
  const [activeTab, setActiveTab] = useState('salary-components');
  
  // Salary Component Dialog States
  const [isSalaryComponentDialogOpen, setIsSalaryComponentDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedComponentType, setSelectedComponentType] = useState('');
  const [calculationType, setCalculationType] = useState<'fixed' | 'percentage'>('fixed');
  const [componentValue, setComponentValue] = useState('');
  const [sequence, setSequence] = useState('');
  const [isTaxable, setIsTaxable] = useState(false);
  const [isSalaryComponentLoading, setIsSalaryComponentLoading] = useState(false);
  
  // Employee List States
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
  const [employeeDropdownOpen, setEmployeeDropdownOpen] = useState(false);
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchComponentTypes = async () => {
    try {
      const response = await httpClient.post<ApiResponse<ComponentType[]>>('/salary_component_types/list', {
        page: 1,
        page_size: 100
      });
      setComponentTypes(response.data.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch component types",
        variant: "destructive",
      });
    }
  };

  const fetchEmployees = async () => {
    setIsEmployeesLoading(true);
    try {
      const response = await employeeService.getEmployees({
        page: 1,
        page_size: 100,
        include: ['department', 'designation']
      });
      setEmployees(response.data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch employees",
        variant: "destructive",
      });
    } finally {
      setIsEmployeesLoading(false);
    }
  };


  const handleSalaryComponentSubmit = async () => {
    if (!selectedEmployee || !selectedComponentType || !componentValue || !sequence) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
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

    // Validate sequence
    const sequenceValue = parseInt(sequence);
    if (isNaN(sequenceValue) || sequenceValue < 1) {
      toast({
        title: "Error",
        description: "Sequence must be a positive integer",
        variant: "destructive",
      });
      return;
    }

    setIsSalaryComponentLoading(true);
    try {
      // Get organisation_id from user context
      const organisationId = user?.organisation_id;
      if (!organisationId) {
        throw new Error('Organisation ID not found');
      }

      // Prepare payload according to the specified structure
      const payload = {
        employee_id: selectedEmployee,
        organisation_id: organisationId,
        type_id: selectedComponentType,
        calculation: calculationType === 'fixed' ? 'FIXED' : 'PERCENTAGE',
        value: parseFloat(componentValue),
        sequence: sequenceValue,
        is_taxable: isTaxable
      };

      // Make API call to create salary component
      const response = await httpClient.post<ApiResponse<any>>(API_ENDPOINTS.SALARY_COMPONENTS_CREATE, payload);

      if (response.data.status) {
        toast({
          title: "Success",
          description: "Salary component created successfully",
        });
        
        // Reset form
        setSelectedEmployee('');
        setSelectedComponentType('');
        setCalculationType('fixed');
        setComponentValue('');
        setSequence('');
        setIsTaxable(false);
        setIsSalaryComponentDialogOpen(false);
      } else {
        throw new Error(response.data.message || 'Failed to create salary component');
      }
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

  useEffect(() => {
    if (activeTab === 'salary-components') {
      fetchComponentTypes(); // Need component types for the dropdown
      fetchEmployees(); // Fetch employees for the dropdown
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="salary-components" 
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white hover:bg-green-50 hover:text-green-600"
          >
            Salary Components
          </TabsTrigger>
          <TabsTrigger 
            value="payroll" 
            className="data-[state=active]:bg-orange-500 data-[state=active]:text-white hover:bg-orange-50 hover:text-orange-600"
          >
            Payroll
          </TabsTrigger>
        </TabsList>


        <TabsContent value="salary-components" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Salary Components Management
                </CardTitle>
                <Dialog open={isSalaryComponentDialogOpen} onOpenChange={setIsSalaryComponentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Component
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg [&>button]:hidden">
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="text-xl font-semibold">Add Salary Component</DialogTitle>
                      <DialogDescription className="text-sm text-gray-600">
                        Create a new salary component for an employee
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      {/* Employee Dropdown */}
                      <div className="space-y-2">
                        <Label htmlFor="employee" className="text-sm font-medium text-gray-700">
                          Employee *
                        </Label>
                         <Popover open={employeeDropdownOpen} onOpenChange={setEmployeeDropdownOpen}>
                           <PopoverTrigger asChild>
                             <Button
                               variant="outline"
                               role="combobox"
                               aria-expanded={employeeDropdownOpen}
                               className="w-full justify-between"
                               disabled={isEmployeesLoading}
                             >
                               {selectedEmployee
                                 ? employees.find((employee) => employee.id === selectedEmployee)?.name || "Select employee..."
                                 : isEmployeesLoading ? "Loading employees..." : "Select an employee"}
                               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                             </Button>
                           </PopoverTrigger>
                           <PopoverContent className="w-full p-0">
                             <Command>
                               <CommandInput placeholder="Search employee by name or email..." />
                               <CommandList>
                                 <CommandEmpty>No employee found.</CommandEmpty>
                                 <CommandGroup>
                                   {employees.map((employee) => (
                                     <CommandItem
                                       key={employee.id}
                                       value={`${employee.name} ${employee.email || ''}`}
                                       onSelect={() => {
                                         setSelectedEmployee(employee.id === selectedEmployee ? "" : employee.id);
                                         setEmployeeDropdownOpen(false);
                                       }}
                                     >
                                       <Check
                                         className={`mr-2 h-4 w-4 ${
                                           selectedEmployee === employee.id ? "opacity-100" : "opacity-0"
                                         }`}
                                       />
                                       <div className="flex flex-col">
                                         <span className="font-medium">{employee.name}</span>
                                         {employee.email && (
                                           <span className="text-sm text-gray-500">{employee.email}</span>
                                         )}
                                       </div>
                                     </CommandItem>
                                   ))}
                                 </CommandGroup>
                               </CommandList>
                             </Command>
                           </PopoverContent>
                         </Popover>
                      </div>

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
                            {componentTypes.map((type: ComponentType) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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

                      {/* Sequence Input */}
                      <div className="space-y-2">
                        <Label htmlFor="sequence" className="text-sm font-medium text-gray-700">
                          Sequence *
                        </Label>
                        <Input
                          id="sequence"
                          type="number"
                          value={sequence}
                          onChange={(e) => setSequence(e.target.value)}
                          placeholder="Enter sequence number"
                          className="w-full"
                        />
                      </div>

                      {/* Is Taxable Switch */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">
                          Tax Status
                        </Label>
                        <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                          <Switch
                            id="taxable"
                            checked={isTaxable}
                            onCheckedChange={setIsTaxable}
                          />
                          <div className="flex flex-col">
                            <Label htmlFor="taxable" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                              {isTaxable ? 'Taxable Component' : 'Non-Taxable Component'}
                            </Label>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {isTaxable ? 'This component will be subject to taxation' : 'This component is exempt from taxation'}
                            </span>
                          </div>
                        </div>
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
              <div className="text-center py-12">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Salary Components
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Define salary structures, basic pay, allowances, and other compensation components.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payroll Processing
              </CardTitle>
              <CardDescription>
                Process monthly payroll, generate payslips, and manage payroll reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Payroll Processing
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Process monthly payroll, generate employee payslips, and create payroll reports.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PayrollPage;