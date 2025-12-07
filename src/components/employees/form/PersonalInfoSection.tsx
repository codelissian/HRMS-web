import { UseFormRegister, Control, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Controller } from 'react-hook-form';
import { formatDateForInput } from '@/lib/date-utils';
import { ExtendedInsertEmployee } from '@/hooks/useEmployeeForm';

interface PersonalInfoSectionProps {
  register: UseFormRegister<ExtendedInsertEmployee>;
  control: Control<ExtendedInsertEmployee>;
  errors: FieldErrors<ExtendedInsertEmployee>;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  register,
  control,
  errors,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              {...register('name')}
              error={errors.name?.message}
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
              placeholder="Enter email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
            <Input
              id="mobile"
              {...register('mobile')}
              error={errors.mobile?.message}
              placeholder="Enter mobile number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Controller
              name="date_of_birth"
              control={control}
              render={({ field }) => (
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    field.onChange(date);
                  }}
                  error={errors.date_of_birth?.message}
                />
              )}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            {...register('address')}
            error={errors.address?.message}
            placeholder="Enter address"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
};
