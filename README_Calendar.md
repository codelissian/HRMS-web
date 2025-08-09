# Calendar Component Documentation

A comprehensive, reusable calendar component system for displaying leaves, holidays, and employee attendance data in the OneHR HRMS application.

## Components Overview

### 1. Calendar (Base Component)
The core calendar component that displays events in a monthly grid view.

**File:** `client/src/components/common/Calendar.tsx`

#### Features:
- Monthly calendar grid with navigation
- Event display with color coding
- Support for multiple event types (leave, holiday, attendance)
- Responsive design with dark mode support
- Event click handlers and date selection
- Status indicators with icons
- Event overflow handling (shows "X more" for days with many events)

#### Props:
```typescript
interface CalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: string) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
  showEventDetails?: boolean;
  viewMode?: 'month' | 'week';
  highlightToday?: boolean;
}
```

#### Event Data Structure:
```typescript
interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD format
  type: 'leave' | 'holiday' | 'attendance' | 'absence';
  title: string;
  description?: string;
  status?: 'approved' | 'pending' | 'rejected' | 'present' | 'absent' | 'half-day';
  leaveType?: 'annual' | 'sick' | 'personal' | 'maternity' | 'emergency';
  employeeName?: string;
}
```

### 2. CalendarView (Enhanced Component)
A feature-rich calendar view with filtering, search, and management capabilities.

**File:** `client/src/components/common/CalendarView.tsx`

#### Features:
- Built on top of the base Calendar component
- Event filtering by type and status
- Event details modal
- Create/edit event functionality
- Export capabilities
- Employee-specific or organization-wide views
- Comprehensive legend and status indicators

#### Props:
```typescript
interface CalendarViewProps {
  employeeId?: string;
  showAllEmployees?: boolean;
  onCreateEvent?: () => void;
  onEditEvent?: (event: CalendarEvent) => void;
}
```

### 3. CalendarPage (Page Component)
The main calendar page that integrates with the application's routing and authentication system.

**File:** `client/src/pages/calendar/CalendarPage.tsx`

## Usage Examples

### Basic Calendar
```tsx
import { Calendar, CalendarEvent } from '@/components/common/Calendar';

const events: CalendarEvent[] = [
  {
    id: '1',
    date: '2025-01-15',
    type: 'leave',
    title: 'Annual Leave',
    status: 'approved',
    leaveType: 'annual',
    employeeName: 'John Doe'
  }
];

function MyComponent() {
  return (
    <Calendar
      events={events}
      onDateClick={(date) => console.log('Date clicked:', date)}
      onEventClick={(event) => console.log('Event clicked:', event)}
      showEventDetails={true}
      highlightToday={true}
    />
  );
}
```

### Enhanced Calendar View
```tsx
import { CalendarView } from '@/components/common/CalendarView';

function HRDashboard() {
  return (
    <CalendarView
      showAllEmployees={true}
      onCreateEvent={() => {/* Handle create */}}
      onEditEvent={(event) => {/* Handle edit */}}
    />
  );
}
```

### Employee Personal Calendar
```tsx
import { CalendarView } from '@/components/common/CalendarView';

function EmployeeDashboard({ employeeId }) {
  return (
    <CalendarView
      employeeId={employeeId}
      showAllEmployees={false}
      onCreateEvent={() => {/* Handle leave request */}}
    />
  );
}
```

## Event Types and Color Coding

### Leave Events
- **Annual Leave**: Blue with plane icon
- **Sick Leave**: Red with heart icon  
- **Personal Leave**: Purple with coffee icon
- **Maternity Leave**: Pink with baby icon
- **Emergency Leave**: Orange with alert icon

### Holiday Events
- **Federal Holidays**: Red with home icon
- **Company Holidays**: Orange with building icon

### Attendance Events
- **Present**: Green with clock icon
- **Absent**: Red with x icon
- **Half Day**: Orange with clock icon
- **Late**: Yellow with clock icon

## Status Indicators

### Leave Status
- **Approved**: Green background
- **Pending**: Yellow background
- **Rejected**: Red background

### Attendance Status
- **Present**: Green background
- **Absent**: Red background
- **Half Day**: Orange background

## Integration with HRMS Features

### Employee Management
- View individual employee calendars
- Track attendance patterns
- Monitor leave balances

### Leave Management
- Display leave requests with approval status
- Show leave type and duration
- Track remaining leave days

### HR Administration
- Organization-wide calendar view
- Holiday and policy management
- Attendance monitoring and reporting

### Department Management
- Department-specific calendar views
- Team availability tracking
- Resource planning support

## Responsive Design

- **Mobile**: Single column layout with touch-friendly interactions
- **Tablet**: Two-column layout with sidebar navigation
- **Desktop**: Full calendar grid with detailed sidebar

## Dark Mode Support

All calendar components support automatic dark/light mode switching with:
- Proper contrast ratios
- Theme-aware color schemes
- Consistent visual hierarchy

## Accessibility Features

- Screen reader compatible
- Keyboard navigation support
- High contrast mode support
- Focus indicators
- ARIA labels and descriptions

## Customization Options

### Theming
- CSS custom properties for colors
- Tailwind CSS utility classes
- Component-level styling overrides

### Functionality
- Custom event types
- Additional status options
- Custom date ranges
- Event filtering logic

## API Integration

The calendar components are designed to work with:
- RESTful APIs for event data
- Real-time updates via WebSocket
- Caching with React Query
- Optimistic updates for better UX

## Performance Considerations

- Virtualized rendering for large date ranges
- Memoized event calculations
- Efficient re-rendering strategies
- Lazy loading of event details

## Dependencies

- **React 18**: Core framework
- **Tailwind CSS**: Styling system
- **Lucide React**: Icons
- **Radix UI**: Accessible primitives
- **React Query**: Data fetching and caching
- **Class Variance Authority**: Component variants

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

When adding new features or modifying the calendar components:

1. Follow the existing TypeScript interfaces
2. Maintain accessibility standards
3. Test across different screen sizes
4. Update documentation
5. Add appropriate tests

## Future Enhancements

- Week and day view modes
- Drag and drop event scheduling
- Recurring event support
- Calendar synchronization with external systems
- Advanced filtering and search
- Calendar sharing and permissions
- Mobile app integration
- Offline support with service workers