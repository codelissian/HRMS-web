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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Payroll Preview</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto border rounded-lg p-4 bg-white">
          <div
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            className="payroll-preview"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

