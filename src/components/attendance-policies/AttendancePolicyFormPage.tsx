import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
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

const OnDutyIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WorkFromHomeIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2v20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Validation schema
const attendancePolicySchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  geo_tracking_enabled: z.boolean(),
  geo_radius_meters: z.number().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  selfie_required: z.boolean(),
  web_attendance_enabled: z.boolean(),
  mobile_attendance_enabled: z.boolean(),
  regularization_enabled: z.boolean(),
  on_duty_enabled: z.boolean(),
  work_from_home_enabled: z.boolean(),
});

interface AttendancePolicyFormPageProps {
  policy?: AttendancePolicy | null;
  mode: 'create' | 'edit';
  onSuccess: () => void;
  onCancel: () => void;
}

export const AttendancePolicyFormPage = forwardRef<{ submitForm: () => void }, AttendancePolicyFormPageProps>(({ 
  policy, 
  mode, 
  onSuccess,
  onCancel
}, ref) => {
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
      geo_radius_meters: undefined,
      latitude: '',
      longitude: '',
      selfie_required: false,
      web_attendance_enabled: true,
      mobile_attendance_enabled: true,
      regularization_enabled: true,
      on_duty_enabled: true,
      work_from_home_enabled: true,
    }
  });

  const geoTrackingEnabled = watch('geo_tracking_enabled');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Expose submitForm method to parent component
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      console.log('submitForm called');
      console.log('Form errors:', errors);
      console.log('Form isValid:', isValid);
      console.log('Form values:', watch());
      
      // Trigger form validation and submission
      handleSubmit(onSubmit)();
    }
  }));

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

  // Get current location using browser geolocation API
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    
    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      // Get current position using browser geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Update form values
      reset({
        ...watch(),
        latitude: latitude.toString(),
        longitude: longitude.toString(),
      });

      // Update location data for the map
      setLocationData({
        latitude,
        longitude
      });
      
      toast({
        title: "Success",
        description: `Current location obtained: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      });
    } catch (error) {
      console.error('Location fetch error:', error);
      let errorMessage = "Unable to retrieve your location. Please try again or enter manually.";
      
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please allow location access and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable. Please try again.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
        name: policy?.data?.name,
        geo_tracking_enabled: policy?.data?.geo_tracking_enabled,
        geo_radius_meters: policy?.data?.geo_radius_meters,
        latitude: policy?.data?.latitude || '',
        longitude: policy?.data?.longitude || '',
        selfie_required: policy?.data?.selfie_required,
        web_attendance_enabled: policy?.data?.web_attendance_enabled,
        mobile_attendance_enabled: policy?.data?.mobile_attendance_enabled,
        regularization_enabled: policy?.data?.regularization_enabled,
        on_duty_enabled: policy?.data?.on_duty_enabled,
        work_from_home_enabled: policy?.data?.work_from_home_enabled,
      });

      // Update locationData for the map if coordinates exist
      if (policy?.data?.latitude && policy?.data?.longitude) {
        setLocationData({
          latitude: parseFloat(policy.data.latitude),
          longitude: parseFloat(policy.data.longitude)
        });
      }
    } else {
      reset();
      setLocationData(null);
    }
  }, [policy, mode, reset]);

  const onSubmit = async (data: AttendancePolicyFormData) => {
    console.log('onSubmit called with data:', data);
    setLoading(true);
    try {
      if (mode === 'create') {
        // Remove on_duty_enabled and work_from_home_enabled from the payload before sending to API
        const { on_duty_enabled, work_from_home_enabled, ...dataWithoutExcludedFields } = data;
        
        // Add organization_id to the payload
        const payload = {
          ...dataWithoutExcludedFields,
          organisation_id: user?.organisation_id || "bd3575a0-ff7e-4dcf-a6a7-c3dcbd1cdf44",
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
        // Remove on_duty_enabled and work_from_home_enabled from the payload before sending to API
        const { on_duty_enabled, work_from_home_enabled, ...dataWithoutExcludedFields } = data;
        
        await import('@/services/attendancePolicyService').then(
          ({ AttendancePolicyService }) => 
            AttendancePolicyService.update({
              ...dataWithoutExcludedFields,
              id: policy?.data?.id,
              organisation_id: user?.organisation_id || "bd3575a0-ff7e-4dcf-a6a7-c3dcbd1cdf44",
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

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Policy Name */}
        <div className="space-y-2 max-w-[500px]">
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

        {/* Attendance Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-blue-600" />
              Attendance Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-2">
              {/* Web Attendance */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
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

              {/* Mobile Attendance */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
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

              {/* Selfie Verification */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
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

              {/* Regularization */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
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

              {/* On Duty */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <OnDutyIcon className="h-5 w-5 text-indigo-600" />
                  <div className="space-y-1">
                    <Label htmlFor="on_duty_enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable On Duty
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Allow employees to mark themselves as on duty
                    </p>
                  </div>
                </div>
                <Controller
                  name="on_duty_enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="on_duty_enabled"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-indigo-600"
                    />
                  )}
                />
              </div>

              {/* Work From Home */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <WorkFromHomeIcon className="h-5 w-5 text-teal-600" />
                  <div className="space-y-1">
                    <Label htmlFor="work_from_home_enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Work From Home
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Allow employees to work from home and mark attendance remotely
                    </p>
                  </div>
                </div>
                <Controller
                  name="work_from_home_enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="work_from_home_enabled"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-teal-600"
                    />
                  )}
                />
              </div>

              {/* Geo Tracking */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <LocationIcon className="h-5 w-5 text-emerald-600" />
                  <div className="space-y-1">
                    <Label htmlFor="geo_tracking_enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Geo Tracking
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Track employee location when marking attendance
                    </p>
                  </div>
                </div>
                <Controller
                  name="geo_tracking_enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="geo_tracking_enabled"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Tracking - Only visible when geo tracking is enabled */}
        {geoTrackingEnabled && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <LocationIcon className="h-5 w-5 text-green-600" />
                Location Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use the map below to set the location and adjust the geo-fencing radius. The radius can be controlled using the slider on the map.
                </p>
              </div>

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

                {/* Google Maps Location Tracker */}
                <div className="mt-6">
                  <LocationTracker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={locationData || undefined}
                    disabled={false}
                    radius={watch('geo_radius_meters') ?? 0}
                    onRadiusChange={(radius) => {
                      reset({
                        ...watch(),
                        geo_radius_meters: radius
                      });
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </form>
    </div>
  );
});
