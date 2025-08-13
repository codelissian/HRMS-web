import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { AttendancePolicyTable } from '@/components/attendance-policies/AttendancePolicyTable';
import { AttendancePolicyForm } from '@/components/attendance-policies/AttendancePolicyForm';
import { AttendancePolicyDetails } from '@/components/attendance-policies/AttendancePolicyDetails';
import { AttendancePolicy } from '@/types/attendance';
import { Plus, Filter, Download, Upload } from 'lucide-react';
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
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [featureFilter, setFeatureFilter] = useState<string>('all');

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
  };

  // Calculate filtered policies
  const filteredPolicies = policies.filter(policy => {
    if (statusFilter !== 'all' && policy.active_flag !== (statusFilter === 'active')) {
      return false;
    }
    if (featureFilter !== 'all') {
      switch (featureFilter) {
        case 'geo-tracking':
          return policy.geo_tracking_enabled;
        case 'selfie':
          return policy.selfie_required;
        case 'break-management':
          return policy.break_management_enabled;
        case 'regularization':
          return policy.regularization_enabled;
        default:
          return true;
      }
    }
    return true;
  });

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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder="Search policies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={featureFilter} onValueChange={setFeatureFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Features" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Features</SelectItem>
                  <SelectItem value="geo-tracking">Geo-tracking</SelectItem>
                  <SelectItem value="selfie">Selfie Required</SelectItem>
                  <SelectItem value="break-management">Break Management</SelectItem>
                  <SelectItem value="regularization">Regularization</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
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

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} policies
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => handlePageChange(Math.max(1, page - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={page === pageCount}
              onClick={() => handlePageChange(Math.min(pageCount, page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
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
