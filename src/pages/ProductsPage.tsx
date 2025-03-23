import { ResourceTable } from '../helpers/ResourceTable';
import { useGetProducts, useDeleteProduct, Product } from '../api/products';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { Column } from '../helpers/ResourceTable';

export function ProductsPage() {
  const { data: products = [], isLoading } = useGetProducts();
  const deleteProduct = useDeleteProduct();
  const navigate = useNavigate();

  const columns: Column<Product>[] = [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Title (UZ)',
      accessorKey: 'title_uz',
    },
    {
      header: 'Title (RU)',
      accessorKey: 'title_ru',
    },
    {
      header: 'Price',
      accessorKey: (product: Product) => `$${product.price.toLocaleString()}`,
    },
    {
      header: 'Quantity',
      accessorKey: 'quantity',
    },
    {
      header: 'Variants',
      accessorKey: 'product_attributes',
      cell: (product: Product) => (
        <div className="flex gap-1 flex-wrap">
          {product.product_attributes.map((attr, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {attr.color}
              {attr.size ? ` - ${attr.size}` : ''}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Created At',
      accessorKey: (product: Product) => 
        new Date(product.created_at).toLocaleDateString(),
    },
  ];

  const handleEdit = (product: Product) => {
    navigate(`/products/edit/${product.id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct.mutateAsync(id);
    }
  };

  const handleAdd = () => {
    navigate('/products/new');
  };

  return (
    <div className="container mx-auto py-6">
      <ResourceTable<Product>
        data={products}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        pageSize={10}
      />
    </div>
  );
}