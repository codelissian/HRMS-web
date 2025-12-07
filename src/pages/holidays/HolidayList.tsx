import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Plus, 
  Calendar
} from 'lucide-react';
import { HolidayForm } from '@/components/holidays/HolidayForm';
import { HolidayTable } from '@/components/holidays/HolidayTable';
import { ConfirmationDialog, Pagination, EmptyState, LoadingSpinner } from '@/components/common';
import { Holiday, HolidayFormData } from '@/types/holiday';
import { holidayService } from '@/services/holidayService';
import { useToast } from '@/hooks/use-toast';

export default function HolidayList() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  
  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch holidays from API
  const { data: holidaysResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['holidays', 'list', { page: currentPage, page_size: pageSize, search: debouncedSearchTerm }],
    queryFn: () => holidayService.getHolidays({
      page: currentPage,
      page_size: pageSize
    }),
    enabled: true,
  });

  // Create holiday mutation
  const createMutation = useMutation({
    mutationFn: (data: HolidayFormData) => holidayService.createHoliday(data),
    onSuccess: (result) => {
      if (result.status && result.data) {
        toast({
          title: "Success",
          description: "Holiday created successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['holidays', 'list'] });
        setShowForm(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create holiday",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error creating holiday:', error);
      toast({
        title: "Error",
        description: "Failed to create holiday. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update holiday mutation
  const updateMutation = useMutation({
    mutationFn: (data: HolidayFormData & { id: string }) => holidayService.updateHoliday(data),
    onSuccess: (result) => {
      if (result.status && result.data) {
        toast({
          title: "Success",
          description: "Holiday updated successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['holidays', 'list'] });
        setShowForm(false);
        setEditingHoliday(null);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update holiday",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error updating holiday:', error);
      toast({
        title: "Error",
        description: "Failed to update holiday. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete holiday mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => holidayService.deleteHoliday(id),
    onSuccess: (result) => {
      if (result.status) {
        toast({
          title: "Success",
          description: "Holiday deleted successfully",
        });
        queryClient.invalidateQueries({ queryKey: ['holidays', 'list'] });
        setDeleteDialogOpen(false);
        setHolidayToDelete(null);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete holiday",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Error deleting holiday:', error);
      toast({
        title: "Error",
        description: "Failed to delete holiday. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update holidays state when API response changes
  useEffect(() => {
    if (holidaysResponse?.data) {
      setHolidays(holidaysResponse.data);
      setTotalCount(holidaysResponse.total_count || 0);
      setPageCount(holidaysResponse.page_count || 0);
      setLoading(false);
    }
  }, [holidaysResponse]);

  const handleCreateHoliday = () => {
    setEditingHoliday(null);
    setShowForm(true);
  };

  const handleEditHoliday = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setShowForm(true);
  };

  const handleDeleteHoliday = (holiday: Holiday) => {
    setHolidayToDelete(holiday);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteHoliday = async () => {
    if (holidayToDelete) {
      deleteMutation.mutate(holidayToDelete.id);
    }
  };

  const handleSaveHoliday = async (data: HolidayFormData) => {
    if (editingHoliday) {
      updateMutation.mutate({
        ...data,
        id: editingHoliday.id
      });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter holidays based on search query (client-side for now)
  const filteredHolidays = holidays.filter(holiday =>
    holiday.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    holiday.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search holidays..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            onClick={handleCreateHoliday}
            className="flex items-center gap-2 bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white"
          >
            <Plus className="h-4 w-4" />
            Create Holiday
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load holidays. Please try again.</p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search holidays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button
          onClick={handleCreateHoliday}
          className="flex items-center gap-2 bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white"
        >
          <Plus className="h-4 w-4" />
          Create Holiday
        </Button>
      </div>

      {loading || isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh] w-full">
          <LoadingSpinner />
        </div>
      ) : filteredHolidays.length > 0 ? (
        <>
      {/* Holidays Table */}
      <HolidayTable
        holidays={filteredHolidays}
            loading={loading || isLoading}
        onEdit={handleEditHoliday}
        onDelete={handleDeleteHoliday}
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
          title="No holidays configured"
          description="Get started by creating your first holiday. You can set up public holidays, company holidays, or special occasions."
          action={{
            label: "Create Holiday",
            onClick: handleCreateHoliday
          }}
      />
      )}

      {/* Holiday Form Modal */}
      <HolidayForm
        open={showForm}
        onOpenChange={setShowForm}
        holiday={editingHoliday}
        onSave={handleSaveHoliday}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Holiday"
        description={`Are you sure you want to delete the holiday "${holidayToDelete?.name}"? This action cannot be undone and will permanently remove the holiday from the system.`}
        type="delete"
        confirmText="Delete Holiday"
        onConfirm={confirmDeleteHoliday}
        itemName={holidayToDelete?.name}
      />
    </div>
  );
}
