import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types/api';

export function useApi<T>(
  endpoint: string | null,
  options?: RequestInit
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!endpoint) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response: ApiResponse<T> = await apiClient.post(endpoint, options);
        if (response.status) {
          setData(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: () => setData(null) };
}

export function useApiCall<T>() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async (
    endpoint: string,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST',
    data?: any
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      let response: ApiResponse<T>;
      
      switch (method) {
        case 'PUT':
          response = await apiClient.put(endpoint, data);
          break;
        case 'PATCH':
          response = await apiClient.patch(endpoint, data);
          break;
        default:
          response = await apiClient.post(endpoint, data);
      }

      if (response.status) {
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
}
