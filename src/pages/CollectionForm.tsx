import { useState, useEffect } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm, FormField } from '../helpers/ResourceForm';
import { useGetCollections, useCreateCollection, useUpdateCollection, useDeleteCollection } from '../api/new-collection';
import { Dialog, DialogContent } from '../components/ui/dialog';

// Define interfaces first
interface Product {
  id: number;
  title_uz: string;
  title_ru: string;
  brand: number;
  category: number;
  description_uz: string;
  description_ru: string;
  material: number;
  product_attributes: Array<{
    id: number;
    color_code: string;
    sizes: number[];
    color_name_ru: string;
    color_name_uz: string;
    price: string;
    new_price: string;
    quantity: number;
    created_at: string;
    on_sale: boolean;
    attribute_images: Array<{
      id: number;
      product: string;
      image: string;
    }>;
  }>;
}

interface Collection {
  id?: number;
  product: number | string;
  products_details?: any;
  title_uz: string;
  title_ru: string;
  caption_uz: string;
  caption_ru: string;
  description_uz: string;
  description_ru: string;
  collection_images?: Array<{
    id?: number;
    image: string | File;
  }>;
  images_to_delete?: number[];  // Add this new field
 
}

export default function CollectionPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  const { data, isLoading, refetch } = useGetCollections({ params: { page: currentPage } });
  const { mutate: createCollection, isPending: isCreating } = useCreateCollection();
  const { mutate: updateCollection, isPending: isUpdating } = useUpdateCollection();
  const { mutate: deleteCollection } = useDeleteCollection();

  // Updated function to fetch all products
  const fetchAllProducts = async () => {
    setIsLoadingProducts(true);
    try {
      let allProducts: Product[] = [];
      let nextUrl: string | null = 'https://coco20.uz/api/v1/products/crud/product/';

      while (nextUrl) {
        const response :any= await fetch(nextUrl);
        const data :any= await response.json();
        allProducts = [...allProducts, ...data.results];
        nextUrl = data.next;
      }

      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);


  console.log(editingCollection)

  const formFields: FormField[] = [
    {
      name: 'product',
      label: 'Продукт',
      type: 'select',
      options: isLoadingProducts 
        ? [{ value: '', label: 'Загрузка продуктов...' }]
        : products.map(p => ({
            value: p.id.toString(),
            label: `${p.id} - ${p.title_uz} (${p.product_attributes[0]?.price})`,
          })),
    },
    {
      name: 'title_uz',
      label: 'Название (УЗ)',
      type: 'text',
    },
    {
      name: 'title_ru',
      label: 'Название (РУ)',
      type: 'text',
    },
    {
      name: 'caption_uz',
      label: 'Подпись (УЗ)',
      type: 'text',
    },
    {
      name: 'caption_ru',
      label: 'Подпись (РУ)',
      type: 'text',
    },
    {
      name: 'description_uz',
      label: 'Описание (УЗ)',
      type: 'textarea',
    },
    {
      name: 'description_ru',
      label: 'Описание (РУ)',
      type: 'textarea',
    },
    {
      name: 'collection_images',
      label: 'Изображения коллекции',
      type: 'multiple-files',
      required: false,
      existingImages: editingCollection?.collection_images
        ?.filter(img => !imagesToDelete.includes(img.id || -1))
        ?.map(img => ({
          id: img.id,
          url: typeof img.image === 'string' ? img.image : URL.createObjectURL(img.image)
      })),
      onDeleteImage: (imageId?: number) => {
        if (imageId) {
          setImagesToDelete(prev => [...prev, imageId]);
          // Instantly update the editingCollection to remove the deleted image
          setEditingCollection(prev => {
            if (!prev) return null;
            return {
              ...prev,
              collection_images: prev.collection_images?.filter(img => img.id !== imageId)
            };
          });
        }
      }
    }
  ];

  const columns: any = [
    {
      header: 'Продукты',
      accessorKey: 'products_details',
      cell: (item: Collection) => {
        const products = item.products_details;
        return products && products.length > 0 ? (
          <div className="space-y-1">
            {products.map((product:any) => (
              <div key={product.id}>
                <div className="font-medium">{product.title_uz}</div>
                <div className="text-sm text-gray-500">ID: {product.id}</div>
              </div>
            ))}
          </div>
        ) : null;
      }
    },
    {
      header: 'Название коллекции',
      cell: (item: Collection) => (
        <div>
          <div>УЗ: {item.title_uz}</div>
          <div>РУ: {item.title_ru}</div>
        </div>
      )
    },
    {
      header: 'Подпись коллекции',
      cell: (item: Collection) => (
        <div>
          <div>УЗ: {item.caption_uz}</div>
          <div>РУ: {item.caption_ru}</div>
        </div>
      )
    }
  ];

  const handleSubmit = async (formData: Collection) => {
    const submitData = new FormData();
    
    // Add basic fields
    submitData.append('product', formData.product.toString());
    submitData.append('title_uz', formData.title_uz);
    submitData.append('title_ru', formData.title_ru);
    submitData.append('caption_uz', formData.caption_uz);
    submitData.append('caption_ru', formData.caption_ru);
    submitData.append('description_uz', formData.description_uz);
    submitData.append('description_ru', formData.description_ru);

    // Add uploaded_products using the main product ID
    submitData.append('uploaded_products[0]', formData.product.toString());

    // Add images to delete
    if (imagesToDelete.length > 0) {
      imagesToDelete.forEach((id, index) => {
        submitData.append(`images_to_delete[${index}]`, id.toString());
      });
    }

    // Handle multiple images
    if (formData.collection_images) {
      formData.collection_images.forEach((image, index) => {
        if (image instanceof File) {
          submitData.append(`collection_images[${index}]image`, image);
        }
      });
    }

    if (editingCollection?.id) {
      updateCollection({
        id: editingCollection.id,
        formData: submitData,
      }, {
        onSuccess: () => {
          setIsFormOpen(false);
          setEditingCollection(null);
          refetch();
        },
      });
    } else {
      createCollection(submitData, {
        onSuccess: () => {
          setIsFormOpen(false);
          refetch();
        },
      });
    }
  };

  const handleEdit = (collection: Collection) => {
    if (collection.products_details && collection.products_details.length > 0) {
      setEditingCollection({
        ...collection,
        product: collection.products_details[0].id.toString(),
      });
    }
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту коллекцию?')) {
      deleteCollection(id, {
        onSuccess: () => refetch(),
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <ResourceTable
        data={data?.results || []}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => {
          setEditingCollection(null);
          setIsFormOpen(true);
        }}
        pageSize={10}
        totalCount={data?.count || 0}
        onPageChange={setCurrentPage}
        currentPage={currentPage}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <ResourceForm<Collection>
            fields={formFields}
            onSubmit={handleSubmit}
            defaultValues={editingCollection || undefined}
            isSubmitting={isCreating || isUpdating}
            title={editingCollection ? 'Редактировать коллекцию' : 'Создать коллекцию'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}