import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, DollarSign } from 'lucide-react';
import { PayrollCycleFilter, PayrollTable } from '@/components/payroll';
import { PayrollCycle } from '@/types/payrollCycle';

export function PayrollPage() {
  const [selectedCycleId, setSelectedCycleId] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<PayrollCycle | null>(null);

  const handleCycleSelect = useCallback((cycleId: string | null, cycle: PayrollCycle | null) => {
    setSelectedCycleId(cycleId);
    setSelectedCycle(cycle);
    console.log('Selected Cycle ID:', cycleId);
    console.log('Selected Cycle:', cycle);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Payroll Management
          </CardTitle>
          <CardDescription>
            Manage employee payroll, salary calculations, and payment processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Payroll Cycle Filter */}
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by Cycle:
              </label>
              <PayrollCycleFilter 
                onCycleSelect={handleCycleSelect}
                selectedCycleId={selectedCycleId}
              />
            </div>


            {/* Payroll Table */}
            <PayrollTable payrollCycleId={selectedCycleId} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PayrollPage;