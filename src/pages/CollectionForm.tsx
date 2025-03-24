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
  price: string;
  brand: number;
  category: number;
  description_uz: string;
  description_ru: string;
  material: number;
  quantity: number;
  product_attributes: Array<{
    color: string;
    image: string;
    sizes: number[];
  }>;
  on_sale: boolean;
}

interface Collection {
  id?: number;
  product: number | string;
  product_details?: Product;
  title_uz: string;
  title_ru: string;
  caption_uz: string;
  caption_ru: string;
  description_uz: string;
  description_ru: string;
}



export default function CollectionPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState<Product[]>([]);

  const { data, isLoading, refetch } = useGetCollections({ params: { page: currentPage } });
  const { mutate: createCollection, isPending: isCreating } = useCreateCollection();
  const { mutate: updateCollection, isPending: isUpdating } = useUpdateCollection();
  const { mutate: deleteCollection } = useDeleteCollection();

  useEffect(() => {
    fetch('https://coco20.uz/api/v1/products/crud/product/')
      .then(res => res.json())
      .then(data => setProducts(data.results));
  }, []);


  console.log(editingCollection)

  const formFields: FormField[] = [
    {
      name: 'product',
      label: 'Product',
      type: 'select',
      required: true,
      options: products.map(p => ({
        value: p.id.toString(),
        label: `${p.id} - ${p.title_uz}`,
      })),
    },
    {
      name: 'title_uz',
      label: 'Title (UZ)',
      type: 'text',
      required: true,
    },
    {
      name: 'title_ru',
      label: 'Title (RU)',
      type: 'text',
      required: true,
    },
    {
      name: 'caption_uz',
      label: 'Caption (UZ)',
      type: 'text',
      required: true,
    },
    {
      name: 'caption_ru',
      label: 'Caption (RU)',
      type: 'text',
      required: true,
    },
    {
      name: 'description_uz',
      label: 'Description (UZ)',
      type: 'textarea',
      required: true,
    },
    {
      name: 'description_ru',
      label: 'Description (RU)',
      type: 'textarea',
      required: true,
    },
  ];

  const columns: any= [
    {
      header: 'Product',
      accessorKey: 'product_details',
      cell: (item: Collection) => {
        const product = item.product_details;
        return product ? (
          <div className="space-y-1">
            <div className="font-medium">{product.title_uz}</div>
            <div className="text-sm text-gray-500">ID: {product.id}</div>
          </div>
        ) : null;
      }
    },
    {
      header: 'Collection Title',
      cell: (item: Collection) => (
        <div>
          <div>UZ: {item.title_uz}</div>
          <div>RU: {item.title_ru}</div>
        </div>
      )
    },
    {
      header: 'Collection Caption',
      cell: (item: Collection) => (
        <div>
          <div>UZ: {item.caption_uz}</div>
          <div>RU: {item.caption_ru}</div>
        </div>
      )
    }
  ];

  const handleSubmit = async (formData: Collection) => {
    const submitData = {
      ...formData,
      product: Number(formData.product),
    };

    if (editingCollection?.id) {
      updateCollection({
        ...submitData,
        id: editingCollection.id,
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
    if (collection.product_details) {
      setEditingCollection({
        ...collection,
        product: collection.product_details.id.toString(),
      });
    }
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this collection?')) {
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
            title={editingCollection ? 'Edit Collection' : 'Create Collection'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}