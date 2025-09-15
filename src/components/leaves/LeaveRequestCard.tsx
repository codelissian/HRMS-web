import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LeaveRequestWithDetails } from '@/services/leaveService';
import { Calendar, Clock, Tag, Check, X, Eye, User, Building2, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequestCardProps {
  request: LeaveRequestWithDetails;
  onApprove?: (request: LeaveRequestWithDetails) => void;
  onReject?: (request: LeaveRequestWithDetails) => void;
  onView?: (request: LeaveRequestWithDetails) => void;
  showActions?: boolean;
}

export function LeaveRequestCard({ 
  request, 
  onApprove, 
  onReject, 
  onView,
  showActions = true 
}: LeaveRequestCardProps) {
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'sick_leave':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'casual_leave':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'marriage_leave':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'emergency_leave':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'annual_leave':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400';
      case 'maternity_leave':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400';
      case 'paternity_leave':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
      case 'regularization':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const canApprove = request.status === 'PENDING' && showActions;
  const isHalfDay = request.is_half_day;
  const hasWorkHandover = request.work_handover_to;
  const hasEmergencyContact = request.emergency_contact_name;

  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-white">
                {getInitials(request.employee_name || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {request.employee_name || 'Unknown Employee'}
                </h3>
                {isHalfDay && (
                  <Badge variant="outline" className="text-orange-600 border-orange-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Half Day
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {request.designation_name || 'Unknown Position'}
                </span>
                <span className="flex items-center">
                  <Building2 className="h-4 w-4 mr-1" />
                  {request.department_name || 'Unknown Department'}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(request.start_date), 'MMM dd')} - {format(new Date(request.end_date), 'MMM dd, yyyy')}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {request.total_days} day{request.total_days !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  <Badge className={getLeaveTypeColor(request.leave_type_name || request.leave?.name || request.leave_id)}>
                    {request.leave_type_name || request.leave?.name || 'Leave'}
                  </Badge>
                </span>
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                {request.reason && (
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Reason:</strong> {request.reason}
                    </p>
                  </div>
                )}
                
                {hasWorkHandover && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Work Handover:</strong> {request.work_handover_to}
                    </span>
                  </div>
                )}

                {hasEmergencyContact && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Emergency Contact:</strong> {request.emergency_contact_name}
                      {request.emergency_contact_phone && ` (${request.emergency_contact_phone})`}
                    </span>
                  </div>
                )}

                {request.comments && (
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-gray-500 mt-0.5" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Comments:</strong> {request.comments}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-3">
            <Badge className={getStatusColor(request.status || 'PENDING')}>
              {request.status || 'PENDING'}
            </Badge>
            
            {showActions && (
              <div className="flex space-x-2">
                {canApprove && onApprove && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onApprove(request)}
                    className="text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/30"
                    title="Approve"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                
                {canApprove && onReject && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onReject(request)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                    title="Reject"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
                
                {onView && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onView(request)}
                    className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-700"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {/* Request Date */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
              Requested: {format(new Date(request.created_at), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
