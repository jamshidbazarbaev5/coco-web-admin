import { useGetOrders, useCreateOrder, useUpdateOrder, useDeleteOrder, type Order } from '../api/order';
import { useGetProducts, type Product } from '../api/products';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm, type FormField } from '../helpers/ResourceForm';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

// Add type for the custom render props
interface CustomRenderProps {
  value: any;
  onChange: (value: any) => void;
}

// Update FormField type to include render property
interface ExtendedFormField extends FormField {
  render?: (props: CustomRenderProps) => React.ReactNode;
}

export function Orders() {
  const [page, setPage] = useState(1);
  const [productPage, _setProductPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Array<{product: Product | null, quantity: number}>>([]);

  const { data, isLoading, refetch } = useGetOrders({ params: { page } });
  const { data: productsData } = useGetProducts({ params: { page: productPage } });
  const { mutate: createOrder, isPending: isCreating } = useCreateOrder();
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateOrder();
  const { mutate: deleteOrder } = useDeleteOrder();

  const formFields: ExtendedFormField[] = [
    {
      name: 'customer_name',
      label: 'Customer Name',
      type: 'text',
      required: true,
    },
    {
      name: 'customer_phone',
      label: 'Phone Number',
      type: 'text',
      required: true,
    },
    {
      name: 'customer_preferences',
      label: 'Preferences',
      type: 'textarea',
    },
    {
      name: 'order_items',
      label: 'Products',
      type: 'select' as const,
      render: ({ onChange }: CustomRenderProps) => (
        <div className="space-y-4">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setSelectedProducts([...selectedProducts, { product: null, quantity: 1 }])}
          >
            Add Product
          </button>
          
          {selectedProducts.map((item, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium">Product</label>
                <select
                  className="w-full rounded-md border"
                  value={item.product?.id || ''}
                  onChange={(e) => {
                    const newProducts = [...selectedProducts];
                    const selectedProduct = productsData?.results.find(
                      (p: Product) => p.id === Number(e.target.value)
                    );
                    newProducts[index] = {
                      ...newProducts[index],
                      product: selectedProduct || null
                    };
                    setSelectedProducts(newProducts);
                    onChange(newProducts.map(p => ({
                      product: p.product?.id,
                      quantity: p.quantity
                    })));
                  }}
                >
                  <option value="">Select a product</option>
                  {productsData?.results.map((product: Product) => (
                    <option key={product.id} value={product.id}>
                      {product.title_uz} - ${product.price}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-24">
                <label className="text-sm font-medium">Quantity</label>
                <input
                  type="number"
                  min="1"
                  className="w-full rounded-md border"
                  value={item.quantity}
                  onChange={(e) => {
                    const newProducts = [...selectedProducts];
                    newProducts[index] = {
                      ...newProducts[index],
                      quantity: Number(e.target.value)
                    };
                    setSelectedProducts(newProducts);
                    onChange(newProducts.map(p => ({
                      product: p.product?.id,
                      quantity: p.quantity
                    })));
                  }}
                />
              </div>

              <button
                type="button"
                className="btn btn-error"
                onClick={() => {
                  const newProducts = selectedProducts.filter((_, i) => i !== index);
                  setSelectedProducts(newProducts);
                  onChange(newProducts.map(p => ({
                    product: p.product?.id,
                    quantity: p.quantity
                  })));
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ),
      required: true,
    },
  ];

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
  ];

  const handleSubmit = (formData: Order) => {
    if (!formData.order_items?.length) {
      toast.error('Please select at least one product');
      return;
    }

    const operation = editingOrder 
      ? updateOrder({ id: editingOrder.id!, ...formData })
      : createOrder(formData);

    Promise.resolve(operation)
      .then(() => {
        toast(`Order ${editingOrder ? 'updated' : 'created'} successfully`);
        setIsFormOpen(false);
        setEditingOrder(null);
        refetch();
      })
      .catch((error: Error) => {
        toast.error('Error', {
          description: error.message,
        });
      });
  };

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
    if (editingOrder) {
      setSelectedProducts(
        editingOrder.order_items?.map(item => ({
          product: productsData?.results.find((p: Product) => p.id === item.product) || null,
          quantity: item.quantity
        })) || []
      );
    } else {
      setSelectedProducts([]);
    }
  }, [editingOrder, productsData?.results]);

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
          <ResourceForm
            fields={formFields}
            onSubmit={handleSubmit}
            defaultValues={editingOrder ?? {}}
            isSubmitting={isCreating || isUpdating}
            title={editingOrder ? 'Edit Order' : 'Create Order'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}