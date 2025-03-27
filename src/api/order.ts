import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

interface OrderItem {
  product_variant: number;  // Changed from product
  size: number;
  quantity: number;
  subtotal: string;  // Changed to string to match API response
}

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_preferences: string;
  order_items: OrderItem[];
  total_sum: string;  // Changed to string to match API response
  status: string;
  created_at: string;
}

export const {
  useGetResources: useGetOrders,
  useGetResource: useGetOrder,
  useCreateResource: useCreateOrder,
  useUpdateResource: useUpdateOrder,
  useDeleteResource: useDeleteOrder,
} = createResourceApiHooks<Order>('orders/crud/order/', 'orders');
