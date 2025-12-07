import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AttendancePolicy, AttendancePolicyFormData } from '@/types/attendance';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { LocationTracker } from './LocationTracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
// Custom SVG Icons
const BuildingIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 21h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 21V7l8-4v18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 21V11l-6-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LocationIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WebIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M2 12h20" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const MobileIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
    <line x1="12" y1="18" x2="12.01" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const LocationButtonIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="9" r="2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Validation schema
const attendancePolicySchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  geo_tracking_enabled: z.boolean(),
  geo_radius_meters: z.number().min(1, 'Radius must be at least 1 meter'),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  selfie_required: z.boolean(),
  web_attendance_enabled: z.boolean(),
  mobile_attendance_enabled: z.boolean(),
  regularization_enabled: z.boolean(),
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
  const queryClient = useQueryClient();
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
      latitude: '',
      longitude: '',
      selfie_required: false,
      web_attendance_enabled: true,
      mobile_attendance_enabled: true,
      regularization_enabled: true,
    }
  });

  const geoTrackingEnabled = watch('geo_tracking_enabled');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Handle location selection from LocationTracker
  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
  }) => {
    setLocationData({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    // Update form values
    reset({
      ...watch(),
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
    });
  };

  // Get current location using IP-based geolocation
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        // Update form values
        reset({
          ...watch(),
          latitude: data.latitude.toString(),
          longitude: data.longitude.toString(),
        });
        
        toast({
          title: "Success",
          description: `Location obtained: ${data.city}, ${data.country_name}`,
        });
      } else {
        throw new Error('Location data not available');
      }
    } catch (error) {
      console.error('Location fetch error:', error);
      toast({
        title: "Error",
        description: "Unable to retrieve your location. Please try again or enter manually.",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Reset form when policy changes
  useEffect(() => {
    if (policy && mode === 'edit') {
      reset({
        name: policy.name,
        geo_tracking_enabled: policy.geo_tracking_enabled,
        geo_radius_meters: policy.geo_radius_meters,
        latitude: policy.latitude || '',
        longitude: policy.longitude || '',
        selfie_required: policy.selfie_required,
        web_attendance_enabled: policy.web_attendance_enabled,
        mobile_attendance_enabled: policy.mobile_attendance_enabled,
        regularization_enabled: policy.regularization_enabled,
      });
    } else {
      reset();
    }
  }, [policy, mode, reset]);

  const onSubmit = async (data: AttendancePolicyFormData) => {
    setLoading(true);
    try {
      if (mode === 'create') {
        // Add organization_id to the payload
        const payload = {
          ...data,
          organisation_id: "bd3575a0-ff7e-4dcf-a6a7-c3dcbd1cdf44", // This should come from user context
        };
        
        await import('@/services/attendancePolicyService').then(
          ({ AttendancePolicyService }) => 
            AttendancePolicyService.create(payload)
        );
        
        toast({
          title: "Success",
          description: "Attendance policy created successfully",
        });
        
        // Invalidate and refetch the attendance policies list
        queryClient.invalidateQueries({ queryKey: ['attendance-policies', 'list'] });
      } else if (policy) {
        await import('@/services/attendancePolicyService').then(
          ({ AttendancePolicyService }) => 
            AttendancePolicyService.update({
              ...data,
              id: policy.id,
              organisation_id: "bd3575a0-ff7e-4dcf-a6a7-c3dcbd1cdf44", // This should come from user context
            })
        );
        
        toast({
          title: "Success",
          description: "Attendance policy updated successfully",
        });
        
        // Invalidate and refetch the attendance policies list
        queryClient.invalidateQueries({ queryKey: ['attendance-policies', 'list'] });
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
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BuildingIcon className="h-6 w-6 text-blue-600" />
            {mode === 'create' ? 'Create New Policy' : 'Edit Policy'}
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 text-base">
            {mode === 'create' 
              ? 'Configure attendance tracking rules and policies for your organization'
              : 'Update the attendance policy settings'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Policy Name */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-blue-600" />
                Policy Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Policy Name <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder="e.g., Standard Office Policy"
                      className="h-12 text-base"
                      error={errors.name?.message}
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Tracking */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <LocationIcon className="h-5 w-5 text-green-600" />
                Location Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="space-y-1">
                  <Label htmlFor="geo_tracking" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enable Geo-tracking
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Track employee location when marking attendance
                  </p>
                </div>
                <Controller
                  name="geo_tracking_enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="geo_tracking"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-green-600"
                    />
                  )}
                />
              </div>

              {geoTrackingEnabled && (
                <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                  {/* Location Button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Get Current Location
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Automatically fill in your current coordinates
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="flex items-center gap-2 bg-white hover:bg-gray-50 border-green-300 text-green-700 hover:text-green-800"
                    >
                      <LocationButtonIcon className="h-4 w-4" />
                      {isGettingLocation ? 'Getting...' : 'Get Location'}
                    </Button>
                  </div>
                  
                  {/* Location Fields */}
                  
                  {/* Geo Radius Field */}
                  <div className="space-y-2">
                    <Label htmlFor="geo_radius_meters" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Geo Radius (meters) <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      name="geo_radius_meters"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="number"
                          min="1"
                          placeholder="e.g., 100"
                          className="h-12 text-base"
                          error={errors.geo_radius_meters?.message}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      )}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Set the radius in meters for location validation
                    </p>
                  </div>

                  {/* Google Maps Location Tracker */}
                  <div className="mt-6">
                    <LocationTracker
                      onLocationSelect={handleLocationSelect}
                      initialLocation={locationData || undefined}
                      disabled={false}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Methods */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <WebIcon className="h-5 w-5 text-purple-600" />
                Attendance Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <WebIcon className="h-5 w-5 text-purple-600" />
                    <div className="space-y-1">
                      <Label htmlFor="web_attendance" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Web Attendance
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Allow attendance via web browser
                      </p>
                    </div>
                  </div>
                  <Controller
                    name="web_attendance_enabled"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="web_attendance"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-purple-600"
                      />
                    )}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MobileIcon className="h-5 w-5 text-orange-600" />
                    <div className="space-y-1">
                      <Label htmlFor="mobile_attendance" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mobile Attendance
                      </Label>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Allow attendance via mobile app
                      </p>
                    </div>
                  </div>
                  <Controller
                    name="mobile_attendance_enabled"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="mobile_attendance"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-orange-600"
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Features */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldIcon className="h-5 w-5 text-blue-600" />
                Security Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShieldIcon className="h-5 w-5 text-blue-600" />
                  <div className="space-y-1">
                    <Label htmlFor="selfie_required" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Require Selfie Verification
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Employees must take a selfie when marking attendance
                    </p>
                  </div>
                </div>
                <Controller
                  name="selfie_required"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="selfie_required"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ShieldIcon className="h-5 w-5 text-green-600" />
                  <div className="space-y-1">
                    <Label htmlFor="regularization_enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Regularization
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Allow employees to regularize their attendance
                    </p>
                  </div>
                </div>
                <Controller
                  name="regularization_enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="regularization_enabled"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-green-600"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="pt-6 border-t">
            <div className="flex gap-3 w-full">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                disabled={loading}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !isValid}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Saving...' : mode === 'create' ? 'Create Policy' : 'Update Policy'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
