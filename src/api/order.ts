import { createResourceApiHooks } from '../hooks/createResourceApiHooks';

interface OrderItem {
  product: number;
  quantity: number;
}

export interface Order {
  id?: number;
  customer_name: string;
  customer_phone: string;
  customer_preferences: string;
  order_items: OrderItem[];
}

export const {
  useGetResources: useGetOrders,
  useGetResource: useGetOrder,
  useCreateResource: useCreateOrder,
  useUpdateResource: useUpdateOrder,
  useDeleteResource: useDeleteOrder,
} = createResourceApiHooks<Order>('orders/crud/order/', 'orders');
