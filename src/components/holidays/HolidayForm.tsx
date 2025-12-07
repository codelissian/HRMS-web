import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Holiday, HolidayFormData } from '@/types/holiday';

// Form validation schema
const holidayFormSchema = z.object({
  name: z.string().min(1, "Holiday name is required"),
  date: z.string().min(1, "Holiday date is required"),
  description: z.string().min(1, "Description is required"),
  is_recurring: z.boolean(),
});

interface HolidayFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  holiday?: Holiday | null;
  onSave: (data: HolidayFormData) => void;
}

export function HolidayForm({ open, onOpenChange, holiday, onSave }: HolidayFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm<HolidayFormData>({
    resolver: zodResolver(holidayFormSchema),
    defaultValues: {
      name: '',
      date: '',
      description: '',
      is_recurring: false,
    },
  });

  // Set form data when editing
  useEffect(() => {
    if (open && holiday) {
      reset({
        name: holiday.name,
        date: holiday.date.split('T')[0], // Convert ISO date to YYYY-MM-DD format
        description: holiday.description,
        is_recurring: holiday.is_recurring,
      });
    } else if (open && !holiday) {
      // Reset form for new holiday
      reset({
        name: '',
        date: '',
        description: '',
        is_recurring: false,
      });
    }
  }, [open, holiday, reset]);

  const handleFormSubmit = async (data: HolidayFormData) => {
    setIsLoading(true);
    try {
      // Convert date to ISO format and set active_flag to true
      const formattedData = {
        ...data,
        date: new Date(data.date).toISOString(),
        active_flag: true, // Always set to true
      };
      await onSave(formattedData);
    } catch (error) {
      console.error('Error saving holiday:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset({
      name: '',
      date: '',
      description: '',
      is_recurring: false,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{holiday ? 'Edit Holiday' : 'Create New Holiday'}</DialogTitle>
          <DialogDescription>
            {holiday ? 'Update the holiday information below.' : 'Add a new holiday to your organization.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Holiday Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Christmas Day"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Holiday Date <span className="text-red-500">*</span></Label>
            <Input
              id="date"
              type="date"
              {...register('date')}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description <span className="text-red-500">*</span></Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe the holiday..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_recurring">Recurring Holiday</Label>
            <Controller
              name="is_recurring"
              control={control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (holiday ? 'Update Holiday' : 'Create Holiday')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
