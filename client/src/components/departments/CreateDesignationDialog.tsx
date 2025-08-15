import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, X } from 'lucide-react';
import { designationService } from '@/services/designationService';

interface CreateDesignationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName: string;
  departmentId: string;
  onSuccess?: () => void;
  // New props for edit mode
  editMode?: boolean;
  designationToEdit?: {
    id: string;
    name: string;
    description?: string;
  } | null;
}

export const CreateDesignationDialog: React.FC<CreateDesignationDialogProps> = ({
  isOpen,
  onClose,
  departmentName,
  departmentId,
  onSuccess,
  editMode = false,
  designationToEdit = null
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form when editing
  useEffect(() => {
    if (editMode && designationToEdit) {
      setFormData({
        name: designationToEdit.name || '',
        description: designationToEdit.description || ''
      });
    } else {
      // Reset form for create mode
      setFormData({ name: '', description: '' });
    }
  }, [editMode, designationToEdit, isOpen]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Designation name is required');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (editMode && designationToEdit) {
        // Update existing designation
        const payload = {
          id: designationToEdit.id,
          name: formData.name.trim(),
          department_id: departmentId,
          description: formData.description.trim() || undefined
        };

        console.log('Updating designation with payload:', payload);
        
        const response = await designationService.updateDesignation(payload);
        
        console.log('Update designation API response:', response);
        
        if (response.status && response.data) {
          console.log('Designation updated successfully:', response.data);
          handleClose();
          if (onSuccess) onSuccess();
        } else {
          setError(response.message || 'Failed to update designation. Please try again.');
        }
      } else {
        // Create new designation
        const payload = {
          name: formData.name.trim(),
          department_id: departmentId,
          description: formData.description.trim() || undefined
        };

        console.log('Creating designation with payload:', payload);
        
        const response = await designationService.createDesignation(payload);
        
        console.log('Create designation API response:', response);
        
        if (response.status && response.data) {
          console.log('Designation created successfully:', response.data);
          handleClose();
          if (onSuccess) onSuccess();
        } else {
          setError(response.message || 'Failed to create designation. Please try again.');
        }
      }
    } catch (err) {
      console.error('Error saving designation:', err);
      setError(`Failed to ${editMode ? 'update' : 'create'} designation. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    setError(null);
    onClose();
  };

  const dialogTitle = editMode ? 'Edit Designation' : 'Create New Designation';
  const submitButtonText = editMode ? 'Update Designation' : 'Create Designation';
  const submittingText = editMode ? 'Updating...' : 'Creating...';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {dialogTitle}
            </DialogTitle>
          </div>
          
          {/* Department Info Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {editMode ? 'Editing designation in' : 'Creating designation for'}
                </p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {departmentName} Department
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Designation Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Designation Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Software Engineer, HR Manager, Sales Executive"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10 h-12 text-base border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Enter the official job title or designation
              </p>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Brief description of the role, responsibilities, or requirements..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="min-h-[100px] resize-none border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                rows={4}
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Optional: Add details about the role or position
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{submittingText}</span>
                </div>
              ) : (
                submitButtonText
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 