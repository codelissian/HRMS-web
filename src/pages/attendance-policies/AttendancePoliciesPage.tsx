import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AttendancePolicyTable } from '@/components/attendance-policies/AttendancePolicyTable';
import { AttendancePolicyForm } from '@/components/attendance-policies/AttendancePolicyForm';
import { AttendancePolicyDetails } from '@/components/attendance-policies/AttendancePolicyDetails';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { AttendancePolicy } from '@/types/attendance';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AttendancePolicyService } from '@/services/attendancePolicyService';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

export default function AttendancePoliciesPage() {
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  
  // Modal states
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<AttendancePolicy | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  // Delete confirmation states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<AttendancePolicy | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attendance policies with React Query
  const { 
    data: policiesResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['attendance-policies', 'list', { 
      page: currentPage, 
      page_size: pageSize
    }],
    queryFn: () => AttendancePolicyService.list({
      page: currentPage,
      page_size: pageSize
    }),
  });

  const policies = policiesResponse?.data || [];
  const totalCount = policiesResponse?.total_count || 0;
  const pageCount = policiesResponse?.page_count || 0;

  // Log the data for debugging
  console.log('📄 AttendancePoliciesPage - React Query Data:', {
    policiesResponse,
    policies,
    totalCount,
    pageCount,
    isLoading,
    error
  });

  // Create policy mutation
  const createPolicyMutation = useMutation({
    mutationFn: (data: any) => AttendancePolicyService.create(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Attendance policy created successfully',
      });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['attendance-policies', 'list'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create policy',
        variant: 'destructive',
      });
    },
  });

  // Update policy mutation
  const updatePolicyMutation = useMutation({
    mutationFn: (data: any) => AttendancePolicyService.update(data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Attendance policy updated successfully',
      });
      setShowForm(false);
      setFormMode('create');
      setSelectedPolicy(null);
      queryClient.invalidateQueries({ queryKey: ['attendance-policies', 'list'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update policy',
        variant: 'destructive',
      });
    },
  });

  // Delete policy mutation
  const deletePolicyMutation = useMutation({
    mutationFn: (id: string) => AttendancePolicyService.delete(id),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Attendance policy deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['attendance-policies', 'list'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete policy',
        variant: 'destructive',
      });
    },
  });

  // Handle create new policy
  const handleCreate = () => {
    setFormMode('create');
    setSelectedPolicy(null);
    setShowForm(true);
  };

  // Handle edit policy
  const handleEdit = (policy: AttendancePolicy) => {
    setFormMode('edit');
    setSelectedPolicy(policy);
    setShowForm(true);
  };

  // Handle view policy details
  const handleView = (policy: AttendancePolicy) => {
    setSelectedPolicy(policy);
    setShowDetails(true);
  };

  // Handle form success
  const handleFormSuccess = () => {
    // refreshPolicies(); // This function is no longer available
    setShowForm(false);
  };

  // Handle form close
  const handleFormClose = () => {
    setShowForm(false);
    setSelectedPolicy(null);
  };

  // Handle details close
  const handleDetailsClose = () => {
    setShowDetails(false);
    setSelectedPolicy(null);
  };

  // Handle edit from details view
  const handleEditFromDetails = (policy: AttendancePolicy) => {
    setShowDetails(false);
    setFormMode('edit');
    setSelectedPolicy(policy);
    setShowForm(true);
  };

  // Handle delete policy
  const handleDeletePolicy = (policy: AttendancePolicy) => {
    setPolicyToDelete(policy);
    setShowDeleteDialog(true);
  };

  // Confirm delete policy
  const confirmDeletePolicy = async () => {
    if (!policyToDelete) return;
    
    try {
      await deletePolicyMutation.mutateAsync(policyToDelete.id);
      // Refresh the list after successful deletion
      queryClient.invalidateQueries({ queryKey: ['attendance-policies', 'list'] });
      setShowDeleteDialog(false);
      setPolicyToDelete(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete policy",
        variant: "destructive",
      });
    }
  };


  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };




  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Use policies directly since we removed search functionality
  const filteredPolicies = policies;

  // const pageCount = Math.ceil(total / pageSize); // This line is now handled by policiesResponse

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Policy
        </Button>
      </div>

      {/* Attendance Policies Table */}
      <AttendancePolicyTable
        policies={filteredPolicies}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeletePolicy}
      />


      {/* Pagination */}
      {pageCount > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} policies
              </div>
              <div className="flex items-center gap-2">
                <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-500 dark:text-gray-400">per page</span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(1)}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === pageCount}
                    onClick={() => handlePageChange(Math.min(pageCount, currentPage + 1))}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === pageCount}
                    onClick={() => handlePageChange(pageCount)}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form Modal */}
      <AttendancePolicyForm
        open={showForm}
        onClose={handleFormClose}
        policy={selectedPolicy}
        mode={formMode}
        onSuccess={handleFormSuccess}
      />

      {/* View Details Modal */}
      <AttendancePolicyDetails
        open={showDetails}
        onClose={handleDetailsClose}
        policy={selectedPolicy}
        onEdit={handleEditFromDetails}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Attendance Policy"
        description="Are you sure you want to delete this attendance policy?"
        type="delete"
        confirmText="Delete Policy"
        cancelText="Cancel"
        onConfirm={confirmDeletePolicy}
        loading={deletePolicyMutation.isPending}
        itemName={policyToDelete?.name}
      />
    </div>
  );
}
