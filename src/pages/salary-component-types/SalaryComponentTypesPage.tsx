import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Plus, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { httpClient } from '@/lib/httpClient';
import { ApiResponse } from '@/types/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ComponentType {
  id: string;
  name: string;
  type?: string;
  sequence?: number;
  created_at: string;
  updated_at: string;
}

// Component type options for the dropdown
const COMPONENT_TYPE_OPTIONS = [
  { value: 'BASIC', label: 'Basic' },
  { value: 'ALLOWANCE', label: 'Allowance' },
  { value: 'DEDUCTION', label: 'Deduction' },
  { value: 'STATUTORY', label: 'Statutory' },
  { value: 'PF', label: 'Provident Fund (PF)' },
  { value: 'ESI', label: 'Employee State Insurance (ESI)' },
  { value: 'PROFESSIONAL_TAX', label: 'Professional Tax' },
  { value: 'INCOME_TAX', label: 'Income Tax' },
  { value: 'TDS', label: 'Tax Deducted at Source (TDS)' }
] as const;

export function SalaryComponentTypesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [componentTypeName, setComponentTypeName] = useState('');
  const [componentType, setComponentType] = useState('');
  const [componentTypeSequence, setComponentTypeSequence] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [componentTypes, setComponentTypes] = useState<ComponentType[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingComponentType, setEditingComponentType] = useState<ComponentType | null>(null);
  const [editComponentTypeName, setEditComponentTypeName] = useState('');
  const [editComponentType, setEditComponentType] = useState('');
  const [editComponentTypeSequence, setEditComponentTypeSequence] = useState('');
  const [isEditLoading, setIsEditLoading] = useState(false);
  
  const { toast } = useToast();

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
    setEditComponentTypeSequence(componentType.sequence?.toString() || '');
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

    if (!editComponentTypeSequence) {
      toast({
        title: "Error",
        description: "Please enter a sequence number",
        variant: "destructive",
      });
      return;
    }

    // Validate sequence
    const sequenceValue = parseInt(editComponentTypeSequence);
    if (isNaN(sequenceValue) || sequenceValue < 1) {
      toast({
        title: "Error",
        description: "Sequence must be a positive integer",
        variant: "destructive",
      });
      return;
    }

    setIsEditLoading(true);
    try {
      await httpClient.put<ApiResponse<any>>('/salary_component_types/update', {
        id: editingComponentType.id,
        name: editComponentTypeName.trim(),
        type: editComponentType,
        sequence: sequenceValue
      });

      toast({
        title: "Success",
        description: "Component type updated successfully",
      });
      setEditComponentTypeName('');
      setEditComponentType('');
      setEditComponentTypeSequence('');
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

    if (!componentTypeSequence) {
      toast({
        title: "Error",
        description: "Please enter a sequence number",
        variant: "destructive",
      });
      return;
    }

    // Validate sequence
    const sequenceValue = parseInt(componentTypeSequence);
    if (isNaN(sequenceValue) || sequenceValue < 1) {
      toast({
        title: "Error",
        description: "Sequence must be a positive integer",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await httpClient.post<ApiResponse<any>>('/salary_component_types/create', {
        name: componentTypeName.trim(),
        type: componentType,
        sequence: sequenceValue
      });

      toast({
        title: "Success",
        description: "Component type created successfully",
      });
      setComponentTypeName('');
      setComponentType('');
      setComponentTypeSequence('');
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

  useEffect(() => {
    fetchComponentTypes();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Salary Component Types
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage salary component types for your payroll system
              </p>
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
                  <div className="space-y-2">
                    <Label htmlFor="sequence" className="text-sm font-medium text-gray-700">
                      Sequence *
                    </Label>
                    <Input
                      id="sequence"
                      type="number"
                      value={componentTypeSequence}
                      onChange={(e) => setComponentTypeSequence(e.target.value)}
                      placeholder="Enter sequence number"
                      className="w-full"
                    />
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
                  <TableHead>Sequence</TableHead>
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
                      {componentType.sequence ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {componentType.sequence}
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
              Update the details of your salary component type
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
            <div className="space-y-2">
              <Label htmlFor="edit-sequence" className="text-sm font-medium text-gray-700">
                Sequence *
              </Label>
              <Input
                id="edit-sequence"
                type="number"
                value={editComponentTypeSequence}
                onChange={(e) => setEditComponentTypeSequence(e.target.value)}
                placeholder="Enter sequence number"
                className="w-full"
              />
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
    </div>
  );
}

export default SalaryComponentTypesPage;