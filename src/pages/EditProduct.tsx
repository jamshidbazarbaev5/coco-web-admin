import { useNavigate, useParams } from 'react-router-dom';
import { ProductForm } from '../helpers/ProductForm'
import { useGetProduct, useUpdateProduct } from '../api/products'
import { useQuery } from '@tanstack/react-query';
import api from '../api/api';

export function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const updateProduct = useUpdateProduct();
  const { data: product, isLoading } = useGetProduct(Number(id));

  // Fetch required data
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => api.get('v1/brands').then(res => res.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('v1/categories').then(res => res.data),
  });

  const { data: materials } = useQuery({
    queryKey: ['materials'],
    queryFn: () => api.get('v1/materials').then(res => res.data),
  });

  const { data: sizes } = useQuery({
    queryKey: ['sizes'],
    queryFn: () => api.get('v1/sizes').then(res => res.data),
  });

  if (isLoading || !brands || !categories || !materials || !sizes) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm
        defaultValues={product}
        onSubmit={async (data) => {
          try {
            await updateProduct.mutateAsync({ 
              ...data, 
              id: Number(id),
              created_at: product.created_at,
              updated_at: product.updated_at
            } as any);
            navigate('/products');
          } catch (error) {
            console.error('Failed to update product:', error);
          }
        }}
        isSubmitting={updateProduct.isPending}
        brands={brands}
        categories={categories}
        materials={materials}
        sizes={sizes}
      />
    </div>
  );
}   