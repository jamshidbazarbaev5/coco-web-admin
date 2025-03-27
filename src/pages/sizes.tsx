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
      name: 'name',
      label: 'Название размера',
      type: 'text',
      placeholder: 'Введите название размера (например, Маленький, Средний, Большой)',
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
      header: 'Название',
      accessorKey: 'name',
    },
  ];

  const handleSubmit = (data: Partial<Size>) => {
    if (editingSize) {
      updateSize(
        { id: editingSize.id, name: data.name! } as Size,
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
