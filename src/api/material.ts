import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

// Types
export interface Material {
  id?: number;
  name: string;
  name_ru: string;
  name_uz: string;
}

// Update the interface to include pagination response type
export interface MaterialsResponse {
  results: Material[];
  count: number;
}

// API endpoints
const MATERIAL_URL = 'products/crud/material/';

// Create API hooks for Material resource
export const {
  useGetResources: useGetMaterials,
  useGetResource: useGetMaterial,
  useCreateResource: useCreateMaterial,
  useUpdateResource: useUpdateMaterial,
  useDeleteResource: useDeleteMaterial
} = createResourceApiHooks<Material>(MATERIAL_URL, 'materials');