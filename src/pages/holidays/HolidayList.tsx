import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus, 
  Calendar, 
  Search,
  Filter
} from 'lucide-react';
import { HolidayForm } from '@/components/holidays/HolidayForm';
import { HolidayTable } from '@/components/holidays/HolidayTable';
import { ConfirmationDialog } from '@/components/common';
import { Holiday, HolidayFormData } from '@/types/holiday';
import { holidayService } from '@/services/holidayService';
import { useToast } from '@/hooks/use-toast';

export default function HolidayList() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  
  // Confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch holidays from API
  const { data: holidaysResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['holidays', 'list', { page: currentPage, page_size: pageSize }],
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

  // Filter holidays based on search query
  const filteredHolidays = holidays.filter(holiday =>
    holiday.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    holiday.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search holidays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleCreateHoliday}>
            <Plus className="h-4 w-4 mr-2" />
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
      {/* Search and Create Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search holidays..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreateHoliday}>
          <Plus className="h-4 w-4 mr-2" />
          Create Holiday
        </Button>
      </div>

      {/* Holidays Table */}
      <HolidayTable
        holidays={filteredHolidays}
        onEdit={handleEditHoliday}
        onDelete={handleDeleteHoliday}
        isLoading={loading || isLoading}
      />

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
        description="Are you sure you want to delete this holiday? This action cannot be undone."
        type="delete"
        confirmText="Delete Holiday"
        onConfirm={confirmDeleteHoliday}
        itemName={holidayToDelete?.name}
      />
    </div>
  );
}
