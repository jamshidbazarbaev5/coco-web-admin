import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

// Types
export interface Feedback {
  id?: number;
  name: string;
  phone_number: string;
  feedback: string;
  created_at?: string;
}

// API endpoints
const FEEDBACK_URL = 'feedback/crud/';

// Create hooks using the generic factory
export const {
  useGetResources: useGetFeedbacks,
  useGetResource: useGetFeedback,
  useCreateResource: useCreateFeedback,
  useUpdateResource: useUpdateFeedback,
  useDeleteResource: useDeleteFeedback,
} = createResourceApiHooks<Feedback>(FEEDBACK_URL, 'feedbacks');