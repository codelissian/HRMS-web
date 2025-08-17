import { useState, useEffect, useCallback } from 'react';
import { AttendancePolicy, ListAttendancePoliciesRequest, AttendancePoliciesResponse } from '@/types/attendance';
import { AttendancePolicyService } from '@/services/attendancePolicyService';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  const [policies, setPolicies] = useState<AttendancePolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await AttendancePolicyService.list({
        page,
        page_size: pageSize,
        search: searchQuery || undefined
      });
      
      setPolicies(response.data || []);
      setTotal(response.total || 0);
      
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
  }, [page, pageSize, searchQuery, toast]);

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
