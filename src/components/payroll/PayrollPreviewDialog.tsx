import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PayrollPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  htmlContent: string;
  payrollId?: string;
}

export function PayrollPreviewDialog({
  open,
  onOpenChange,
  htmlContent,
  payrollId,
}: PayrollPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Payroll Preview</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto border-t bg-gray-50 p-4">
          <div 
            className="bg-white shadow-sm rounded-lg overflow-hidden"
            style={{ zoom: 0.6 }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              className="payroll-preview"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

