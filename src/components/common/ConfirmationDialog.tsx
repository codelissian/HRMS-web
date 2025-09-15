import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Info, AlertCircle, CheckCircle } from 'lucide-react';

export type ConfirmationType = 'delete' | 'warning' | 'info' | 'danger' | 'approve';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  type?: ConfirmationType;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  loading?: boolean;
  itemName?: string;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  type = 'delete',
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  loading = false,
  itemName,
}: ConfirmationDialogProps) {
  const getIcon = () => {
    switch (type) {
      case 'delete':
        return <Trash2 className="h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />;
      case 'danger':
        return <AlertCircle className="h-5 w-5" />;
      case 'info':
        return <Info className="h-5 w-5" />;
      case 'approve':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'delete':
      case 'danger':
        return 'destructive';
      case 'warning':
        return 'default';
      case 'info':
        return 'default';
      case 'approve':
        return 'default';
      default:
        return 'destructive';
    }
  };

  const getDefaultConfirmText = () => {
    switch (type) {
      case 'delete':
        return 'Delete';
      case 'warning':
        return 'Continue';
      case 'danger':
        return 'Reject';
      case 'info':
        return 'Confirm';
      case 'approve':
        return 'Approve';
      default:
        return 'Confirm';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'delete':
      case 'danger':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      case 'approve':
        return 'text-green-600';
      default:
        return 'text-red-600';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[480px] border-0 shadow-2xl">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${getIconColor()} bg-opacity-10`}>
              {getIcon()}
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
            {itemName && (
              <span className="block mt-2 font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                "{itemName}"
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex gap-3 pt-6">
          <AlertDialogCancel asChild>
            <Button 
              variant="outline" 
              disabled={loading}
              className="flex-1 h-11 font-medium"
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={getConfirmButtonVariant()}
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 h-11 font-medium ${
                type === 'approve' 
                  ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' 
                  : type === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                  : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                confirmText || getDefaultConfirmText()
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 