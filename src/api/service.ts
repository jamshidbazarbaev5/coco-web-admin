import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

export interface Service {
  id?: number;
  title_uz: string;
  title_ru: string;
  image_first: File | string;
  image_second: File | string;
  services_uz: {
    service_1: string;
    service_2: string;
  };
  services_ru: {
    service_1: string;
    service_2: string;
  };
  subtitles_uz: {
    subtitle_1: string;
    subtitle_2: string;
  };
  subtitles_ru: {
    subtitle_1: string;
    subtitle_2: string;
  };
}

interface PaginationParams {
  page?: number;
  results?: Service[];
  count?: number;
}

const SERVICE_URL = 'abouts/crud/service/';

export const {
  useGetResources: useGetServices,
  useGetResource: useGetService,
  useCreateResource: useCreateService,
  useUpdateResource: useUpdateService,
  useDeleteResource: useDeleteService
} = createResourceApiHooks<Service, PaginationParams>(SERVICE_URL, 'services');
