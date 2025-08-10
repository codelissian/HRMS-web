import { EmptyState } from '@/components/common/EmptyState';
import { Building } from 'lucide-react';

export default function DepartmentList() {
  return (
    <EmptyState
      icon={Building}
      title="Departments"
      description="Department management interface will be implemented here. This page will allow you to create, edit, and manage organisational departments."
      action={{
        label: 'Add Department',
        onClick: () => console.log('Add department clicked')
      }}
    />
  );
}
