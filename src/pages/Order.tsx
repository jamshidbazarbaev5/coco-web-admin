import { useGetOrders, useDeleteOrder, type Order } from '../api/order';
import { useGetProducts, type Product } from '../api/products';
import { ResourceTable } from '../helpers/ResourceTable';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';




export function Orders() {
  const [page, setPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [, setSelectedProducts] = useState<Array<{product: Product | null, quantity: number, subtotal?: number}>>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  const { data, isLoading, refetch } = useGetOrders({ params: { page } });
  const { data: productsData, refetch: refetchProducts } = useGetProducts({ params: { page: productPage, page_size: 100 } });
  const { mutate: deleteOrder } = useDeleteOrder();

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
                  {item.subtotal && <span> (${item.subtotal})</span>}
                </div>
              );
            })}
            {row.total_sum && (
              <div className="font-semibold mt-1">Total: ${row.total_sum}</div>
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
                <div>
                  <strong>Status:</strong> {editingOrder.status}
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
                          <strong>Subtotal:</strong> ${item.subtotal}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {editingOrder.total_sum && (
                  <div className="text-right font-semibold mt-3">
                    Total: ${editingOrder.total_sum}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}