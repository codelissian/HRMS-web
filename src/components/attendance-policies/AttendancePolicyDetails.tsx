import React from 'react';
import { AttendancePolicy } from '@/types/attendance';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  MapPin, 
  Camera, 
  Monitor, 
  Smartphone, 
  Coffee, 
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface AttendancePolicyDetailsProps {
  open: boolean;
  onClose: () => void;
  policy: AttendancePolicy | null;
  onEdit?: (policy: AttendancePolicy) => void;
}

export function AttendancePolicyDetails({
  open,
  onClose,
  policy,
  onEdit
}: AttendancePolicyDetailsProps) {
  if (!policy) return null;

  const getStatusIcon = (active: boolean) => {
    return active ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusText = (active: boolean) => {
    return active ? 'Active' : 'Inactive';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl font-semibold">
                {policy.name}
              </DialogTitle>
              <DialogDescription>
                Attendance Policy Details
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(policy.active_flag)}
              <Badge 
                variant={policy.active_flag ? 'default' : 'secondary'}
                className={policy.active_flag ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
              >
                {getStatusText(policy.active_flag)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Policy ID
                  </label>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">
                    {policy.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Organization ID
                  </label>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">
                    {policy.organisation_id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Time Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Time Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Grace Period
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {policy.grace_period_minutes} minutes
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Overtime Threshold
                  </label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {policy.overtime_threshold_hours} hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Monitor className="h-5 w-5" />
                Attendance Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {policy.web_attendance_enabled ? 
                    <CheckCircle className="h-5 w-5 text-green-600" /> : 
                    <XCircle className="h-5 w-5 text-red-600" />
                  }
                  <span className="text-sm text-gray-900 dark:text-white">
                    Web Attendance
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {policy.mobile_attendance_enabled ? 
                    <CheckCircle className="h-5 w-5 text-green-600" /> : 
                    <XCircle className="h-5 w-5 text-red-600" />
                  }
                  <span className="text-sm text-gray-900 dark:text-white">
                    Mobile Attendance
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Location Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {policy.geo_tracking_enabled ? 
                    <CheckCircle className="h-5 w-5 text-green-600" /> : 
                    <XCircle className="h-5 w-5 text-red-600" />
                  }
                  <span className="text-sm text-gray-900 dark:text-white">
                    Geo-tracking Enabled
                  </span>
                </div>
                {policy.geo_tracking_enabled && (
                  <div className="ml-7">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Geo-radius
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {policy.geo_radius_meters} meters
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coffee className="h-5 w-5" />
                Additional Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  {policy.selfie_required ? 
                    <CheckCircle className="h-5 w-5 text-green-600" /> : 
                    <XCircle className="h-5 w-5 text-red-600" />
                  }
                  <span className="text-sm text-gray-900 dark:text-white">
                    Selfie Verification Required
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {policy.break_management_enabled ? 
                    <CheckCircle className="h-5 w-5 text-green-600" /> : 
                    <XCircle className="h-5 w-5 text-red-600" />
                  }
                  <span className="text-sm text-gray-900 dark:text-white">
                    Break Management
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {policy.regularization_enabled ? 
                    <CheckCircle className="h-5 w-5 text-green-600" /> : 
                    <XCircle className="h-5 w-5 text-red-600" />
                  }
                  <span className="text-sm text-gray-900 dark:text-white">
                    Attendance Regularization
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          {(policy.created_at || policy.modified_at) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">System Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {policy.created_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Created At
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(policy.created_at)}
                      </p>
                      {policy.created_by && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          by {policy.created_by}
                        </p>
                      )}
                    </div>
                  )}
                  {policy.modified_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Last Modified
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {formatDate(policy.modified_at)}
                      </p>
                      {policy.modified_by && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          by {policy.modified_by}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          {onEdit && (
            <Button 
              variant="outline" 
              onClick={() => onEdit(policy)}
              className="mr-auto"
            >
              Edit Policy
            </Button>
          )}
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
