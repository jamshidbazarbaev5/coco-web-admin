import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/api';

// Update BaseResource to have optional id
interface BaseResource {
  id?: number;
}

// Generic resource API hook factory
export function createResourceApiHooks<T extends BaseResource, R = { results: T[], count: number }>(baseUrl: string, queryKey: string) {
  // Get all resources
  const useGetResources = (options?: { params?: Record<string, any> }) => {
    return useQuery({
      queryKey: [queryKey, options?.params],
      queryFn: async () => {
        const response = await api.get<R>(baseUrl, { params: options?.params });
        return response.data;
      },
    });
  };

  // Get a single resource by ID
  const useGetResource = (id: number) => {
    return useQuery({
      queryKey: [queryKey, id],
      queryFn: async () => {
        const response = await api.get<T>(`${baseUrl}${id}/`);
        return response.data;
      },
      enabled: !!id,
    });
  };

  // Create a new resource
  const useCreateResource = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (newResource: T) => {
        // Check if we need to use FormData (for files)
        const isFormData = newResource instanceof FormData;
        const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
        
        const response = await api.post<T>(baseUrl, newResource, config);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  };

  // Update an existing resource
  const useUpdateResource = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (payload: { formData: FormData; id: number } | T) => {
        // Check if we're dealing with FormData
        if ('formData' in payload && payload.id) {
          const response = await api.put<T>(
            `${baseUrl}${payload.id}/`,
            payload.formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
          );
          return response.data;
        }
        
        // Handle regular updates
        const updatedResource = payload as T;
        if (!updatedResource.id) throw new Error(`${queryKey} ID is required for update`);
        
        const response = await api.put<T>(
          `${baseUrl}${updatedResource.id}/`,
          updatedResource
        );
        return response.data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
        if (data.id) {
          queryClient.invalidateQueries({ queryKey: [queryKey, data.id] });
        }
      },
    });
  };

  // Delete a resource
  const useDeleteResource = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
      mutationFn: async (id: number) => {
        await api.delete(`${baseUrl}${id}/`);
        return id;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [queryKey] });
      },
    });
  };

  return {
    useGetResources,
    useGetResource,
    useCreateResource,
    useUpdateResource,
    useDeleteResource,
  };
}