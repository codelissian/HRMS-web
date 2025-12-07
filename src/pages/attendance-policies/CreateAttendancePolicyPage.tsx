import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { AttendancePolicyFormPage } from '@/components/attendance-policies/AttendancePolicyFormPage';
import { useQuery } from '@tanstack/react-query';
import { AttendancePolicyService } from '@/services/attendancePolicyService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function CreateAttendancePolicyPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const formRef = useRef<{ submitForm: () => void }>(null);
  
  const isEditMode = Boolean(id);

  // Fetch policy data for edit mode
  const { data: policy, isLoading, error } = useQuery({
    queryKey: ['attendance-policy', id],
    queryFn: () => AttendancePolicyService.getById(id!),
    enabled: isEditMode && Boolean(id),
  });

  const handleSuccess = () => {
    navigate('/admin/attendance-policies');
  };

  const handleClose = () => {
    navigate('/admin/attendance-policies');
  };

  const handleSave = () => {
    console.log('Save button clicked');
    console.log('formRef.current:', formRef.current);
    alert('Save button clicked!'); // Temporary test
    if (formRef.current) {
      console.log('Calling submitForm');
      formRef.current.submitForm();
    } else {
      console.log('formRef.current is null');
    }
  };

  // Show loading state when fetching policy data
  if (isEditMode && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state if policy fetch failed
  if (isEditMode && error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load policy data</p>
          <Button onClick={() => navigate('/admin/attendance-policies')}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 h-10 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4" />
          {isEditMode ? 'Update Policy' : 'Save Policy'}
        </Button>
      </div>

      {/* Form */}
      <AttendancePolicyFormPage
        ref={formRef}
        policy={isEditMode ? policy : null}
        mode={isEditMode ? 'edit' : 'create'}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </div>
  );
}
