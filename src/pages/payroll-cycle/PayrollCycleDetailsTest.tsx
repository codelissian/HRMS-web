import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PayrollCycleService } from '@/services/payrollCycleService';
import { useAuth } from '@/hooks/useAuth';
import { getOrganisationId } from '@/lib/shift-utils';
import { authToken } from '@/services/authToken';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common';

/**
 * Temporary test component to check Payroll Cycle API response
 * This will be removed after we understand the API structure
 */
export default function PayrollCycleDetailsTest() {
  const { user } = useAuth();
  const [testCycleId, setTestCycleId] = useState<string>('');

  // Get organisation_id
  const organisationId = user?.organisation_id || getOrganisationId() || authToken.getorganisationId();

  // First, fetch payroll cycles list to get an ID
  const { data: cyclesListResponse } = useQuery({
    queryKey: ['payroll-cycles', 'test-list'],
    queryFn: () => PayrollCycleService.getPayrollCycles({ page: 1, page_size: 10 }),
    enabled: !!organisationId,
  });

  // Set the first cycle ID when list loads
  useEffect(() => {
    if (cyclesListResponse?.data && cyclesListResponse.data.length > 0 && !testCycleId) {
      setTestCycleId(cyclesListResponse.data[0].id);
    }
  }, [cyclesListResponse, testCycleId]);

  // Fetch single payroll cycle with include
  const { data: cycleResponse, isLoading, error } = useQuery({
    queryKey: ['payroll-cycle', 'test-details', testCycleId],
    queryFn: () => PayrollCycleService.getPayrollCycle(testCycleId, { organisation: true }),
    enabled: !!testCycleId,
  });

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Payroll Cycle API Test</CardTitle>
        </CardHeader>
        <CardContent>
          {!organisationId && (
            <div className="text-red-600">No organisation ID found</div>
          )}
          
          {!testCycleId && cyclesListResponse && (
            <div className="text-yellow-600">No payroll cycles found. Please create one first.</div>
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {error && (
            <div className="text-red-600">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          )}

          {cycleResponse && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Raw API Response:</h3>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs">
                  {JSON.stringify(cycleResponse, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payroll Cycle Data:</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>ID:</strong> {cycleResponse.id}</div>
                  <div><strong>Name:</strong> {cycleResponse.name}</div>
                  <div><strong>Status:</strong> {cycleResponse.status}</div>
                  <div><strong>Pay Period Start:</strong> {cycleResponse.pay_period_start}</div>
                  <div><strong>Pay Period End:</strong> {cycleResponse.pay_period_end}</div>
                  <div><strong>Salary Month:</strong> {cycleResponse.salary_month}</div>
                  <div><strong>Salary Year:</strong> {cycleResponse.salary_year}</div>
                  <div><strong>Working Days:</strong> {cycleResponse.working_days}</div>
                  <div><strong>Active Flag:</strong> {cycleResponse.active_flag ? 'Yes' : 'No'}</div>
                  <div><strong>Created At:</strong> {cycleResponse.created_at}</div>
                  <div><strong>Modified At:</strong> {cycleResponse.modified_at}</div>
                </div>
              </div>

              {(cycleResponse as any).organisation && (
                <div>
                  <h3 className="font-semibold mb-2">Organisation Data (Included):</h3>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs">
                    {JSON.stringify((cycleResponse as any).organisation, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">All Properties:</h3>
                <div className="space-y-1 text-xs">
                  {Object.keys(cycleResponse).map((key) => (
                    <div key={key}>
                      <strong>{key}:</strong> {typeof (cycleResponse as any)[key] === 'object' 
                        ? JSON.stringify((cycleResponse as any)[key]) 
                        : String((cycleResponse as any)[key])}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

