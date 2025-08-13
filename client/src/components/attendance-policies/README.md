# Attendance Policies Module

This module provides comprehensive management of attendance policies for the HRMS system, allowing administrators to configure various attendance tracking rules and settings.

## Features

- **Create Attendance Policy**: Form to create new attendance policies with all required fields
- **List Attendance Policies**: Table view with search, pagination, and sorting
- **Update Attendance Policy**: Edit existing policies through a pre-filled form
- **View Policy Details**: Read-only view of complete policy information
- **Delete Policies**: Remove policies with confirmation
- **Role-based Access**: Admin and HR manager access control

## Components

### 1. AttendancePolicyForm
- **Purpose**: Create and edit attendance policies
- **Props**:
  - `open`: Boolean to control dialog visibility
  - `onClose`: Function to close the dialog
  - `policy`: Policy object for editing (null for creation)
  - `mode`: 'create' | 'edit'
  - `onSuccess`: Callback after successful save

### 2. AttendancePolicyTable
- **Purpose**: Display list of policies with actions
- **Features**:
  - Search functionality
  - Pagination
  - Action buttons (View, Edit, Delete)
  - Status indicators
  - Feature chips

### 3. AttendancePolicyDetails
- **Purpose**: Read-only view of policy details
- **Features**:
  - Organized sections for different policy aspects
  - Visual indicators for enabled/disabled features
  - Edit button for quick access to edit mode

## API Integration

### Endpoints Used
- `POST /attendance-policies/create` - Create new policy
- `POST /attendance-policies/list` - Fetch policies with pagination
- `POST /attendance-policies/update` - Update existing policy
- `POST /attendance-policies/one` - Get single policy details
- `POST /attendance-policies/delete` - Delete policy

### Service Layer
- `AttendancePolicyService` class handles all API calls
- Proper error handling and response formatting
- Type-safe request/response handling

## Data Structure

### AttendancePolicy Interface
```typescript
interface AttendancePolicy {
  id: string;
  organisation_id: string;
  name: string;
  geo_tracking_enabled: boolean;
  geo_radius_meters: number;
  selfie_required: boolean;
  web_attendance_enabled: boolean;
  mobile_attendance_enabled: boolean;
  grace_period_minutes: number;
  overtime_threshold_hours: number;
  break_management_enabled: boolean;
  regularization_enabled: boolean;
  active_flag: boolean;
  created_at?: string;
  updated_at?: string;
}
```

## Form Validation

Uses Zod schema validation:
- Policy name: Required, minimum 1 character
- Geo-radius: Minimum 1 meter (when geo-tracking enabled)
- Grace period: Non-negative minutes
- Overtime threshold: Non-negative hours

## State Management

### Custom Hook: useAttendancePolicies
- Manages policies list state
- Handles pagination and search
- Provides refresh functionality
- Error handling and loading states

### Local State
- Modal visibility states
- Selected policy for editing/viewing
- Form mode (create/edit)

## UI/UX Features

### Material-UI Components
- Responsive grid layout
- Consistent theming
- Loading states and error handling
- Toast notifications for user feedback

### Responsive Design
- Mobile-friendly table layout
- Adaptive form grid
- Touch-friendly action buttons

## Usage Examples

### Basic Implementation
```tsx
import { AttendancePoliciesPage } from '@/pages/attendance-policies';

// In your router
<Route path="attendance-policies" element={<AttendancePoliciesPage />} />
```

### Custom Form Usage
```tsx
import { AttendancePolicyForm } from '@/components/attendance-policies/AttendancePolicyForm';

<AttendancePolicyForm
  open={formOpen}
  onClose={handleClose}
  policy={selectedPolicy}
  mode="create"
  onSuccess={handleSuccess}
/>
```

## Styling

- Uses Material-UI theme colors
- Consistent spacing and typography
- Dark/light theme support
- Custom elevation and shadows

## Error Handling

- API error messages displayed in toast notifications
- Form validation errors shown inline
- Loading states for better user experience
- Graceful fallbacks for missing data

## Performance Considerations

- Debounced search input
- Efficient pagination
- Lazy loading of form components
- Optimized re-renders with proper state management

## Accessibility

- ARIA labels for form controls
- Keyboard navigation support
- Screen reader friendly table structure
- High contrast mode support


