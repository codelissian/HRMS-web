import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center h-64 ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

interface ErrorStateProps {
  error: any;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="text-center py-8">
      <p className="text-red-600 dark:text-red-400">
        Error loading employee: {error instanceof Error ? error.message : 'Employee not found'}
      </p>
      {onRetry && (
        <Button onClick={onRetry} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Employees
        </Button>
      )}
    </div>
  );
};
