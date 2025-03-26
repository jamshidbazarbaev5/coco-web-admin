import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { Category, useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../api/category';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';

export function CategoryPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading, refetch } = useGetCategories({
    params: {
      page: page,
      page_size: 10
    }
  });
  const categories = data?.results || [];

  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const columns = [
    { 
      header: 'Image', 
      accessorKey: 'image',
      cell: (category: any) => 
        category.image ? (
          <img 
            src={category.image} 
            alt="Product"
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
            No image
          </div>
        )
    },
    { header: 'Name (RU)', accessorKey: 'name_ru' },
    { header: 'Name (UZ)', accessorKey: 'name_uz' },
  ];

  const formFields = [
    {
      name: 'name_ru',
      label: 'Name (Russian)',
      type: 'text' as const,
      placeholder: 'Enter category name in Russian',
      required: true,
    },
    {
      name: 'name_uz',
      label: 'Name (Uzbek)',
      type: 'text' as const,
      placeholder: 'Enter category name in Uzbek',
      required: true,
    },
    {
      name: 'image',
      label: 'Image',
      type: 'file' as const,
      required: !selectedCategory, // Only required for new categories
    }
  ];

  const handleSubmit = (data: Category) => {
    const formData = new FormData();
    formData.append('name_ru', data.name_ru);
    formData.append('name_uz', data.name_uz);
    
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }

    if (selectedCategory?.id) {
      updateCategory(
        { 
          formData,
          id: selectedCategory.id
        } as any,
        {
          onSuccess: () => {
            toast.success('Category updated successfully');
            setIsFormOpen(false);
            setSelectedCategory(null);
            refetch();
          },
          onError: (error) => {
            console.error('Update error:', error);
            toast.error('Failed to update category');
          },
        }
      );
    } else {
      createCategory(formData as any, {
        onSuccess: () => {
          toast.success('Category created successfully');
          setIsFormOpen(false);
          refetch();
        },
        onError: (error) => {
          console.error('Create error:', error);
          toast.error('Failed to create category');
        },
      });
    }
  };

  const handleEdit = (category: Category) => {
    const cleanCategory = {
      id: category.id,
      name_ru: category.name_ru,
      name_uz: category.name_uz,
      ...(category.image && Object.keys(category.image).length > 0 ? { image: category.image } : {})
    };
    setSelectedCategory(cleanCategory);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id, {
        onSuccess: () => {
          toast.success('Category deleted successfully');
          refetch();
        },
        onError: () => toast.error('Failed to delete category'),
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogTrigger asChild>
          <div className="hidden">Trigger</div>
        </DialogTrigger>
        <DialogContent>
          <ResourceForm<Category>
            fields={formFields}
            onSubmit={handleSubmit}
            defaultValues={selectedCategory || {}}
            isSubmitting={isCreating || isUpdating}
            title={selectedCategory ? 'Edit Category' : 'Create Category'}
          />
        </DialogContent>
      </Dialog>

      <ResourceTable<Category>
        data={categories}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => {
          setSelectedCategory(null);
          setIsFormOpen(true);
        }}
        currentPage={page}
        totalCount={data?.count || 0}
        onPageChange={(newPage) => setPage(newPage)}
        pageSize={10}
      />
    </div>
  );
}