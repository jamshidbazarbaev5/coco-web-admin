import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

// Types
export interface Size {
  id?: number;
  name_uz: string;
  name_ru: string;
  length: number;
  width: number;
  height: number;
}

// API endpoints
const SIZE_URL = 'products/crud/size/';

// Create API hooks for Size resource
export const {
  useGetResources: useGetSizes,
  useGetResource: useGetSize,
  useCreateResource: useCreateSize,
  useUpdateResource: useUpdateSize,
  useDeleteResource: useDeleteSize
} = createResourceApiHooks<Size>(SIZE_URL, 'sizes');