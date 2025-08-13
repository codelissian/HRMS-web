import { useState, useEffect, useCallback } from 'react';
import { AttendancePolicy, ListAttendancePoliciesRequest, AttendancePoliciesResponse } from '@/types/attendance';
import { attendancePolicyService } from '@/services/attendancePolicyService';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Mock data for development/testing
const mockPolicies: AttendancePolicy[] = [
  {
    id: '1',
    organisation_id: 'org-1',
    name: 'Standard Office Policy',
    geo_tracking_enabled: true,
    geo_radius_meters: 100,
    selfie_required: false,
    web_attendance_enabled: true,
    mobile_attendance_enabled: true,
    grace_period_minutes: 15,
    overtime_threshold_hours: 8.0,
    break_management_enabled: true,
    regularization_enabled: true,
    active_flag: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    organisation_id: 'org-1',
    name: 'Remote Work Policy',
    geo_tracking_enabled: false,
    geo_radius_meters: 0,
    selfie_required: true,
    web_attendance_enabled: true,
    mobile_attendance_enabled: false,
    grace_period_minutes: 30,
    overtime_threshold_hours: 8.5,
    break_management_enabled: false,
    regularization_enabled: true,
    active_flag: true,
    created_at: '2024-01-20T14:30:00Z',
    updated_at: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    organisation_id: 'org-1',
    name: 'Field Work Policy',
    geo_tracking_enabled: true,
    geo_radius_meters: 500,
    selfie_required: true,
    web_attendance_enabled: false,
    mobile_attendance_enabled: true,
    grace_period_minutes: 45,
    overtime_threshold_hours: 10.0,
    break_management_enabled: true,
    regularization_enabled: false,
    active_flag: false,
    created_at: '2024-01-25T09:15:00Z',
    updated_at: '2024-01-25T09:15:00Z',
  },
];

interface UseAttendancePoliciesReturn {
  policies: AttendancePolicy[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  searchQuery: string;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearchQuery: (query: string) => void;
  refreshPolicies: () => void;
  error: string | null;
}

export function useAttendancePolicies(): UseAttendancePoliciesReturn {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    if (!user?.organisation_id) return;

    setLoading(true);
    setError(null);
    
    try {
      // For development, use mock data
      // In production, uncomment the API call below
      
      // const response = await AttendancePolicyService.list({
      //   organisation_id: user.organisation_id,
      //   page,
      //   page_size: pageSize,
      // });
      // setPolicies(response.data || []);
      // setTotal(response.total || 0);

      // Mock data implementation
      let filteredPolicies = [...mockPolicies];
      
      // Apply search filter
      if (searchQuery) {
        filteredPolicies = filteredPolicies.filter(policy =>
          policy.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedPolicies = filteredPolicies.slice(startIndex, endIndex);
      
      setPolicies(paginatedPolicies);
      setTotal(filteredPolicies.length);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch policies');
      toast({
        title: "Error",
        description: "Failed to fetch attendance policies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.organisation_id, page, pageSize, searchQuery, toast]);

  const refreshPolicies = useCallback(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  return {
    policies,
    loading,
    total,
    page,
    pageSize,
    searchQuery,
    setPage,
    setPageSize,
    setSearchQuery,
    refreshPolicies,
    error,
  };
}
