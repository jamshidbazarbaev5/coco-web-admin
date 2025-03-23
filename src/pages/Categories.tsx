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

  const { data, isLoading } = useGetCategories({
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
  ];

  const handleSubmit = (data: Category) => {
    if (selectedCategory?.id) {
      updateCategory(
        { id: selectedCategory.id, ...data },
        {
          onSuccess: () => {
            toast.success('Category updated successfully');
            setIsFormOpen(false);
            setSelectedCategory(null);
          },
          onError: () => toast.error('Failed to update category'),
        }
      );
    } else {
      createCategory(data, {
        onSuccess: () => {
          toast.success('Category created successfully');
          setIsFormOpen(false);
        },
        onError: () => toast.error('Failed to create category'),
      });
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id, {
        onSuccess: () => toast.success('Category deleted successfully'),
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