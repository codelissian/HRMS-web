import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Plus, Search, Edit, Trash2, Users, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { departmentService } from '@/services/departmentService';
import { designationService, Designation as ServiceDesignation } from '@/services/designationService';
import { Department as SchemaDepartment } from '../../types/database';
import { LoadingSpinner, Pagination } from '@/components/common';
import { authToken } from '@/services/authToken';
import AddDepartmentDialog from '@/components/departments/AddDepartmentDialog';
import EditDepartmentDialog from '@/components/departments/EditDepartmentDialog';
import Snackbar from '@/components/common/Snackbar';
import { CreateDesignationDialog } from '@/components/departments/CreateDesignationDialog';
import { DepartmentSelectorDialog } from '@/components/departments/DepartmentSelectorDialog';

// Extended interface for UI display that includes designations
interface DepartmentWithDesignations {
  id: string;
  name: string;
  description?: string;
  head?: string;
  designations: ServiceDesignation[];
  designationsLoading?: boolean;
  designationsError?: string | null;
}

export default function DepartmentList() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  // Removed activeTab state - only departments tab now
  const [departments, setDepartments] = useState<DepartmentWithDesignations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Removed designations tab state - designations are now only managed within departments
  
  // New state for deleting designations
  const [deletingDesignationId, setDeletingDesignationId] = useState<string | null>(null);
  const [deleteDesignationConfirmation, setDeleteDesignationConfirmation] = useState<{ id: string; name: string } | null>(null);

  // New state for Create Designation dialog
  const [isCreateDesignationDialogOpen, setIsCreateDesignationDialogOpen] = useState(false);
  const [selectedDepartmentForDesignation, setSelectedDepartmentForDesignation] = useState<{ id: string; name: string } | null>(null);
  
  // Department selector dialog state
  const [isDepartmentSelectorOpen, setIsDepartmentSelectorOpen] = useState(false);

  // New state for editing designations
  const [isEditDesignationDialogOpen, setIsEditDesignationDialogOpen] = useState(false);
  const [designationToEdit, setDesignationToEdit] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [selectedDepartmentForEdit, setSelectedDepartmentForEdit] = useState<{ id: string; name: string } | null>(null);

  // Debounced search term to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset to page 1 when search term actually changes (after debounce)
      if (searchTerm !== debouncedSearchTerm) {
        setCurrentPage(1);
      }
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchDepartments();
  }, [currentPage, pageSize, debouncedSearchTerm]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorMessage(null);
      
      // Check if user is authenticated
      if (!authToken.isAuthenticated()) {
        setLoading(false);
        setErrorMessage('Please log in to view departments');
        return;
      }
      
      console.log('Fetching departments...');
      console.log('Auth token exists:', !!authToken.getToken());
      
      // Build search object if searchTerm exists
      const requestBody: any = {
        active_flag: true,
        delete_flag: false,
        page: currentPage,
        page_size: pageSize,
        include: ["designations"] // Include designations in the response
      };

      // Add search parameter if debouncedSearchTerm exists
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        requestBody.search = {
          keys: ["name", "description"],
          value: debouncedSearchTerm.trim()
        };
      }
      
      const response = await departmentService.getDepartments(requestBody);

      console.log('API Response:', response);

      if (response.status && response.data) {
        // Transform the API response - designations are already included from API
        const departmentsWithDesignations: DepartmentWithDesignations[] = response.data.map(dept => ({
          id: dept.id,
          name: dept.name,
          description: dept.description || `Department for ${dept.name.toLowerCase()} operations`,
          head: 'TBD', // This would come from a different API call
          designations: dept.designations || [], // Use designations from API response
          designationsLoading: false,
          designationsError: undefined
        }));
        
        setDepartments(departmentsWithDesignations);
        setTotalCount(response.total_count || 0);
        setPageCount(response.page_count || 0);
      } else {
        setErrorMessage(response.message || 'Failed to fetch departments');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      setErrorMessage('Failed to fetch departments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Removed fetchAllDesignations - designations are now included in the department API response

  const handleCreateDepartment = async (data: { name: string; description: string }) => {
    try {
      setIsCreating(true);
      setError(null);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      console.log('Creating department with data:', data);
      
      // Make API call to create department
      const response = await departmentService.createDepartment({
        name: data.name,
        description: data.description || undefined
      });
      
      console.log('Create department API response:', response);
      
      if (response.status && response.data) {
        // Transform the API response to match our UI structure
        const newDepartment: DepartmentWithDesignations = {
          id: response.data.id,
          name: response.data.name,
          description: response.data.description || `Department for ${response.data.name.toLowerCase()} operations`,
          head: 'TBD', // This would come from a different API call
          designations: [] // This would come from a different API call
        };
        
        // Add the new department to the list
        setDepartments(prev => [newDepartment, ...prev]);
        
        // Close the dialog
        setIsAddDialogOpen(false);
        
        // Show success message
        setSuccessMessage(`Department "${data.name}" created successfully!`);
        console.log('Department created successfully:', newDepartment);
      } else {
        setErrorMessage(response.message || 'Failed to create department. Please check your input and try again.');
      }
      
    } catch (err) {
      console.error('Error creating department:', err);
      setErrorMessage('Failed to create department. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    // Find the department to get its name for confirmation
    const department = departments.find(dept => dept.id === departmentId);
    if (department) {
      setDeleteConfirmation({ id: departmentId, name: department.name });
    }
  };

  const confirmDeleteDepartment = async () => {
    if (!deleteConfirmation) return;
    
    try {
      setDeletingDepartmentId(deleteConfirmation.id);
      setErrorMessage(null);
      setSuccessMessage(null);
      setDeleteConfirmation(null);
      
      console.log('Deleting department with ID:', deleteConfirmation.id);
      
      // Make API call to delete department
      const response = await departmentService.deleteDepartment(deleteConfirmation.id);
      
      console.log('Delete department API response:', response);
      
      if (response.status) {
        // Remove the department from the local state
        setDepartments(prev => prev.filter(dept => dept.id !== deleteConfirmation.id));
        
        // Show success message
        setSuccessMessage('Department deleted successfully!');
        
        console.log('Department deleted successfully');
      } else {
        setErrorMessage(response.message || 'Failed to delete department. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting department:', err);
      setErrorMessage('Failed to delete department. Please try again.');
    } finally {
      setDeletingDepartmentId(null);
    }
  };

  const handleEditDepartment = (department: { id: string; name: string; description?: string }) => {
    setEditingDepartment(department);
    setIsEditDialogOpen(true);
  };

  const handleUpdateDepartment = async (data: { id: string; name: string; description: string }) => {
    try {
      setIsUpdating(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      
      console.log('Updating department with data:', { 
        id: data.id,
        name: data.name,
        description: data.description
      });
      
      // Make API call to update department
      const response = await departmentService.updateDepartment({
        id: data.id,
        name: data.name,
        description: data.description
      });
      
      console.log('Update department API response:', response);
      
      if (response.status && response.data) {
        // Update the department in the local state
        setDepartments(prev => prev.map(dept => 
          dept.id === data.id 
            ? {
                ...dept,
                name: data.name,
                description: data.description
              }
            : dept
        ));
        
        // Show success message
        setSuccessMessage('Department updated successfully!');
        
        // Close the dialog
        setIsEditDialogOpen(false);
        setEditingDepartment(null);
        
        console.log('Department updated successfully');
      } else {
        setErrorMessage(response.message || 'Failed to update department. Please try again.');
      }
    } catch (err) {
      console.error('Error updating department:', err);
      setErrorMessage('Failed to update department. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDesignation = (designationId: string, designationName: string) => {
    setDeleteDesignationConfirmation({ id: designationId, name: designationName });
  };

  const confirmDeleteDesignation = async () => {
    if (!deleteDesignationConfirmation) return;
    
    try {
      setDeletingDesignationId(deleteDesignationConfirmation.id);
      setErrorMessage(null);
      setSuccessMessage(null);
      setDeleteDesignationConfirmation(null);
      
      console.log('Deleting designation with ID:', deleteDesignationConfirmation.id);
      
      // Make API call to delete designation
      const response = await designationService.deleteDesignation(deleteDesignationConfirmation.id);
      
      console.log('Delete designation API response:', response);
      
      if (response.status) {
        // Remove from departments' designations
        setDepartments(prev => prev.map(dept => ({
          ...dept,
          designations: dept.designations.filter(designation => designation.id !== deleteDesignationConfirmation.id)
        })));
        
        // Show success message
        setSuccessMessage('Designation deleted successfully!');
        
        console.log('Designation deleted successfully');
      } else {
        setErrorMessage(response.message || 'Failed to delete designation. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting designation:', err);
      setErrorMessage('Failed to delete designation. Please try again.');
    } finally {
      setDeletingDesignationId(null);
    }
  };

  const handleOpenCreateDesignationDialog = (departmentId: string, departmentName: string) => {
    setSelectedDepartmentForDesignation({ id: departmentId, name: departmentName });
    setIsCreateDesignationDialogOpen(true);
  };

  const handleCloseCreateDesignationDialog = () => {
    setIsCreateDesignationDialogOpen(false);
    setSelectedDepartmentForDesignation(null);
  };

  // New handlers for editing designations
  const handleOpenEditDesignationDialog = (designation: { id: string; name: string; description?: string }, departmentId: string, departmentName: string) => {
    setDesignationToEdit(designation);
    setSelectedDepartmentForEdit({ id: departmentId, name: departmentName });
    setIsEditDesignationDialogOpen(true);
  };

  const handleCloseEditDesignationDialog = () => {
    setIsEditDesignationDialogOpen(false);
    setDesignationToEdit(null);
    setSelectedDepartmentForEdit(null);
  };

  // Department selector handlers
  const handleOpenDepartmentSelector = () => {
    setIsDepartmentSelectorOpen(true);
  };

  const handleCloseDepartmentSelector = () => {
    setIsDepartmentSelectorOpen(false);
  };

  const handleDepartmentSelect = (department: { id: string; name: string }) => {
    setSelectedDepartmentForDesignation(department);
    setIsCreateDesignationDialogOpen(true);
  };

  const fetchDesignations = async (departmentId: string) => {
      // Set the department to loading state
      setDepartments(prev => prev.map(dept => 
        dept.id === departmentId 
          ? { ...dept, designationsLoading: true, designationsError: undefined }
          : dept
      ));
      
    // Refetch all departments with designations included
    // This will update all departments including the one we're refreshing
    await fetchDepartments();
  };

  const toggleDepartment = (departmentId: string) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentId)) {
      // Collapsing - just remove from expanded set
      newExpanded.delete(departmentId);
    } else {
      // Expanding - add to expanded set
      newExpanded.add(departmentId);
    }
    setExpandedDepartments(newExpanded);
  };

  // Search is now handled by API - no client-side filtering needed

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error loading departments
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {error}
          </p>
          <Button onClick={fetchDepartments} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 max-w-7xl mx-auto">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1 max-w-md">
              <Input
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
              <Button 
          className="bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </div>



      {/* Removed tabs - only departments view now */}



      {/* Departments Content */}
      <div className="space-y-4">
          {departments.map((department) => (
            <Card key={department.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Department Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {department.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {department.description}
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{department.designations.length} designations</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        onClick={() => navigate(`/admin/employees/assign/department/${department.id}`)}
                        title="Assign Employees"
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-[#0B2E5C] hover:bg-[#0B2E5C]/10 transition-colors"
                        onClick={() => handleEditDepartment(department)}
                        title="Edit Department"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        onClick={() => handleDeleteDepartment(department.id)}
                        disabled={deletingDepartmentId === department.id}
                        title="Delete Department"
                      >
                        {deletingDepartmentId === department.id ? (
                          <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Expand/Collapse Button */}
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => toggleDepartment(department.id)}
                      className="flex items-center space-x-2 text-[#0B2E5C] hover:text-[#0B2E5C]/80 text-sm font-medium transition-colors duration-200"
                    >
                      <div className={`transition-transform duration-300 ease-in-out ${expandedDepartments.has(department.id) ? 'rotate-180' : 'rotate-0'}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                      <span>{expandedDepartments.has(department.id) ? 'Hide Designations' : 'Show Designations'}</span>
                    </button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleOpenCreateDesignationDialog(department.id, department.name)}
                      className="text-xs h-7 px-2 bg-[#0B2E5C]/10 hover:bg-[#0B2E5C]/20 text-[#0B2E5C] border-[#0B2E5C]/30 hover:border-[#0B2E5C]/50"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Designation
                    </Button>
                  </div>
                </div>

                {/* Designations Section with Smooth Animation */}
                <div 
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    expandedDepartments.has(department.id) 
                      ? 'max-h-[1000px] opacity-100' 
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 animate-in slide-in-from-top-2 duration-300">
                        Designations
                      </h4>
                      
                      {/* Loading State */}
                      {department.designationsLoading && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 animate-in fade-in duration-300">
                          <div className="w-8 h-8 border-2 border-[#0B2E5C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p>Loading designations...</p>
                        </div>
                      )}
                      
                      {/* Error State */}
                      {department.designationsError && !department.designationsLoading && (
                        <div className="text-center py-8 text-red-500 dark:text-red-400 animate-in fade-in duration-300">
                          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-300" />
                          <p className="mb-2">{department.designationsError}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => fetchDesignations(department.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            Try Again
                          </Button>
                        </div>
                      )}
                      
                      {/* Designations List */}
                      {!department.designationsLoading && !department.designationsError && department.designations.length > 0 && (
                        <div className="space-y-3">
                          {department.designations.map((designation, index) => (
                            <div
                              key={designation.id}
                              className={`flex items-center justify-between p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 animate-in slide-in-from-left-2 duration-300`}
                              style={{
                                animationDelay: `${index * 100}ms`,
                                animationFillMode: 'both'
                              }}
                            >
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h5 className="font-medium text-gray-900 dark:text-white">
                                    {designation.name}
                                  </h5>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                                <span>{designation.positions} positions</span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                                  onClick={() => navigate(`/admin/employees/assign/designation/${designation.id}`)}
                                  title="Assign Employees"
                                >
                                  <UserPlus className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-400 hover:text-[#0B2E5C] hover:bg-[#0B2E5C]/10 transition-colors duration-200"
                                  onClick={() => handleOpenEditDesignationDialog(designation, department.id, department.name)}
                                  title="Edit Designation"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                                  onClick={() => handleDeleteDesignation(designation.id, designation.name)}
                                  disabled={deletingDesignationId === designation.id}
                                  title="Delete Designation"
                                >
                                  {deletingDesignationId === designation.id ? (
                                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Empty State */}
                      {!department.designationsLoading && !department.designationsError && department.designations.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 animate-in fade-in duration-500">
                          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No designations found for this department.</p>
                          <p className="text-sm">Click "Add Designation" to create one.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      {departments.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {debouncedSearchTerm ? 'No departments found' : 'No departments yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {debouncedSearchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first department.'}
          </p>
        </div>
      )}

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
    </div>

    {/* Add Department Dialog */}
    <AddDepartmentDialog
      isOpen={isAddDialogOpen}
      onClose={() => setIsAddDialogOpen(false)}
      onSubmit={handleCreateDepartment}
      isLoading={isCreating}
    />

    {/* Edit Department Dialog */}
    <EditDepartmentDialog
      isOpen={isEditDialogOpen}
      onClose={() => {
        setIsEditDialogOpen(false);
        setEditingDepartment(null);
      }}
      onSubmit={handleUpdateDepartment}
      isLoading={isUpdating}
      department={editingDepartment}
    />

    {/* Delete Confirmation Dialog */}
    {deleteConfirmation && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Department
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteConfirmation.name}"</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirmation(null)}
                  disabled={deletingDepartmentId === deleteConfirmation.id}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteDepartment}
                  disabled={deletingDepartmentId === deleteConfirmation.id}
                  className="flex-1"
                >
                  {deletingDepartmentId === deleteConfirmation.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete Department'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Delete Designation Confirmation Dialog */}
    {deleteDesignationConfirmation && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Designation
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{deleteDesignationConfirmation.name}"</span>? 
                This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDesignationConfirmation(null)}
                  disabled={deletingDesignationId === deleteDesignationConfirmation.id}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteDesignation}
                  disabled={deletingDesignationId === deleteDesignationConfirmation.id}
                  className="flex-1"
                >
                  {deletingDesignationId === deleteDesignationConfirmation.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Deleting...</span>
                    </div>
                  ) : (
                    'Delete Designation'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Create Designation Dialog */}
    {selectedDepartmentForDesignation && (
      <CreateDesignationDialog
        isOpen={isCreateDesignationDialogOpen}
        onClose={handleCloseCreateDesignationDialog}
        departmentName={selectedDepartmentForDesignation.name}
        departmentId={selectedDepartmentForDesignation.id}
        onSuccess={() => {
          // Refresh designations for the specific department
          fetchDesignations(selectedDepartmentForDesignation.id);
        }}
      />
    )}

    {/* Edit Designation Dialog */}
    {selectedDepartmentForEdit && designationToEdit && (
      <CreateDesignationDialog
        isOpen={isEditDesignationDialogOpen}
        onClose={handleCloseEditDesignationDialog}
        departmentName={selectedDepartmentForEdit.name}
        departmentId={selectedDepartmentForEdit.id}
        editMode={true}
        designationToEdit={designationToEdit}
        onSuccess={() => {
          // Refresh designations for the specific department
          fetchDesignations(selectedDepartmentForEdit.id);
        }}
      />
    )}

    {/* Department Selector Dialog */}
    <DepartmentSelectorDialog
      isOpen={isDepartmentSelectorOpen}
      onClose={handleCloseDepartmentSelector}
      onDepartmentSelect={handleDepartmentSelect}
    />

    {/* Success Snackbar */}
    <Snackbar
      message={successMessage || ''}
      type="success"
      isVisible={!!successMessage}
      onClose={() => setSuccessMessage(null)}
      duration={4000}
    />

    {/* Error Snackbar */}
    <Snackbar
      message={errorMessage || ''}
      type="error"
      isVisible={!!errorMessage}
      onClose={() => setErrorMessage(null)}
      duration={6000}
    />
    </>
  );
}
