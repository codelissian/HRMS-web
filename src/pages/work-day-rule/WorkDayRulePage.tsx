import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WorkDayRuleTable } from '@/components/work-day-rule/WorkDayRuleTable';
import { WorkDayRuleForm } from '@/components/work-day-rule/WorkDayRuleForm';
import { ConfirmationDialog } from '@/components/common/ConfirmationDialog';
import { EmptyState, LoadingSpinner, Pagination } from '@/components/common';
import { WorkDayRule } from '@/types/workDayRule';
import { Plus, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WorkDayRuleService } from '@/services/workDayRuleService';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

export default function WorkDayRulePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
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
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error loading work day rules
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {error?.response?.data?.message || "Failed to load work day rules"}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-end">
        <Button 
          onClick={handleCreate} 
          className="flex items-center gap-2 bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white"
        >
          <Plus className="h-4 w-4" />
          Create Work Day Rule
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh] w-full">
          <LoadingSpinner />
        </div>
      ) : totalCount > 0 ? (
        <>
          {/* Work Day Rules Table */}
          <WorkDayRuleTable
            workDayRules={rules}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
          icon={CalendarDays}
          title="No work day rules configured"
          description="Get started by creating your first work day rule. Define which days of the week are working days and which are included in payroll calculations."
          action={{
            label: "Create Work Day Rule",
            onClick: handleCreate
          }}
        />
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