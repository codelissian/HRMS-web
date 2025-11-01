import React, { useState, useEffect } from 'react';
import { EmptyState, Pagination } from '../../components/common';
import { ShiftForm } from '../../components/shifts';
import { Clock, Edit, Power, PowerOff, Trash2 } from 'lucide-react';
import { useShifts } from '../../contexts/ShiftsContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
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
    fetchShifts, 
    selectShift, 
    toggleShiftStatus,
    deleteShift,
    setCurrentPage,
    setPageSize
  } = useShifts();

  // Fetch shifts on component mount
  useEffect(() => {
    fetchShifts();
  }, []);

  const handleEditShift = (shift: any) => {
    selectShift(shift);
    setIsCreateDialogOpen(true);
  };

  const handleToggleStatus = async (shiftId: string) => {
    await toggleShiftStatus(shiftId);
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
    <div className="container mx-auto px-4 py-8">
      {/* Search and Actions */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search shifts..."
                className="max-w-md"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Create Shift
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading shifts...</p>
        </div>
      ) : totalCount > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Current Shifts ({totalCount})
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {shifts.map((shift) => (
              <div key={shift.id} className="px-6 py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {shift.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {shift.start} - {shift.end} 
                      (Grace: {shift.grace_minutes} min)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {shift.active_flag ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                    
                    <Button
                      onClick={() => handleToggleStatus(shift.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                      title={shift.active_flag ? "Deactivate Shift" : "Activate Shift"}
                    >
                      {shift.active_flag ? (
                        <PowerOff className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      ) : (
                        <Power className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => handleEditShift(shift)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Edit Shift"
                    >
                      <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                    
                    <Button
                      onClick={() => handleDeleteShift(shift.id)}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20"
                      title="Delete Shift"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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

      {/* Pagination */}
      {totalCount > 0 && (
        <Card className="mt-4">
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