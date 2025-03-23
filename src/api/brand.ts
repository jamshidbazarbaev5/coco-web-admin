import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

// Types
export interface Brand {
  id?: number;
  name: string;
}

// API endpoints
const BRAND_URL = 'brands/crud/brand/';

// Create brand API hooks using the factory function
export const {
  useGetResources: useGetBrands,
  useGetResource: useGetBrand,
  useCreateResource: useCreateBrand,
  useUpdateResource: useUpdateBrand,
  useDeleteResource: useDeleteBrand,
} = createResourceApiHooks<Brand>(BRAND_URL, 'brands');
