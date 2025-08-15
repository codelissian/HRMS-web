import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AttendancePolicy, AttendancePolicyFormData } from '@/types/attendance';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

// Validation schema
const attendancePolicySchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  geo_tracking_enabled: z.boolean(),
  geo_radius_meters: z.number().min(1, 'Radius must be at least 1 meter'),
  selfie_required: z.boolean(),
  web_attendance_enabled: z.boolean(),
  mobile_attendance_enabled: z.boolean(),
  grace_period_minutes: z.number().min(0, 'Grace period cannot be negative'),
  overtime_threshold_hours: z.number().min(0, 'Overtime threshold cannot be negative'),
  break_management_enabled: z.boolean(),
  regularization_enabled: z.boolean(),
  active_flag: z.boolean(),
});

interface AttendancePolicyFormProps {
  open: boolean;
  onClose: () => void;
  policy?: AttendancePolicy | null;
  mode: 'create' | 'edit';
  onSuccess: () => void;
}

export function AttendancePolicyForm({ 
  open, 
  onClose, 
  policy, 
  mode, 
  onSuccess 
}: AttendancePolicyFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid }
  } = useForm<AttendancePolicyFormData>({
    resolver: zodResolver(attendancePolicySchema),
    defaultValues: {
      name: '',
      geo_tracking_enabled: false,
      geo_radius_meters: 100,
      selfie_required: false,
      web_attendance_enabled: true,
      mobile_attendance_enabled: true,
      grace_period_minutes: 15,
      overtime_threshold_hours: 8.0,
      break_management_enabled: true,
      regularization_enabled: true,
      active_flag: true,
    }
  });

  const geoTrackingEnabled = watch('geo_tracking_enabled');

  // Reset form when policy changes
  useEffect(() => {
    if (policy && mode === 'edit') {
      reset({
        name: policy.name,
        geo_tracking_enabled: policy.geo_tracking_enabled,
        geo_radius_meters: policy.geo_radius_meters,
        selfie_required: policy.selfie_required,
        web_attendance_enabled: policy.web_attendance_enabled,
        mobile_attendance_enabled: policy.mobile_attendance_enabled,
        grace_period_minutes: policy.grace_period_minutes,
        overtime_threshold_hours: policy.overtime_threshold_hours,
        break_management_enabled: policy.break_management_enabled,
        regularization_enabled: policy.regularization_enabled,
        active_flag: policy.active_flag,
      });
    } else {
      reset();
    }
  }, [policy, mode, reset]);

  const onSubmit = async (data: AttendancePolicyFormData) => {
    setLoading(true);
    try {
      if (mode === 'create') {
        await import('@/services/attendancePolicyService').then(
          ({ AttendancePolicyService }) => 
            AttendancePolicyService.create(data)
        );
        toast({
          title: "Success",
          description: "Attendance policy created successfully",
        });
      } else if (policy) {
        await import('@/services/attendancePolicyService').then(
          ({ AttendancePolicyService }) => 
            AttendancePolicyService.update({
              ...data,
              id: policy.id,
            })
        );
        toast({
          title: "Success",
          description: "Attendance policy updated successfully",
        });
      }
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save policy",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Attendance Policy' : 'Edit Attendance Policy'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Configure attendance tracking rules and policies for your organization'
              : 'Update the attendance policy settings'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Policy Name <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="Enter policy name"
                      error={errors.name?.message}
                    />
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grace_period_minutes">
                  Grace Period (minutes)
                </Label>
                <Controller
                  name="grace_period_minutes"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      step={1}
                      placeholder="15"
                      error={errors.grace_period_minutes?.message}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="overtime_threshold_hours">
                  Overtime Threshold (hours)
                </Label>
                <Controller
                  name="overtime_threshold_hours"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min={0}
                      step={0.5}
                      placeholder="8.0"
                      error={errors.overtime_threshold_hours?.message}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="geo_radius_meters">
                  Geo-radius (meters)
                </Label>
                <Controller
                  name="geo_radius_meters"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="number"
                      min={1}
                      step={1}
                      placeholder="100"
                      disabled={!geoTrackingEnabled}
                      error={errors.geo_radius_meters?.message}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Attendance Methods */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Attendance Methods
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="web_attendance_enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="web_attendance"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="web_attendance">Enable Web Attendance</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="mobile_attendance_enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="mobile_attendance"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="mobile_attendance">Enable Mobile Attendance</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Tracking */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Location Tracking
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="geo_tracking_enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="geo_tracking"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="geo_tracking">Enable Geo-tracking</Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Additional Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Additional Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="selfie_required"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="selfie_required"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="selfie_required">Require Selfie Verification</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="break_management_enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="break_management"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="break_management">Enable Break Management</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="regularization_enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="regularization"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="regularization">Enable Attendance Regularization</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="active_flag"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="active_flag"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label htmlFor="active_flag">Active Policy</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !isValid}>
              {loading ? 'Saving...' : mode === 'create' ? 'Create Policy' : 'Update Policy'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
