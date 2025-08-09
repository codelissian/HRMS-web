import { useState, useEffect } from 'react';
import { Calendar, CalendarEvent } from './Calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Calendar as CalendarIcon,
  User,
  Clock,
  MapPin,
  FileText,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { format } from '@/lib/date-utils';

interface CalendarViewProps {
  employeeId?: string;
  showAllEmployees?: boolean;
  onCreateEvent?: () => void;
  onEditEvent?: (event: CalendarEvent) => void;
}

export function CalendarView({ 
  employeeId, 
  showAllEmployees = false,
  onCreateEvent,
  onEditEvent 
}: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - replace with actual API calls
  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      date: '2025-01-10',
      type: 'leave',
      title: 'Annual Leave',
      description: 'Family vacation',
      status: 'approved',
      leaveType: 'annual',
      employeeName: 'John Doe'
    },
    {
      id: '2',
      date: '2025-01-15',
      type: 'holiday',
      title: 'Martin Luther King Jr. Day',
      description: 'Federal Holiday'
    },
    {
      id: '3',
      date: '2025-01-08',
      type: 'attendance',
      title: 'Present',
      status: 'present',
      employeeName: 'John Doe'
    },
    {
      id: '4',
      date: '2025-01-09',
      type: 'attendance',
      title: 'Half Day',
      status: 'half-day',
      employeeName: 'John Doe'
    },
    {
      id: '5',
      date: '2025-01-12',
      type: 'leave',
      title: 'Sick Leave',
      description: 'Medical appointment',
      status: 'pending',
      leaveType: 'sick',
      employeeName: 'Jane Smith'
    },
    {
      id: '6',
      date: '2025-01-20',
      type: 'holiday',
      title: 'Inauguration Day',
      description: 'Federal Holiday'
    }
  ];

  // Filter events based on selected filters
  const filteredEvents = mockEvents.filter(event => {
    if (filterType !== 'all' && event.type !== filterType) return false;
    if (filterStatus !== 'all' && event.status !== filterStatus) return false;
    if (employeeId && event.employeeName !== 'John Doe') return false; // Mock filter by employee
    return true;
  });

  const handleDateClick = (date: string) => {
    console.log('Date clicked:', date);
    // You can implement date selection logic here
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'leave': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'holiday': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'attendance': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'present': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'absent': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'half-day': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Calendar View
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {showAllEmployees ? 'Organization calendar' : 'Your personal calendar'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {onCreateEvent && (
            <Button onClick={onCreateEvent} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          )}
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="leave">Leaves</SelectItem>
                <SelectItem value="holiday">Holidays</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="half-day">Half Day</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredEvents.length} events
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Calendar
        events={filteredEvents}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
        showEventDetails={true}
        highlightToday={true}
        className="shadow-lg"
      />

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Event Details
            </DialogTitle>
            <DialogDescription>
              {selectedEvent && format(new Date(selectedEvent.date), 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                {selectedEvent.description && (
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {selectedEvent.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-500">Type:</span>
                  <Badge className={getEventTypeColor(selectedEvent.type)}>
                    {selectedEvent.type}
                  </Badge>
                </div>

                {selectedEvent.status && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Status:</span>
                    <Badge className={getStatusColor(selectedEvent.status)}>
                      {selectedEvent.status}
                    </Badge>
                  </div>
                )}

                {selectedEvent.employeeName && showAllEmployees && (
                  <div className="flex items-center gap-2 col-span-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Employee:</span>
                    <span className="font-medium">{selectedEvent.employeeName}</span>
                  </div>
                )}

                {selectedEvent.leaveType && (
                  <div className="flex items-center gap-2 col-span-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Leave Type:</span>
                    <span className="font-medium capitalize">{selectedEvent.leaveType}</span>
                  </div>
                )}
              </div>

              {onEditEvent && selectedEvent.type === 'leave' && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => onEditEvent(selectedEvent)}
                    className="flex-1"
                  >
                    Edit Event
                  </Button>
                  <Button variant="outline" onClick={() => setShowEventDialog(false)}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CalendarView;