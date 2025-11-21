import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
          <DialogTitle className="flex items-center justify-between">
            <span>Payroll Preview</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
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

