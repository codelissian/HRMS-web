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
      
      // Retry logic for network errors
      let lastError: any;
      const maxRetries = 3;
      
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await PayrollCycleService.getPayrollCycles();
          setCycles(response.data);
          
          // Auto-select the first cycle if available
          if (response.data.length > 0) {
            const firstCycle = response.data[0];
            onCycleSelect(firstCycle.id, firstCycle);
          }
          return; // Success, exit retry loop
        } catch (err: any) {
          lastError = err;
          
          // Check if it's a network error and we should retry
          const isNetworkError = err.code === 'ECONNABORTED' || 
                                err.code === 'ETIMEDOUT' || 
                                err.code === 'ERR_NETWORK' ||
                                err.message?.toLowerCase().includes('network') ||
                                err.message?.toLowerCase().includes('timeout');
          
          if (!isNetworkError || attempt === maxRetries) {
            break; // Not a network error or max retries reached
          }
          
          // Wait before retrying (exponential backoff)
          const waitTime = 1000 * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
      
      // If we get here, all retries failed
      const errorMessage = lastError?.message || 'Failed to fetch payroll cycles';
      setError(errorMessage);
      console.error('Error fetching payroll cycles:', lastError);
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