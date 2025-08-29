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
import { ConfirmationDialog } from '@/components/common';
import { Leave } from '../../../shared/schema';
import { leaveService } from '@/services/leaveService';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/common';

export default function LeaveManagementPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const { toast } = useToast();
  
  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<Leave | null>(null);

  // Fetch leaves from API
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getLeaveTypes({
        page: 1,
        page_size: 1000 // Get all leaves for now
      });
      
      if (response.status && response.data) {
        setLeaves(response.data);
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

  // Load leaves on component mount
  useEffect(() => {
    fetchLeaves();
  }, []);

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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PAID': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'UNPAID': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'HALF_DAY': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create and manage different types of leaves for your organization
          </p>
        </div>
        
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
          <Card key={leave.id} className="hover:shadow-lg transition-shadow duration-200">
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
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={leave.active_flag ? 'default' : 'secondary'}
                    className={leave.active_flag ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                  >
                    {leave.active_flag ? 'Active' : 'Inactive'}
                  </Badge>
                  
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {leave.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {leave.description}
                </p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Category:</span>
                  <Badge className={getCategoryColor(leave.category || 'PAID')}>
                    {leave.category || 'PAID'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Accrual:</span>
                  <span className="font-medium">
                    {leave.accrual_method === 'NONE' ? 'No Accrual' : 
                      `${leave.accrual_rate || 0} days ${getAccrualMethodLabel(leave.accrual_method || 'MONTHLY').toLowerCase()}`}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Balance:</span>
                  <span className="font-medium">
                    {leave.initial_balance} days
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Approval:</span>
                  <span className="font-medium">
                    {leave.requires_approval ? `${leave.approval_levels} level(s)` : 'Auto-approve'}
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
                approval_levels: Number(leaveData.approval_levels), // Ensure it's sent as a number
              } as any); // Type assertion to bypass schema mismatch
              
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
              const response = await leaveService.createLeaveType({
                ...leaveData,
                approval_levels: Number(leaveData.approval_levels), // Ensure it's sent as a number
                organisation_id: "1823a724-3843-4aef-88b4-7505e4aa88f7", // TODO: Get from auth context
              } as any); // Type assertion to bypass schema mismatch
              
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
        description="Are you sure you want to delete this leave type? This action cannot be undone."
        type="delete"
        confirmText="Delete Leave Type"
        onConfirm={confirmDeleteLeave}
        itemName={leaveToDelete?.name}
      />
    </div>
  );
} 