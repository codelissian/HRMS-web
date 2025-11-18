import React, { useState, useEffect } from 'react';
import { EmptyState, LoadingSpinner } from '../../components/common';
import { ShiftForm, ShiftTable } from '../../components/shifts';
import { Clock, Plus } from 'lucide-react';
import { useShifts } from '../../contexts/ShiftsContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Pagination } from '../../components/common';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';

const ShiftsPage: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<any>(null);
  const { 
    shifts, 
    totalCount,
    pageCount,
    currentPage,
    pageSize,
    isLoading,
    searchTerm,
    fetchShifts, 
    selectShift, 
    deleteShift,
    setCurrentPage,
    setPageSize,
    setSearchTerm
  } = useShifts();

  // Fetch shifts on component mount
  useEffect(() => {
    fetchShifts();
  }, []);

  const handleEditShift = (shift: any) => {
    selectShift(shift);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteShift = async (shiftId: string) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
      setShiftToDelete(shift);
      setIsDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (shiftToDelete) {
      await deleteShift(shiftToDelete.id);
      setIsDeleteDialogOpen(false);
      setShiftToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search shifts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center gap-2 bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white"
        >
          <Plus className="h-4 w-4" />
          Create Shift
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh] w-full">
          <LoadingSpinner />
        </div>
      ) : totalCount > 0 ? (
        <>
          {/* Shifts Table */}
          <ShiftTable
            shifts={shifts}
            loading={isLoading}
            onEdit={handleEditShift}
            onDelete={handleDeleteShift}
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
                  onPageSizeChange={setPageSize}
                  showFirstLast={false}
                />
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <EmptyState
          icon={Clock}
          title="No shifts configured"
          description="Get started by creating your first work shift. You can set up different shift types like day shift, night shift, or flexible hours."
          action={{
            label: "Create Shift",
            onClick: () => setIsCreateDialogOpen(true)
          }}
        />
      )}

      <ShiftForm
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the shift "{shiftToDelete?.name}"? 
              This action cannot be undone and will permanently remove the shift from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Shift
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ShiftsPage; 