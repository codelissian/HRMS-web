import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AttendancePolicyTable } from '@/components/attendance-policies/AttendancePolicyTable';
import { AttendancePolicyForm } from '@/components/attendance-policies/AttendancePolicyForm';
import { AttendancePolicyDetails } from '@/components/attendance-policies/AttendancePolicyDetails';
import { AttendancePolicy } from '@/types/attendance';
import { Plus, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAttendancePolicies } from '@/hooks/useAttendancePolicies';

export default function AttendancePoliciesPage() {
  const {
    policies,
    loading,
    total,
    page,
    pageSize,
    searchQuery,
    setPage,
    setPageSize,
    setSearchQuery,
    refreshPolicies,
  } = useAttendancePolicies();
  
  const { toast } = useToast();
  
  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<AttendancePolicy | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
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
    refreshPolicies();
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
  const handleDeletePolicy = async (policy: AttendancePolicy) => {
    if (window.confirm(`Are you sure you want to delete the policy "${policy.name}"?`)) {
      try {
        await import('@/services/attendancePolicyService').then(
          ({ AttendancePolicyService }) => AttendancePolicyService.delete(policy.id)
        );
        toast({
          title: "Success",
          description: "Policy deleted successfully",
        });
        refreshPolicies();
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete policy",
          variant: "destructive",
        });
      }
    }
  };

  // Handle export policies
  const handleExportPolicies = () => {
    // TODO: Implement export functionality
    toast({
      title: "Info",
      description: "Export functionality coming soon",
    });
  };

  // Handle bulk import
  const handleBulkImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    // TODO: Implement bulk import functionality
    toast({
      title: "Info",
      description: "Bulk import functionality coming soon",
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // Reset to first page when searching
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== undefined) {
        setPage(1); // Reset to first page when searching
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Calculate filtered policies
  const filteredPolicies = policies; // API handles filtering

  const pageCount = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Attendance Policies
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage attendance tracking rules and policies ({total} total)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshPolicies} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" onClick={handleExportPolicies}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label htmlFor="bulk-import">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </label>
          <input
            id="bulk-import"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleBulkImport}
            className="hidden"
          />
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Policy
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search policies by name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    setPage(1);
                  }
                }}
                className="max-w-md"
              />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              Press Enter to search
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Policies Table */}
      <AttendancePolicyTable
        policies={filteredPolicies}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeletePolicy}
      />

      {/* Empty State */}
      {!loading && filteredPolicies.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {searchQuery ? 'No policies found' : 'No attendance policies yet'}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchQuery 
                    ? 'Try adjusting your search terms or create a new policy.'
                    : 'Get started by creating your first attendance policy.'
                  }
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Policy
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} policies
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
                    disabled={page === 1}
                    onClick={() => handlePageChange(1)}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => handlePageChange(Math.max(1, page - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pageCount}
                    onClick={() => handlePageChange(Math.min(pageCount, page + 1))}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === pageCount}
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
    </div>
  );
}
