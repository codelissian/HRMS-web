import { UseFormRegister, Control, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExtendedInsertEmployee } from '@/hooks/useEmployeeForm';

interface AdditionalInfoSectionProps {
  register: UseFormRegister<ExtendedInsertEmployee>;
  control: Control<ExtendedInsertEmployee>;
  errors: FieldErrors<ExtendedInsertEmployee>;
}

export const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  register,
  control,
  errors,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Additional Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pan_number">PAN Number</Label>
            <Input
              id="pan_number"
              {...register('pan_number')}
              error={errors.pan_number?.message}
              placeholder="PAN number"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
