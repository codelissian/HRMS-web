import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SnackbarProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
  isVisible: boolean;
}

export default function Snackbar({
  message,
  type = 'success',
  duration = 5000,
  onClose,
  isVisible
}: SnackbarProps) {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      
      // Auto-hide after duration
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(() => {
          onClose?.();
        }, 300); // Wait for exit animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
      default:
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div
        className={cn(
          'flex items-center justify-between p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out',
          getStyles(),
          isShowing
            ? 'translate-x-0 opacity-100'
            : 'translate-x-full opacity-0'
        )}
        style={{ 
          animation: isShowing ? 'slideInRight 0.3s ease-out' : 'slideOutRight 0.3s ease-in' 
        }}
      >
        <div className="flex items-center space-x-3">
          {getIcon()}
          <p className="font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsShowing(false);
            setTimeout(() => {
              onClose?.();
            }, 300);
          }}
          className="ml-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 