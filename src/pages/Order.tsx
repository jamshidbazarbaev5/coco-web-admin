import { useGetOrders, useDeleteOrder, type Order } from '../api/order';
import { useGetProducts, type Product } from '../api/products';
import { ResourceTable } from '../helpers/ResourceTable';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useUpdateOrder } from '../api/order';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';

export function Orders() {
  const [page, setPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [, setSelectedProducts] = useState<Array<{product: Product | null, quantity: number, subtotal?: number}>>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [newStatus, setNewStatus] = useState<string>('');
  const { mutate: updateOrder } = useUpdateOrder();

  const { data, isLoading, refetch } = useGetOrders({ params: { page } });
  const { data: productsData, refetch: refetchProducts } = useGetProducts({ params: { page: productPage, page_size: 100 } });
  const { mutate: deleteOrder } = useDeleteOrder();

  const STATUS_CHOICES = [
    'Отклонен',
    'Ожидает подтверждения',
    'Собирается',
    'В пути',
    'Доставлен',
  ];

  useEffect(() => {
    // Reset state when component mounts
    setAllProducts([]);
    setProductPage(1);
    refetchProducts();
  }, []); // Only run once on mount

  useEffect(() => {
    if (productsData?.results) {
      setAllProducts(prev => {
        // Check if we already have these products to prevent duplicates
        const newProducts = productsData.results.filter(
          newProduct => !prev.some(p => p.id === newProduct.id)
        );
        return [...prev, ...newProducts];
      });
      
      // Check if we need to load more products
      if (productsData.count > allProducts.length && productPage * 100 < productsData.count) {
        setProductPage(prev => prev + 1);
      }
    }
  }, [productsData, productPage]);

  const columns = [
    {
      header: 'Customer Name',
      accessorKey: 'customer_name',
    },
    {
      header: 'Phone',
      accessorKey: 'customer_phone',
    },
    {
      header: 'Preferences',
      accessorKey: 'customer_preferences',
    },
    {
      header: 'Status',
      accessorKey: 'status',
    },
    {
      header: 'Created At',
      accessorKey: 'created_at',
      cell: (row: Order) => {
        return row.created_at 
          ? new Date(row.created_at).toLocaleDateString()
          : '-';
      },
    },
    {
      header: 'Products',
      accessorKey: 'order_items',
      cell: (row: Order) => {
        const orderItems = row.order_items || [];
        return (
          <div className="max-w-xs">
            {orderItems.map((item: any, index: number) => {
              const product = allProducts.find((p: Product) => p.id === item.product);
              return (
                <div key={index} className="text-sm">
                  <span>
                    {product ? product.title_uz : `Product ID: ${item.product}`}, 
                    Qty: {item.quantity}
                  </span>
                  {item.subtotal && <span> ({formatPrice(item.subtotal)})</span>}
                </div>
              );
            })}
            {row.total_sum && (
              <div className="font-semibold mt-1">Total: {formatPrice(row.total_sum)}</div>
            )}
          </div>
        );
      },
    },
  ];

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      Promise.resolve(deleteOrder(id))
        .then(() => {
          toast('Order deleted successfully');
          refetch();
        })
        .catch((error: Error) => {
          toast.error('Error', {
            description: error.message,
          });
        });
    }
  };

  useEffect(() => {
    if (editingOrder && allProducts.length > 0) {
        setSelectedProducts(
        editingOrder.order_items?.map(item => {
          const product = allProducts.find((p: Product) => p.id === item.product) || null;
          return {
            product,
            quantity: item.quantity,
            subtotal: item.subtotal
          };
        }) || []
      );
    } else {
      setSelectedProducts([]);
    }
  }, [editingOrder, allProducts]);
  const formatPrice = (price: any) => {
    // Convert price to string if it's a number
    const priceStr = typeof price === 'number' ? price.toString() : price;
    
    // Convert price string to number, removing any non-digit characters except decimal point
    const numPrice = Number(priceStr.replace(/[^\d.]/g, ''));
    
    // Format with spaces between thousands
    const formattedPrice = Math.floor(numPrice)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    // Return formatted price with 'uzs' suffix
    return `${formattedPrice} uzs`;
  }


  const handleSaveStatus = () => {
    if (!editingOrder || !newStatus) return;

    const updateData = {
      id: editingOrder.id,
      customer_name: editingOrder.customer_name,
      customer_phone: editingOrder.customer_phone,
      customer_preferences: editingOrder.customer_preferences,
      order_items: editingOrder.order_items.map(item => ({
        product: item.product,
        quantity: item.quantity,
        subtotal: item.subtotal
      })),
      status: newStatus,
      total_sum: editingOrder.total_sum
    };

    console.log('Sending update data:', updateData); // For debugging

    updateOrder(
      updateData,
      {
        onSuccess: () => {
          toast.success('Status updated successfully');
          refetch();
          setIsFormOpen(false);
        },
        onError: (error: Error) => {
          toast.error('Error updating status', {
            description: error.message,
          });
        },
      }
    );
  };

  console.log(data);

  return (
    <div className="container mx-auto py-6">
      <ResourceTable
        data={data?.results ?? []}
        columns={columns}
        isLoading={isLoading}
        onEdit={(order) => {
          setEditingOrder(order);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
        onAdd={() => {
          setEditingOrder(null);
          setIsFormOpen(true);
        }}
        pageSize={10}
        totalCount={data?.count ?? 0}
        currentPage={page}
        onPageChange={setPage}
  
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogTitle className="text-lg font-semibold mb-4">
            {editingOrder ? 'Order Details' : 'New Order'}
          </DialogTitle>
          
          {editingOrder && (
            <div className="space-y-4">
              <div className="grid gap-3">
                <div>
                  <strong>Customer Name:</strong> {editingOrder.customer_name}
                </div>
                <div>
                  <strong>Phone Number:</strong> {editingOrder.customer_phone}
                </div>
                <div>
                  <strong>Preferences:</strong> {editingOrder.customer_preferences}
                </div>
                <div className="flex items-center gap-2">
                  <strong>Status:</strong>
                  <Select
                    defaultValue={editingOrder.status}
                    onValueChange={setNewStatus}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_CHOICES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Order Items:</h3>
                <div className="space-y-3">
                  {editingOrder.order_items?.map((item, index) => {
                    const product = allProducts.find(p => p.id === item.product);
                    return (
                      <div key={index} className="bg-gray-50 p-3 rounded">
                        <div>
                          <strong>Product:</strong> {product?.title_uz || `Product ${item.product}`}
                        </div>
                        <div>
                          <strong>Quantity:</strong> {item.quantity}
                        </div>
                        <div>
                          <strong>Subtotal:</strong> {formatPrice(item.subtotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {editingOrder.total_sum && (
                  <div className="text-right font-semibold mt-3">
                    Total: {formatPrice(editingOrder.total_sum)}
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleSaveStatus}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}