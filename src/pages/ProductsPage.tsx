import { ResourceTable } from '../helpers/ResourceTable';
import { useGetProducts, useDeleteProduct, Product } from '../api/products';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { useState } from 'react';

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const { data: productsData = { count: 0, results: [], next: null, previous: null }, isLoading } = useGetProducts({
    params: { page }
  });
  const deleteProduct = useDeleteProduct();
  const navigate = useNavigate();

  // Map products to include displayId
  const products = (productsData.results || []).map((product, index) => ({
    ...product,
    displayId: ((page - 1) * 10) + index + 1
  }));

  const columns = [
    {
      header: 'ID',
      accessorKey: 'displayId',
    },
    {
      header: 'Image',
      accessorKey: 'image',
      cell: (product: Product) => (
        <img 
          src={product.product_attributes[0].image} 
          alt="Product"
          className="w-16 h-16 object-cover rounded"
        />
      ),
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
              <div 
                className="w-3 h-3 rounded-full inline-block mr-1" 
                style={{ backgroundColor: attr.color_code }}
              />
              {attr.color_name_uz}
              {/* {attr.sizes.length > 0 ? `  ${attr.sizes.join(', ')}` : ''} */}
            </Badge>
          ))}
        </div>
      ),
    },
  ];

  const handleEdit = (product: Product) => {
    navigate(`/edit-product/${product.id}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct.mutateAsync(id);
    }
  };

  const handleAdd = () => {
    navigate('/create-product');
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
        totalCount={productsData.count || 0}
        currentPage={page}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}