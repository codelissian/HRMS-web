import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ChevronDown, ChevronRight, Calendar, Settings } from 'lucide-react';
import { WorkDayRule, WorkDayRuleFormData } from '@/types/workDayRule';

// Form validation schema
const workDayRuleFormSchema = z.object({
  name: z.string().min(1, "Work day rule name is required"),
  workweek: z.enum(['five_days', 'six_days', 'seven_days']),
  include_monday_in_payroll: z.boolean(),
  include_tuesday_in_payroll: z.boolean(),
  include_wednesday_in_payroll: z.boolean(),
  include_thursday_in_payroll: z.boolean(),
  include_friday_in_payroll: z.boolean(),
  include_saturday_in_payroll: z.boolean(),
  include_sunday_in_payroll: z.boolean(),
});

interface WorkDayRuleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workDayRule?: WorkDayRule | null;
  onSave: (data: WorkDayRuleFormData) => void;
}

// Work week presets
const workWeekPresets = {
  five_days: {
    name: "5-Day Work Week",
    description: "Standard Monday to Friday working week",
    icon: "📅",
    days: { 
      monday: true, 
      tuesday: true, 
      wednesday: true, 
      thursday: true, 
      friday: true, 
      saturday: false, 
      sunday: false 
    },
    payrollDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    }
  },
  six_days: {
    name: "6-Day Work Week",
    description: "Monday to Saturday working week",
    icon: "📆",
    days: { 
      monday: true, 
      tuesday: true, 
      wednesday: true, 
      thursday: true, 
      friday: true, 
      saturday: true, 
      sunday: false 
    },
    payrollDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: false
    }
  },
  seven_days: {
    name: "7-Day Work Week",
    description: "All days working week",
    icon: "🗓️",
    days: { 
      monday: true, 
      tuesday: true, 
      wednesday: true, 
      thursday: true, 
      friday: true, 
      saturday: true, 
      sunday: true 
    },
    payrollDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    }
  }
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function WorkDayRuleForm({ open, onOpenChange, workDayRule, onSave }: WorkDayRuleFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'five_days' | 'six_days' | 'seven_days' | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<WorkDayRuleFormData>({
    resolver: zodResolver(workDayRuleFormSchema),
    defaultValues: {
      name: '',
      workweek: 'five_days',
      include_monday_in_payroll: true,
      include_tuesday_in_payroll: true,
      include_wednesday_in_payroll: true,
      include_thursday_in_payroll: true,
      include_friday_in_payroll: true,
      include_saturday_in_payroll: false,
      include_sunday_in_payroll: false,
    },
  });

  const watchedWorkweek = watch('workweek');

  // Apply preset when workweek changes
  useEffect(() => {
    if (watchedWorkweek && workWeekPresets[watchedWorkweek]) {
      const preset = workWeekPresets[watchedWorkweek];
      setSelectedPreset(watchedWorkweek);
      
      // Apply preset days
      Object.entries(preset.days).forEach(([day, isWorking]) => {
        setValue(day.toLowerCase() as keyof WorkDayRuleFormData, isWorking);
      });
      
      // Apply preset payroll days
      Object.entries(preset.payrollDays).forEach(([day, includeInPayroll]) => {
        setValue(`include_${day.toLowerCase()}_in_payroll` as keyof WorkDayRuleFormData, includeInPayroll);
      });
    }
  }, [watchedWorkweek, setValue]);

  // Set form data when editing
  useEffect(() => {
    if (open && workDayRule) {
      reset({
        name: workDayRule.name,
        workweek: workDayRule.workweek,
        include_monday_in_payroll: workDayRule.include_monday_in_payroll || false,
        include_tuesday_in_payroll: workDayRule.include_tuesday_in_payroll || false,
        include_wednesday_in_payroll: workDayRule.include_wednesday_in_payroll || false,
        include_thursday_in_payroll: workDayRule.include_thursday_in_payroll || false,
        include_friday_in_payroll: workDayRule.include_friday_in_payroll || false,
        include_saturday_in_payroll: workDayRule.include_saturday_in_payroll || false,
        include_sunday_in_payroll: workDayRule.include_sunday_in_payroll || false,
      });
      setSelectedPreset(workDayRule.workweek);
    } else if (open && !workDayRule) {
      reset({
        name: '',
        workweek: 'five_days',
        include_monday_in_payroll: true,
        include_tuesday_in_payroll: true,
        include_wednesday_in_payroll: true,
        include_thursday_in_payroll: true,
        include_friday_in_payroll: true,
        include_saturday_in_payroll: false,
        include_sunday_in_payroll: false,
      });
      setSelectedPreset('five_days');
    }
  }, [open, workDayRule, reset]);

  const handleFormSubmit = async (data: WorkDayRuleFormData) => {
    setIsLoading(true);
    try {
      // Get the selected preset to determine day settings
      const preset = workWeekPresets[data.workweek];
      
      // Add default values for missing fields
      const formattedData = {
        ...data,
        // Set day fields based on preset
        monday: preset.days.monday,
        tuesday: preset.days.tuesday,
        wednesday: preset.days.wednesday,
        thursday: preset.days.thursday,
        friday: preset.days.friday,
        saturday: preset.days.saturday,
        sunday: preset.days.sunday,
        // Set payroll inclusion based on form data
        include_monday_in_payroll: data.include_monday_in_payroll,
        include_tuesday_in_payroll: data.include_tuesday_in_payroll,
        include_wednesday_in_payroll: data.include_wednesday_in_payroll,
        include_thursday_in_payroll: data.include_thursday_in_payroll,
        include_friday_in_payroll: data.include_friday_in_payroll,
        include_saturday_in_payroll: data.include_saturday_in_payroll,
        include_sunday_in_payroll: data.include_sunday_in_payroll,
        active_flag: true,
        delete_flag: false,
        // Set all patterns to 'none' by default
        monday_pattern: 'none',
        tuesday_pattern: 'none',
        wednesday_pattern: 'none',
        thursday_pattern: 'none',
        friday_pattern: 'none',
        saturday_pattern: 'none',
        sunday_pattern: 'none',
        // Set all include_in_pattern to false by default
        include_monday_in_pattern: false,
        include_tuesday_in_pattern: false,
        include_wednesday_in_pattern: false,
        include_thursday_in_pattern: false,
        include_friday_in_pattern: false,
        include_saturday_in_pattern: false,
        include_sunday_in_pattern: false,
      };
      await onSave(formattedData);
    } catch (error) {
      console.error('Error saving work day rule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset({
      name: '',
      workweek: 'five_days',
      include_monday_in_payroll: true,
      include_tuesday_in_payroll: true,
      include_wednesday_in_payroll: true,
      include_thursday_in_payroll: true,
      include_friday_in_payroll: true,
      include_saturday_in_payroll: false,
      include_sunday_in_payroll: false,
    });
    setSelectedPreset(null);
    setShowAdvanced(false);
    onOpenChange(false);
  };

  const getWorkingDays = () => {
    const preset = workWeekPresets[watchedWorkweek];
    const workingDays = [];
    days.forEach(day => {
      const dayKey = day.toLowerCase() as keyof typeof preset.days;
      if (preset.days[dayKey]) {
        workingDays.push(day);
      }
    });
    return workingDays;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {workDayRule ? 'Edit Work Day Rule' : 'Create New Work Day Rule'}
          </DialogTitle>
          <DialogDescription>
            {workDayRule ? 'Update the work day rule configuration below.' : 'Configure a new work day rule for your organization.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details for the work day rule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g., Standard Working Week"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Work Week Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Work Week Type</CardTitle>
              <CardDescription>Select a preset or customize your own</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(workWeekPresets).map(([key, preset]) => (
                  <Card 
                    key={key}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPreset === key ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setValue('workweek', key as any);
                      setSelectedPreset(key as any);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl mb-2">{preset.icon}</div>
                        <h3 className="font-semibold text-sm">{preset.name}</h3>
                        <p className="text-xs text-gray-600 mb-3">{preset.description}</p>
                        
                        {/* Day indicators */}
                        <div className="flex justify-center gap-1">
                          {days.map(day => {
                            const dayKey = day.toLowerCase() as keyof typeof preset.days;
                            const isWorking = preset.days[dayKey];
                            return (
                              <div 
                                key={day}
                                className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${
                                  isWorking 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                                }`}
                                title={day}
                              >
                                {day.charAt(0)}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Working days count */}
                        <div className="mt-2">
                          <Badge variant="outline" className="text-xs">
                            {Object.values(preset.days).filter(Boolean).length} working days
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>


          {/* Advanced Settings */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
                {showAdvanced ? <ChevronDown className="h-4 w-4 ml-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Payroll Inclusion</CardTitle>
                  <CardDescription>Select which days should be included in payroll calculations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {days.map(day => {
                      const preset = workWeekPresets[watchedWorkweek];
                      const dayKey = day.toLowerCase() as keyof typeof preset.days;
                      const isWorking = preset.days[dayKey];
                      const payrollKey = `include_${day.toLowerCase()}_in_payroll` as keyof WorkDayRuleFormData;
                      const includeInPayroll = watch(payrollKey);
                      
                      return (
                        <div key={day} className="text-center">
                          <div className="font-medium text-sm mb-2">{day}</div>
                          <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                            isWorking ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <Controller
                            name={payrollKey}
                            control={control}
                            render={({ field }) => (
                              <Switch 
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={!isWorking}
                                size="sm"
                              />
                            )}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {isWorking ? (includeInPayroll ? 'Included' : 'Excluded') : 'N/A'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>Review your work day rule configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {watch('name') || 'Untitled Rule'}</p>
                <p><strong>Work Week:</strong> {workWeekPresets[watchedWorkweek]?.name || 'Custom'}</p>
                <p><strong>Working Days:</strong> {getWorkingDays().join(', ') || 'None'}</p>
                <p><strong>Total Working Days:</strong> {getWorkingDays().length} days per week</p>
                <p><strong>Payroll Days:</strong> {
                  days.filter(day => {
                    const payrollKey = `include_${day.toLowerCase()}_in_payroll` as keyof WorkDayRuleFormData;
                    return watch(payrollKey);
                  }).join(', ') || 'None'
                }</p>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (workDayRule ? 'Update Rule' : 'Create Rule')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
