import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Search, Users, X, CheckCircle2 } from 'lucide-react';
import { departmentService } from '@/services/departmentService';

interface Department {
  id: string;
  name: string;
  description?: string;
  employee_count?: number;
}

interface DepartmentSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDepartmentSelect: (department: Department) => void;
}

export const DepartmentSelectorDialog: React.FC<DepartmentSelectorDialogProps> = ({
  isOpen,
  onClose,
  onDepartmentSelect
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Fetch departments when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

  // Filter departments based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredDepartments(filtered);
    }
  }, [searchTerm, departments]);

  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const organisationId = localStorage.getItem('organisation_id') || '1823a724-3843-4aef-88b4-7505e4aa88f7';
      
      const response = await departmentService.getDepartments({
        organisation_id: organisationId
      });
      
      if (response.status && response.data) {
        setDepartments(response.data);
        setFilteredDepartments(response.data);
      } else {
        setError('Failed to fetch departments');
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError('Failed to fetch departments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDepartmentSelect = (department: Department) => {
    setSelectedDepartment(department);
    // Small delay to show selection feedback
    setTimeout(() => {
      onDepartmentSelect(department);
      onClose();
    }, 300);
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedDepartment(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Select Department
            </DialogTitle>
          </div>
          
          {/* Header Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Choose a department to create designation for
                </p>
                <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  Department Selection
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search departments by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400"
            />
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600 dark:text-gray-400">Loading departments...</span>
              </div>
            </div>
          )}

          {/* Departments List */}
          {!isLoading && !error && (
            <div className="space-y-3">
              {filteredDepartments.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No departments found matching your search.' : 'No departments available.'}
                  </p>
                </div>
              ) : (
                filteredDepartments.map((department) => (
                  <Card
                    key={department.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md border-2 ${
                      selectedDepartment?.id === department.id
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                    }`}
                    onClick={() => handleDepartmentSelect(department)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selectedDepartment?.id === department.id
                              ? 'bg-purple-100 dark:bg-purple-900/50'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}>
                            <Building2 className={`w-5 h-5 ${
                              selectedDepartment?.id === department.id
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold text-lg ${
                              selectedDepartment?.id === department.id
                                ? 'text-purple-900 dark:text-purple-100'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {department.name}
                            </h3>
                            {department.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {department.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {/* Employee Count Badge */}
                          {department.employee_count !== undefined && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              <Users className="w-3 h-3 mr-1" />
                              {department.employee_count}
                            </Badge>
                          )}
                          
                          {/* Selection Indicator */}
                          {selectedDepartment?.id === department.id && (
                            <CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {filteredDepartments.length} department{filteredDepartments.length !== 1 ? 's' : ''} found
            </p>
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6 py-2.5 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 