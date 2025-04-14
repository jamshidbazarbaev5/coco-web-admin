import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

// Types
export interface About {
  id?: number;
  title_uz: string;
  title_ru: string;
  description_uz: string;
  description_ru: string;
  subtitles_uz: {
    subtitle_1: string;
    subtitle_2: string;
    subtitle_3: string;
  };
  subtitles_ru: {
    subtitle_1: string;
    subtitle_2: string;
    subtitle_3: string;
  };
}

// API endpoints
const ABOUT_URL = 'abouts/crud/profile/';

interface PaginationParams {
  page?: number;
  results?: About[];
  count?: number;
}

// Create API hooks for About resource
export const {
  useGetResources: useGetAbouts,
  useGetResource: useGetAbout,
  useCreateResource: useCreateAbout,
  useUpdateResource: useUpdateAbout,
  useDeleteResource: useDeleteAbout
} = createResourceApiHooks<About, PaginationParams>(ABOUT_URL, 'abouts');
