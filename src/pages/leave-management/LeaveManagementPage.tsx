import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Calendar
} from 'lucide-react';
import { LeaveForm } from '@/components/leave-form';
import { ConfirmationDialog, Pagination, EmptyState, LoadingSpinner } from '@/components/common';
import { LeaveTable } from '@/components/leaves';
import { Leave } from '../../types/database';
import { leaveService } from '@/services/leaveService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<Leave | null>(null);

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

  // Fetch leaves from API
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const requestBody: any = {
        page: currentPage,
        page_size: pageSize,
        active_flag: true,
        delete_flag: false
      };

      // Add search parameter if debouncedSearchTerm exists
      if (debouncedSearchTerm && debouncedSearchTerm.trim()) {
        requestBody.search = {
          keys: ["name", "code"],
          value: debouncedSearchTerm.trim()
        };
      }

      const response = await leaveService.getLeaveTypes(requestBody);
      
      if (response.status && response.data) {
        setLeaves(response.data);
        setTotalCount(response.total_count || 0);
        setPageCount(response.page_count || 0);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch leave types",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leave types. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load leaves on component mount and when pagination/search changes
  useEffect(() => {
    fetchLeaves();
  }, [currentPage, pageSize, debouncedSearchTerm]);

  const handleCreateLeave = () => {
    setEditingLeave(null);
    setShowForm(true);
  };

  const handleEditLeave = (leave: Leave) => {
    setEditingLeave(leave);
    setShowForm(true);
  };

  const handleDeleteLeave = (leave: Leave) => {
    setLeaveToDelete(leave);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteLeave = async () => {
    if (leaveToDelete) {
      try {
        const response = await leaveService.deleteLeaveType(leaveToDelete.id);
        
        if (response.status) {
          toast({
            title: "Success",
            description: "Leave type deleted successfully",
          });
          // Refresh the list
          fetchLeaves();
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to delete leave type",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error deleting leave:', error);
        toast({
          title: "Error",
          description: "Failed to delete leave type. Please try again.",
          variant: "destructive",
        });
      } finally {
        setDeleteDialogOpen(false);
        setLeaveToDelete(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search leave types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
                
                <Button 
          onClick={handleCreateLeave}
          className="flex items-center gap-2 bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white"
                >
          <Plus className="h-4 w-4" />
          Create Leave Type
                </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh] w-full">
          <LoadingSpinner />
            </div>
      ) : totalCount > 0 ? (
        <>
          {/* Leave Types Table */}
          <LeaveTable
            leaves={leaves}
            loading={loading}
            onEdit={handleEditLeave}
            onDelete={handleDeleteLeave}
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
          icon={Calendar}
          title="No leave types configured"
          description="Get started by creating your first leave type. You can set up different leave types like annual leave, sick leave, or personal leave."
          action={{
            label: "Create Leave Type",
            onClick: handleCreateLeave
          }}
        />
      )}

      {/* Leave Form Modal */}
      <LeaveForm
        open={showForm}
        onOpenChange={setShowForm}
        leave={editingLeave}
        onSave={async (leaveData) => {
          try {
            if (editingLeave) {
              // Update existing leave
              const response = await leaveService.updateLeaveType({
                id: editingLeave.id,
                ...leaveData,
              });
              
              if (response.status && response.data) {
                toast({
                  title: "Success",
                  description: "Leave type updated successfully",
                });
                fetchLeaves(); // Refresh the list
              } else {
                toast({
                  title: "Error",
                  description: response.message || "Failed to update leave type",
                  variant: "destructive",
                });
              }
            } else {
              // Create new leave
              if (!user?.organisation_id) {
                toast({
                  title: "Error",
                  description: "Organization ID not found. Please log in again.",
                  variant: "destructive",
                });
                return;
              }
              
              const response = await leaveService.createLeaveType({
                ...leaveData,
                organisation_id: user.organisation_id,
              });
              
              if (response.status && response.data) {
                toast({
                  title: "Success",
                  description: "Leave type created successfully",
                });
                fetchLeaves(); // Refresh the list
              } else {
                toast({
                  title: "Error",
                  description: response.message || "Failed to create leave type",
                  variant: "destructive",
                });
              }
            }
            setShowForm(false);
            setEditingLeave(null);
          } catch (error) {
            console.error('Error saving leave:', error);
            toast({
              title: "Error",
              description: "Failed to save leave type. Please try again.",
              variant: "destructive",
            });
          }
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Leave Type"
        description={`Are you sure you want to delete the leave type "${leaveToDelete?.name}"? This action cannot be undone and will permanently remove the leave type from the system.`}
        type="delete"
        confirmText="Delete Leave Type"
        onConfirm={confirmDeleteLeave}
        itemName={leaveToDelete?.name}
      />
    </div>
  );
} 