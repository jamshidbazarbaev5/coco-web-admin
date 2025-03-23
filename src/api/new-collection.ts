import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

// Types
export interface Collection {
  id?: number;
  product: number;
  title_uz: string;
  title_ru: string;
  caption_uz: string;
  caption_ru: string;
  description_uz: string;
  description_ru: string;
}

// API endpoints
const COLLECTION_URL = 'collections/crud/collection/';

// Create API hooks for Collection resource
export const {
  useGetResources: useGetCollections,
  useGetResource: useGetCollection,
  useCreateResource: useCreateCollection,
  useUpdateResource: useUpdateCollection,
  useDeleteResource: useDeleteCollection
} = createResourceApiHooks<Collection>(COLLECTION_URL, 'collections');