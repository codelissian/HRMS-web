import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Settings, 
  Eye, 
  Edit, 
  Trash2,
  MoreVertical
} from 'lucide-react';
import { LeaveForm } from '@/components/leave-form';
import { ConfirmationDialog, Pagination } from '@/components/common';
import { Leave } from '../../types/database';
import { leaveService } from '@/services/leaveService';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common';
import { useAuth } from '@/hooks/useAuth'; // ✅ Added: Import useAuth

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth(); // ✅ Added: Get user from auth context
  
  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<Leave | null>(null);

  // Fetch leaves from API
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getLeaveTypes({
        page: currentPage,
        page_size: pageSize
      });
      
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

  // Load leaves on component mount and when pagination changes
  useEffect(() => {
    fetchLeaves();
  }, [currentPage, pageSize]);

  const handleCreateLeave = () => {
    console.log('🖱️ Create Leave Type button clicked');
    console.log('📝 Current state:', { editingLeave, showForm });
    setEditingLeave(null);
    setShowForm(true);
    console.log('✅ Form should now be open');
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

  const getAccrualMethodLabel = (method: string) => {
    switch (method) {
      case 'MONTHLY': return 'Monthly';
      case 'YEARLY': return 'Yearly';
      case 'QUARTERLY': return 'Quarterly';
      case 'NONE': return 'No Accrual';
      default: return method;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end items-center">      
        <div className="flex items-center space-x-3">
          <Button onClick={handleCreateLeave}>
            <Plus className="h-4 w-4 mr-2" />
            Create Leave Type
          </Button>
        </div>
      </div>

      {/* Leave Types Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {leaves.map((leave) => (
          <Card key={leave.id} className="border-gray-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: leave.color || '#6B7280' }}
                  >
                    {leave.icon || '📋'}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{leave.name}</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{leave.code}</p>
                    {leave.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {leave.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                  variant={(leave as any).active_flag ? 'default' : 'secondary'}
                  className={(leave as any).active_flag ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                  >
                  {(leave as any).active_flag ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Accrual:</span>
                  <span className="font-medium">
                    {leave.accrual_method === 'NONE' ? 'No Accrual' : 
                      `${leave.accrual_rate || 0} days ${getAccrualMethodLabel(leave.accrual_method || 'MONTHLY').toLowerCase()}`}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleEditLeave(leave)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDeleteLeave(leave)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {leaves.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No leave types found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Get started by creating your first leave type.
            </p>
            <Button onClick={handleCreateLeave}>
              <Plus className="h-4 w-4 mr-2" />
              Create Leave Type
            </Button>
          </CardContent>
        </Card>
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
                setCurrentPage(1); // Reset to first page when changing page size
              }}
              showFirstLast={false}
            />
          </CardContent>
        </Card>
      )}

      {/* Leave Form Modal */}
      <LeaveForm
        open={showForm}
        onOpenChange={setShowForm}
        leave={editingLeave}
        onSave={async (leaveData) => {
          console.log('🚀 Form onSave called with data:', leaveData);
          console.log('📝 Is editing mode:', !!editingLeave);
          console.log('👤 User context:', { user: user?.id, organisation_id: user?.organisation_id });
          
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
              console.log('🆕 Creating new leave type');
              console.log('📝 Leave data to send:', leaveData);
              
              if (!user?.organisation_id) {
                console.log('❌ No organization ID found');
                toast({
                  title: "Error",
                  description: "Organization ID not found. Please log in again.",
                  variant: "destructive",
                });
                return;
              }
              
              console.log('📡 Calling leaveService.createLeaveType with:', {
                ...leaveData,
                organisation_id: user.organisation_id
              });
              
              const response = await leaveService.createLeaveType({
                ...leaveData,
                organisation_id: user.organisation_id, // ✅ Fixed: Use auth context
              });
              
              console.log('📡 API Response:', response);
              
              if (response.status && response.data) {
                console.log('✅ Leave type created successfully');
                toast({
                  title: "Success",
                  description: "Leave type created successfully",
                });
                fetchLeaves(); // Refresh the list
              } else {
                console.log('❌ Leave type creation failed:', response);
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
            console.error('❌ Error saving leave:', error);
            console.error('❌ Error details:', {
              message: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined
            });
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
        description="Are you sure you want to delete this leave type? This action cannot be undone."
        type="delete"
        confirmText="Delete Leave Type"
        onConfirm={confirmDeleteLeave}
        itemName={leaveToDelete?.name}
      />
    </div>
  );
} 