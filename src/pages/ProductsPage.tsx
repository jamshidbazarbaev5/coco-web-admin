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
   
  const formatPrice = (price: any) => {
    // Конвертировать цену в строку, если это число
    const priceStr = typeof price === 'number' ? price.toString() : price;
    
    // Конвертировать строку цены в число, удаляя все символы кроме цифр и точки
    const numPrice = Number(priceStr.replace(/[^\d.]/g, ''));
    
    // Форматировать с пробелами между тысячами
    const formattedPrice = Math.floor(numPrice)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    // Вернуть отформатированную цену с суффиксом 'сум'
    return `${formattedPrice} сум`;
  }
  const columns = [
    {
      header: 'ИД',
      accessorKey: 'displayId',
    },
    {
      header: 'Изображение',
      accessorKey: 'image',
      cell: (product: Product) => (
        product?.product_attributes[0]?.image ? (
          <img 
            src={product.product_attributes[0].image} 
            alt="Товар"
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
              <span>{attr.quantity}</span>
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