import { ResourceTable } from '../helpers/ResourceTable';
import { useGetProducts, useDeleteProduct, Product } from '../api/products';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../components/ui/badge';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';

export function ProductsPage() {
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
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
   
  const formatPrice = (price: number | string | null | undefined) => {
    // Return early if price is null or undefined
    if (price == null) return '0 сум';
    
    // Convert price to string if it's a number
    const priceStr = typeof price === 'number' ? price.toString() : price;
    
    // Convert string price to number, removing non-digit characters except dots
    const numPrice = Number(priceStr.replace(/[^\d.]/g, ''));
    
    // Return 0 if the price is NaN
    if (isNaN(numPrice)) return '0 сум';
    
    // Format with spaces between thousands
    const formattedPrice = Math.floor(numPrice)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    return `${formattedPrice} сум`;
  };

  const columns = [
    {
      header: 'ИД',
      accessorKey: 'displayId',
    },
    {
      header: 'Изображение',
      accessorKey: 'image',
      cell: (product: Product) => (
        product?.product_attributes[0]?.attribute_images?.[0]?.image ? (
          <img 
            src={product.product_attributes[0].attribute_images[0].image} 
            alt={product.product_attributes[0].attribute_images[0].product}
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <span className="text-gray-400">Нет изображения</span>
        )
      ),
    },
    {
      header: 'Название (РУ)',
      accessorKey: 'title_ru',
    },
    {
      header: 'Цена',
      accessorKey: 'product_attributes',
      cell: (product: Product) => (
        <div className="space-y-1">
          {product.product_attributes.map((attr, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: attr.color_code }}
              />
              <span>{formatPrice(attr.price)}</span>
              {attr.new_price && (
                <span className="text-green-600">
                  → {formatPrice(attr.new_price)}
                </span>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      header: 'Количество',
      accessorKey: 'product_attributes',
      cell: (product: Product) => (
        <div className="space-y-1">
          {product.product_attributes.map((attr, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: attr.color_code }}
              />
              {attr.quantity === null ? (
                <span className="text-blue-500">предзаказ</span>
              ) : attr.quantity === 0 ? (
                <span className="text-red-500">распродан</span>
              ) : (
                <span>{attr.quantity}</span>
              )}
            </div>
          ))}
        </div>
      ),
    },
    {
      header: 'Варианты',
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
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await deleteProduct.mutateAsync(id);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Произошла ошибка при удалении товара');
      }
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

      <Dialog open={!!error} onOpenChange={() => setError(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ошибка</DialogTitle>
            <DialogDescription>{error}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}