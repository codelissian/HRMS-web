import React, { useState, useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { PayrollCycleFilter, PayrollTable } from '@/components/payroll';
import { PayrollCycle } from '@/types/payrollCycle';

export function PayrollPage() {
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<PayrollCycle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleCycleSelect = useCallback((cycleId: string | null, cycle: PayrollCycle | null) => {
    setSelectedCycleId(cycleId);
    setSelectedCycle(cycle);
    console.log('Selected Cycle ID:', cycleId);
    console.log('Selected Cycle:', cycle);
  }, []);

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
            <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search payroll records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
                Filter by Cycle:
              </label>
              <PayrollCycleFilter 
                onCycleSelect={handleCycleSelect}
                selectedCycleId={selectedCycleId}
              />
            </div>
      </div>

            {/* Payroll Table */}
      <PayrollTable payrollCycleId={selectedCycleId} searchTerm={debouncedSearchTerm} />
    </div>
  );
}

export default PayrollPage;