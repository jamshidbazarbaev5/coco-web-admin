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
      label: 'Size Name',
      type: 'text',
      placeholder: 'Enter size name (e.g., Small, Medium, Large)',
      required: true,
    },
  ];

  // Table columns definition
  const columns = [
    {
      header: 'ID',
      accessorKey: 'displayId',
    },
    {
      header: 'Name',
      accessorKey: 'name',
    },
  ];

  const handleSubmit = (data: Partial<Size>) => {
    if (editingSize) {
      updateSize(
        { id: editingSize.id, name: data.name! } as Size,
        {
          onSuccess: () => {
            toast.success('Size updated successfully');
            setIsFormOpen(false);
            setEditingSize(null);
          },
          onError: () => toast.error('Failed to update size'),
        }
      );
    } else {
      createSize(data as Size, {
        onSuccess: () => {
          toast.success('Size created successfully');
          setIsFormOpen(false);
        },
        onError: () => toast.error('Failed to create size'),
      });
    }
  };

  const handleEdit = (size: Size) => {
    setEditingSize(size);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this size?')) {
      deleteSize(id, {
        onSuccess: () => toast.success('Size deleted successfully'),
        onError: () => toast.error('Failed to delete size'),
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Size Management</h1>
      
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
            title={editingSize ? 'Edit Size' : 'Create Size'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
