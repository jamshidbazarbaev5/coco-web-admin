import { useState } from 'react';
import { ResourceTable } from '../helpers/ResourceTable';
import { ResourceForm, FormField } from '../helpers/ResourceForm';
import { Brand, useGetBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from '../api/brand';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { toast } from 'sonner'

export function BrandsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [page, setPage] = useState(1);

  const { data: brandsData, isLoading } = useGetBrands({
    params: {
      page: page,
      page_size: 10,
      ordering: '-created_at'
    }
  });
  const brands = (brandsData?.results || []).map((brand, index) => ({
    ...brand,
    displayId: ((page - 1) * 10) + index + 1
  }));
  
  const { mutate: createBrand, isPending: isCreating } = useCreateBrand();
  const { mutate: updateBrand, isPending: isUpdating } = useUpdateBrand();
  const { mutate: deleteBrand } = useDeleteBrand();

  const columns = [
    {
      header: 'ID',
      accessorKey: 'displayId',
    },
    {
      header: 'Название',
      accessorKey: 'name',
    },
  ];

  const formFields: FormField[] = [
    {
      name: 'name',
      label: 'Название бренда',
      type: 'text',
      placeholder: 'Введите название бренда',
      required: true,
    },
  ];

  const handleSubmit = (data: Partial<Brand>) => {
    if (editingBrand) {
      updateBrand(
        { id: editingBrand.id, name: data.name! } as Brand,
        {
          onSuccess: () => {
            toast.success('Бренд успешно обновлен');
            setIsFormOpen(false);
            setEditingBrand(null);
          },
          onError: () => toast.error('Не удалось обновить бренд'),
        }
      );
    } else {
      createBrand(data as Brand, {
        onSuccess: () => {
          toast.success('Бренд успешно создан');
          setIsFormOpen(false);
        },
        onError: () => toast.error('Не удалось создать бренд'),
      });
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsFormOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот бренд?')) {
      deleteBrand(id, {
        onSuccess: () => toast.success('Бренд успешно удален'),
        onError: () => toast.error('Не удалось удалить бренд'),
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <ResourceTable
        data={brands}
        columns={columns}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={() => {
          setEditingBrand(null);
          setIsFormOpen(true);
        }}
        totalCount={brandsData?.count || 0}
        pageSize={10}
        currentPage={page}
        onPageChange={(newPage) => setPage(newPage)}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <ResourceForm
            fields={formFields}
            onSubmit={handleSubmit}
            defaultValues={editingBrand || {}}
            isSubmitting={isCreating || isUpdating}
            title={editingBrand ? 'Редактировать бренд' : 'Создать бренд'}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}