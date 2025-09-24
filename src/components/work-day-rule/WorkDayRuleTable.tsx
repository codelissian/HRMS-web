import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkDayRule } from '@/types/workDayRule';
import { Edit, Trash2, Eye } from 'lucide-react';
import { LoadingSpinner } from '@/components/common';

interface WorkDayRuleTableProps {
  workDayRules: WorkDayRule[];
  loading?: boolean;
  onEdit?: (workDayRule: WorkDayRule) => void;
  onDelete?: (workDayRule: WorkDayRule) => void;
  onView?: (workDayRule: WorkDayRule) => void;
}

export function WorkDayRuleTable({ 
  workDayRules, 
  loading = false, 
  onEdit, 
  onDelete, 
  onView 
}: WorkDayRuleTableProps) {
  const getWorkweekLabel = (workweek: string) => {
    switch (workweek) {
      case 'five_days':
        return '5 Days';
      case 'six_days':
        return '6 Days';
      case 'seven_days':
        return '7 Days';
      default:
        return workweek;
    }
  };

  const getWorkweekBadgeVariant = (workweek: string) => {
    switch (workweek) {
      case 'five_days':
        return 'default';
      case 'six_days':
        return 'secondary';
      case 'seven_days':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (workDayRules.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No work day rules found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Get started by creating your first work day rule.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Day Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Work Week</TableHead>
                <TableHead>Organization ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workDayRules.map((workDayRule) => (
                <TableRow key={workDayRule.id}>
                  <TableCell className="font-medium">
                    {workDayRule.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getWorkweekBadgeVariant(workDayRule.workweek)}>
                      {getWorkweekLabel(workDayRule.workweek)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {workDayRule.organisation_id}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {onView && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onView(workDayRule)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(workDayRule)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(workDayRule)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}