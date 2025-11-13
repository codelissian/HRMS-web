import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AttendancePolicyTable } from '@/components/attendance-policies/AttendancePolicyTable';
import { AttendancePolicyDetails } from '@/components/attendance-policies/AttendancePolicyDetails';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { AttendancePolicy } from '@/types/attendance';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AttendancePolicyService } from '@/services/attendancePolicyService';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export default function AttendancePoliciesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modal states
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<AttendancePolicy | null>(null);
  
  // Delete confirmation states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<AttendancePolicy | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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
    navigate('/admin/attendance-policies/create');
  };

  // Handle edit policy
  const handleEdit = (policy: AttendancePolicy) => {
    navigate(`/admin/attendance-policies/${policy.id}/edit`);
  };

  // Handle view policy details
  const handleView = (policy: AttendancePolicy) => {
    setSelectedPolicy(policy);
    setShowDetails(true);
  };


  // Handle details close
  const handleDetailsClose = () => {
    setShowDetails(false);
    setSelectedPolicy(null);
  };

  // Handle edit from details view
  const handleEditFromDetails = (policy: AttendancePolicy) => {
    setShowDetails(false);
    navigate(`/admin/attendance-policies/${policy.id}/edit`);
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
