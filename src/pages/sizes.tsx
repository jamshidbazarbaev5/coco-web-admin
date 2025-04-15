import { useState } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm, FormField } from '../helpers/ResourceForm';
import { Size, useGetSizes, useCreateSize, useUpdateSize, useDeleteSize } from '../api/sizes';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { toast } from 'sonner';

export function SizesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<Size | null>(null);
  const [page, setPage] = useState(1);

  const { 
    data: sizesData = { count: 0, results: [], next: null, previous: null }, 
    isLoading 
  } = useGetSizes({
    params: {
      page: page,
      page_size: 10,
      ordering: '-created_at'
    }
  });
  const { mutate: createSize, isPending: isCreating } = useCreateSize();
  const { mutate: updateSize, isPending: isUpdating } = useUpdateSize();
  const { mutate: deleteSize } = useDeleteSize();

  const sizes = (sizesData.results || []).map((size, index) => ({
    ...size,
    displayId: ((page - 1) * 10) + index + 1
  }));

  // Form fields definition
  const sizeFields: FormField[] = [
    {
      name: 'name_ru',
      label: 'Название (Русский)',
      type: 'text',
      placeholder: 'Введите название размера на русском',
      required: true,
    },
    {
      name: 'name_uz',
      label: 'Название (Узбекский)',
      type: 'text',
      placeholder: 'Введите название размера на узбекском',
      required: true,
    },
    {
      name: 'length',
      label: 'Длина',
      type: 'text',
      placeholder: 'Введите длину',
      required: true,
    },
    {
      name: 'width',
      label: 'Ширина',
      type: 'text',
      placeholder: 'Введите ширину',
      required: true,
    },
    {
      name: 'height',
      label: 'Высота',
      type: 'text',
      placeholder: 'Введите высоту',
      required: true,
    },
  ];

  // Table columns definition
  const columns = [
    {
      header: 'ИД',
      accessorKey: 'displayId',
    },
    {
      header: 'Название (Русский)',
      accessorKey: 'name_ru',
    },
    {
      header: 'Название (Узбекский)',
      accessorKey: 'name_uz',
    },
    {
      header: 'Длина',
      accessorKey: 'length',
    },
    {
      header: 'Ширина',
      accessorKey: 'width',
    },
    {
      header: 'Высота',
      accessorKey: 'height',
    },
  ];

  const handleSubmit = (data: Partial<Size>) => {
    if (editingSize) {
      updateSize(
        { id: editingSize.id!, ...data } as Size,
        {
          onSuccess: () => {
            toast.success('Размер успешно обновлен');
            setIsFormOpen(false);
            setEditingSize(null);
          },
          onError: () => toast.error('Не удалось обновить размер'),
        }
      );
    } else {
      createSize(data as Size, {
        onSuccess: () => {
          toast.success('Размер успешно создан');
          setIsFormOpen(false);
        },
        onError: () => toast.error('Не удалось создать размер'),
      });
    }
  };

  const handleEdit = (size: Size) => {
    setEditingSize(size);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот размер?')) {
      deleteSize(id, {
        onSuccess: () => toast.success('Размер успешно удален'),
        onError: () => toast.error('Не удалось удалить размер'),
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Управление размерами</h1>
      
      <ResourceTable
        data={sizes}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => {
          setEditingSize(null);
          setIsFormOpen(true);
        }}
        totalCount={sizesData.count}
        pageSize={10}
        currentPage={page}
        onPageChange={(newPage) => setPage(newPage)}
      />
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <ResourceForm
            fields={sizeFields}
            onSubmit={handleSubmit}
            defaultValues={editingSize || {}}
            isSubmitting={isCreating || isUpdating}
            title={editingSize ? 'Редактировать размер' : 'Создать размер'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
