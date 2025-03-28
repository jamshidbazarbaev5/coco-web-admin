import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm } from '../helpers/ResourceForm';
import { useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../api/category';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/dialog';
import { useState } from 'react';
import { toast } from 'sonner';

// Define the Category type explicitly
interface Category {
  id?: number;
  name_ru: string;
  name_uz: string;
  image?: string | File;
}

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
      header: 'Изображение', 
      accessorKey: 'image',
      cell: (category: any) => 
        category.image ? (
          <img 
            src={category.image} 
            alt="Продукт"
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400">
            Нет изображения
          </div>
        )
    },
    { header: 'Название (РУ)', accessorKey: 'name_ru' },
    { header: 'Название (УЗ)', accessorKey: 'name_uz' },
  ];

  const formFields: any = [
    {
      name: 'name_ru',
      label: 'Название (Русский)',
      type: 'text',
      placeholder: 'Введите название категории на русском',
      required: true,
    },
    {
      name: 'name_uz',
      label: 'Название (Узбекский)',
      type: 'text',
      placeholder: 'Введите название категории на узбекском',
      required: true,
    },
    {
      name: 'image',
      label: 'Изображение',
      type: 'file',
      required: !selectedCategory,
      imageUrl: selectedCategory?.image as string
    }
  ];

  const handleSubmit = (data: Category) => {
    const formData = new FormData();
    formData.append('name_ru', data.name_ru);
    formData.append('name_uz', data.name_uz);
    
    // Only append image if a new file was selected
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
            toast.success('Категория успешно обновлена');
            setIsFormOpen(false);
            setSelectedCategory(null);
            refetch();
          },
          onError: (error) => {
            console.error('Update error:', error);
            toast.error('Не удалось обновить категорию');
          },
        }
      );
    } else {
      createCategory(formData as any, {
        onSuccess: () => {
          toast.success('Категория успешно создана');
          setIsFormOpen(false);
          refetch();
        },
        onError: (error) => {
          console.error('Create error:', error);
          toast.error('Не удалось создать категорию');
        },
      });
    }
  };

  const handleEdit = (category: Category) => {
    const cleanCategory = {
      id: category.id,
      name_ru: category.name_ru,
      name_uz: category.name_uz,
      image: category.image // The image URL will be used for preview
    };
    setSelectedCategory(cleanCategory);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить эту категорию?')) {
      deleteCategory(id, {
        onSuccess: () => {
          toast.success('Категория успешно удалена');
          refetch();
        },
        onError: () => toast.error('Не удалось удалить категорию'),
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
            title={selectedCategory ? 'Редактировать категорию' : 'Создать категорию'}
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