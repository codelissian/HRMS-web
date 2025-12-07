import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

interface FormActionsProps {
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  isLoading: boolean;
  isEditMode: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onSubmit,
  isLoading,
  isEditMode,
}) => {
  const handleClick = () => {
    console.log('🖱️ Update Employee button clicked');
    console.log('📝 Is loading:', isLoading);
    console.log('📝 Is edit mode:', isEditMode);
  };

  return (
    <div className="flex items-center justify-end">
      <Button 
        type="submit"
        disabled={isLoading}
        onClick={handleClick}
      >
        <Save className="h-4 w-4 mr-2" />
        {isLoading 
          ? 'Saving...' 
          : (isEditMode ? 'Update Employee' : 'Save Employee')
        }
      </Button>
    </div>
  );
};
