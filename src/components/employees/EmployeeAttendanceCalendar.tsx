import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon,
  Clock,
  Home,
  Plane,
  Heart,
  Coffee,
  UserCheck,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmployeeAttendanceEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  type: 'attendance' | 'leave' | 'holiday' | 'weekend';
  title: string;
  description?: string;
  status?: 'present' | 'absent' | 'half-day' | 'late' | 'early-departure';
  leaveType?: 'annual' | 'sick' | 'personal' | 'maternity' | 'emergency';
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  lateMinutes?: number;
  earlyDeparture?: number;
}

interface EmployeeAttendanceCalendarProps {
  employeeId: string;
  employeeName: string;
  events?: EmployeeAttendanceEvent[];
  onDateClick?: (date: string) => void;
  onEventClick?: (event: EmployeeAttendanceEvent) => void;
  className?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function EmployeeAttendanceCalendar({
  employeeId,
  employeeName,
  events = [],
  onDateClick,
  onEventClick,
  className
}: EmployeeAttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { firstDay, daysInMonth, daysInPrevMonth, year, month } = useMemo(() => {
    const year = selectedYear;
    const month = selectedMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    return { firstDay, daysInMonth, daysInPrevMonth, year, month };
  }, [selectedMonth, selectedYear]);

  const eventsMap = useMemo(() => {
    const map: Record<string, EmployeeAttendanceEvent[]> = {};
    events.forEach(event => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });
    return map;
  }, [events]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedMonth(prev => {
      let newMonth = prev;
      let newYear = selectedYear;
      
      if (direction === 'prev') {
        if (prev === 0) {
          newMonth = 11;
          newYear = selectedYear - 1;
        } else {
          newMonth = prev - 1;
        }
      } else {
        if (prev === 11) {
          newMonth = 0;
          newYear = selectedYear + 1;
        } else {
          newMonth = prev + 1;
        }
      }
      
      setSelectedYear(newYear);
      return newMonth;
    });
  };

  const goToToday = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth());
    setSelectedYear(today.getFullYear());
  };

  const formatDate = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  };

  const getEventIcon = (type: string, leaveType?: string) => {
    switch (type) {
      case 'holiday':
        return <Home className="h-3 w-3" />;
      case 'leave':
        switch (leaveType) {
          case 'sick':
            return <Heart className="h-3 w-3" />;
          case 'annual':
            return <Plane className="h-3 w-3" />;
          default:
            return <Coffee className="h-3 w-3" />;
        }
      case 'attendance':
        return <Clock className="h-3 w-3" />;
      case 'weekend':
        return <Home className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const getEventColor = (event: EmployeeAttendanceEvent) => {
    if (event.type === 'holiday') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
    
    if (event.type === 'weekend') {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
    
    if (event.type === 'leave') {
      switch (event.status) {
        case 'present':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'absent':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'half-day':
          return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
        default:
          return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      }
    }

    if (event.type === 'attendance') {
      switch (event.status) {
        case 'present':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'absent':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        case 'half-day':
          return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
        case 'late':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'early-departure':
          return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
        default:
          return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      }
    }

    return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <div
          key={`prev-${day}`}
          className="h-24 p-1 text-gray-400 dark:text-gray-600 border border-gray-100 dark:border-gray-800"
        >
          <span className="text-sm">{day}</span>
        </div>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDate(day);
      const dayEvents = eventsMap[dateKey] || [];
      const isTodayDate = isToday(day);

      days.push(
        <div
          key={day}
          className={cn(
            "h-24 p-1 border border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
            isTodayDate && "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          )}
          onClick={() => onDateClick?.(dateKey)}
        >
          <div className="flex justify-between items-start mb-1">
            <span className={cn(
              "text-sm font-medium",
              isTodayDate && "text-blue-600 dark:text-blue-400"
            )}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span className="text-xs bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center">
                {dayEvents.length}
              </span>
            )}
          </div>
          
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event, index) => (
              <div
                key={`${event.id}-${index}`}
                className={cn(
                  "text-xs px-1 py-0.5 rounded flex items-center gap-1 cursor-pointer truncate",
                  getEventColor(event)
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onEventClick?.(event);
                }}
                title={`${event.title}${event.description ? ` - ${event.description}` : ''}`}
              >
                {getEventIcon(event.type, event.leaveType)}
                <span className="truncate">{event.title}</span>
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 px-1">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    // Next month's leading days
    const remainingCells = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className="h-24 p-1 text-gray-400 dark:text-gray-600 border border-gray-100 dark:border-gray-800"
        >
          <span className="text-sm">{day}</span>
        </div>
      );
    }

    return days;
  };

  // Calculate attendance statistics for the selected month
  const monthStats = useMemo(() => {
    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === selectedMonth && eventDate.getFullYear() === selectedYear;
    });

    const presentDays = monthEvents.filter(e => e.type === 'attendance' && e.status === 'present').length;
    const absentDays = monthEvents.filter(e => e.type === 'attendance' && e.status === 'absent').length;
    const halfDays = monthEvents.filter(e => e.type === 'attendance' && e.status === 'half-day').length;
    const leaveDays = monthEvents.filter(e => e.type === 'leave').length;
    const totalWorkingDays = monthEvents.filter(e => e.type === 'attendance').length;
    
    const attendanceRate = totalWorkingDays > 0 ? ((presentDays + (halfDays * 0.5)) / totalWorkingDays * 100) : 0;

    return {
      presentDays,
      absentDays,
      halfDays,
      leaveDays,
      totalWorkingDays,
      attendanceRate: Math.round(attendanceRate * 100) / 100
    };
  }, [events, selectedMonth, selectedYear]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        {/* Monthly Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {monthStats.presentDays}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Present</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-red-600 dark:text-red-400">
              {monthStats.absentDays}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Absent</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
              {monthStats.halfDays}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Half Day</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {monthStats.attendanceRate}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Rate</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <UserCheck className="h-3 w-3 mr-1" />
            Present
          </Badge>
          <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <Home className="h-3 w-3 mr-1" />
            Holiday
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <Plane className="h-3 w-3 mr-1" />
            Leave
          </Badge>
          <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
            <Coffee className="h-3 w-3 mr-1" />
            Half Day
          </Badge>
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            Late
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {DAYS.map((day) => (
            <div
              key={day}
              className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      </CardContent>
    </Card>
  );
}

export default EmployeeAttendanceCalendar;
