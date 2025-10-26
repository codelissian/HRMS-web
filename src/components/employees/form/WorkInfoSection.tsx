import { UseFormRegister, Control, FieldErrors } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';
import { formatDateForInput } from '@/lib/date-utils';
import { ExtendedInsertEmployee } from '@/hooks/useEmployeeForm';

interface WorkInfoSectionProps {
  register: UseFormRegister<ExtendedInsertEmployee>;
  control: Control<ExtendedInsertEmployee>;
  errors: FieldErrors<ExtendedInsertEmployee>;
  departments: any[];
  designations: any[];
  shifts: any[];
  attendanceRules: any[];
  departmentsLoading: boolean;
  designationsLoading: boolean;
  shiftsLoading: boolean;
  attendanceRulesLoading: boolean;
  selectedDepartmentId?: string;
}

export const WorkInfoSection: React.FC<WorkInfoSectionProps> = ({
  register,
  control,
  errors,
  departments,
  designations,
  shifts,
  attendanceRules,
  departmentsLoading,
  designationsLoading,
  shiftsLoading,
  attendanceRulesLoading,
  selectedDepartmentId,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="code">Employee Code <span className="text-red-500">*</span></Label>
            <Input
              id="code"
              {...register('code')}
              error={errors.code?.message}
              placeholder="e.g., EMP001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department_id">Department <span className="text-red-500">*</span></Label>
            <Controller
              name="department_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <SelectTrigger disabled={departmentsLoading}>
                    <SelectValue placeholder={departmentsLoading ? "Loading..." : "Select Department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation_id">Designation <span className="text-red-500">*</span></Label>
            <Controller
              name="designation_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <SelectTrigger disabled={designationsLoading || !selectedDepartmentId}>
                    <SelectValue placeholder={
                      !selectedDepartmentId 
                        ? "Select Department First" 
                        : designationsLoading 
                          ? "Loading designations..." 
                          : "Select Designation"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {designationsLoading ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                        Loading designations...
                      </div>
                    ) : designations.length > 0 ? (
                      designations.map((designation) => (
                        <SelectItem key={designation.id} value={designation.id}>
                          {designation.name}
                        </SelectItem>
                      ))
                    ) : selectedDepartmentId && !designationsLoading ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                        No designations found for this department
                      </div>
                    ) : null}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shift_id">Shift</Label>
            <Controller
              name="shift_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <SelectTrigger disabled={shiftsLoading}>
                    <SelectValue placeholder={shiftsLoading ? "Loading shifts..." : "Select Shift"} />
                  </SelectTrigger>
                  <SelectContent>
                    {shiftsLoading ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                        Loading shifts...
                      </div>
                    ) : shifts.length > 0 ? (
                      shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                        No shifts found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attendance_rule_id">Attendance Rule</Label>
            <Controller
              name="attendance_rule_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <SelectTrigger disabled={attendanceRulesLoading}>
                    <SelectValue placeholder={attendanceRulesLoading ? "Loading rules..." : "Select Attendance Rule"} />
                  </SelectTrigger>
                  <SelectContent>
                    {attendanceRulesLoading ? (
                      <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                        Loading attendance rules...
                      </div>
                    ) : attendanceRules.length > 0 ? (
                      attendanceRules.map((rule) => (
                        <SelectItem key={rule.id} value={rule.id}>
                          {rule.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                        No attendance rules found
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="joining_date">Joining Date</Label>
            <Controller
              name="joining_date"
              control={control}
              render={({ field }) => (
                <Input
                  id="joining_date"
                  type="date"
                  value={formatDateForInput(field.value)}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    field.onChange(date);
                  }}
                  error={errors.joining_date?.message}
                />
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
