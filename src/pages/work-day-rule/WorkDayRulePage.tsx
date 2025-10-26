import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { WorkDayRuleTable } from '@/components/work-day-rule/WorkDayRuleTable';
import { WorkDayRuleForm } from '@/components/work-day-rule/WorkDayRuleForm';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { WorkDayRule } from '@/types/workDayRule';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WorkDayRuleService } from '@/services/workDayRuleService';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

export default function WorkDayRulePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  
  // Modal states
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRule, setSelectedRule] = useState<WorkDayRule | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  // Delete confirmation states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<WorkDayRule | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch work day rules with React Query
  const { 
    data: rulesResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['work-day-rules', 'list', { 
      page: currentPage, 
      page_size: pageSize
    }],
    queryFn: () => WorkDayRuleService.list({
      page: currentPage,
      page_size: pageSize
    }),
  });

  const rules = rulesResponse?.data || [];
  const totalCount = rulesResponse?.total_count || 0;
  const pageCount = rulesResponse?.page_count || 0;

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => WorkDayRuleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-day-rules'] });
      toast({
        title: "Success",
        description: "Work day rule created successfully",
      });
      setShowDetails(false);
      setSelectedRule(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create work day rule",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => WorkDayRuleService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-day-rules'] });
      toast({
        title: "Success",
        description: "Work day rule updated successfully",
      });
      setShowDetails(false);
      setSelectedRule(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update work day rule",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => WorkDayRuleService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-day-rules'] });
      toast({
        title: "Success",
        description: "Work day rule deleted successfully",
      });
      setShowDeleteDialog(false);
      setRuleToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete work day rule",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    setFormMode('create');
    setSelectedRule(null);
    setShowDetails(true);
  };

  const handleEdit = (rule: WorkDayRule) => {
    setFormMode('edit');
    setSelectedRule(rule);
    setShowDetails(true);
  };

  const handleView = (rule: WorkDayRule) => {
    setSelectedRule(rule);
    setShowDetails(true);
  };

  const handleDelete = (rule: WorkDayRule) => {
    setRuleToDelete(rule);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (ruleToDelete) {
      deleteMutation.mutate(ruleToDelete.id);
    }
  };

  const handleFormSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['work-day-rules'] });
    setShowDetails(false);
    setSelectedRule(null);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Work Day Rules</h3>
            <p className="text-gray-600 mb-4">
              {error?.response?.data?.message || "Failed to load work day rules"}
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Work Day Rule
        </Button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Show:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
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
            <span className="text-sm text-gray-600">entries</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} entries
        </div>
      </div>

      <WorkDayRuleTable
        workDayRules={rules}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(pageCount, prev + 1))}
              disabled={currentPage === pageCount}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Work Day Rule Form */}
      <WorkDayRuleForm
        open={showDetails}
        onOpenChange={setShowDetails}
        workDayRule={selectedRule}
        onSave={async (formData) => {
          if (formMode === 'edit' && selectedRule) {
            updateMutation.mutate({ id: selectedRule.id, ...formData });
          } else {
            createMutation.mutate(formData);
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setRuleToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Work Day Rule"
        description={`Are you sure you want to delete "${ruleToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}