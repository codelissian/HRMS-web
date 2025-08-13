import { CalendarView } from '@/components/common/CalendarView';
import { CalendarEvent } from '@/components/common/Calendar';
import { useAuth } from '@/hooks/useAuth';

export default function CalendarPage() {
  const { user } = useAuth();
  
  const handleCreateEvent = () => {
    console.log('Create new event');
  };

  const handleEditEvent = (event: CalendarEvent) => {
    console.log('Edit event:', event);
  };

  const showAll = user?.role === 'admin';

  return (
    <CalendarView
      employeeId={user?.id}
      showAllEmployees={showAll}
      onCreateEvent={handleCreateEvent}
      onEditEvent={handleEditEvent}
    />
  );
}