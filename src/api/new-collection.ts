import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

// Types
export interface Collection {
  id?: number;
  product: number | string;
  product_details?: {
    id: number;
    title_uz: string;
    title_ru: string;
    price: string;
    brand: number;
    category: number;
    description_uz: string;
    description_ru: string;
    material: number;
    quantity: number;
    product_attributes: Array<{
      color: string;
      image: string;
      sizes: number[];
    }>;
    on_sale: boolean;
  };
  title_uz: string;
  title_ru: string;
  caption_uz: string;
  caption_ru: string;
  description_uz: string;
  description_ru: string;
  collection_images?: Array<{
    id?: number;
    image: string | File;
  }>;
  images_to_delete?: number[];
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