# ConfirmationDialog Component

A reusable confirmation dialog component that can be used across all sections for delete operations, warnings, and confirmations.

## Features

- ✅ **Multiple Types**: delete, warning, info, danger
- ✅ **Customizable**: title, description, button text
- ✅ **Loading States**: Shows loading spinner during operations
- ✅ **Responsive**: Mobile-friendly design
- ✅ **Accessible**: Proper ARIA labels and keyboard navigation
- ✅ **Consistent UI**: Matches the design system

## Usage Examples

### 1. Delete Employee
```tsx
import { ConfirmationDialog } from '@/components/common';

const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

<ConfirmationDialog
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  title="Delete Employee"
  description="Are you sure you want to delete this employee? This action cannot be undone."
  type="delete"
  confirmText="Delete Employee"
  onConfirm={confirmDeleteEmployee}
  loading={deleteEmployeeMutation.isPending}
  itemName={employeeToDelete?.name}
/>
```

### 2. Warning Dialog
```tsx
<ConfirmationDialog
  open={warningDialogOpen}
  onOpenChange={setWarningDialogOpen}
  title="Unsaved Changes"
  description="You have unsaved changes. Are you sure you want to leave?"
  type="warning"
  confirmText="Leave Page"
  onConfirm={handleLeavePage}
/>
```

### 3. Info Dialog
```tsx
<ConfirmationDialog
  open={infoDialogOpen}
  onOpenChange={setInfoDialogOpen}
  title="Confirm Action"
  description="Please confirm that you want to proceed with this action."
  type="info"
  confirmText="Proceed"
  onConfirm={handleProceed}
/>
```

### 4. Danger Dialog
```tsx
<ConfirmationDialog
  open={dangerDialogOpen}
  onOpenChange={setDangerDialogOpen}
  title="Dangerous Operation"
  description="This operation is irreversible and may affect system stability."
  type="danger"
  confirmText="I Understand, Proceed"
  onConfirm={handleDangerousOperation}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | - | Controls dialog visibility |
| `onOpenChange` | `(open: boolean) => void` | - | Callback when dialog state changes |
| `title` | `string` | - | Dialog title |
| `description` | `string` | - | Dialog description |
| `type` | `ConfirmationType` | `'delete'` | Type of confirmation |
| `confirmText` | `string` | - | Custom confirm button text |
| `cancelText` | `string` | `'Cancel'` | Custom cancel button text |
| `onConfirm` | `() => void` | - | Callback when confirmed |
| `loading` | `boolean` | `false` | Shows loading state |
| `itemName` | `string` | - | Name of item being affected |

## Confirmation Types

- **`delete`**: Red destructive button, trash icon
- **`warning`**: Default button, warning triangle icon
- **`danger`**: Red destructive button, alert circle icon
- **`info`**: Default button, info icon

## Benefits

1. **Consistency**: Same look and feel across all sections
2. **Reusability**: One component for all confirmation needs
3. **Maintainability**: Easy to update styles and behavior
4. **User Experience**: Professional, accessible dialogs
5. **Performance**: Optimized rendering and state management

## Integration

This component can be used in:
- Employee management
- Department management
- Designation management
- Shift management
- Leave management
- Any other section requiring confirmation 