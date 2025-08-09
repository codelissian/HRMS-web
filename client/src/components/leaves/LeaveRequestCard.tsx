import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LeaveRequest } from '@shared/schema';
import { Calendar, Clock, Tag, Check, X, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface LeaveRequestCardProps {
  request: LeaveRequest & {
    employee_name?: string;
    designation_name?: string;
    leave_type_name?: string;
  };
  onApprove?: (request: LeaveRequest) => void;
  onReject?: (request: LeaveRequest) => void;
  onView?: (request: LeaveRequest) => void;
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
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const canApprove = request.status === 'pending' && showActions;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-white">
                {getInitials(request.employee_name || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {request.employee_name || 'Unknown Employee'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {request.designation_name || 'Unknown Position'}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(request.start_date), 'MMM dd')} - {format(new Date(request.end_date), 'MMM dd, yyyy')}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {request.total_days} days
                </span>
                <span className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  {request.leave_type_name || 'Leave'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge className={getStatusColor(request.status || 'pending')}>
              {request.status || 'Pending'}
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
          </div>
        </div>
        
        {request.reason && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Reason:</strong> {request.reason}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
