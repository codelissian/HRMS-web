import React, { createContext, useContext, useState, useCallback } from 'react';
import { ShiftService, CreateShiftData, Shift, ShiftsResponse } from '@/services/shiftService';
import { getOrganisationId } from '@/lib/shift-utils';
import { useToast } from '@/hooks/use-toast';

// Optimized shift data structure - only essential fields
export interface ShiftSummary {
  id: string;
  name: string;
  organisation_id: string;
  start: string;
  end: string;
  grace_minutes: number;
  active_flag: boolean;
}

interface ShiftsContextValue {
  shifts: ShiftSummary[];
  selectedShift: ShiftSummary | null;
  isLoading: boolean;
  totalCount: number;
  
  // Actions
  fetchShifts: () => Promise<void>;
  selectShift: (shift: ShiftSummary) => void;
  clearSelection: () => void;
  createShift: (data: CreateShiftData) => Promise<void>;
  updateShift: (id: string, data: Partial<CreateShiftData>) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  toggleShiftStatus: (id: string) => Promise<void>;
}

const ShiftsContext = createContext<ShiftsContextValue | undefined>(undefined);

export function ShiftsProvider({ children }: { children: React.ReactNode }) {
  const [shifts, setShifts] = useState<ShiftSummary[]>([]);
  const [selectedShift, setSelectedShift] = useState<ShiftSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const { toast } = useToast();

  // Transform API response to store only essential data
  const transformShiftData = useCallback((apiShift: Shift): ShiftSummary => {
    const transformed = {
      id: apiShift.id,
      name: apiShift.name,
      organisation_id: apiShift.organisation_id,
      start: apiShift.start,
      end: apiShift.end,
      grace_minutes: apiShift.grace_minutes,
      active_flag: apiShift.active_flag
    };
    
    return transformed;
  }, []);

  const fetchShifts = useCallback(async () => {
    try {
      setIsLoading(true);
      const organisationId = getOrganisationId();
      
      if (!organisationId) {
        toast({
          title: "Error",
          description: "Organisation ID not found. Please log in again.",
          variant: "destructive",
        });
        return;
      }

      const response: ShiftsResponse = await ShiftService.getShifts(organisationId);
      
      if (response.status && response.data) {
        // Transform and store only essential data
        const transformedShifts = response.data.map(transformShiftData);
        setShifts(transformedShifts);
        setTotalCount(response.total_count);
      } else {
        console.error('API returned error:', response.message);
        toast({
          title: "Error",
          description: response.message || "Failed to fetch shifts",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error fetching shifts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch shifts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, transformShiftData]);

  const selectShift = useCallback((shift: ShiftSummary) => {
    setSelectedShift(shift);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedShift(null);
  }, []);

  const createShift = useCallback(async (shiftData: CreateShiftData) => {
    try {
      const newShift = await ShiftService.createShift(shiftData);
      
      // Transform and add to store
      const transformedShift = transformShiftData(newShift);
      setShifts(prev => [...prev, transformedShift]);
      setTotalCount(prev => prev + 1);
      
      toast({
        title: "Success!",
        description: `Shift "${newShift.name}" created successfully.`,
      });
      
    } catch (error) {
      console.error('Error creating shift:', error);
      toast({
        title: "Error",
        description: "Failed to create shift. Please try again.",
        variant: "destructive",
      });
      throw error; // Re-throw to let component handle loading state
    }
  }, [toast, transformShiftData]);

  const updateShift = useCallback(async (id: string, shiftData: Partial<CreateShiftData> & { active_flag?: boolean }) => {
    try {
      const updatedShift = await ShiftService.updateShift(id, shiftData);
      
      // Transform and update in store
      const transformedShift = transformShiftData(updatedShift);
      
      setShifts(prev => {
        const newShifts = prev.map(shift => 
          shift.id === id ? transformedShift : shift
        );
        return newShifts;
      });
      
      // Update selected shift if it's the one being edited
      setSelectedShift(prev => {
        if (prev?.id === id) {
          return transformedShift;
        }
        return prev;
      });
      
      toast({
        title: "Success!",
        description: `Shift "${updatedShift.name}" updated successfully.`,
      });
      
    } catch (error) {
      console.error('Error updating shift:', error);
      toast({
        title: "Error",
        description: "Failed to update shift. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, transformShiftData, shifts]);

  const deleteShift = useCallback(async (id: string) => {
    try {
      await ShiftService.deleteShift(id);
      
      // Remove from store
      setShifts(prev => prev.filter(shift => shift.id !== id));
      setTotalCount(prev => prev - 1);
      
      // Clear selection if deleted shift was selected
      setSelectedShift(prev => prev?.id === id ? null : prev);
      
      toast({
        title: "Success!",
        description: "Shift deleted successfully.",
      });
      
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({
        title: "Error",
        description: "Failed to delete shift. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  const toggleShiftStatus = useCallback(async (id: string) => {
    try {
      const shift = shifts.find(s => s.id === id);
      if (!shift) return;
      
      // Use the new toggleShiftStatus method that only updates active_flag
      const updatedShift = await ShiftService.toggleShiftStatus(id, !shift.active_flag);
      
      // Update in store
      const transformedShift = transformShiftData(updatedShift);
      setShifts(prev => prev.map(s => s.id === id ? transformedShift : s));
      
      // Update selected shift if it's the one being toggled
      setSelectedShift(prev => prev?.id === id ? transformedShift : prev);
      
      toast({
        title: "Success!",
        description: `Shift "${shift.name}" ${transformedShift.active_flag ? 'activated' : 'deactivated'} successfully.`,
      });
      
    } catch (error) {
      console.error('Error toggling shift status:', error);
      toast({
        title: "Error",
        description: "Failed to update shift status. Please try again.",
        variant: "destructive",
      });
    }
  }, [shifts, toast, transformShiftData]);

  const value: ShiftsContextValue = {
    shifts,
    selectedShift,
    isLoading,
    totalCount,
    fetchShifts,
    selectShift,
    clearSelection,
    createShift,
    updateShift,
    deleteShift,
    toggleShiftStatus,
  };

  return (
    <ShiftsContext.Provider value={value}>
      {children}
    </ShiftsContext.Provider>
  );
}

export function useShifts() {
  const context = useContext(ShiftsContext);
  if (context === undefined) {
    throw new Error('useShifts must be used within a ShiftsProvider');
  }
  return context;
} 