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
  created_at: string;
  updated_at: string;
}

// Component type options for the dropdown
const COMPONENT_TYPE_OPTIONS = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'ALLOWANCE', label: 'Allowance' },
  { value: 'DEDUCTION', label: 'Deduction' },
  { value: 'EMPLOYER_CONTRIBUTION', label: 'Employer Contribution' }
] as const;

export function PayrollPage() {
  const [activeTab, setActiveTab] = useState('component-types');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [componentTypeName, setComponentTypeName] = useState('');
  const [componentType, setComponentType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingComponentType, setEditingComponentType] = useState<ComponentType | null>(null);
  const [editComponentTypeName, setEditComponentTypeName] = useState('');
  const [editComponentType, setEditComponentType] = useState('');
  const [isEditLoading, setIsEditLoading] = useState(false);
  
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
  
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchComponentTypes = async () => {
    setIsLoadingList(true);
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
    } finally {
      setIsLoadingList(false);
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

  const handleDeleteComponentType = async (id: string) => {
    setDeletingId(id);
    try {
      await httpClient.patch<ApiResponse<any>>('/salary_component_types/delete', {
        id
      }, {
        includeOrganisationId: false
      });

      toast({
        title: "Success",
        description: "Component type deleted successfully",
      });
      // Refresh the list
      fetchComponentTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete component type",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (componentType: ComponentType) => {
    setEditingComponentType(componentType);
    setEditComponentTypeName(componentType.name);
    setEditComponentType(componentType.type || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateComponentType = async () => {
    if (!editComponentTypeName.trim() || !editingComponentType) {
      toast({
        title: "Error",
        description: "Please enter a component type name",
        variant: "destructive",
      });
      return;
    }

    if (!editComponentType) {
      toast({
        title: "Error",
        description: "Please select a component type",
        variant: "destructive",
      });
      return;
    }

    setIsEditLoading(true);
    try {
      await httpClient.put<ApiResponse<any>>('/salary_component_types/update', {
        id: editingComponentType.id,
        name: editComponentTypeName.trim(),
        type: editComponentType
      });

      toast({
        title: "Success",
        description: "Component type updated successfully",
      });
      setEditComponentTypeName('');
      setEditComponentType('');
      setIsEditDialogOpen(false);
      setEditingComponentType(null);
      // Refresh the list
      fetchComponentTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update component type",
        variant: "destructive",
      });
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleCreateComponentType = async () => {
    if (!componentTypeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a component type name",
        variant: "destructive",
      });
      return;
    }

    if (!componentType) {
      toast({
        title: "Error",
        description: "Please select a component type",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await httpClient.post<ApiResponse<any>>('/salary_component_types/create', {
        name: componentTypeName.trim(),
        type: componentType
      });

      toast({
        title: "Success",
        description: "Component type created successfully",
      });
      setComponentTypeName('');
      setComponentType('');
      setIsDialogOpen(false);
      // Refresh the list
      fetchComponentTypes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create component type",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
    if (activeTab === 'component-types') {
      fetchComponentTypes();
    } else if (activeTab === 'salary-components') {
      fetchComponentTypes(); // Need component types for the dropdown
      fetchEmployees(); // Fetch employees for the dropdown
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="component-types" 
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-blue-50 hover:text-blue-600"
          >
            Component Types
          </TabsTrigger>
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

        <TabsContent value="component-types" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Salary Component Types
                  </h2>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Component Type
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md [&>button]:hidden">
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="text-xl font-semibold">Add Component Type</DialogTitle>
                      <DialogDescription className="text-sm text-gray-600">
                        Create a new salary component type for your payroll system
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                          Component Type Name
                        </Label>
                        <Input
                          id="name"
                          value={componentTypeName}
                          onChange={(e) => setComponentTypeName(e.target.value)}
                          placeholder="e.g., HRA, Allowance, Bonus"
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                          Type *
                        </Label>
                        <Select value={componentType} onValueChange={setComponentType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select component type" />
                          </SelectTrigger>
                          <SelectContent>
                            {COMPONENT_TYPE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCreateComponentType}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                      >
                        {isLoading ? "Creating..." : "Create Component Type"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingList ? (
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Loading...
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Fetching component types
                  </p>
                </div>
              ) : componentTypes.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No Component Types
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Start by creating your first component type using the button above.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {componentTypes.map((componentType) => (
                      <TableRow key={componentType.id}>
                        <TableCell className="font-medium">
                          {componentType.name}
                        </TableCell>
                        <TableCell>
                          {componentType.type ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {COMPONENT_TYPE_OPTIONS.find(opt => opt.value === componentType.type)?.label || componentType.type}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(componentType.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditClick(componentType)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-red-600 hover:text-red-700"
                                  disabled={deletingId === componentType.id}
                                >
                                  {deletingId === componentType.id ? (
                                    <Settings className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Component Type</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{componentType.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteComponentType(componentType.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-md [&>button]:hidden">
              <DialogHeader className="space-y-3">
                <DialogTitle className="text-xl font-semibold">Edit Component Type</DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  Update the name of your salary component type
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">
                    Component Type Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={editComponentTypeName}
                    onChange={(e) => setEditComponentTypeName(e.target.value)}
                    placeholder="e.g., HRA, Allowance, Bonus"
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-type" className="text-sm font-medium text-gray-700">
                    Type *
                  </Label>
                  <Select value={editComponentType} onValueChange={setEditComponentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select component type" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPONENT_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isEditLoading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleUpdateComponentType}
                  disabled={isEditLoading}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                >
                  {isEditLoading ? "Updating..." : "Update Component Type"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

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
                            {componentTypes.map((type) => (
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