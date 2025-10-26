import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Calendar,
  RotateCcw,
  Clock
} from 'lucide-react';
import { HolidayForm } from '@/components/holidays/HolidayForm';
import { ConfirmationDialog } from '@/components/common';
import { Holiday, HolidayFormData } from '@/types/holiday';
import { holidayService } from '@/services/holidayService';
import { useToast } from '@/hooks/use-toast';

export default function HolidayDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch holiday details
  const { data: holidayResponse, isLoading, error } = useQuery({
    queryKey: ['holiday', 'detail', id],
    queryFn: () => holidayService.getHoliday(id!),
    enabled: !!id,
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
        queryClient.invalidateQueries({ queryKey: ['holiday', 'detail', id] });
        queryClient.invalidateQueries({ queryKey: ['holidays', 'list'] });
        setShowForm(false);
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
        navigate('/holidays');
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

  const holiday = holidayResponse?.data;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (active: boolean) => {
    return active 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const handleEditHoliday = () => {
    setShowForm(true);
  };

  const handleDeleteHoliday = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeleteHoliday = async () => {
    if (holiday) {
      deleteMutation.mutate(holiday.id);
    }
  };

  const handleSaveHoliday = async (data: HolidayFormData) => {
    if (holiday) {
      updateMutation.mutate({
        ...data,
        id: holiday.id
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/holidays')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Holidays
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading holiday details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !holiday) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/holidays')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Holidays
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-red-500">Holiday not found or failed to load.</p>
          <Button onClick={() => navigate('/holidays')} className="mt-4">
            Back to Holidays
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/holidays')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Holidays
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{holiday.name}</h1>
            <p className="text-gray-600">Holiday Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleEditHoliday}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Holiday
          </Button>
          <Button variant="destructive" onClick={handleDeleteHoliday}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Holiday
          </Button>
        </div>
      </div>

      {/* Holiday Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Holiday Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-lg font-semibold">{holiday.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Date</label>
              <p className="text-lg">{formatDate(holiday.date)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-gray-700">{holiday.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <div className="mt-1">
                  {holiday.is_recurring ? (
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <RotateCcw className="h-3 w-3" />
                      Recurring
                    </Badge>
                  ) : (
                    <Badge variant="outline">One-time</Badge>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(holiday.active_flag)}>
                    {holiday.active_flag ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="text-sm">{formatDateTime(holiday.created_at)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Modified</label>
              <p className="text-sm">{formatDateTime(holiday.modified_at)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Holiday ID</label>
              <p className="text-sm font-mono text-gray-600">{holiday.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Organization ID</label>
              <p className="text-sm font-mono text-gray-600">{holiday.organisation_id}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Holiday Form Modal */}
      <HolidayForm
        open={showForm}
        onOpenChange={setShowForm}
        holiday={holiday}
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
        itemName={holiday.name}
      />
    </div>
  );
}
