import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PayrollCycleTable } from '@/components/payroll-cycle/PayrollCycleTable';

export function PayrollCyclePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Cycle Management</CardTitle>
          <CardDescription>
            Manage payroll cycles, define pay periods, and schedule payroll processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PayrollCycleTable />
        </CardContent>
      </Card>
    </div>
  );
}

export default PayrollCyclePage;