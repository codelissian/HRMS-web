import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableAction<T> {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
  textOnly?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  onSearch?: (query: string) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  searchable = false,
  filterable = false,
  pagination,
  onSearch,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');



  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const defaultActions: TableAction<T>[] = [
    {
      label: 'View',
      icon: Eye,
      onClick: (row) => console.log('View', row),
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: (row) => console.log('Edit', row),
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: (row) => console.log('Delete', row),
      variant: 'destructive',
    },
  ];

  const tableActions = actions.length > 0 ? actions : [];

  if (loading) {
    return (
      <div className="space-y-4">
        {searchable && (
          <div className="w-full max-w-sm">
            <Input placeholder="Search..." disabled />
          </div>
        )}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead key={index}>{column.header}</TableHead>
                ))}
                {tableActions.length > 0 && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </TableCell>
                  ))}
                  {tableActions.length > 0 && (
                    <TableCell>
                      <div className="flex justify-end space-x-2">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {searchable && (
        <div className="w-full max-w-sm">
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      )}

      <div className="rounded-md border bg-white dark:bg-gray-850">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800">
              {columns.map((column, index) => (
                <TableHead 
                  key={index} 
                  className={cn(
                    "text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider",
                    column.align === 'center' && "text-center",
                    column.align === 'right' && "text-right"
                  )}
                >
                  {column.header}
                </TableHead>
              ))}
              {tableActions.length > 0 && (
                <TableHead className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (tableActions.length > 0 ? 1 : 0)} className="text-center py-8">
                  <div className="text-gray-500 dark:text-gray-400">
                    No data available
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  {columns.map((column, colIndex) => (
                    <TableCell 
                      key={colIndex} 
                      className={cn(
                        "text-sm text-gray-900 dark:text-white",
                        column.align === 'center' && "text-center",
                        column.align === 'right' && "text-right"
                      )}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                  {tableActions.length > 0 && (
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {tableActions.map((action, actionIndex) => {
                          const Icon = action.icon;
                          return (
                            <Button
                              key={actionIndex}
                              variant={action.textOnly ? "outline" : "ghost"}
                              size={action.textOnly ? "sm" : "icon"}
                              onClick={() => action.onClick(row)}
                              className={cn(
                                action.textOnly ? "h-8 px-3" : "h-8 w-8",
                                action.variant === 'destructive' && "text-red-600 hover:text-red-800 hover:bg-red-100 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/30"
                              )}
                            >
                              {action.textOnly ? (
                                action.label
                              ) : (
                                Icon && <Icon className="h-4 w-4" />
                              )}
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {pagination && (
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.totalItems)} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={pagination.pageSize.toString()}
                  onValueChange={(value) => pagination.onPageSizeChange(parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.page} of {Math.ceil(pagination.totalItems / pagination.pageSize)}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.page + 1)}
                  disabled={pagination.page >= Math.ceil(pagination.totalItems / pagination.pageSize)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
