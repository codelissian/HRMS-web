import { useState } from 'react';
import { Calendar, CalendarEvent } from './Calendar';
import { CalendarView } from './CalendarView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Demo data showing different types of events
const demoEvents: CalendarEvent[] = [
  // Leave events
  {
    id: '1',
    date: '2025-01-10',
    type: 'leave',
    title: 'Annual Leave',
    description: 'Family vacation in Hawaii',
    status: 'APPROVED',
    leaveType: 'annual',
    employeeName: 'John Doe'
  },
  {
    id: '2',
    date: '2025-01-12',
    type: 'leave',
    title: 'Sick Leave',
    description: 'Medical appointment',
    status: 'PENDING',
    leaveType: 'sick',
    employeeName: 'Jane Smith'
  },
  {
    id: '3',
    date: '2025-01-18',
    type: 'leave',
    title: 'Personal Leave',
    description: 'Moving to new apartment',
    status: 'REJECTED',
    leaveType: 'personal',
    employeeName: 'Mike Johnson'
  },
  
  // Holiday events
  {
    id: '4',
    date: '2025-01-01',
    type: 'holiday',
    title: 'New Year\'s Day',
    description: 'Federal Holiday'
  },
  {
    id: '5',
    date: '2025-01-20',
    type: 'holiday',
    title: 'Martin Luther King Jr. Day',
    description: 'Federal Holiday'
  },
  {
    id: '6',
    date: '2025-02-17',
    type: 'holiday',
    title: 'Presidents\' Day',
    description: 'Federal Holiday'
  },

  // Attendance events
  {
    id: '7',
    date: '2025-01-08',
    type: 'attendance',
    title: 'Present',
    status: 'present',
    employeeName: 'John Doe'
  },
  {
    id: '8',
    date: '2025-01-09',
    type: 'attendance',
    title: 'Half Day',
    status: 'half-day',
    employeeName: 'John Doe'
  },
  {
    id: '9',
    date: '2025-01-11',
    type: 'attendance',
    title: 'Absent',
    status: 'absent',
    employeeName: 'Sarah Wilson'
  },
  
  // Additional events for demonstration
  {
    id: '10',
    date: '2025-01-15',
    type: 'leave',
    title: 'Maternity Leave',
    description: 'Maternity leave start',
    status: 'APPROVED',
    leaveType: 'maternity',
    employeeName: 'Emily Brown'
  },
  {
    id: '11',
    date: '2025-01-22',
    type: 'attendance',
    title: 'Present',
    status: 'present',
    employeeName: 'David Lee'
  }
];

export function CalendarDemo() {
  const [selectedTab, setSelectedTab] = useState('basic');
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>(demoEvents);

  const handleDateClick = (date: string) => {
    console.log('Date clicked:', date);
    // You can implement date selection logic here
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
    // You can implement event details modal here
  };

  const filterEventsByType = (type: string) => {
    if (type === 'all') {
      setSelectedEvents(demoEvents);
    } else {
      setSelectedEvents(demoEvents.filter(event => event.type === type));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendar Component Demo</CardTitle>
          <CardDescription>
            Comprehensive calendar component for displaying leaves, holidays, and attendance data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{demoEvents.filter(e => e.type === 'attendance' && e.status === 'present').length}</div>
              <div className="text-sm text-gray-500">Present Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{demoEvents.filter(e => e.type === 'leave').length}</div>
              <div className="text-sm text-gray-500">Leave Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{demoEvents.filter(e => e.type === 'holiday').length}</div>
              <div className="text-sm text-gray-500">Holidays</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{demoEvents.filter(e => e.status === 'half-day').length}</div>
              <div className="text-sm text-gray-500">Half Days</div>
            </div>
          </div>

          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Calendar</TabsTrigger>
              <TabsTrigger value="filtered">Filtered View</TabsTrigger>
              <TabsTrigger value="full">Full Calendar View</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={() => filterEventsByType('all')}>
                  All Events ({demoEvents.length})
                </Button>
                <Button size="sm" variant="outline" onClick={() => filterEventsByType('leave')}>
                  Leaves ({demoEvents.filter(e => e.type === 'leave').length})
                </Button>
                <Button size="sm" variant="outline" onClick={() => filterEventsByType('holiday')}>
                  Holidays ({demoEvents.filter(e => e.type === 'holiday').length})
                </Button>
                <Button size="sm" variant="outline" onClick={() => filterEventsByType('attendance')}>
                  Attendance ({demoEvents.filter(e => e.type === 'attendance').length})
                </Button>
              </div>
              <Calendar
                events={selectedEvents}
                onDateClick={handleDateClick}
                onEventClick={handleEventClick}
                showEventDetails={true}
                highlightToday={true}
              />
            </TabsContent>

            <TabsContent value="filtered" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Calendar
                  events={demoEvents.filter(e => e.type === 'leave')}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  showEventDetails={false}
                  className="col-span-1"
                />
                <Calendar
                  events={demoEvents.filter(e => e.type === 'holiday')}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  showEventDetails={false}
                  className="col-span-1"
                />
                <Calendar
                  events={demoEvents.filter(e => e.type === 'attendance')}
                  onDateClick={handleDateClick}
                  onEventClick={handleEventClick}
                  showEventDetails={false}
                  className="col-span-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="full">
              <CalendarView
                showAllEmployees={true}
                onCreateEvent={() => console.log('Create event')}
                onEditEvent={(event) => console.log('Edit event:', event)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Examples</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Basic Calendar Component</h4>
            <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm block">
              {`<Calendar
  events={events}
  onDateClick={handleDateClick}
  onEventClick={handleEventClick}
  showEventDetails={true}
  highlightToday={true}
/>`}
            </code>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Calendar View Component</h4>
            <code className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm block">
              {`<CalendarView
  employeeId={user.id}
  showAllEmployees={false}
  onCreateEvent={handleCreate}
  onEditEvent={handleEdit}
/>`}
            </code>
          </div>

          <div>
            <h4 className="font-medium mb-2">Event Types</h4>
            <div className="flex gap-2 flex-wrap">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Leave</Badge>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Holiday</Badge>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">Attendance</Badge>
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Half Day</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CalendarDemo;