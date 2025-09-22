import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendancePoliciesPage } from '@/pages/attendance-policies';
import { WorkDayRulePage } from '@/pages/work-day-rule';

export default function AttendanceAndWorkDayRulePage() {
  const [activeTab, setActiveTab] = useState('attendance-policies');

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Attendance and Work Day Rule</h1>
        <p className="text-gray-600 mt-1">
          Manage attendance policies and work day rules for your organization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attendance-policies">Attendance Policies</TabsTrigger>
          <TabsTrigger value="work-day-rules">Work Day Rules</TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance-policies" className="mt-6">
          <AttendancePoliciesPage />
        </TabsContent>
        
        <TabsContent value="work-day-rules" className="mt-6">
          <WorkDayRulePage />
        </TabsContent>
      </Tabs>
    </div>
  );
}