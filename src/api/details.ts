import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

// Types
export interface SocialMediaUrls {
  instagram?: string;
  telegram?: string;
  facebook?: string;
  [key: string]: string | undefined;
}

export interface ContactDetail {
  id?: number;

  address_ru: string;
  address_uz: string;
  phone: string;
  instagram: string;
  telegram: string;
  facebook: string;
  
  map_url: string;
  social_media_urls: SocialMediaUrls;
}

// API endpoints
const CONTACT_DETAIL_URL = 'contact_detail/crud/';

// Create API hooks for ContactDetail resource
export const {
  useGetResources: useGetContactDetails,
  useGetResource: useGetContactDetail,
  useCreateResource: useCreateContactDetail,
  useUpdateResource: useUpdateContactDetail,
  useDeleteResource: useDeleteContactDetail
} = createResourceApiHooks<ContactDetail>(CONTACT_DETAIL_URL, 'contactDetails');