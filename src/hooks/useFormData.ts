import { useState, useCallback } from 'react';
import { designationService } from '@/services/designationService';
import { ShiftService } from '@/services/shiftService';
import { httpClient } from '@/services/httpClient';
import { API_ENDPOINTS } from '@/services/api/endpoints';
import { getCurrentOrganizationId } from '@/lib/organization-utils';

interface UseFormDataReturn {
  designations: any[];
  shifts: any[];
  attendanceRules: any[];
  designationsLoading: boolean;
  shiftsLoading: boolean;
  attendanceRulesLoading: boolean;
  fetchDesignations: (departmentId: string) => Promise<void>;
  fetchShifts: () => Promise<void>;
  fetchAttendanceRules: () => Promise<void>;
}

export const useFormData = (): UseFormDataReturn => {
  // State for designations
  const [designations, setDesignations] = useState<any[]>([]);
  const [designationsLoading, setDesignationsLoading] = useState(false);
  
  // State for shifts
  const [shifts, setShifts] = useState<any[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  
  // State for attendance rules
  const [attendanceRules, setAttendanceRules] = useState<any[]>([]);
  const [attendanceRulesLoading, setAttendanceRulesLoading] = useState(false);

  const fetchShifts = useCallback(async () => {
    try {
      setShiftsLoading(true);
      
      const organisationId = getCurrentOrganizationId();
      
      const response = await ShiftService.getShifts();

      if (response.status && response.data) {
        console.log('✅ Shifts loaded successfully:', response.data);
        setShifts(response.data);
      } else {
        console.error('❌ Failed to fetch shifts:', response.message);
        setShifts([]);
      }
    } catch (error) {
      console.error('❌ Error fetching shifts:', error);
      setShifts([]);
    } finally {
      setShiftsLoading(false);
    }
  }, []);

  const fetchAttendanceRules = useCallback(async () => {
    try {
      setAttendanceRulesLoading(true);
      
      const organisationId = getCurrentOrganizationId();
      
      console.log('🔍 Fetching attendance rules for organisation:', organisationId);
      
      try {
        const response = await httpClient.post(API_ENDPOINTS.ATTENDANCE_POLICIES_LIST, {
          organisation_id: organisationId,
          page: 1,
          page_size: 100
        });

        console.log('📊 Attendance rules API response (httpClient):', response.data);

        if (response.data.status && response.data.data) {
          console.log('✅ Successfully fetched attendance rules:', response.data.data);
          setAttendanceRules(response.data.data);
          return;
        } else {
          console.error('❌ Failed to fetch attendance rules (httpClient):', response.data.message || 'Unknown error');
        }
      } catch (httpClientError) {
        console.log('🔄 httpClient failed, trying direct fetch:', httpClientError);
        
        // Fallback to direct fetch
        const response = await fetch(`${process.env.VITE_API_BASE_URL || 'http://35.224.247.153:9000/api/v1'}/attendance_rules/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('hrms_auth_token')}`
          },
          body: JSON.stringify({
            organisation_id: organisationId,
            page: 1,
            page_size: 100
          })
        });

        const data = await response.json();

        if (data.status && data.data) {
          console.log('✅ Successfully fetched attendance rules (fetch):', data.data);
          setAttendanceRules(data.data);
        } else {
          console.error('❌ Failed to fetch attendance rules (fetch):', data.message || 'Unknown error');
          setAttendanceRules([]);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching attendance rules:', error);
      setAttendanceRules([]);
    } finally {
      setAttendanceRulesLoading(false);
    }
  }, []);

  const fetchDesignations = useCallback(async (departmentId: string) => {
    if (!departmentId) return;
    
    console.log('🔍 Fetching designations for department:', departmentId);
    
    try {
      setDesignationsLoading(true);
      // Don't clear designations immediately - keep existing ones until new ones load
      
      const organisationId = getCurrentOrganizationId();
      
      const response = await designationService.getDesignations({
        department_id: departmentId
      });

      console.log('📊 Designations API response:', response);

      if (response.status && response.data) {
        console.log('✅ Designations loaded successfully:', response.data);
        setDesignations(response.data);
      } else {
        console.error('❌ Failed to fetch designations:', response.message);
        setDesignations([]);
      }
    } catch (error) {
      console.error('❌ Error fetching designations:', error);
      setDesignations([]);
    } finally {
      setDesignationsLoading(false);
      console.log('🏁 Designations fetch completed, count:', designations.length);
    }
  }, [designations.length]);

  return {
    designations,
    shifts,
    attendanceRules,
    designationsLoading,
    shiftsLoading,
    attendanceRulesLoading,
    fetchDesignations,
    fetchShifts,
    fetchAttendanceRules,
  };
};
