import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw, Calendar, DollarSign } from 'lucide-react';

export function PayrollCyclePage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Payroll Cycle Management
          </CardTitle>
          <CardDescription>
            Manage payroll cycles, define pay periods, and schedule payroll processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Payroll Cycle Management
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Define and manage payroll cycles, set up pay periods, and schedule automated payroll processing.
              This includes monthly, bi-weekly, or custom cycle configurations.
            </p>
            <Button disabled className="opacity-50">
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PayrollCyclePage;