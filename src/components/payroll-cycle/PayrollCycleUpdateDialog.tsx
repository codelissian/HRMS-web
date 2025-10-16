import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PayrollCycle } from '@/types/payrollCycle';

interface PayrollCycleUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payrollCycle: PayrollCycle | null;
  onUpdate: (id: string, status: string) => Promise<void>;
}

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'PAID', label: 'Paid' },
];

export function PayrollCycleUpdateDialog({
  open,
  onOpenChange,
  payrollCycle,
  onUpdate,
}: PayrollCycleUpdateDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Set initial status when dialog opens
  React.useEffect(() => {
    if (open && payrollCycle) {
      setSelectedStatus(payrollCycle.status);
    }
  }, [open, payrollCycle]);

  const handleUpdate = async () => {
    if (!payrollCycle || !selectedStatus) return;

    try {
      setIsUpdating(true);
      await onUpdate(payrollCycle.id, selectedStatus);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating payroll cycle:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedStatus('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Payroll Cycle Status</DialogTitle>
          <DialogDescription>
            Update the status for "{payrollCycle?.name}"
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          <Label className="text-lg font-semibold text-gray-900 mb-4 block">Select Status</Label>
          <div className="grid grid-cols-1 gap-3">
            {statusOptions.map((option) => {
              const isSelected = selectedStatus === option.value;
              const getStatusStyles = (value: string) => {
                switch (value) {
                  case 'DRAFT':
                    return {
                      bg: isSelected ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-200 hover:bg-gray-50',
                      text: 'text-gray-700'
                    };
                  case 'PROCESSING':
                    return {
                      bg: isSelected ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200 hover:bg-blue-50',
                      text: 'text-blue-700'
                    };
                  case 'PAID':
                    return {
                      bg: isSelected ? 'bg-green-100 border-green-400' : 'bg-white border-gray-200 hover:bg-green-50',
                      text: 'text-green-700'
                    };
                  default:
                    return {
                      bg: isSelected ? 'bg-gray-100 border-gray-400' : 'bg-white border-gray-200 hover:bg-gray-50',
                      text: 'text-gray-700'
                    };
                }
              };
              
              const styles = getStatusStyles(option.value);
              
              return (
                <div
                  key={option.value}
                  className={`
                    relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md
                    ${styles.bg}
                    ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 shadow-lg' : 'hover:shadow-sm'}
                  `}
                  onClick={() => setSelectedStatus(option.value)}
                >
                  <div className="flex-1">
                    <div className={`font-medium text-base ${styles.text}`}>
                      {option.label}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {option.value === 'DRAFT' && 'Work in progress, not yet finalized'}
                      {option.value === 'PROCESSING' && 'Currently being processed and calculated'}
                      {option.value === 'PAID' && 'Successfully completed and paid out'}
                    </div>
                  </div>
                  
                  {/* Custom radio indicator */}
                  <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                    ${isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300 bg-white'
                    }
                  `}>
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating || !selectedStatus}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isUpdating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}