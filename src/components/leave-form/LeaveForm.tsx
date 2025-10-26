import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Leave } from '../../types/database';
import { leaveFormSchema, LeaveFormData } from '../../types/forms';
import { ColorPicker } from '@/components/common';



interface LeaveFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave?: Leave | null;
  onSave: (data: LeaveFormData) => void;
}

export function LeaveForm({ open, onOpenChange, leave, onSave }: LeaveFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  console.log('🔍 LeaveForm rendered with props:', { 
    open, 
    leave: leave?.id || 'new', 
    onSave: !!onSave 
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
    setValue,
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      color: '#3B82F6',
      icon: '📋',
      expiry_method: 'YEARLY', // ✅ Added: Backend expects this field
      accrual_method: 'MONTHLY',
      accrual_rate: 0,
      allow_carry_forward: false,
      carry_forward_limit: 0,
      carry_forward_expiry_months: 0,
      allow_encashment: false,
      encashment_rate: 0,
      requires_approval: false,
      requires_documentation: false,
      required_documents: [],
      auto_approve_for_days: 0,
      approval_levels: 1,
      min_service_months: 0,
      min_advance_notice_days: 0,
      max_consecutive_days: 0,
      blackout_dates: [],
      // ❌ Removed: category, initial_balance, max_balance, min_balance, active_flag
    },
  });

  // Watch form values for conditional rendering
  const watchedAccrualMethod = watch('accrual_method');
  const watchedAllowCarryForward = watch('allow_carry_forward');
  const watchedAllowEncashment = watch('allow_encashment');
  const watchedRequiresApproval = watch('requires_approval');
  
  // Debug form state
  console.log('🔍 Form state:', { 
    open, 
    isLoading, 
    errors: Object.keys(errors),
    formValues: {
      name: watch('name'),
      code: watch('code'),
      accrual_method: watch('accrual_method')
    }
  });

  // Set form data when editing
  useEffect(() => {
    console.log('🔄 LeaveForm useEffect triggered:', { open, leave: leave?.id || 'new' });
    
    if (open && leave) {
      console.log('📝 Setting form data for editing leave:', leave.id);
      reset({
        name: leave.name,
        code: leave.code,
        description: leave.description || '',
        color: leave.color || '#3B82F6',
        icon: leave.icon || '📋',
        expiry_method: (leave as any).expiry_method || 'YEARLY', // ✅ Added: Backend expects this field
        accrual_method: (leave.accrual_method as 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'NONE') || 'MONTHLY',
        accrual_rate: leave.accrual_rate || 0,
        allow_carry_forward: leave.allow_carry_forward || false,
        carry_forward_limit: leave.carry_forward_limit || 0,
        carry_forward_expiry_months: leave.carry_forward_expiry_months || 0,
        allow_encashment: leave.allow_encashment || false,
        encashment_rate: leave.encashment_rate || 0,
        requires_approval: leave.requires_approval || true,
        requires_documentation: leave.requires_documentation || false,
        required_documents: Array.isArray(leave.required_documents) ? leave.required_documents : [],
        auto_approve_for_days: leave.auto_approve_for_days || 0,
        approval_levels: typeof leave.approval_levels === 'string' ? parseInt(leave.approval_levels) : (leave.approval_levels || 1),
        min_service_months: leave.min_service_months || 0,
        min_advance_notice_days: leave.min_advance_notice_days || 0,
        max_consecutive_days: leave.max_consecutive_days || 0,
        blackout_dates: Array.isArray(leave.blackout_dates) ? leave.blackout_dates : [],
        // ❌ Removed: category, initial_balance, max_balance, min_balance, active_flag
      });
    } else if (open && !leave) {
      console.log('🆕 Setting form data for new leave');
      // Reset form for new leave with proper default values
      reset({
        name: '',
        code: '',
        description: '',
        color: '#3B82F6', // ✅ Fixed: Default blue color
        icon: '📋', // ✅ Fixed: Default icon
        expiry_method: 'YEARLY', // ✅ Added: Backend expects this field
        accrual_method: 'MONTHLY',
        accrual_rate: 0,
        allow_carry_forward: false,
        carry_forward_limit: 0,
        carry_forward_expiry_months: 0,
        allow_encashment: false,
        encashment_rate: 0,
        requires_approval: false,
        requires_documentation: false,
        required_documents: [],
        auto_approve_for_days: 0,
        approval_levels: 1,
        min_service_months: 0,
        min_advance_notice_days: 0,
        max_consecutive_days: 0,
        blackout_dates: [],
        // ❌ Removed: category, initial_balance, max_balance, min_balance, active_flag
      });
    }
  }, [open, leave, reset]);

  const handleFormSubmit = async (data: LeaveFormData) => {
    console.log('📝 Form submitted with data:', data);
    console.log('🔍 Form errors:', errors);
    console.log('📝 Form is valid:', Object.keys(errors).length === 0);
    
    if (Object.keys(errors).length > 0) {
      console.log('❌ Form validation failed, preventing submission');
      console.log('❌ Validation errors:', errors);
      return;
    }
    
    console.log('✅ Form validation passed, proceeding with submission');
    
    setIsLoading(true);
    try {
      console.log('📡 Calling onSave callback');
      onSave(data);
      console.log('✅ onSave callback completed');
    } catch (error) {
      console.error('❌ Error in handleFormSubmit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    console.log('🚪 Closing LeaveForm dialog');
    // Reset form to default state when closing
    reset({
      name: '',
      code: '',
      description: '',
      color: '#3B82F6', // ✅ Fixed: Default blue color
      icon: '📋', // ✅ Fixed: Default icon
      expiry_method: 'YEARLY', // ✅ Added: Backend expects this field
      accrual_method: 'MONTHLY',
      accrual_rate: 0,
      allow_carry_forward: false,
      carry_forward_limit: 0,
      carry_forward_expiry_months: 0,
      allow_encashment: false,
      encashment_rate: 0,
      requires_approval: false,
      requires_documentation: false,
      required_documents: [],
      auto_approve_for_days: 0,
      approval_levels: 1,
      min_service_months: 0,
      min_advance_notice_days: 0,
      max_consecutive_days: 0,
      blackout_dates: [],
      // ❌ Removed: category, initial_balance, max_balance, min_balance, active_flag
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{leave ? 'Edit Leave Type' : 'Create New Leave Type'}</DialogTitle>
          <DialogDescription>
            {leave ? 'Update the leave type configuration below.' : 'Configure a new leave type for your organization.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Leave Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g., Annual Leave"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="code">Leave Code <span className="text-red-500">*</span></Label>
                <Input
                  id="code"
                  {...register('code')}
                  placeholder="e.g., AL"
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <ColorPicker
                  value={watch('color')}
                  onChange={(color) => setValue('color', color)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Input
                  id="icon"
                  {...register('icon')}
                  placeholder="🏖️"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the leave type and its purpose..."
                rows={3}
              />
            </div>
          </div>

          {/* Leave Configuration */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Leave Configuration
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="accrual_method">
                  Accrual Method <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="accrual_method"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select accrual method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="NONE">No Accrual</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              
              {watchedAccrualMethod !== 'NONE' && (
                <div className="space-y-2">
                  <Label htmlFor="accrual_rate">
                    Accrual Rate (days)
                  </Label>
                  <Input
                    id="accrual_rate"
                    type="number"
                    step="0.5"
                    {...register('accrual_rate', { valueAsNumber: true })}
                    placeholder="2.5"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="expiry_method">
                  Expiry Method
                </Label>
                <Controller
                  name="expiry_method"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expiry method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="YEARLY">Yearly</SelectItem>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="NONE">No Expiry</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
              Advanced Settings
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow_carry_forward">Allow Carry Forward</Label>
                  <Controller
                    name="allow_carry_forward"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                {watchedAllowCarryForward && (
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <Label htmlFor="carry_forward_limit">Carry Forward Limit (days)</Label>
                      <Input
                        id="carry_forward_limit"
                        placeholder="Limit"
                        type="number"
                        {...register('carry_forward_limit', { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carry_forward_expiry_months">Carry Forward Expiry (months)</Label>
                      <Input
                        id="carry_forward_expiry_months"
                        placeholder="Expiry (months)"
                        type="number"
                        {...register('carry_forward_expiry_months', { valueAsNumber: true })}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Allow Encashment - Hidden by default */}
              <div className="space-y-2" style={{ display: 'none' }}>
                <div className="flex items-center justify-between">
                  <Label htmlFor="allow_encashment">Allow Encashment</Label>
                  <Controller
                    name="allow_encashment"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                {watchedAllowEncashment && (
                  <Input
                    placeholder="Encashment Rate"
                    type="number"
                    step="0.01"
                    {...register('encashment_rate', { valueAsNumber: true })}
                  />
                )}
              </div>
            </div>
            
            {/* Hidden: Requires Approval and Requires Documentation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ display: 'none' }}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requires_approval">Requires Approval</Label>
                  <Controller
                    name="requires_approval"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
                {watchedRequiresApproval && (
                  <Input
                    placeholder="Approval Levels"
                    type="number"
                    min="1"
                    {...register('approval_levels', { valueAsNumber: true })}
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requires_documentation">Requires Documentation</Label>
                  <Controller
                    name="requires_documentation"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_service_months">Minimum Service (months)</Label>
                <Input
                  id="min_service_months"
                  type="number"
                  {...register('min_service_months', { valueAsNumber: true })}
                  placeholder="6"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="min_advance_notice_days">Advance Notice (days)</Label>
                <Input
                  id="min_advance_notice_days"
                  type="number"
                  {...register('min_advance_notice_days', { valueAsNumber: true })}
                  placeholder="3"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_consecutive_days">Max Consecutive Days</Label>
                <Input
                  id="max_consecutive_days"
                  type="number"
                  {...register('max_consecutive_days', { valueAsNumber: true })}
                  placeholder="15"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="auto_approve_for_days">Auto-approve (days)</Label>
                <Input
                  id="auto_approve_for_days"
                  type="number"
                  {...register('auto_approve_for_days', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              onClick={() => {
                console.log('🖱️ Submit button clicked');
                console.log('📝 Form state:', { isLoading, errors: Object.keys(errors) });
              }}
            >
              {isLoading ? 'Saving...' : (leave ? 'Update Leave Type' : 'Create Leave Type')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 