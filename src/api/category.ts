import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

// Types
export interface Category {
  id?: number;
  name_ru: string;
  name_uz: string;
}

// API endpoints
const CATEGORY_URL = 'brands/crud/category/';

interface PaginationParams {
  page?: number;
  results?: Category[];
  count?: number;
  

}

// Create API hooks for Category resource
export const {
  useGetResources: useGetCategories,
  useGetResource: useGetCategory,
  useCreateResource: useCreateCategory,
  useUpdateResource: useUpdateCategory,
  useDeleteResource: useDeleteCategory
} = createResourceApiHooks<Category, PaginationParams>(CATEGORY_URL, 'categories');
