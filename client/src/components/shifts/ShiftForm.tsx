import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Plus, Edit, ChevronUp, ChevronDown } from 'lucide-react';
import { convertTimeToISO, getOrganisationId, formatTimeForDisplay } from '@/lib/shift-utils';
import { CreateShiftData } from '@/services/shiftService';
import { useShifts } from '@/contexts/ShiftsContext';

interface ShiftFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface ShiftFormData {
  name: string;
  start: string;
  end: string;
  grace_minutes: number;
  active_flag: boolean;
}

export function ShiftForm({ isOpen, onOpenChange }: ShiftFormProps) {
  const { selectedShift, createShift, updateShift, clearSelection } = useShifts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ShiftFormData>({
    name: '',
    start: '09:00',
    end: '18:00',
    grace_minutes: 15,
    active_flag: true
  });
  const [openTimePicker, setOpenTimePicker] = useState<'start' | 'end' | null>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  const isEditMode = !!selectedShift;

  // Pre-fill form when editing
  useEffect(() => {
    if (selectedShift && isOpen) {
      const startTime = formatTimeForDisplay(selectedShift.start);
      const endTime = formatTimeForDisplay(selectedShift.end);
      
      setFormData({
        name: selectedShift.name,
        start: startTime,
        end: endTime,
        grace_minutes: selectedShift.grace_minutes,
        active_flag: selectedShift.active_flag
      });
    } else if (!selectedShift && isOpen) {
      // Reset form for create mode
      setFormData({
        name: '',
        start: '09:00',
        end: '18:00',
        grace_minutes: 15,
        active_flag: true
      });
    }
  }, [selectedShift, isOpen]);

  // Close time picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setOpenTimePicker(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const organisationId = getOrganisationId();
    if (!organisationId) {
      alert('Organisation ID not found. Please log in again.');
      return;
    }

    if (selectedShift) {
      // Update existing shift
      const convertedShiftData = {
        name: formData.name,
        start: formData.start,
        end: formData.end,
        grace_minutes: formData.grace_minutes,
        active_flag: formData.active_flag
      };
      
      try {
        await updateShift(selectedShift.id, convertedShiftData);
        onOpenChange(false);
        clearSelection();
      } catch (error) {
        console.error('Error updating shift:', error);
      }
    } else {
      // For create, send the create data structure
      const shiftData: CreateShiftData = {
        name: formData.name,
        start: convertTimeToISO(formData.start),
        end: convertTimeToISO(formData.end),
        grace_minutes: formData.grace_minutes,
        organisation_id: organisationId
      };

      try {
        setIsSubmitting(true);
        await createShift(shiftData);
        
        // Close form and reset
        onOpenChange(false);
        clearSelection();
        
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (field: keyof ShiftFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTimeChange = (field: 'start' | 'end', hours: number, minutes: number) => {
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    handleInputChange(field, timeString);
  };

  const handleClose = () => {
    onOpenChange(false);
    clearSelection();
  };

  const TimePickerDropdown = ({ field, value, onTimeChange }: { 
    field: 'start' | 'end', 
    value: string, 
    onTimeChange: (field: 'start' | 'end', hours: number, minutes: number) => void 
  }) => {
    const [hours, minutes] = value.split(':').map(Number);
    
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
        <div className="flex">
          {/* Hours Column */}
          <div className="flex-1 border-r border-gray-200 dark:border-gray-600">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Hours</div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {Array.from({ length: 24 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onTimeChange(field, i, minutes)}
                  className={`w-full px-3 py-2 text-sm text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                    hours === i
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300'
                  }`}
                >
                  {i.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
          
          {/* Minutes Column */}
          <div className="flex-1">
            <div className="p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Minutes</div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {Array.from({ length: 60 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onTimeChange(field, hours, i)}
                  className={`w-full px-3 py-2 text-sm text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors ${
                    minutes === i
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300'
                  }`}
                >
                  {i.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <Edit className="h-5 w-5" />
                Edit Shift
              </>
            ) : (
              <>
                <Clock className="h-5 w-5" />
                Create New Shift
              </>
            )}
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            All times are in 24-hour format (HH:MM)
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Shift Name</Label>
            <Input
              id="name"
              placeholder="e.g., Morning Shift, Night Shift"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="start" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                Start Time (24-hour)
              </Label>
              <div className="relative" ref={openTimePicker === 'start' ? timePickerRef : undefined}>
                <Input
                  id="start"
                  type="text"
                  placeholder="09:00"
                  value={formData.start}
                  onChange={(e) => handleInputChange('start', e.target.value)}
                  onClick={() => setOpenTimePicker(openTimePicker === 'start' ? null : 'start')}
                  className="cursor-pointer"
                  readOnly
                  required
                />
                {openTimePicker === 'start' && (
                  <TimePickerDropdown
                    field="start"
                    value={formData.start}
                    onTimeChange={handleTimeChange}
                  />
                )}
              </div>
              <p className="text-xs text-gray-500">Format: HH:MM (24-hour)</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end" className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                End Time (24-hour)
              </Label>
              <div className="relative" ref={openTimePicker === 'end' ? timePickerRef : undefined}>
                <Input
                  id="end"
                  type="text"
                  placeholder="18:00"
                  value={formData.end}
                  onChange={(e) => handleInputChange('end', e.target.value)}
                  onClick={() => setOpenTimePicker(openTimePicker === 'end' ? null : 'end')}
                  className="cursor-pointer"
                  readOnly
                  required
                />
                {openTimePicker === 'end' && (
                  <TimePickerDropdown
                    field="end"
                    value={formData.end}
                    onTimeChange={handleTimeChange}
                  />
                )}
              </div>
              <p className="text-xs text-gray-500">Format: HH:MM (24-hour)</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grace_minutes">Grace Period (minutes)</Label>
            <Input
              id="grace_minutes"
              type="number"
              min="0"
              max="60"
              placeholder="15"
              value={formData.grace_minutes}
              onChange={(e) => handleInputChange('grace_minutes', parseInt(e.target.value) || 0)}
              required
            />
            <p className="text-sm text-gray-500">
              Allowable late arrival time in minutes
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="active_flag"
                checked={formData.active_flag}
                onChange={(e) => handleInputChange('active_flag', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="active_flag">Active Shift</Label>
            </div>
            <p className="text-sm text-gray-500">
              Enable this shift for scheduling
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex items-center gap-2" 
              disabled={isSubmitting}
            >
              {isEditMode ? (
                <>
                  <Edit className="h-4 w-4" />
                  {isSubmitting ? 'Updating...' : 'Update Shift'}
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  {isSubmitting ? 'Creating...' : 'Create Shift'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 