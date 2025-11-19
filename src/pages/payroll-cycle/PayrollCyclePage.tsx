import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { PayrollCycleTable } from '@/components/payroll-cycle/PayrollCycleTable';

export function PayrollCyclePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms debounce delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAddPayrollCycle = () => {
    // TODO: Implement add payroll cycle functionality
    console.log('Add Payroll Cycle clicked');
  };

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search payroll cycles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button
          onClick={handleAddPayrollCycle}
          className="flex items-center gap-2 bg-[#0B2E5C] hover:bg-[#0B2E5C]/90 text-white"
        >
          <Plus className="h-4 w-4" />
          Add Payroll Cycle
        </Button>
      </div>

      <PayrollCycleTable searchTerm={debouncedSearchTerm} />
    </div>
  );
}

export default PayrollCyclePage;