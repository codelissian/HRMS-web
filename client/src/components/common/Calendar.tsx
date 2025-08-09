import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Clock,
  Home,
  Plane,
  Heart,
  Coffee
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  type: 'leave' | 'holiday' | 'attendance' | 'absence';
  title: string;
  description?: string;
  status?: 'approved' | 'pending' | 'rejected' | 'present' | 'absent' | 'half-day';
  leaveType?: 'annual' | 'sick' | 'personal' | 'maternity' | 'emergency';
  employeeName?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
  showEventDetails?: boolean;
  viewMode?: 'month' | 'week';
  highlightToday?: boolean;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({
  events = [],
  onDateClick,
  onEventClick,
  className,
  showEventDetails = true,
  viewMode = 'month',
  highlightToday = true,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { firstDay, daysInMonth, daysInPrevMonth, year, month } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    return { firstDay, daysInMonth, daysInPrevMonth, year, month };
  }, [currentDate]);

  const eventsMap = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach(event => {
      if (!map[event.date]) {
        map[event.date] = [];
      }
      map[event.date].push(event);
    });
    return map;
  }, [events]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
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
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.type === 'holiday') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
    
    if (event.type === 'leave') {
      switch (event.status) {
        case 'approved':
          return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        case 'pending':
          return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        case 'rejected':
          return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
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
      const isTodayDate = highlightToday && isToday(day);

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

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            {MONTHS[month]} {year}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-sm"
            >
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {showEventDetails && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <Clock className="h-3 w-3 mr-1" />
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
          </div>
        )}
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

export default Calendar;