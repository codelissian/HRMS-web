import { useState, useEffect } from 'react';
import { Building, ChevronDown, ChevronUp, Plus, Search, Edit, Trash2, MoreVertical, User, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { departmentService } from '@/services/departmentService';
import { designationService, Designation as ServiceDesignation } from '@/services/designationService';
import { Department as SchemaDepartment } from '@shared/schema';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'departments' | 'designations'>('departments');
  const [departments, setDepartments] = useState<DepartmentWithDesignations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; name: string } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // New state for designations tab
  const [allDesignations, setAllDesignations] = useState<ServiceDesignation[]>([]);
  const [designationsLoading, setDesignationsLoading] = useState(false);
  const [designationsError, setDesignationsError] = useState<string | null>(null);
  const [designationSearchTerm, setDesignationSearchTerm] = useState('');
  
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

  useEffect(() => {
    if (activeTab === 'departments') {
      fetchDepartments();
    } else if (activeTab === 'designations') {
      fetchAllDesignationsForOrg();
    }
  }, [activeTab]);

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
      
      const response = await departmentService.getDepartments({
        active_flag: true,
        delete_flag: false,
        page: 1,
        page_size: 100
      });

      console.log('API Response:', response);

      if (response.status && response.data) {
        // Transform the API response to include designations
        const departmentsWithDesignations: DepartmentWithDesignations[] = response.data.map(dept => ({
          id: dept.id,
          name: dept.name,
          description: dept.description || `Department for ${dept.name.toLowerCase()} operations`,
          head: 'TBD', // This would come from a different API call
          designations: [], // Will be populated with designations
          designationsLoading: false, // Will be set to true when fetching designations
          designationsError: undefined
        }));
        
        setDepartments(departmentsWithDesignations);
        
        // Now fetch designations for all departments
        await fetchAllDesignations(departmentsWithDesignations);
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

  const fetchAllDesignationsForOrg = async () => {
    try {
      setDesignationsLoading(true);
      setDesignationsError(null);
      
      // Check if user is authenticated
      if (!authToken.isAuthenticated()) {
        setDesignationsError('Please log in to view designations');
        setDesignationsLoading(false);
        return;
      }
      
      console.log('Fetching all designations...');
      
      const response = await designationService.getAllDesignations();
      
      console.log('Designations API Response:', response);

      if (response.status && response.data) {
        setAllDesignations(response.data);
      } else {
        setDesignationsError(response.message || 'Failed to fetch designations');
      }
    } catch (err) {
      console.error('Error fetching designations:', err);
      setDesignationsError('Failed to fetch designations. Please try again.');
    } finally {
      setDesignationsLoading(false);
    }
  };

  const handleTabChange = (tab: 'departments' | 'designations') => {
    setActiveTab(tab);
    // Reset search terms when switching tabs
    setSearchTerm('');
    setDesignationSearchTerm('');
  };

  const fetchAllDesignations = async (departmentsList: DepartmentWithDesignations[]) => {
    try {
      console.log('Fetching designations for all departments...');
      
      // Set all departments to loading state
      setDepartments(prev => prev.map(dept => ({
        ...dept,
        designationsLoading: true,
        designationsError: undefined
      })));
      
      // Fetch designations for each department in parallel
      const designationPromises = departmentsList.map(async (dept) => {
        try {
          const response = await designationService.getDesignations({
            department_id: dept.id
          });
          
          if (response.status && response.data) {
            return {
              departmentId: dept.id,
              designations: response.data || [],
              error: null
            };
          } else {
            return {
              departmentId: dept.id,
              designations: [],
              error: response.message || 'Failed to fetch designations'
            };
          }
        } catch (err) {
          console.error(`Error fetching designations for department ${dept.id}:`, err);
          return {
            departmentId: dept.id,
            designations: [],
            error: 'Failed to fetch designations. Please try again.'
          };
        }
      });
      
      // Wait for all designation requests to complete
      const results = await Promise.all(designationPromises);
      
      // Update departments with fetched designations
      setDepartments(prev => prev.map(dept => {
        const result = results.find(r => r.departmentId === dept.id);
        if (result) {
          return {
            ...dept,
            designations: result.designations,
            designationsLoading: false,
            designationsError: result.error
          };
        }
        return dept;
      }));
      
      console.log('All designations fetched successfully');
    } catch (err) {
      console.error('Error in fetchAllDesignations:', err);
      // Mark all departments as having errors
      setDepartments(prev => prev.map(dept => ({
        ...dept,
        designationsLoading: false,
        designationsError: 'Failed to fetch designations. Please try again.'
      })));
    }
  };

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
        // Remove the designation from the local state
        setAllDesignations(prev => prev.filter(designation => designation.id !== deleteDesignationConfirmation.id));
        
        // Also remove from departments' designations if they exist
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
    try {
      // Set the department to loading state
      setDepartments(prev => prev.map(dept => 
        dept.id === departmentId 
          ? { ...dept, designationsLoading: true, designationsError: undefined }
          : dept
      ));
      
      const response = await designationService.getDesignations({
        department_id: departmentId
      });
      
      if (response.status && response.data) {
        // Update the department with fetched designations
        setDepartments(prev => prev.map(dept => 
          dept.id === departmentId 
            ? { 
                ...dept, 
                designations: response.data || [],
                designationsLoading: false,
                designationsError: undefined
              }
            : dept
        ));
      } else {
        setDepartments(prev => prev.map(dept => 
          dept.id === departmentId 
            ? { 
                ...dept, 
                designations: [],
                designationsLoading: false,
                designationsError: response.message || 'Failed to fetch designations'
              }
            : dept
        ));
      }
    } catch (err) {
      console.error('Error fetching designations:', err);
      setDepartments(prev => prev.map(dept => 
        dept.id === departmentId 
          ? { 
              ...dept, 
              designations: [],
              designationsLoading: false,
              designationsError: 'Failed to fetch designations. Please try again.'
            }
          : dept
      ));
    }
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

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredDesignations = allDesignations.filter(designation =>
    designation.name.toLowerCase().includes(designationSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-red-400 mx-auto mb-4" />
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
      <div className="p-6 max-w-7xl mx-auto">
      {/* Search and Actions */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Input
                placeholder={activeTab === 'departments' ? "Search departments..." : "Search designations..."}
                value={activeTab === 'departments' ? searchTerm : designationSearchTerm}
                onChange={(e) => activeTab === 'departments' ? setSearchTerm(e.target.value) : setDesignationSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            
            <div className="flex gap-2">
              {activeTab === 'departments' ? (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Department
                </Button>
              ) : (
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleOpenDepartmentSelector}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Designation
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Tabs */}
      <div className="flex space-x-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit">
        <button
          onClick={() => handleTabChange('departments')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'departments'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-700'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Departments
        </button>
        <button
          onClick={() => handleTabChange('designations')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'designations'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-200 dark:border-blue-700'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Designations
        </button>
      </div>



      {/* Departments Tab Content */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          {filteredDepartments.map((department) => (
            <Card key={department.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Department Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {department.name}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {department.description}
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Head: {department.head}</span>
                          </div>
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
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Expand/Collapse Button */}
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => toggleDepartment(department.id)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
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
                      className="text-xs h-7 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
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
                          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
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
                                  className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
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
      )}

      {/* Designations Tab Content */}
      {activeTab === 'designations' && (
        <div className="space-y-4">
          {designationsLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          ) : designationsError ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Error loading designations
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {designationsError}
              </p>
              <Button onClick={fetchAllDesignationsForOrg} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredDesignations.length > 0 ? (
            filteredDesignations.map((designation) => (
              <Card key={designation.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {designation.name}
                        </h3>
                        <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{designation.positions} positions</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4" />
                            <span>Department ID: {designation.department_id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        onClick={() => {
                          const department = departments.find(d => d.id === designation.department_id);
                          if (department) {
                            handleOpenEditDesignationDialog(designation, department.id, department.name);
                          }
                        }}
                        title="Edit Designation"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {designationSearchTerm ? 'No designations found' : 'No designations yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {designationSearchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first designation.'}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'departments' && filteredDepartments.length === 0 && !loading && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm ? 'No departments found' : 'No departments yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first department.'}
          </p>
        </div>
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
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
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
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
          // Also refresh all designations if we're on the designations tab
          if (activeTab === 'designations') {
            fetchAllDesignationsForOrg();
          }
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
          // Also refresh all designations if we're on the designations tab
          if (activeTab === 'designations') {
            fetchAllDesignationsForOrg();
          }
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
