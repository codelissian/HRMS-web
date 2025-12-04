import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { httpClient } from '@/lib/httpClient';
import { ApiResponse } from '@/types/api';
import { Pagination, ConfirmationDialog, EmptyState, LoadingSpinner } from '@/components/common';
import { SalaryComponentTypeTable } from '@/components/salary-component-types';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingComponentType, setEditingComponentType] = useState<ComponentType | null>(null);
  const [editComponentTypeName, setEditComponentTypeName] = useState('');
  const [editComponentType, setEditComponentType] = useState('');
  const [editComponentTypeSequence, setEditComponentTypeSequence] = useState('');
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [componentTypeToDelete, setComponentTypeToDelete] = useState<ComponentType | null>(null);
  
  const { toast } = useToast();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // Reset to page 1 when search term changes
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchComponentTypes = async () => {
    setIsLoadingList(true);
    try {
      const requestBody: any = {
        page: currentPage,
        page_size: pageSize
      };

      // Add search parameter if debouncedSearchTerm exists
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        requestBody.search = {
          keys: ["name", "type"],
          value: debouncedSearchTerm.trim()
        };
      }

      const response = await httpClient.post<ApiResponse<ComponentType[]>>('/salary_component_types/list', requestBody);
      setComponentTypes(response.data.data || []);
      setTotalCount(response.data.total_count || 0);
      setPageCount(response.data.page_count || 0);
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

  const handleDeleteClick = (componentType: ComponentType) => {
    setComponentTypeToDelete(componentType);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteComponentType = async () => {
    if (componentTypeToDelete) {
    try {
      await httpClient.patch<ApiResponse<any>>('/salary_component_types/delete', {
          id: componentTypeToDelete.id
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
        setDeleteDialogOpen(false);
        setComponentTypeToDelete(null);
      }
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
  }, [currentPage, pageSize, debouncedSearchTerm]);

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search component types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white">
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
                    className="w-full sm:w-auto bg-[#0B2E5C] hover:bg-[#0B2E5C]/90"
                  >
                    {isLoading ? "Creating..." : "Create Component Type"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
      </div>

      {isLoadingList ? (
        <div className="flex items-center justify-center min-h-[60vh] w-full">
          <LoadingSpinner />
        </div>
      ) : totalCount > 0 ? (
        <>
          {/* Component Types Table */}
          <SalaryComponentTypeTable
            componentTypes={componentTypes}
            loading={isLoadingList}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />

      {/* Pagination */}
      {totalCount > 0 && (
            <Card>
          <CardContent className="p-4">
            <Pagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newPageSize) => {
                setPageSize(newPageSize);
                setCurrentPage(1);
              }}
              showFirstLast={false}
            />
          </CardContent>
        </Card>
      )}
        </>
      ) : (
        <EmptyState
          icon={Settings}
          title="No component types configured"
          description="Get started by creating your first salary component type. You can set up different types like Basic, Allowance, Deduction, and more."
          action={{
            label: "Add Component Type",
            onClick: () => setIsDialogOpen(true)
          }}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Component Type"
        description={`Are you sure you want to delete the component type "${componentTypeToDelete?.name}"? This action cannot be undone and will permanently remove the component type from the system.`}
        type="delete"
        confirmText="Delete Component Type"
        onConfirm={confirmDeleteComponentType}
        itemName={componentTypeToDelete?.name}
      />

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