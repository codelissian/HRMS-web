import React from 'react';
import { DataTable, Column, TableAction } from '@/components/common/DataTable';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ComponentType {
  id: string;
  name: string;
  type?: string;
  sequence?: number;
  created_at: string;
  updated_at: string;
}

interface SalaryComponentTypeTableProps {
  componentTypes: ComponentType[];
  loading?: boolean;
  onEdit: (componentType: ComponentType) => void;
  onDelete: (componentType: ComponentType) => void;
}

// Component type options for display
const COMPONENT_TYPE_OPTIONS: Record<string, string> = {
  'BASIC': 'Basic',
  'ALLOWANCE': 'Allowance',
  'DEDUCTION': 'Deduction',
  'STATUTORY': 'Statutory',
  'PF': 'Provident Fund (PF)',
  'ESI': 'Employee State Insurance (ESI)',
  'PROFESSIONAL_TAX': 'Professional Tax',
  'INCOME_TAX': 'Income Tax',
  'TDS': 'Tax Deducted at Source (TDS)'
};

export function SalaryComponentTypeTable({
  componentTypes,
  loading = false,
  onEdit,
  onDelete
}: SalaryComponentTypeTableProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const columns: Column<ComponentType>[] = [
    {
      key: 'name',
      header: 'Component Name',
      align: 'left',
      render: (_, componentType) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {componentType.name}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      align: 'left',
      render: (_, componentType) => (
        componentType.type ? (
          <Badge variant="outline" className="bg-[#0B2E5C]/10 text-[#0B2E5C] border-[#0B2E5C]/20">
            {COMPONENT_TYPE_OPTIONS[componentType.type] || componentType.type}
          </Badge>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      ),
    },
    {
      key: 'sequence',
      header: 'Sequence',
      align: 'center',
      render: (_, componentType) => (
        componentType.sequence ? (
          <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200">
            {componentType.sequence}
          </Badge>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )
      ),
    },
    {
      key: 'created_at',
      header: 'Created At',
      align: 'left',
      render: (_, componentType) => (
        <div className="text-sm text-gray-900 dark:text-white whitespace-nowrap">
          {formatDate(componentType.created_at)}
        </div>
      ),
    },
  ];

  const actions: TableAction<ComponentType>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: onEdit,
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      variant: 'destructive',
    },
  ];

  return (
    <DataTable
      data={componentTypes}
      columns={columns}
      actions={actions}
      loading={loading}
      searchable={false}
      filterable={false}
    />
  );
}

