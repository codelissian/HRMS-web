import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PayrollCycleService } from '@/services/payrollCycleService';
import { PayrollCycle } from '@/types/payrollCycle';

interface PayrollCycleFilterProps {
  onCycleSelect: (cycleId: string | null, cycle: PayrollCycle | null) => void;
  selectedCycleId?: string | null;
}

export function PayrollCycleFilter({ onCycleSelect, selectedCycleId }: PayrollCycleFilterProps) {
  const [cycles, setCycles] = useState<PayrollCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayrollCycles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await PayrollCycleService.getPayrollCycles();
      setCycles(response.data);
      
      // Auto-select the first cycle if available
      if (response.data.length > 0) {
        const firstCycle = response.data[0];
        onCycleSelect(firstCycle.id, firstCycle);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payroll cycles');
      console.error('Error fetching payroll cycles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollCycles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleValueChange = (value: string) => {
    const selectedCycle = cycles.find(cycle => cycle.id === value);
    onCycleSelect(value, selectedCycle || null);
  };

  if (loading) {
    return (
      <div className="w-full max-w-sm">
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading cycles..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-sm">
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Error loading cycles" />
          </SelectTrigger>
        </Select>
        <p className="text-sm text-red-600 mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <Select value={selectedCycleId || ''} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a payroll cycle" />
        </SelectTrigger>
        <SelectContent>
          {cycles.map((cycle) => (
            <SelectItem key={cycle.id} value={cycle.id}>
              {cycle.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}